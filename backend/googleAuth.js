const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load the JSON key file from the 'credentials' directory
const keyFilePath = path.join(
  __dirname,
  "credentials",
  "gemini-api-service-account-mis.json"
);
const key = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));

// Authenticate using the JSON key
const authClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/cloud-platform"]
);

// Authorize the client
authClient.authorize(async (err, tokens) => {
  if (err) {
    console.error("Error authorizing with JSON key:", err);
    return;
  }
  console.log("Successfully authorized with JSON key!");

  // Manually pass the credentials to the PredictionServiceClient
  const client = new PredictionServiceClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    projectId: key.project_id,
  });

  const endpoint = `projects/${key.project_id}/locations/us-central1/endpoints/your_endpoint_id`; // Replace with your actual endpoint ID

  try {
    const [response] = await client.predict({
      endpoint,
      instances: [{ content: "What is the best insurance for a new car?" }],
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 100,
      },
    });

    console.log("AI Response:", response.predictions);
  } catch (err) {
    console.error("Error making API request:", err);
  }
});
