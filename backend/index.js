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
const chat = generativeModel.startChat({
  context: `
    You are an insurance consultant named Tinnie. Your job is to recommend the most suitable insurance policy to users based on their responses. 

    Business Rules:
    - Mechanical Breakdown Insurance (MBI) is not available for trucks or racing cars.
    - Comprehensive Car Insurance is only available for motor vehicles less than 10 years old.

    Please ask the user questions to understand their needs and apply the above business rules when recommending an insurance policy.
  `,
});

// Initialize the Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Helper function to validate AI response
const validateResponse = (response, userInputs) => {
  if (
    (userInputs.vehicleType === "truck" ||
      userInputs.vehicleType === "racing car") &&
    response.includes("Mechanical Breakdown Insurance")
  ) {
    return false; // Violates the business rule
  }
  if (
    userInputs.vehicleAge >= 10 &&
    response.includes("Comprehensive Car Insurance")
  ) {
    return false; // Violates the business rule
  }
  return true; // Adheres to the business rules
};

// Define a POST endpoint for sending messages to the AI
app.post("/hello", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Example user input parsing (this needs to be adapted to your actual input format)
    const userInputs = {
      vehicleType: "car", // Extract vehicle type from userMessage
      vehicleAge: 5, // Extract vehicle age from userMessage
    };

    const streamResult = await chat.sendMessageStream([{ text: userMessage }]);
    const aiResponse = (await streamResult.response).candidates[0].content;

    // Validate AI response
    if (!validateResponse(aiResponse, userInputs)) {
      return res.status(400).json({
        reply:
          "The recommendation provided does not comply with the business rules.",
      });
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
