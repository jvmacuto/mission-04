// routes/routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

router.post("/input", controller.handleUserInput);
router.post("/recommendation", controller.generateRecommendation);

module.exports = { router };
