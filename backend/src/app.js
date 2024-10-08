// src/app.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const routes = require("./routes/routes");
const cors = require("cors");

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/", routes.router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
