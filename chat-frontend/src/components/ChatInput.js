import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

const InputContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <InputContainer component="form" onSubmit={handleSubmit}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
            />
            <IconButton 
                type="submit" 
                color="primary" 
                disabled={!message.trim()}
                sx={{
                    backgroundColor: (theme) => 
                        message.trim() ? `${theme.palette.primary.main}!important` : 'inherit',
                    color: (theme) => 
                        message.trim() ? theme.palette.primary.contrastText : theme.palette.text.disabled,
                    '&:hover': {
                        backgroundColor: (theme) => 
                            message.trim() ? `${theme.palette.primary.dark}!important` : 'inherit',
                    }
                }}
            >
                <SendIcon />
            </IconButton>
        </InputContainer>
    );
};

export default ChatInput; 