const Redis = require('redis');
const config = require('../config/config');

class RedisService {
    constructor() {
        this.isConnected = false;
        this.userSockets = new Map(); // Fallback in-memory storage
        this.init();
    }

    async init() {
        try {
            this.client = Redis.createClient({
                url: config.REDIS_URL
            });

            this.client.on('error', (err) => {
                console.log('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('Connected to Redis');
                this.isConnected = true;
            });

            await this.client.connect();
        } catch (error) {
            console.log('Redis connection failed, using in-memory fallback:', error);
            this.isConnected = false;
        }
    }

    async setUserSocket(userId, socketId) {
        try {
            if (this.isConnected) {
                await this.client.set(`user:${userId}:socket`, socketId);
            } else {
                this.userSockets.set(userId, socketId);
            }
        } catch (error) {
            console.error('Error setting user socket:', error);
            this.userSockets.set(userId, socketId);
        }
    }

    async getUserSocket(userId) {
        try {
            if (this.isConnected) {
                return await this.client.get(`user:${userId}:socket`);
            } else {
                return this.userSockets.get(userId);
            }
        } catch (error) {
            console.error('Error getting user socket:', error);
            return this.userSockets.get(userId);
        }
    }

    async getUserBySocket(socketId) {
        return await this.client.get(`socket:${socketId}:user`);
    }

    async removeUserSocket(userId) {
        try {
            if (this.isConnected) {
                await this.client.del(`user:${userId}:socket`);
            } else {
                this.userSockets.delete(userId);
            }
        } catch (error) {
            console.error('Error removing user socket:', error);
            this.userSockets.delete(userId);
        }
    }

    async checkRateLimit(userId) {
        // Simple rate limiting - allow all messages when Redis is not available
        if (!this.isConnected) return true;
        
        try {
            const key = `ratelimit:${userId}`;
            const count = await this.client.incr(key);
            if (count === 1) {
                await this.client.expire(key, 60); // Reset after 1 minute
            }
            return count <= 30; // 30 messages per minute
        } catch (error) {
            console.error('Rate limit check error:', error);
            return true;
        }
    }

    async publishMessage(channel, message) {
        if (!this.isConnected) return;
        
        try {
            await this.client.publish(channel, JSON.stringify(message));
        } catch (error) {
            console.error('Error publishing message:', error);
        }
    }

    async subscribe(channel, callback) {
        const subscriber = this.client.duplicate();
        await subscriber.connect();
        await subscriber.subscribe(channel, callback);
    }
}

module.exports = new RedisService(); 