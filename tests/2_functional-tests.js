/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

const TEST_STOCK = "acopy";
const TEST_STOCK_2 = "awrrf";

suite('Functional Tests', function() {
  
    suite('GET /api/reset => delete TEST_STOCK objects', function() {
      test('reset TEST-STOCK', function(done){
        chai.request(server)
          .get('/api/reset')
          .query({stock: TEST_STOCK})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Deleted ' + TEST_STOCK.toLowerCase() + ' document successfully');
            done();
          });
      });
      test('reset TEST-STOCK_2', function(done){
        chai.request(server)
          .get('/api/reset')
          .query({stock: TEST_STOCK_2})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'Deleted ' + TEST_STOCK_2.toLowerCase() + ' document successfully');
            done();
          });
      });
    });
  
    suite('GET /api/stock-prices => stockData object', function() {
      
      /* Stock price API only allows 5 API calls per minute, so we can't run all the tests at once.
      
      test('1 stock', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: TEST_STOCK})
        .end(function(err, res){
          //console.log("rest.body", res.body);
          assert.equal(res.status, 200, "status is not 200");
          assert.isObject(res.body.stockData, "stockData is not an boject");
          assert.property(res.body.stockData, 'price', "price is not a prop of stockData");
          assert.equal(res.body.stockData.likes, 0, "likes does not equal 1");
          assert.equal(res.body.stockData.stock, TEST_STOCK.toUpperCase(), "stock value is incorrect");   
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: TEST_STOCK, like: "true"})
        .end(function(err, res){
          //console.log("res.body", res.body);
          assert.equal(res.status, 200, "status is not 200");
          assert.isObject(res.body.stockData, "stockData is not an boject");
          assert.property(res.body.stockData, 'price', "price is not a prop of stockData");
          assert.equal(res.body.stockData.likes, 1, "likes does not equal 0");
          assert.equal(res.body.stockData.stock, TEST_STOCK.toUpperCase(), "stock value is incorrect");   
          done();
        });
      });
      */
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: TEST_STOCK, like: "true"})
        .end(function(err, res){
          //console.log("res.body", res.body);
          assert.equal(res.status, 200, "status is not 200");
          assert.isObject(res.body.stockData, "stockData is not an boject");
          assert.property(res.body.stockData, 'price', "price is not a prop of stockData");
          assert.equal(res.body.stockData.likes, 1, "likes does not equal 1");
          assert.equal(res.body.stockData.stock, TEST_STOCK.toUpperCase(), "stock value is incorrect");   
          done();
        });
      });
      
      
      test('2 stocks', function(done) {
        setTimeout(function () {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: [TEST_STOCK, TEST_STOCK_2]})
        .end(function(err, res){
          //console.log("res.body", res.body);
          assert.equal(res.status, 200, "status is not 200");
          //assert.isArray(res.body.stockData, "stockData is not an boject");//
          assert.isObject(res.body.stockData[0], "stockData[0] is not an boject");
          assert.isObject(res.body.stockData[1], "stockData[1] is not an boject");
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[1], 'price');
          assert.equal(res.body.stockData[0].rel_likes, 1, "rel_likes does not equal 1");
          assert.equal(res.body.stockData[1].rel_likes, -1, "rel_likes does not equal -1");
          assert.equal(res.body.stockData[0].stock, TEST_STOCK.toUpperCase(), "stock1 value is incorrect");
          assert.equal(res.body.stockData[1].stock, TEST_STOCK_2.toUpperCase(), "stock2 value is incorrect"); 
          done();
          }, 30000);
        });
      });
      
      test('2 stocks with like', function(done) {
        setTimeout(function () {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: [TEST_STOCK, TEST_STOCK_2], like: "true"})
        .end(function(err, res){
          //console.log("res.body", res.body);
          assert.equal(res.status, 200, "status is not 200");
          //assert.isArray(res.body.stockData, "stockData is not an boject");//
          assert.isObject(res.body.stockData[0], "stockData[0] is not an boject");
          assert.isObject(res.body.stockData[1], "stockData[1] is not an boject");
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[1], 'price');
          assert.equal(res.body.stockData[0].rel_likes, 0, "rel_likes does not equal 0");
          assert.equal(res.body.stockData[1].rel_likes, 0, "rel_likes does not equal 0");
          assert.equal(res.body.stockData[0].stock, TEST_STOCK.toUpperCase(), "stock1 value is incorrect");
          assert.equal(res.body.stockData[1].stock, TEST_STOCK_2.toUpperCase(), "stock2 value is incorrect"); 
          done();
          }, 30000);
        });
      });
      
      
    });

});
