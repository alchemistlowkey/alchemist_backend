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
    origin: "http://localhost:5173" || process.env.FRONTEND_URL, // Adjust this according to your frontend server
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

app.post("/submit-form", async (req, res) => {
  const { name, email, comments } = req.body;

  try {
    const query =
      "INSERT INTO tailorsonline_contact_form (name, email, comments) VALUES ($1, $2, $3)";
    const values = [name, email, comments];

    await pool.query(query, values);
    res.send("Form submitted successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting form");
  }
});

app.post('/subscribe-newsletter', async (req, res) => {
  const { email } = req.body;

  try {
    const query = 'INSERT INTO tailorsonline_newsletter (email) VALUES ($1)';
    const values = [email];

    await pool.query(query, values);
    res.send('Subscribed successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error subscribing to newsletter');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
