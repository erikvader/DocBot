/**
 * Module keeping track of contract.
 */

/**
 * Cool way of documenting:
 * @api {post} /api/user Create user
 * @apiName Create new user
 * @apiPermission admin
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username
 * @apiParam  {String} [email] Email
 * @apiParam  {String} [phone] Phone number
 * @apiParam  {String} [status] Status
 *
 * @apiSuccess (200) {Object} mixed `User` object
 */

const db = require("./db");
const {assistant, workspace_id} = require("./watson");

const WELCOME_NODE = "welcome";
const WELCOME_PHRASE = "Hello, how can I help you?";
const CONTRACT_CATCH = "contract catch";
const CONTRACT_CATCH_PHRASE =
    "Sorry, I don't know if I can help you with that, maybe try rephrasing it?";

class Contract {
    /**
     * Create the catch node for all contracts,
     * which is used when the system can't recognize
     * what the user want.
     * @param  {String} previousNode Title of the last top-level node.
     * @return {Promise}          Result of API call.
     */
    static createCatchNode(previousNode) {
        return assistant.createDialogNode({
            workspace_id,
            dialog_node: CONTRACT_CATCH,
            title: CONTRACT_CATCH,
            conditions: "anything_else",
            previous_sibling: previousNode,
            output: {
                generic: [
                    {
                        values: [
                            {
                                text: CONTRACT_CATCH_PHRASE
                            }
                        ],
                        response_type: "text"
                    }
                ]
            }
        });
    }

    /**
     * Create the welcome node in the dialog tree, greeting the user.
     * @return {Promise} Result of api call.
     */
    static createWelcomeNode() {
        return assistant.createDialogNode({
            workspace_id,
            dialog_node: WELCOME_NODE,
            title: WELCOME_NODE,
            conditions: "welcome",
            output: {
                generic: [
                    {
                        values: [
                            {
                                text: WELCOME_PHRASE
                            }
                        ],
                        response_type: "text"
                    }
                ]
            }
        });
    }

