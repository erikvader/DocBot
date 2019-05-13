
/**
 * Module handling api calls, redirecting them to other modules.
 * Used in server.js
 */

const express = require("express");
const api = express.Router();

// Modules
const contract = require("./contract");

// api calls
api.get("/api/contract/get", contract.get);
api.post("/api/contract/create", contract.create);
api.post("/api/contract/delete", contract.delete);
api.post("/api/contract/edit/name", contract.changeName);
api.post("/api/contract/edit/condition", contract.changeCondition);

module.exports = api;
