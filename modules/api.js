/**
 * Module handling api calls, redirecting them to other modules.
 * Used in server.js
 */

const express = require("express");
const api = express.Router();

// Modules
const contract = require("./contract");
const entity = require("./entity");
const db = require("./db");

// check if server is up
api.use(function(req, res, next) {
    db.ping(function(err) {
        if (err) {
            res.status(500).send("SQL server is not up");
        } else {
            next();
        }
    });
});

// api calls

api.get("/contract/get", contract.get);
api.post("/contract/create", contract.create);
api.post("/contract/delete", contract.delete);
api.post("/contract/edit/name", contract.changeName);
api.post("/contract/edit/condition", contract.changeCondition);

api.get("/entity/get", entity.get);
api.post("/entity/create", entity.create);
api.post("/entity/delete", entity.delete);


module.exports = api;
