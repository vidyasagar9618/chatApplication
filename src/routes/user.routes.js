const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('username status lastSeen')
            .sort('-lastSeen');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get online users
router.get('/online', async (req, res) => {
    try {
        const users = await User.find({ status: 'online' })
            .select('username lastSeen');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch online users' });
    }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('username status lastSeen');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { username } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const user = new User({ username });
        await user.save();
        
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Search users
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        })
            .select('username status lastSeen')
            .limit(10);
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search users' });
    }
});

module.exports = router; 