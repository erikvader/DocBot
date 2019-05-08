const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const app = next({dev});
const handle = app.getRequestHandler();

const api = require("./modules/api");

app.prepare()
    .then(() => {
        const server = express();

        server.use(express.json()); // to support JSON-encoded bodies
        server.use(express.urlencoded({extended: true})); // to support URL-encoded bodies

        server.use(api);
        server.get("*", handle);

        server.listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
    })
    .catch(ex => {
        console.error(ex.stack);
        process.exit(1);
    });
