import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect(url = 'http://localhost:3001') {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(url);
        
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
        });
    }

    authenticate(userId) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected. Reconnecting...');
            this.connect();
        }
        this.socket.emit('authenticate', userId);
    }

    joinRoom(roomId) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected. Reconnecting...');
            this.connect();
            return;
        }
        this.socket.emit('join_room', roomId);
    }

    leaveRoom(roomId) {
        if (!this.socket || !this.isConnected) return;
        this.socket.emit('leave_room', roomId);
    }

    sendMessage(data) {
        if (!this.socket || !this.isConnected) {
            console.error('Socket not connected. Cannot send message.');
            return;
        }
        this.socket.emit('send_message', data);
    }

    onNewMessage(callback) {
        if (!this.socket) return;
        
        // Remove any existing listeners to prevent duplicates
        this.socket.off('new_message');
        this.socket.on('new_message', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

export default new SocketService(); 