import React, { createContext, useState, useContext, useEffect } from 'react';
import socketService from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            socketService.connect();
            socketService.authenticate(parsedUser._id);
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('chatUser', JSON.stringify(userData));
        socketService.connect();
        socketService.authenticate(userData._id);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('chatUser');
        socketService.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 