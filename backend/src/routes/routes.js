const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");

//print hello world from controllers
router.get("/hello", controller.getGreeting);

module.exports = { router };