    /**
     * Make sure the dialog tree has a welcome node and a catch node.
     * If they can't be found they are created.
     * @return {Promise} Resolves promise if all gone well and both exists or have been created, rejects otherwise
     */
    static validateDialogTree() {
        return new Promise((resolve, reject) => {
            // Get all nodes
            let params = {
                workspace_id,
                include_count: true
            };

            // Get all nodes from watson
            assistant
                .listDialogNodes(params)
                .then(list => {
                    let welcomeNode = list.dialog_nodes.find(
                        node => node.title === WELCOME_NODE
                    );
                    let catchNode = list.dialog_nodes.find(
                        node => node.title === CONTRACT_CATCH
                    );

                    // Contract catch should always be the last of the top level siblings
                    let lastContract =
                        list.dialog_nodes
                            .reverse()
                            .find(
                                node => typeof node.parent_node === "undefined"
                            ) || WELCOME_NODE;

                    // Local function checking if catch node is set, creates it otherwise
                    function checkCatch() {
                        // If contract catch node doesn't exist, create it
                        if (typeof catchNode === "undefined") {
                            Contract.createCatchNode(lastContract)
                                .then(res => {
                                    resolve(true);
                                })
                                .catch(err => {
                                    reject(err);
                                });
                        } else {
                            resolve(true);
                        }
                    }

                    // If welcome node doesn't exist, create it
                    if (typeof welcomeNode === "undefined") {
                        Contract.createWelcomeNode()
                            .then(res => {
                                checkCatch();
                            })
                            .catch(err => {
                                reject(err);
                            });
                    } else {
                        checkCatch();
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    /**
     * Create contract with name. Responds with name and id of created contract.
     * It also validates the integrity of the dialog tree and makes sure that a
     * welcome node and an anything_else node is present.
     *
     * Method: POST
     * Parameters:
     *      String name (required)
     * Status:
     *      201 created
     *      400 bad request
     *
     * @param  {IncomingMessage} req Request object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static create(req, res) {
        const name = req.body.name;

        if (typeof name === "undefined" || name === "") {
            return res
                .status(400)
                .send({message: "Parameter name required but not set"});
        }

        // Add it to the database
        let sql = "INSERT INTO Node (name) VALUES (?)";
        db.query(sql, [name], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({message: "Something went wrong"});
            }

            // Check integrity of contract level nodes
            Contract.validateDialogTree().then(r => {
                // Send it to watson
                let params = {
                    workspace_id,
                    dialog_node: "" + result.insertId,
                    title: name,
                    previous_sibling: WELCOME_NODE
                };

                assistant
                    .createDialogNode(params)
                    .then(resp => {
                        res.status(200).send({name, id: result.insertId});
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).send({message: "Something went wrong"});
                    });
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
     * @param  {IncomingMessage} req Request object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static get(req, res) {
        // Check if contract_id is set either in query (url) or as GET parameter
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
                    return res
                        .status(500)
                        .send({message: "Something went wrong"});
                }

                let nodes = result[0];
                let wordings = result[1];
                let intents = result[2];
                let entities = result[3];

                // Seperate the contract and the questions
                let contract = nodes.find(node => node.root_id === null);

                if (typeof contract === "undefined") {
                    return res.status(400).send({
                        message: "Could not find a contract with that id"
                    });
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

                res.status(200).send(contract);
            });
        } else {
            // Get all contracts
            let sql = "SELECT * FROM Node root_id IS null";
            db.query(sql, [], (error, result) => {
                res.status(200).send(result);
            });
        }
    }

    /**
     * Delete the contract and all of its questions.
     *
     * Method: POST
     * Parameters:
     *      Number contract_id (required)
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static delete(req, res) {
        const contract_id = req.body.contract_id;

        if (typeof contract_id === "undefined") {
            return res
                .status(400)
                .send({message: "Parameter contract_id required but not set"});
        }

        // Remove the node from the database
        let sql = "DELETE FROM Node WHERE root_id IS NULL AND id = ?";
        db.query(sql, [contract_id], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({message: "Something went wrong"});
            }

            if (result.affectedRows === 0) {
                return res
                    .status(400)
                    .send({message: "No contract with that id"});
            }

            // Remove it from Watson
            const params = {
                workspace_id,
                dialog_node: "" + contract_id
            };

            assistant
                .deleteDialogNode(params)
                .then(assiResponse => {
                    return res.status(200).send({contract_id});
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    /**
     * Change the name of the contract.
     * Method: POST
     * Parameters:
     *      Number contract_id (required)
     *      String name (required)
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static changeName(req, res) {
        const contract_id = req.body.contract_id;
        const name = req.body.name;

        if (typeof contract_id === "undefined") {
            return res
                .status(400)
                .send({message: "Parameter contract_id required but not set"});
        }

        if (typeof name === "undefined" || name === "") {
            return res
                .status(400)
                .send({message: "Parameter name required but not set"});
        }

        let sql = "UPDATE Node SET name = ? WHERE id = ?";
        db.query(sql, [name, contract_id], (error, result) => {
            if (error) {
                return res.status(500).send({message: "Something went wrong"});
            }

            if (result.affectedRows === 0) {
                return res
                    .status(400)
                    .send({message: "No contract with that id"});
            }

            const params = {
                workspace_id,
                dialog_node: contract_id,
                new_title: name
            };

            assistant
                .updateDialogNode(params)
                .then(assiResponse => {
                    res.status(200).send({contract_id, name});
                })
                .catch(err => {
                    console.log(err);
                });
        });
    }

    /**
     * Update the condition of the contract, removes the current conditions and inserts the new ones.
     * Method: POST
     * Parameters:
     *      Number contract_id (required)
     *      Number[] entity_value_ids (required)
     *      Number[] intent_ids (required)
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static changeCondition(req, res) {
        const contract_id = req.body.contract_id;
        const entityValueIds = req.body.entity_value_ids;
        const intentIds = req.body.intent_ids;

        // TODO: Create middleware to handle required parameters

        if (typeof contract_id === "undefined") {
            return res
                .status(400)
                .send({message: "Parameter contract_id required but not set"});
        }

        if (typeof entityValueIds === "undefined") {
            return res
                .status(400)
                .send({
                    message: "Parameter entity_value_ids required but not set"
                });
        }

        if (typeof intentIds === "undefined") {
            return res
                .status(400)
                .send({message: "Parameter intent_ids required but not set"});
        }

        // Get contract
        let sql = "SELECT id FROM Node WHERE id = ? AND root_id IS NULL;";
        let params = [contract_id];

        // Get names of entity values
        sql +=
            "SELECT Entity.name AS name, EntityValue.name AS value FROM EntityValue INNER JOIN Entity ON EntityValue.entity_id = Entity.id WHERE EntityValue.id IN (?);";
        params.push(entityValueIds);

        // Get names of intents
        sql += "SELECT name FROM Intent WHERE id IN (?);";
        params.push(intentIds);

        db.query(sql, params, (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({message: "Something went wrong"});
            }

            let contract = result[0][0];
            let entityValues = result[1];
            let intents = result[2];

            if (typeof contract === "undefined") {
                return res
                    .status(400)
                    .send({message: "No contract with that id"});
            }

            // Insert the new conditions into the database

            sql = "";
            params = [];
            entityValueIds.forEach(id => {
                sql +=
                    "INSERT INTO ConditionEntityValue (entity_value_id, node_id) VALUES (?, ?);";
                params.push(id, contract_id);
            });

            intentIds.forEach(id => {
                sql +=
                    "INSERT INTO ConditionIntent (node_id, intent_id) VALUES (?, ?);";
                params.push(id, contract_id);
            });

            db.query(sql, params, (error, result) => {
                if (error) {
                    console.log(error);
                    return res
                        .status(500)
                        .send({message: "Something went wrong"});
                }

                // Send the data to watson
                let condition = "";
                intents.forEach(intent => {
                    // preface with an 'and' if not empty
                    condition += condition.length === 0 ? "" : " and ";
                    condition += "#" + intent.name;
                });

                entityValues.forEach(entity => {
                    // preface with an 'and' if not empty
                    condition += condition.length === 0 ? "" : " and ";
                    condition += "@" + entity.name + ":" + entity.value;
                });

                let params = {
                    workspace_id,
                    dialog_node: "" + contract_id,
                    new_conditions: condition
                };

                assistant
                    .updateDialogNode(params)
                    .then(resp => {
                        res.status(200).send(result);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
        });
    }
}

module.exports = Contract;
