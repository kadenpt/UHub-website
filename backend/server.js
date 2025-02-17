const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const db = new sqlite3.Database("./emails.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create table if not exists
db.run("CREATE TABLE IF NOT EXISTS emails (id INTEGER PRIMARY KEY, email TEXT UNIQUE)");

// API Route to store emails
app.post("/subscribe", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    db.run("INSERT INTO emails (email) VALUES (?)", [email], (err) => {
        if (err) {
            return res.status(500).json({ message: "Email already exists or error occurred" });
        }
        res.json({ message: "Email subscribed successfully!" });
    });
});

app.get("/emails", (req, res) => {
    db.all("SELECT * FROM emails", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving emails" });
        }
        res.json(rows);
    });
});


// Start server
app.listen(5001, () => {
    console.log("Server running on port 5001");
});
