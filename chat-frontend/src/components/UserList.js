import React from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Badge,
    Box,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment';

const OnlineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const UserList = ({ users, selectedUserId, onUserSelect }) => {
    const getInitials = (username) => {
        return username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const renderLastSeen = (user) => {
        if (user.status === 'online') return 'Online';
        if (user.lastSeen) {
            const lastSeen = moment(user.lastSeen);
            if (moment().diff(lastSeen, 'days') < 1) {
                return `Last seen ${lastSeen.format('HH:mm')}`;
            }
            return `Last seen ${lastSeen.format('DD/MM/YYYY')}`;
        }
        return 'Offline';
    };

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {users.map((user) => (
                <React.Fragment key={user._id}>
                    <ListItem
                        button
                        selected={selectedUserId === user._id}
                        onClick={() => onUserSelect(user)}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'action.selected',
                            },
                        }}
                    >
                        <ListItemAvatar>
                            {user.status === 'online' ? (
                                <OnlineBadge
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    variant="dot"
                                >
                                    <Avatar>{getInitials(user.username)}</Avatar>
                                </OnlineBadge>
                            ) : (
                                <Avatar>{getInitials(user.username)}</Avatar>
                            )}
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1" component="span">
                                    {user.username}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: 'inline',
                                        color: user.status === 'online' ? 'success.main' : 'text.secondary',
                                    }}
                                >
                                    {renderLastSeen(user)}
                                </Typography>
                            }
                        />
                    </ListItem>
                    <Divider component="li" />
                </React.Fragment>
            ))}
        </List>
    );
};

export default UserList; 