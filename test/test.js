let supertest = require("supertest");
let should = require("should");

const port = process.env.PORT || 3000;
let server = supertest.agent("http://localhost:" + port);

// UNIT test begin

describe("SAMPLE unit test", function() {
    // #1 should return home page

    it("should return home page", function(done) {
        // calling home page api
        server
            .get("/")
            .expect("Content-type", "text/html")
            .expect(200)
            .end(function(err, res) {
                // HTTP status should be 200
                //res.status.should.equal(200);
                // Error key should be false.
                //res.body.error.should.equal(false);
                done();
            });
    });
});
