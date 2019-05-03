const express = require("express");
const api = express.Router();

const test = require("./modules/test");

api.get("/api/test", test.testMethod);

module.exports = api;
