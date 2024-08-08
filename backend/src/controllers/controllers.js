// Import necessary modules or dependencies
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Load environment variables

console.log(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define your controller functions

// Example controller function
const getGreeting = async (req, res) => {
  const initialPrompt = req.body.message;
  const result = await model.generateContent(initialPrompt);
  const response = await result.response;
  const text = response.text();

  res.send({ reply: text });
};

// Export your controller functions
module.exports = {
  getGreeting,
  // Add more controller functions here if needed
};
