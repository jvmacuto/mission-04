// controllers/controllers.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Handle user input and provide AI response
const handleUserInput = async (req, res) => {
  const userInput = req.body.message;
  let prompt = "You are Tinnie, an AI insurance consultant. ";

  if (
    userInput.toLowerCase().includes("start") ||
    userInput.toLowerCase().includes("hello")
  ) {
    prompt +=
      "I help you choose the best insurance policy. May I ask you a few questions to make sure I recommend the best policy for you?";
  } else {
    prompt += `Based on the user's response: "${userInput}", what would be the next question you should ask to determine the best insurance policy?`;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiResponse = response.text();

  res.send({ reply: aiResponse });
};

// Generate final insurance recommendation
const generateRecommendation = async (req, res) => {
  const userAttributes = req.body;
  console.log(userAttributes);
  let prompt =
    "You are Tinnie, an AI insurance consultant. Based on the following user details: ";

  for (const [key, value] of Object.entries(userAttributes)) {
    prompt += `${key}: ${value}, `;
  }

  prompt +=
    "considering that MBI is not available to trucks and racing cars and Comprehensive Car Insurance is only for vehicles less than 10 years old, what insurance policy would you recommend and why? Do not mention the ${key} and ${value} variables in your response.";

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const recommendation = response.text();

  console.log(recommendation);
  res.send({ recommendation: recommendation });
};

module.exports = {
  handleUserInput,
  generateRecommendation,
};
