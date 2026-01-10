const express = require('express');
const router = express.Router();
const { docClient } = require('../db');
const { ScanCommand, PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME || "LivingBookshelf";

const authMiddleware = require('../middleware/auth');

// Apply middleware to all routes
router.use(authMiddleware);

// Get all books for a specific user
router.get('/', async (req, res) => {
    const userId = req.user.userId;

    try {
        // Ideally use Query with PK=UserId, but for simplicity assuming table structure
        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "UserId = :uid AND begins_with(EntityId, :prefix)",
            ExpressionAttributeValues: {
                ":uid": userId,
                ":prefix": "BOOK#"
            }
        });

        const response = await docClient.send(command);
        res.json(response.Items);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Could not fetch books" });
    }
});

// Add a new book
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const { title, author, coverImage, dateRead, notes, externalId } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: "Title and Author are required" });
    }

    const timestamp = new Date().toISOString();
    // Use Date.now() for unique ID, effectively managing sort order by creation time 
    // If explicit sorting by DateRead is needed, a GSI would be better, but this handles the unique ID requirement.
    const bookId = `BOOK#${Date.now()}`;

    const bookParam = {
        TableName: TABLE_NAME,
        Item: {
            UserId: userId,
            EntityId: bookId,
            Title: title,
            Author: author,
            CoverImage: coverImage,
            // Store the year string directly if provided, or timestamp if not
            DateRead: dateRead || timestamp,
            Notes: notes || '',
            ExternalId: externalId
        }
    };

    try {
        await docClient.send(new PutCommand(bookParam));
        res.status(201).json(bookParam.Item);
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ error: "Could not add book" });
    }
});

// Get a specific book
router.get('/:entityId', async (req, res) => {
    const userId = req.user.userId;
    const { entityId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        Key: {
            UserId: userId,
            EntityId: entityId
        }
    };

    try {
        const { Item } = await docClient.send(new GetCommand(params));
        if (!Item) {
            return res.status(404).json({ error: "Book not found" });
        }
        res.json(Item);
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ error: "Could not fetch book" });
    }
});

// Update book notes
// Update book details (Notes, DateRead)
router.put('/:entityId', async (req, res) => {
    const userId = req.user.userId;
    const { entityId } = req.params;
    const { notes, dateRead } = req.body;

    // Use UpdateExpression dynamically based on what's provided
    let updateExp = "set";
    const expAttrValues = {};
    const expAttrNames = {};

    if (notes !== undefined) {
        updateExp += " #N = :n,";
        expAttrValues[":n"] = notes;
        expAttrNames["#N"] = "Notes";
    }

    if (dateRead !== undefined) {
        updateExp += " DateRead = :d,";
        expAttrValues[":d"] = dateRead;
    }

    // Remove trailing comma
    updateExp = updateExp.slice(0, -1);

    const params = {
        TableName: TABLE_NAME,
        Key: {
            UserId: userId,
            EntityId: entityId
        },
        UpdateExpression: updateExp,
        ExpressionAttributeValues: expAttrValues,
        ReturnValues: "ALL_NEW"
    };

    if (Object.keys(expAttrNames).length > 0) {
        params.ExpressionAttributeNames = expAttrNames;
    }

    try {
        const { Attributes } = await docClient.send(new UpdateCommand(params));
        res.json(Attributes);
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ error: "Could not update book" });
    }
});

// Delete a book
router.delete('/:entityId', async (req, res) => {
    const userId = req.user.userId;
    const { entityId } = req.params;

    const params = {
        TableName: TABLE_NAME,
        Key: {
            UserId: userId,
            EntityId: entityId
        }
    };

    try {
        await docClient.send(new DeleteCommand(params));
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ error: "Could not delete book" });
    }
});

module.exports = router;
