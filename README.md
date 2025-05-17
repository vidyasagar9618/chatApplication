# Real-Time Chat Backend

A scalable real-time chat backend built with Node.js, Socket.IO, MongoDB, and Redis.

## Features

- Real-time messaging using WebSocket (Socket.IO)
- Message persistence in MongoDB
- User presence tracking
- Message delivery status (sent, delivered, read)
- Rate limiting
- Horizontal scaling support using Redis Pub/Sub



### Messages
- `GET /api/messages/room/:roomId` - Get messages for a room
- `GET /api/messages/conversation/:userId1/:userId2` - Get messages between two users
- `PUT /api/messages/read/:roomId` - Mark messages as read

### Users
- `GET /api/users/online` - Get online users
- `GET /api/users/:userId` - Get user by ID
- `POST /api/users` - Create new user
- `GET /api/users/search/:query` - Search users

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
})

## Error Handling

- Rate limiting prevents message flooding
- Messages are stored with delivery status
- Offline messages are queued and delivered when users come online
- Error events are emitted to clients

## Security

- CORS enabled
- Helmet middleware for security headers
- Rate limiting per user
- JWT authentication