/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

//sample full url: https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=64SZ7JIXSAAFMA1F&symbol=goog
const URL = "https://www.alphavantage.co/query"
const FUNCTION = "TIME_SERIES_DAILY";
const API_KEY = process.env.ALPHA_VINTAGE_API_KEY;
const DB_TABLE = 'stock-likes'

var expect = require('chai').expect;
var rp = require('request-promise');

module.exports = function (app, db) {
  
  app.route('/api/reset')
    .get(function(req,res){
    let stock = req.query.stock.toLowerCase();
    db.collection(DB_TABLE).deleteOne({stock: stock}, (err, result)=>{
      res.send("Deleted " + stock + " document successfully");
    });
  })

  app.route('/api/stock-prices')
    .get(function (req, res){

      //console.log("req:", req);//
      //console.log("req.query:", req.query);
      
      //let userIp = req.header('x-forwarded-for').split(',')[0] || req.connection.remoteAddress;
      let userIp = "0"; //during fuctional tests, no x-forwarded-for prop, so use "0" instead
      //console.log("req.headers", req.headers);
      if(req.headers['x-forwarded-for'] != undefined){
        userIp = req.headers['x-forwarded-for'].split(',')[0];
      }
      //console.log("userIp:", userIp);
      let stock = req.query.stock;
      let like = req.query.like;
      //console.log("like", like);
    
      if(stock == null || stock == ''){
        res.send("no stock value received");
        return;
      }
    
      if(typeof stock == 'object'){
        //console.log("stock is an array");
        
        if(stock.length != 2){
          res.send("only 2 stocks are accepted at a time");
          return;
        }
        
        stock[0] = stock[0].toLowerCase();
        stock[1] = stock[1].toLowerCase();
        
        let options1 = {
          uri: URL + "?function=" + FUNCTION + "&apikey=" + API_KEY + "&symbol=" + stock[0],
          json: true
        };
        
        let options2 = {
          uri: URL + "?function=" + FUNCTION + "&apikey=" + API_KEY + "&symbol=" + stock[1],
          json: true
        };
        
        
        rp(options1) //get price for stock1
          .then((response1)=>{
            if("Note" in response1){
              //console.log("Note found");
              res.send("API call limit reached. Please wait one minute and try again");
              return;
            }
            response1 = response1['Time Series (Daily)'];
            let date1 = Object.keys(response1)[0];
            response1 = response1[date1];
            let price1 = response1['4. close'];
            price1 = parseFloat(price1).toFixed(2).toString();
          
            rp(options2) //get price for stock2 after finished with stock1
              .then((response2)=>{
                if("Note" in response2){
                  //console.log("Note found");
                  res.send("API call limit reached. Please wait one minute and try again");
                  return;
                }
                //console.log("response2", response2);
                response2 = response2['Time Series (Daily)'];
                let date2 = Object.keys(response2)[0];
                response2 = response2[date2];
                let price2 = response2['4. close'];
                price2 = parseFloat(price2).toFixed(2).toString();
                //console.log("price1:", price1);
                //console.log("price2:", price2);
                //res.send("finished");
              
                db.collection(DB_TABLE).findOne({stock: stock[0]}, (err, stock1Entry)=>{ //check if stock1 in db
                  console.log("stock1Entry:", stock1Entry);
                  let numLikes1;
                  if(stock1Entry == null){
                    //console.log("stock1 not found in db");
                    numLikes1 = 0;
                    if(like == 'true'){
                      numLikes1++;
                      let newEntry1 = {
                        stock: stock[0],
                        likes: [userIp]
                      };
                      db.collection(DB_TABLE).insertOne(newEntry1, (err, doc)=>{})
                    }
                  }else{
                    let likes1 = stock1Entry.likes;
                    numLikes1 = likes1.length;
                    if(like == 'true' && !likes1.includes(userIp)){
                      numLikes1++;
                      let criteria = {stock: stock[0]};
                      let update = {$push: {likes: userIp}}
                      db.collection(DB_TABLE).findOneAndUpdate(criteria, update, (er, res)=>{})
                    }
                  }
                  //second stock
                  db.collection(DB_TABLE).findOne({stock: stock[1]}, (err, stock2Entry)=>{
                    //console.log("stock2Entry:", stock2Entry);
                    let numLikes2;
                    if(stock2Entry == null){
                      //console.log("stock2 not found in db");
                      numLikes2 = 0;
                      if(like == 'true'){
                        numLikes2++;
                        let newEntry2 = {
                          stock: stock[1],
                          likes: [userIp]
                        };
                        db.collection(DB_TABLE).insertOne(newEntry2, (err, doc)=>{})
                      }
                    }else{
                      let likes2 = stock2Entry.likes;
                      numLikes2 = likes2.length;
                      if(like == 'true' && !likes2.includes(userIp)){
                        numLikes2++;
                        let criteria = {stock: stock[1]};
                        let update = {$push: {likes: userIp}}
                        db.collection(DB_TABLE).findOneAndUpdate(criteria, update, (er, res)=>{})
                      }
                    }
                    //console.log("numLikes1:", numLikes1);
                    //console.log("numLikes2:", numLikes2);
                    
                    let stocks = [];
                    stocks[0] = {
                      stock: stock[0].toUpperCase(),
                      price: price1,
                      rel_likes: numLikes1 - numLikes2
                    };
                    stocks[1] = {
                      stock: stock[1].toUpperCase(),
                      price: price2,
                      rel_likes: numLikes2 - numLikes1
                    };
                    
                    let stockData = stocks;
                    res.json({stockData});
                  });
                });
              }).catch((e)=>{
                res.send("invalid stock symbol(s)")
              })
          }).catch((e)=>{
            res.send("invalid stock symbol(s)");
          });
        
        
      } else{
        //console.log("stock is a string");
        
        stock = stock.toLowerCase();
        
        let options = {
          uri: URL + "?function=" + FUNCTION + "&apikey=" + API_KEY + "&symbol=" + stock,
          json: true
        };
        
        rp(options)
          .then((response)=>{
            if("Note" in response){
              //console.log("Note found");
              res.send("API call limit reached. Please wait one minute and try again");
              return;
            }
            //console.log("raw esponse", response);
            response = response['Time Series (Daily)'];
            //console.log("response", response)
            let date = Object.keys(response)[0];
            //console.log("date:", date);
            response = response[date];
            let price = response['4. close'];
            price = parseFloat(price).toFixed(2).toString();
            //console.log("response:", response);
            //console.log("price:", price);
          
            db.collection(DB_TABLE).findOne({stock: stock}, (err, entry)=>{
              //console.log("entry:", entry);
              let numLikes;
              if(entry == null){
                //console.log("stock not found in db")
                numLikes = 0;
                if(like == 'true'){
                  numLikes++;
                  let newEntry = {
                    stock: stock,
                    likes: [userIp]
                  };
                  db.collection(DB_TABLE).insertOne(newEntry, (err, doc)=>{})
                }
              }else{
                let likes = entry.likes;
                numLikes = likes.length;
                if(like == 'true' && !likes.includes(userIp)){
                  numLikes++;
                  let criteria = {stock: stock};
                  let update = {$push: {likes: userIp}}
                  db.collection(DB_TABLE).findOneAndUpdate(criteria, update, (er, res)=>{})
                }
                
              }
              
              let stockData = {
                stock: stock.toUpperCase(),
                price,
                likes: numLikes
              };

              res.json({stockData});
            })


          })
          .catch((e)=>{
            res.send(stock + " is an invalid stock symbol");
          });
      }
    
    
      //res.send("GET testing");
      
    });
    
};
