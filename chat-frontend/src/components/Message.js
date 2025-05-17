import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';

const MessageContainer = styled(Box)(({ theme, sent }) => ({
    display: 'flex',
    justifyContent: sent ? 'flex-end' : 'flex-start',
    marginBottom: theme.spacing(1),
    width: '100%'
}));

const MessageBubble = styled(Paper)(({ theme, sent }) => ({
    padding: theme.spacing(1, 2),
    maxWidth: '70%',
    borderRadius: theme.spacing(2),
    backgroundColor: sent ? theme.palette.primary.main : theme.palette.grey[200],
    color: sent ? theme.palette.primary.contrastText : theme.palette.text.primary,
    position: 'relative'
}));

const MessageStatus = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.75rem',
    marginTop: '4px'
});

const Message = ({ message, sent }) => {
    const getStatusIcon = () => {
        switch (message.status) {
            case 'read':
                return <DoneAllIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />;
            case 'delivered':
                return <DoneAllIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />;
            case 'sent':
                return <DoneIcon sx={{ color: 'text.secondary', fontSize: '1rem' }} />;
            default:
                return null;
        }
    };

    return (
        <MessageContainer sent={sent}>
            <MessageBubble sent={sent} elevation={0}>
                <Typography variant="body1">{message.message}</Typography>
                <MessageStatus>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: sent ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            mr: 0.5 
                        }}
                    >
                        {moment(message.timestamp).format('HH:mm')}
                    </Typography>
                    {sent && getStatusIcon()}
                </MessageStatus>
            </MessageBubble>
        </MessageContainer>
    );
};

export default Message; 