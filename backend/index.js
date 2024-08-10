const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
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

// Define a POST endpoint for sending messages to the AI
app.post("/hello", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const streamResult = await chat.sendMessageStream([{ text: userMessage }]);
    const aiResponse = (await streamResult.response).candidates[0].content;
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
});

// Remove the /greeting endpoint from the frontend or make sure it is implemented
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
