const WebSocket = require("ws");
const wsPort = 1337;
const {translator, assistant, workspace_id} = require("./watson");

const wss = new WebSocket.Server({
    port: wsPort
});

/**
 * Make an API call to IBM Watson translator.
 * @param  {String} text     What to translate.
 * @param  {String} model_id What model to use, like "sv-en" for translating from swedish to english
 * @return {Promise}          Resolves promise if translation is successful, rejects otherwise
 */
function translate(text, model_id) {
    return new Promise((resolve, reject) => {
        let params = {
            text,
            model_id
        };

        translator
            .translate(params)
            .then(resp => {
                let translation = resp.translations[0].translation;
                resolve(translation);
            })
            .catch(err => {
                console.log("error:", err);
                reject(err);
            });
    });
}

/**
 * Shorthand for calling translate with model for translating from english to swedish.
 * @param  {String} text What to translate.
 * @return {promise}      Resolves if successful, rejects otherwise.
 */
function translateToSwedish(text) {
    return translate(text, "en-sv");
}

/**
 * Shorthand for calling translate with model for translating from swedish to english.
 * @param  {String} text What to translate.
 * @return {Promise}      Resolves if successful, rejects otherwise.
 */
function translateToEnglish(text) {
    return translate(text, "sv-en");
}

/**
 * Send a message to IBM Watson assistant.
 * @param  {String} [text=null]    What message to send to Watson.
 * @param  {Object} [context=null] The context in which the conversation is happening, if left blank a new conversation will begin.
 * @return {Promise}                Resolves if API call is successful, rejects otherwise.
 */
function queryAssistant(text = null, context = null) {
    return new Promise((resolve, reject) => {
        let params = {
            workspace_id
        };

        // Leave input as undefined to get welcome phrase
        if (context) {
            params.input = {text};
            params.context = context;
        }

        assistant
            .message(params)
            .then(response => {
                let answer = JSON.stringify(response.output.text);
                let context = response.context;
                resolve({answer, context});
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

/**
 * Shorthand for getting the welcome phrase from Watson, i.e. start a new conversation.
 * @return {[type]} [description]
 */
function getWelcome() {
    return queryAssistant();
}

// Initial connection from client side
wss.on("connection", function(ws, req) {
    // The context in which the conversation is happening,
    // gets updated after each call to watson
    let context = null;

    /**
     * Shorthand for sending a message to the client
     * @param  {String} message What to send
     * @return {Void}
     */
    function reply(message) {
        ws.send(message);
    }

    // Get the welcome phrase and conversation_id
    getWelcome().then(response => {
        context = response.context;
        reply(response.answer);
    });

    // Handle when a message arrives from client side
    // Currently all messages are sent to watson
    ws.on("message", function(message) {
        translateToEnglish(message)
            .then(translation => queryAssistant(translation, context))
            .then(response => {
                context = response.context;
                reply(response.answer);
            });
    });
});

module.exports = wss;
