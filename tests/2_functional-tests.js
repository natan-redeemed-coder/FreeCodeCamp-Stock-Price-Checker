const chai = require("chai");
const assert = chai.assert;
const chaiHttp = require("chai-http");

const server = require("../server");


chai.use(chaiHttp);


suite("Functional Tests", function() {
  test("Viewing one stock: GET request to /api/stock-prices/", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices")
      .query({
        stock: "goog",
        like: "false"
      })
      .end(
        function (error, response) {
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.type, "application/json");
          assert.deepStrictEqual(Object.keys(response.body), ["stockData"]);
          assert.isObject(response.body.stockData);
          assert.hasAllKeys(response.body.stockData, ["stock", "price", "likes"]);
          assert.strictEqual(response.body.stockData.stock, "GOOG");
          assert.strictEqual(response.body.stockData.likes, 0);
          done();
        }
      );
  });

  test("Viewing one stock and liking it: GET request to /api/stock-prices/", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices")
      .query({
        stock: "goog",
        like: "true"
      })
      .end(
        (error, response) => {
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.type, "application/json");
          assert.deepStrictEqual(Object.keys(response.body), ["stockData"]);
          assert.isObject(response.body.stockData);
          assert.isTrue(Object.keys(response.body.stockData).every((field) => ["stock", "price", "likes"].includes(field)));
          assert.strictEqual(response.body.stockData.stock, "GOOG");
          assert.strictEqual(response.body.stockData.likes, 1);
          done();
        }
      );
  });

  test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices")
      .query({
        stock: "goog",
        like: "true"
      })
      .end(
        function (error, response) {
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.type, "application/json");
          assert.deepStrictEqual(Object.keys(response.body), ["stockData"]);
          assert.isObject(response.body.stockData);
          assert.hasAllKeys(response.body.stockData, ["stock", "price", "likes"]);
          assert.strictEqual(response.body.stockData.stock, "GOOG");
          assert.strictEqual(response.body.stockData.likes, 1);
          done();
        }
      );
  });

  test("Viewing two stocks: GET request to /api/stock-prices/", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices")
      .query({
        stock: ["goog", "msft"],
        like: "false"
      })
      .end(
        function (error, response) {
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.type, "application/json");
          assert.deepStrictEqual(Object.keys(response.body), ["stockData"]);
          assert.isArray(response.body.stockData);
          assert.isTrue(response.body.stockData.length === 2);
          assert.isObject(response.body.stockData[0]);
          assert.hasAllKeys(response.body.stockData[0], ["stock", "price", "rel_likes"]);
          assert.strictEqual(response.body.stockData[0].stock, "GOOG");
          assert.strictEqual(response.body.stockData[0].rel_likes, 1);
          assert.isObject(response.body.stockData[1]);
          assert.hasAllKeys(response.body.stockData[1], ["stock", "price", "rel_likes"]);
          assert.strictEqual(response.body.stockData[1].stock, "MSFT");
          assert.strictEqual(response.body.stockData[1].rel_likes, -1);
          done();
        }
      );
  });

  test("Viewing two stocks and liking them: GET request to /api/stock-prices/", function(done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/stock-prices")
      .query({
        stock: ["goog", "msft"],
        like: "true"
      })
      .end(
        function (error, response) {
          assert.strictEqual(response.status, 200);
          assert.strictEqual(response.type, "application/json");
          assert.deepStrictEqual(Object.keys(response.body), ["stockData"]);
          assert.isArray(response.body.stockData);
          assert.isTrue(response.body.stockData.length === 2);
          assert.isObject(response.body.stockData[0]);
          assert.hasAllKeys(response.body.stockData[0], ["stock", "price", "rel_likes"]);
          assert.strictEqual(response.body.stockData[0].stock, "GOOG");
          assert.strictEqual(response.body.stockData[0].rel_likes, 0);
          assert.isObject(response.body.stockData[1]);
          assert.hasAllKeys(response.body.stockData[1], ["stock", "price", "rel_likes"]);
          assert.strictEqual(response.body.stockData[1].stock, "MSFT");
          assert.strictEqual(response.body.stockData[1].rel_likes, 0);
          done();
        }
      );
  });
});