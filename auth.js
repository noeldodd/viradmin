// auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const SECRET_KEY = "your_jwt_secret"; // Make this an environment variable in production

// Register a new user with hashed password
function registerUser(username, password, callback) {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return callback(err);

        db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash], function (err) {
            if (err) return callback(err);
            callback(null, { id: this.lastID, username });
        });
    });
}

// Authenticate user and generate JWT token
function authenticateUser(username, password, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return callback(err);
        if (!user) return callback(new Error("User not found"));

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(new Error("Invalid password"));

            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            callback(null, token);
        });
    });
}

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send("Access Denied");

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send("Invalid Token");
        req.user = user;
        next();
    });
}

module.exports = { registerUser, authenticateUser, authenticateToken };
