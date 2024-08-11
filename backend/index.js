const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios"); // For making HTTP requests to external APIs

const { VertexAI } = require("@google-cloud/vertexai");

// Initialize Vertex AI with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "consummate-fold-432104-k9",
  location: "australia-southeast1",
});

const model = "gemini-1.0-pro-002";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 1,
    topP: 1,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

// Create a chat session with the model
const chat = generativeModel.startChat({});

// Initialize the Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

const conversationState = {}; // Store conversation states for multiple users

// Example function to get quotes from an external API
async function getInsuranceQuotes(vehicleDetails) {
  try {
    const response = await axios.post(
      "https://api.insurancecompany.com/get-quote",
      {
        vehicle: vehicleDetails,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching insurance quotes:", error);
    return null;
  }
}

// Define a POST endpoint for sending messages to the AI
app.post("/hello", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || "default"; // Identify user session

  if (!conversationState[sessionId]) {
    conversationState[sessionId] = {
      step: 1,
      vehicleDetails: null,
    };
  }

  try {
    let aiResponse;
    switch (conversationState[sessionId].step) {
      case 1:
        aiResponse =
          "I'm Tinnie. I help you to choose an insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?";
        conversationState[sessionId].step++;
        break;
      case 2:
        if (userMessage.toLowerCase().includes("yes")) {
          aiResponse =
            "Great! Let's start. What type of vehicle do you own? Is it a car, truck, or something else?";
          conversationState[sessionId].step++;
        } else {
          aiResponse = "Okay, feel free to ask any questions if you need help!";
          conversationState[sessionId].step = 1; // Reset the conversation if user opts out
        }
        break;
      case 3:
        conversationState[sessionId].vehicleDetails = userMessage; // Save vehicle details
        aiResponse = "Can you tell me how old your vehicle is?";
        conversationState[sessionId].step++;
        break;
      case 4:
        const vehicleAge = parseInt(userMessage, 10);
        if (isNaN(vehicleAge)) {
          aiResponse = "Please provide a valid number for the vehicle's age.";
        } else {
          const quotes = await getInsuranceQuotes({
            type: conversationState[sessionId].vehicleDetails,
            age: vehicleAge,
          });

          aiResponse = quotes
            ? `Based on your vehicle, here are some insurance quotes: ${quotes}`
            : "Sorry, I couldn't fetch the quotes right now.";
        }
        conversationState[sessionId].step = 1; // Reset after recommendation
        break;
      default:
        aiResponse =
          "Sorry, I didn't quite understand that. Could you please clarify?";
        conversationState[sessionId].step = 1;
        break;
    }

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

// Start the server
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
