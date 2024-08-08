// Import any necessary modules or dependencies
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Load environment variables
console.log(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// Define your controller functions

// Example controller function
const getGreeting = (req, res) => {
  // Logic to fetch users from the database or any other data source
  // Return the fetched users as a response
  console.log("CONTROLLER RAN HERE");
  res.send("Hello, world!");
};

// Export your controller functions
module.exports = {
  getGreeting,
  // Add more controller functions here if needed
};
