const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Adjust this according to your frontend server
    credentials: true,
  })
);
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST_NAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.PORT_NUMBER,
});

app.use(
  session({
    store: new pgSession({
      pool: pool,
    }),
    secret: process.env.SECRET, // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set secure to true if using https
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash]
    );
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    req.session.userId = user.id;
    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logout successful" });
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

// Endpoint to submit contact form
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );
    res.json({ success: true, message: "Contact form submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// Endpoint to fetch all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts");
    res.json({ success: true, contacts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
