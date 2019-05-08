/**
 * Module keeping track of contract.
 */

let db = require("./db");
let {assistant, workspace_id} = require("./watson");

class Contract {
    /**
     * Create contract with name. Responds with name and id of
     * created contract.
     *
     * Method: POST
     * Parameters:
     *      String name (required)
     * Status:
     *      201 created
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static create(req, res) {
        const name = req.body.name;

        if (typeof name === "undefined") {
            return res.status(400).send("Parameter name required but not set");
        }

        // Add it to the database
        let sql = "INSERT INTO Node (name) VALUES (?)";
        db.query(sql, [name], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Something went wrong");
            }

            // Send it to watson
            const params = {
                workspace_id,
                dialog_node: "" + result.insertId,
                title: name
            };

            assistant
                .createDialogNode(params)
                .then(assResponse => {
                    res.status(201).send({name, contract_id: result.insertId});
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send("Something went wrong");
                });
        });
    }

    /**
     * Get all contracts, unless id is provided, in
     * which case that contract will be returned along
     * with questions and their formulations and conditions.
     *
     * Method: GET
     * Parameters:
     *      Number contract_id
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static get(req, res) {
        // Check if contranct_id is set either in query (url) or as GET parameter
        let contract_id = {...req.params, ...req.query}.contract_id;

        if (typeof contract_id !== "undefined") {
            let params = [];

            // Get nodes pertaining specific contract
            let sql = "SELECT * FROM Node WHERE id = ? OR root_id = ?;";
            params.push(contract_id, contract_id);

            // Get the wordings for the questions
            sql +=
                "SELECT * FROM QuestionWording WHERE node_id IN (SELECT id FROM Node WHERE id = ? OR root_id = ?);";
            params.push(contract_id, contract_id);

            // Get the condition to all nodes
            sql +=
                "SELECT * FROM ConditionIntent INNER JOIN Intent ON ConditionIntent.intent_id = Intent.id WHERE node_id IN (SELECT id FROM Node WHERE id = ? OR root_id = ?);";
            sql +=
                "SELECT * FROM ConditionEntityValue INNER JOIN EntityValue ON ConditionEntityValue.entity_value_id = EntityValue.id WHERE node_id IN (SELECT id FROM Node WHERE id = ? OR root_id = ?);";
            params.push(contract_id, contract_id);
            params.push(contract_id, contract_id);

            db.query(sql, params, (error, result) => {
                if (error) {
                    return res.status(500).send("Something went wrong");
                }

                let nodes = result[0];
                let wordings = result[1];
                let intents = result[2];
                let entities = result[3];

                // Seperate the contract and the questions
                let contract = nodes.find(node => node.root_id === null);

                if (typeof contract === "undefined") {
                    return res
                        .status(400)
                        .send("Could not find a contract with that id");
                }

                // Add the questions to the contract
                contract.questions = nodes.filter(
                    node => node.root_id !== null
                );

                // Add conditions to all nodes
                nodes.forEach(
                    node =>
                        (node.intents = intents.filter(
                            intent => intent.node_id === node.id
                        ))
                );
                nodes.forEach(
                    node =>
                        (node.entities = entities.filter(
                            entity => entity.node_id === node.id
                        ))
                );

                // Add the wordings to each node
                nodes.forEach(node => {
                    node.wordings = wordings.filter(
                        wording => wording.node_id === node.id
                    );
                });

                res.send(contract);
            });
        } else {
            // Get all contracts
            let sql = "SELECT * FROM Node root_id IS null";
            db.query(sql, [], (error, result) => {
                res.send(result);
            });
        }
    }
    static delete(req, res) {}
    static changeName(req, res) {}
    static changeCondition(req, res) {}
}

module.exports = Contract;
