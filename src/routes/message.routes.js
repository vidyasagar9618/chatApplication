const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Get messages for a room with pagination
router.get('/room/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const messages = await Message.find({ roomId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('senderId', 'username')
            .populate('receiverId', 'username')
            .lean(); // Convert to plain JavaScript objects
            
        const total = await Message.countDocuments({ roomId });
        
        // Process messages to ensure proper sender information
        const processedMessages = messages.map(message => {
            // Ensure senderId is the actual ID, not the populated object
            const senderId = message.senderId._id ? message.senderId._id.toString() : message.senderId.toString();
            const receiverId = message.receiverId._id ? message.receiverId._id.toString() : message.receiverId.toString();
            
            return {
                ...message,
                senderId,
                receiverId,
                senderUsername: message.senderId.username,
                receiverUsername: message.receiverId.username
            };
        });
        
        res.json({
            messages: processedMessages,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get messages between two users
router.get('/conversation/:userId1/:userId2', async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('senderId', 'username')
            .populate('receiverId', 'username');
            
        const total = await Message.countDocuments({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        });
        
        res.json({
            messages,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// Mark messages as read
router.put('/read/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId } = req.body;
        
        await Message.updateMany(
            {
                roomId,
                receiverId: userId,
                status: { $in: ['sent', 'delivered'] }
            },
            {
                $set: { status: 'read' }
            }
        );
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

module.exports = router; 