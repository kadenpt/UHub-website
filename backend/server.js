require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create table if not exists
pool.query(`
    CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL
    );
`).then(() => console.log("✅ Table checked/created"))
  .catch(err => console.error("❌ Table creation error", err));

// API Route to store emails
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        await pool.query("INSERT INTO emails (email) VALUES ($1)", [email]);
        res.json({ message: "✅ Email subscribed successfully!" });
    } catch (err) {
        if (err.code === "23505") { // Unique constraint violation
            res.status(400).json({ message: "⚠️ Email is already subscribed!" });
        } else {
            console.error(err);
            res.status(500).json({ message: "❌ Server error. Please try again." });
        }
    }
});


// API Route to retrieve all emails
app.get("/emails", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM emails");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error retrieving emails" });
    }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
