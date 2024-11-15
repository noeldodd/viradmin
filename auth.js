// auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//import db from './database.js';
import { addUser, findUserByUsername } from './database.ts';

//const SECRET_KEY = "your_jwt_secret"; // Make this an environment variable in production

// Register a new user with hashed password
export const registerUser = async (username, password) => {
    const existingUser = await findUserByUsername(username);
    console.log("Existing user: " + existingUser);
    console.log("typeof existingUser: " + typeof(existingUser));
    if ( typeof(existingUser) !== 'undefined') throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), username, password: hashedPassword };
    addUser(newUser);

    return newUser;
};

// Authenticate user and generate JWT token
export const authenticateUser = async (username, password) => {
    const user = await findUserByUsername(username);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    return { user, token };
};

// Middleware to protect routes
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    //console.log(authHeader);
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    //console.log(token);
    if (token == null) return res.sendStatus(403); // No token provided
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send("Invalid Token");
        req.user = user;
        next();
    });
}
