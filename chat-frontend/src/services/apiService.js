import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

class ApiService {
    async getMessages(roomId, page = 1, limit = 50) {
        const response = await axios.get(`${API_URL}/messages/room/${roomId}`, {
            params: { page, limit }
        });
        return response.data;
    }

    async getConversation(userId1, userId2, page = 1, limit = 50) {
        const response = await axios.get(`${API_URL}/messages/conversation/${userId1}/${userId2}`, {
            params: { page, limit }
        });
        return response.data;
    }

    async markMessagesAsRead(roomId, userId) {
        const response = await axios.put(`${API_URL}/messages/read/${roomId}`, { userId });
        return response.data;
    }

    async getOnlineUsers() {
        const response = await axios.get(`${API_URL}/users/online`);
        return response.data;
    }

    async getUser(userId) {
        const response = await axios.get(`${API_URL}/users/${userId}`);
        return response.data;
    }

    async createUser(username) {
        const response = await axios.post(`${API_URL}/users`, { username });
        return response.data;
    }

    async searchUsers(query) {
        const response = await axios.get(`${API_URL}/users/search/${query}`);
        return response.data;
    }

    async getUsers() {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    }
}

export default new ApiService(); 