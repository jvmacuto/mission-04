const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

//print hello world from controllers
router.post("/hello", controller.getResponse);
router.post("/greeting", controller.getGreeting);

module.exports = { router };
