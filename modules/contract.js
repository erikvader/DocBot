/**
 * Module keeping track of contract,
 * handles the following api calls
 */

let db = require("./db");

class Contract {
    static create(req, res) {}

    /**
     * Get all contracts, unless id is provided, in
     * which case that contract will be returned along
     * with questions and their formulations and conditions.
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static get(req, res) {
        // Check if contranct_id is set either in query(url) or as GET parameter
        let id = {...req.params, ...req.query}.contract_id;

        if (typeof id !== "undefined") {
            // Get specific contract
            let sql = "SELECT * FROM Node WHERE id = ? AND root_id IS NULL";
            db.query(sql, [id], (error, result) => {
                let contract = result;
                // Get the questions belonging to that contract
                sql = "SELECT * FROM Node WHERE root_id = ?";
                db.query(sql, [id], (error, result) => {
                    contract.questions = result;
                    res.send(contract);
                });
            });
        } else {
            // Get all contracts
            /*
            let sql = "SELECT * FROM Node WHERE root_id IS NULL";
            db.query(sql, null, (error, result) => {
                res.send(["all", ...result]);
            });
            */
        }
    }
    static delete(req, res) {}
    static changeName(req, res) {}
    static changeCondition(req, res) {}
}

module.exports = Contract;
