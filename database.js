// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./v2ir.db');

// Initialize the database - removed

module.exports = db;