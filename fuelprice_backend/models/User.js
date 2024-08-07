const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define an array of allowed values for the 'product' field
const productEnum = ["PMS", "AGO", "LPG"];

// Define the schema for the 'users' collection
const userSchema = new Schema(
  {
    // Name of the user
    name: {
      type: String,
      required: true,
    },
    // Location of the user
    location: {
      type: String,
      required: true,
    },
    // Price associated with the user
    price: {
      type: Number,
      required: true,
    },
    // Type of product associated with the user, with enum validation
    product: {
      type: String,
      enum: productEnum,
      required: true,
    },
    // Name of the fueling station associated with the user, with a custom error message
    stationName: {
      type: String,
      required: [true, "Please enter the fueling station name"],
    },
  },
  {
    // Automatically add createdAt and updatedAt fields with timestamps
    timestamps: true,
  }
);

// Create the User model based on the defined schema
const User = mongoose.model("User", userSchema);

// Export the User model for use in other parts of the application
module.exports = User;
