const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { docClient } = require('../db');
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME || "LivingBookshelf";

// Signup Route
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const checkParams = {
            TableName: TABLE_NAME,
            Key: {
                UserId: email,
                EntityId: 'USER#Profile'
            }
        };
        const { Item } = await docClient.send(new GetCommand(checkParams));
        if (Item) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const createParams = {
            TableName: TABLE_NAME,
            Item: {
                UserId: email,
                EntityId: 'USER#Profile',
                PasswordHash: hashedPassword,
                CreatedAt: new Date().toISOString()
            }
        };
        await docClient.send(new PutCommand(createParams));

        // Generate Request Token
        const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token, userId: email });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Get user
        const params = {
            TableName: TABLE_NAME,
            Key: {
                UserId: email,
                EntityId: 'USER#Profile'
            }
        };
        const { Item } = await docClient.send(new GetCommand(params));
        if (!Item) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, Item.PasswordHash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, userId: email });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

module.exports = router;
