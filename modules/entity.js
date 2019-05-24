const db = require("./db");
const {assistant, workspace_id} = require("./watson");

class Entity {

    /**
     * Get all entities, unless id is provided, in
     * which case that entity will be returned along
     * with values and synonyms.
     *
     * Method: GET
     * Parameters:
     *      Number entity_id
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Request object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static get(req, res) {
        // Check if entity_id is set either in query (url) or as GET parameter        
        let entity_id = {...req.params, ...req.query}.entity_id;
        
        if (typeof entity_id !== "undefined") {
            let params = [];

            // Gets the specific entity
            let sql = "SELECT * FROM Entity WHERE id = ?;";
            params.push(entity_id);

            // Gets all values to the entity
            sql += "SELECT * FROM EntityValue WHERE entity_id = ?;";
            params.push(entity_id);

            // Gets all synonyms
            sql += "SELECT * FROM EntitySynonym INNER JOIN EntityValue on EntityValue.id = EntitySynonym.entity_value_id WHERE entity_id = ?";
            params.push(entity_id);

            db.query(sql, params, (error, result) => {
                if (error) {
                    return res
                        .status(500)
                        .send({message: "Something went wrong"});
                }

                let entity = result[0][0];
                let values = result[1];
                let synonyms = result[2];

                if (typeof entity === "undefined") {
                    return res.status(400).send({
                        message: "Could not find a entity with that id"
                    });
                }

                // Adds the synonyms to the entity value
                values.forEach(
                    value =>
                        (value.synonyms = synonyms.filter(
                            synonym => synonym.entity_value_id === value.id
                        ))
                );

                // Adds the values to the entity
                entity.values = values;

                res.status(200).send(entity);

            });
        }
        else{
            // Get all entitties
            //TODO, get all entity_values too
            let params = [];
            let sql = "SELECT * FROM Entity;";
            sql += "SELECT * FROM EntityValue WHERE entity_id = ?;"
            params.push(entity_id);

            db.query(sql, [], (error, result) => {

                let entity = result[0][0];
                let values = result[1];

                if (typeof entity === "undefined") {
                    return res.status(400).send({
                        message: "Could not find a entity with that id"
                    });
                }

                // Adds the values to entity
                entity.values = values;
                res.status(200).send(entity);
            });
        }
    }

    /**
     * Create entity with name. Responds with name and id of created entity.
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

        //Add it to the database
        let sql = "INSERT INTO Entity (name) VALUES (?)";
        db.query(sql, [name], (error, result) => {
            if (error) {
                console.log(error);
                return res.status(500).send({message: "Something went wrong"});
            }

            let params = {
                workspace_id,
                entity: name,
                values: []
            };

            //Add it to Watson
            assistant   
                .createEntity(params)
                .then(resp => {
                    res.status(200).send({name, id: result.id});
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send({message: "Something went wrong"});
                });

        });

    }

    /**
     * Delete the entity
     *
     * Method: POST
     * Parameters:
     *      Number entity_id (required)
     * Status:
     *      200 ok
     *      400 bad request
     *
     * @param  {IncomingMessage} req Reuest object
     * @param  {ServerResponse} res Response object
     * @return {void}
     */
    static delete(req, res) {
        const entity_id = req.body.entity_id;

        if (typeof entity_id === "undefined") {
            return res
                .status(400)
                .send({message: "Parameter entity_id required but not set"});
        }

        // Retrieves name and remove the entity from the database
        let sql_params = [];

        let sql = "SELECT name FROM Entity WHERE id = ?;";
        sql_params.push(entity_id);

        sql += "DELETE FROM Entity WHERE id = ?";
        sql_params.push(entity_id);

        db.query(sql, sql_params, (error, result) => {
            if(error) {
                console.log(error);
                return res.status(500).send({message:  "Something went wrong"});
            }

            if (result.affectedRows === 0) {
                return res
                    .status(400)
                    .send({message: "No entity with that id"});
            }
            
            let name = result[0][0].name;

            const watson_params = {
                workspace_id,
                entity: "" + name
            };

            assistant
                .deleteEntity(watson_params)
                .then(assiResponse => {
                    return res.status(200).send({entity_id});
                })
                .catch(err => {
                    console.log(err);
                    return res.status(500).send({message: "Something went wrong with Watson"});
                });
        })
    }
	
}
module.exports = Entity;
