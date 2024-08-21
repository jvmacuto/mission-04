// routes/routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

router.post("/hello", controller.getInitialGreeting);
router.post("/chat", controller.getUserChat);
router.post("/recommendation", controller.generateRecommendation);

module.exports = { router };
