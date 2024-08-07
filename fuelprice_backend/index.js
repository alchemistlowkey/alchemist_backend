// Import required modules
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const User = require("./models/User"); // Import the User model

// Initialize the Express application
const app = express();

// Define the port to run the server on
const PORT = process.env.PORT || 5000;

let uri = process.env.MONGODB_URI;

// Middleware to enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

app.use(helmet());

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Connect to the MongoDB database
// mongoose.connect(`mongodb://localhost:27017/fuelprice`);
mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB Database connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
    process.exit(1);
  });

const connection = mongoose.connection;

// Log a message once the MongoDB connection is established
// connection.once("open", () => {
//   console.log("MongoDB Database connected");
// });

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Endpoint to get all users, sorted by creation date in descending order
app.get("/users", (req, res) => {
  User.find()
    .sort({ createdAt: "desc" })
    .then((users) => res.json(users))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error fetching users" });
    });
});

// Endpoint to create a new user
app.post("/users", (req, res) => {
  // Create a new User instance with the data from the request body
  let user = new User(req.body);

  // Save the user to the database
  user
    .save()
    .then((user) => res.json(user))
    .catch((err) => {
      res.status(400).json({ message: "Error saving user", error: err });
    });
});

// Endpoint to delete a user by ID
app.delete("/users/:id", (req, res) => {
  console.log(req.params.id);
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "User Deleted" }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Error deleting user" });
    });
});

// Endpoint to search for users based on query and sort by price if specified
app.get("/search", async (req, res) => {
  try {
    const { query, sortBy } = req.query;

    let searchQuery = {};

    // Build the search query if a query parameter is provided
    if (query) {
      searchQuery = {
        $or: [
          { location: new RegExp(query, "i") }, // Case-insensitive regex search for location
          { product: new RegExp(query, "i") }, // Case-insensitive regex search for product
          { stationName: new RegExp(query, "i") }, // Case-insensitive regex search for station name
        ],
      };
    }

    // Find users based on the search query
    let users = await User.find(searchQuery);

    // Sort users by price if sortBy is specified as "price"
    if (sortBy === "price") {
      users = users.sort((a, b) => a.price - b.price);
    }

    // Return the found users as a JSON response
    res.json(users);
  } catch (error) {
    // Handle errors and send a 500 status code with an error message
    res.status(500).json({ message: error.message });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
