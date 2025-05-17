const socketIo = require('socket.io');
const redisService = require('../services/redis.service');
const Message = require('../models/message');
const User = require('../models/user');

class SocketService {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', this.handleConnection.bind(this));
    }

    async handleConnection(socket) {
        console.log(`New connection: ${socket.id}`);

        socket.on('authenticate', async (userId) => {
            await this.handleAuthentication(socket, userId);
        });

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        });

        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User left room: ${roomId}`);
        });

        socket.on('send_message', async (data) => {
            await this.handleMessage(socket, data);
        });

        socket.on('disconnect', async () => {
            await this.handleDisconnect(socket);
        });
    }

    async handleAuthentication(socket, userId) {
        try {
            await redisService.setUserSocket(userId, socket.id);
            await User.findByIdAndUpdate(userId, {
                socketId: socket.id,
                status: 'online'
            });
            
            socket.userId = userId;
            console.log(`User ${userId} authenticated`);
        } catch (error) {
            console.error('Authentication error:', error);
        }
    }

    async handleMessage(socket, data) {
        try {
            const { receiverId, message, roomId, tempId } = data;
            
            // Rate limiting check
            const isAllowed = await redisService.checkRateLimit(socket.userId);
            if (!isAllowed) {
                socket.emit('error', { message: 'Rate limit exceeded' });
                return;
            }

            // Create and save message
            const newMessage = new Message({
                senderId: socket.userId,
                receiverId,
                message,
                roomId,
                status: 'sent'
            });
            await newMessage.save();

            // Get receiver's socket if online
            const receiverSocketId = await redisService.getUserSocket(receiverId);
            
            // Add tempId to response if it exists
            const messageResponse = {
                message: {
                    ...newMessage.toObject(),
                    tempId
                },
                roomId
            };

            // Emit to room
            this.io.to(roomId).emit('new_message', messageResponse);

            // Update message status if receiver is online
            if (receiverSocketId) {
                newMessage.status = 'delivered';
                await newMessage.save();
                
                // Emit updated status
                this.io.to(roomId).emit('message_status_update', {
                    messageId: newMessage._id,
                    status: 'delivered'
                });
            }

            // Publish to Redis for other instances
            await redisService.publishMessage('new_message', messageResponse);

        } catch (error) {
            console.error('Message handling error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    async handleDisconnect(socket) {
        try {
            if (socket.userId) {
                await User.findByIdAndUpdate(socket.userId, {
                    status: 'offline',
                    lastSeen: new Date(),
                    socketId: null
                });
                await redisService.removeUserSocket(socket.userId, socket.id);
            }
            console.log(`Client disconnected: ${socket.id}`);
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }

    // Method to emit to specific user
    async emitToUser(userId, event, data) {
        const socketId = await redisService.getUserSocket(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }
}

module.exports = SocketService; 