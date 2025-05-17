import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    useTheme,
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Message from '../components/Message';
import ChatInput from '../components/ChatInput';
import UserList from '../components/UserList';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socketService';
import apiService from '../services/apiService';

const drawerWidth = 320;

const ChatContainer = styled(Box)(({ theme }) => ({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
}));

const Chat = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await apiService.getUsers();
                const filteredUsers = allUsers.filter(u => u._id !== user._id);
                setUsers(filteredUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [user._id]);

    useEffect(() => {
        if (selectedUser) {
            const roomId = [user._id, selectedUser._id].sort().join('-');
            socketService.joinRoom(roomId);
            setMessages([]);
            setPage(1);
            setHasMore(true);
            loadMessages();
        }
    }, [selectedUser]);

    useEffect(() => {
        const handleNewMessage = (data) => {
            setMessages(prev => {
                // Check if message already exists
                const messageExists = prev.some(m => 
                    m._id === data.message._id || 
                    (m._id === 'temp_' + data.message._id && m.message === data.message.message)
                );
                
                if (messageExists) {
                    // If it's a temporary message, replace it with the real one
                    return prev.map(m => 
                        m._id === 'temp_' + data.message._id ? data.message : m
                    );
                }
                
                return [...prev, data.message];
            });
            scrollToBottom();
        };

        socketService.onNewMessage(handleNewMessage);

        return () => {
            if (selectedUser) {
                const roomId = [user._id, selectedUser._id].sort().join('-');
                socketService.leaveRoom(roomId);
            }
        };
    }, [selectedUser, user._id]);

    const loadMessages = async () => {
        if (!selectedUser || !hasMore) return;

        try {
            const roomId = [user._id, selectedUser._id].sort().join('-');
            const response = await apiService.getMessages(roomId, page);
            
            // Reverse the order of messages to show oldest first
            const newMessages = response.messages.reverse();
            setMessages(prev => [...prev, ...newMessages]);
            setHasMore(page < response.totalPages);
            setPage(prev => prev + 1);
            
            // Scroll to bottom after loading initial messages
            if (page === 1) {
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleUserSelect = (selectedUser) => {
        setSelectedUser(selectedUser);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleSendMessage = (message) => {
        if (!selectedUser) return;

        const roomId = [user._id, selectedUser._id].sort().join('-');
        const tempId = Date.now().toString();
        
        // Add temporary message
        const tempMessage = {
            _id: 'temp_' + tempId,
            message,
            senderId: user._id,
            receiverId: selectedUser._id,
            roomId,
            timestamp: new Date(),
            status: 'sending'
        };
        
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();
        
        // Send the message
        socketService.sendMessage({
            receiverId: selectedUser._id,
            message,
            roomId,
            tempId
        });
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const drawer = (
        <Box sx={{ width: drawerWidth, borderRight: 1, borderColor: 'divider' }}>
            <AppBar position="static" color="default" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Chats
                    </Typography>
                    {isMobile && (
                        <IconButton edge="end" onClick={handleDrawerToggle}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
            <UserList
                users={users}
                selectedUserId={selectedUser?._id}
                onUserSelect={handleUserSelect}
            />
        </Box>
    );

    return (
        <Grid container sx={{ height: '100vh' }}>
            {/* Sidebar */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            ) : (
                <Grid item md={4} lg={3}>
                    {drawer}
                </Grid>
            )}

            {/* Chat Area */}
            <Grid item xs={12} md={8} lg={9}>
                <ChatContainer>
                    <AppBar position="static" color="default" elevation={1}>
                        <Toolbar>
                            {isMobile && (
                                <IconButton
                                    edge="start"
                                    sx={{ mr: 2 }}
                                    onClick={handleDrawerToggle}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                            <Typography variant="h6">
                                {selectedUser ? selectedUser.username : 'Select a chat'}
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <MessagesContainer>
                        {messages.map((message) => (
                            <Message
                                key={message._id}
                                message={message}
                                sent={message.senderId === user._id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </MessagesContainer>

                    {selectedUser && (
                        <ChatInput onSendMessage={handleSendMessage} />
                    )}
                </ChatContainer>
            </Grid>
        </Grid>
    );
};

export default Chat; 