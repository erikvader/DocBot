/**
 * This is where the connection happens.
 *
 * To use:
 * let db = require('[path]/db');
 *
 * db.query(query, values, (error, result) => {
 *   if (error) throw error;
 * });
 */

let mysql = require("mysql");

let host = "localhost";
let user = "docbot_admin";
let password = "123";
let database = "docbot";

let connection = mysql.createConnection({
    host,
    user,
    password,
    database,
    multipleStatements: true
});

module.exports = connection;
