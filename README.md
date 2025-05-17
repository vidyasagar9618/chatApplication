# Real-Time Chat Backend

A scalable real-time chat backend built with Node.js, Socket.IO, MongoDB, and Redis.

## Features

- Real-time messaging using WebSocket (Socket.IO)
- Message persistence in MongoDB
- User presence tracking
- Message delivery status (sent, delivered, read)
- Rate limiting
- Horizontal scaling support using Redis Pub/Sub
- RESTful API for message history and user management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chat_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Running the Application

1. Start MongoDB and Redis servers
2. Start the application:
```bash
npm start
```

## API Endpoints

### Messages
- `GET /api/messages/room/:roomId` - Get messages for a room
- `GET /api/messages/conversation/:userId1/:userId2` - Get messages between two users
- `PUT /api/messages/read/:roomId` - Mark messages as read

### Users
- `GET /api/users/online` - Get online users
- `GET /api/users/:userId` - Get user by ID
- `POST /api/users` - Create new user
- `GET /api/users/search/:query` - Search users

## WebSocket Events

### Client to Server
- `authenticate` - Authenticate user with userId
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message

### Server to Client
- `new_message` - New message received
- `error` - Error event

## Example Usage

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('authenticate', userId);

// Join a room
socket.emit('join_room', roomId);

// Send a message
socket.emit('send_message', {
    receiverId: 'recipient-user-id',
    message: 'Hello!',
    roomId: 'room-id'
});

// Listen for new messages
socket.on('new_message', (data) => {
    console.log('New message:', data);
});
```

## Scaling

The application is designed to scale horizontally:

1. Multiple Node.js instances can run behind a load balancer
2. Redis Pub/Sub ensures message delivery across instances
3. MongoDB handles message persistence
4. Redis manages user sessions and rate limiting

## Error Handling

- Rate limiting prevents message flooding
- Messages are stored with delivery status
- Offline messages are queued and delivered when users come online
- Error events are emitted to clients

## Security

- CORS enabled
- Helmet middleware for security headers
- Rate limiting per user
- JWT authentication (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 