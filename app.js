// app.js
const express = require('express');
const bodyParser = require('body-parser');
const { registerUser, authenticateUser, authenticateToken } = require('./auth');
const db = require('./database');

const app = express();
app.use(bodyParser.json());

// Device CRUD Routes

// 1. Create a new device
app.post('/api/devices', authenticateToken, (req, res) => {
    const { profile } = req.body;
    const userId = req.user.id; // Extract user ID from JWT token

    db.run(
        "INSERT INTO devices (user_id, profile) VALUES (?, ?)",
        [userId, JSON.stringify(profile)],
        function (err) {
            if (err) return res.status(500).send("Error creating device");
            res.status(201).send({ id: this.lastID, profile });
        }
    );
});

// 2. Read all devices for the authenticated user
app.get('/api/devices', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all("SELECT * FROM devices WHERE user_id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).send("Error retrieving devices");
        res.send(rows.map(row => ({ ...row, profile: JSON.parse(row.profile) })));
    });
});

// 3. Read a single device by ID
app.get('/api/devices/:id', authenticateToken, (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user.id;

    db.get("SELECT * FROM devices WHERE id = ? AND user_id = ?", [deviceId, userId], (err, row) => {
        if (err) return res.status(500).send("Error retrieving device");
        if (!row) return res.status(404).send("Device not found");
        res.send({ ...row, profile: JSON.parse(row.profile) });
    });
});

// 4. Update a device by ID
app.put('/api/devices/:id', authenticateToken, (req, res) => {
    const deviceId = req.params.id;
    const { profile } = req.body;
    const userId = req.user.id;

    db.run(
        "UPDATE devices SET profile = ? WHERE id = ? AND user_id = ?",
        [JSON.stringify(profile), deviceId, userId],
        function (err) {
            if (err) return res.status(500).send("Error updating device");
            if (this.changes === 0) return res.status(404).send("Device not found");
            res.send({ id: deviceId, profile });
        }
    );
});

// 5. Delete a device by ID
app.delete('/api/devices/:id', authenticateToken, (req, res) => {
    const deviceId = req.params.id;
    const userId = req.user.id;

    db.run("DELETE FROM devices WHERE id = ? AND user_id = ?", [deviceId, userId], function (err) {
        if (err) return res.status(500).send("Error deleting device");
        if (this.changes === 0) return res.status(404).send("Device not found");
        res.send({ message: "Device deleted successfully" });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
