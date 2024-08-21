// controllers/controllers.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//greetings prompt
const getInitialGreeting = async (req, res) => {
  //greet the user
  let prompt = req.body.message;
  console.log(req.body);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiResponse = response.text();

  res.send({ reply: aiResponse });
};

const getUserChat = async (req, res) => {
  if (!req.session) {
    req.session = {};
  }
  let userMessage = req.body.message;
  let conversationState = req.session.conversationState || [];

  console.log(req.body);

  // Initialize the conversation with a general prompt if no state exists
  let prompt = "You are an AI car insurance consultant. ";

  // Update the prompt with the conversation history
  conversationState.forEach((entry) => {
    prompt += `User said: "${entry.userMessage}". AI replied: "${entry.aiResponse}". `;
  });

  // Add the current user message to the prompt
  if (userMessage) {
    prompt += `User said: "${userMessage}". `;
  }

  // Generate AI response
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiResponse = await response.text();

  // Create an entry with the user message and AI response
  const conversationEntry = {
    userMessage: userMessage,
    aiResponse: aiResponse,
  };

  // Push the entry to the conversation state
  conversationState.push(conversationEntry);

  // Save the updated conversation state back to the session
  req.session.conversationState = conversationState;

  // Send the AI response back to the user
  res.send({ reply: aiResponse });
};

// Generate final insurance recommendation
const generateRecommendation = async (req, res) => {
  const userAttributes = req.body;
  console.log(req.body);
  let prompt =
    "You are Tinnie, an AI insurance consultant. Based on the following user details: ";

  console.log(userAttributes[0].message);

  //get all the user input and key
  userAttributes.forEach((element) => {
    prompt += `${element.key} is ${element.message}. `;
  });

  prompt +=
    "considering that MBI is not available to trucks and racing cars and Comprehensive Car Insurance is only for vehicles less than 10 years old, what insurance policy would you recommend and why? Explain specifics. Do not mention the ${element.key} and ${element.message}. variables in your response.";

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const recommendation = response.text();

  console.log(recommendation);
  res.send({ recommendation: recommendation });
};

module.exports = {
  getInitialGreeting,
  getUserChat,

  generateRecommendation,
};
