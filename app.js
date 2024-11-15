// app.js
import express from 'express';
//const bodyParser = require('body-parser');
import { registerUser, authenticateUser, authenticateToken } from './auth.js';
import { getAllDevices, addDevice, updateDevice, deleteDevice } from './database.ts';

const app = express();
app.use(express.json()); // was bodyParser json

import cors from 'cors';
app.use(cors());

// Testing Startup - remove these lines for PROD 
//console.log(`ACCESS_TOKEN_SECRET : ${process.env.ACCESS_TOKEN_SECRET}`);
// ^^^ remove ^^^

// Route to register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = await registerUser(username, password);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to authenticate a user and return a token
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { user, token } = await authenticateUser(username, password);
        res.json({ message: 'Login successful', user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Device CRUD Routes

// Get all devices for the logged-in user
app.get('/api/devices', authenticateToken, async (req, res) => {
    const userId = req.user.id;  // Assumes user ID is in the token
    try {
        const alldevices = await getAllDevices(userId);
        res.json(alldevices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve devices' });
    }
});

// Add a new device
app.post('/api/devices', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { displayname, profile } = req.body;
    const newDevice = { id: Date.now().toString(), userId, displayname, profile };

    try {
        await addDevice(newDevice);
        console.log("Device added successfully");
        res.status(201).json({ message: 'Device added', device: newDevice });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add device' });
    }
});

// Update an existing device
app.put('/api/devices/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { displayname, profile } = req.body;

    try {
        const updated = await updateDevice(id, { displayname, profile });
        if (updated) {
            res.json({ message: 'Device updated', device: updated });
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update device' });
    }
});

// Delete a device
app.delete('/api/devices/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await deleteDevice(id);
        if (deleted) {
            res.json({ message: 'Device deleted' });
        } else {
            res.status(404).json({ error: 'Device not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete device' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
