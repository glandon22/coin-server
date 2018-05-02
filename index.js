const express = require('express');
const path = require('path');
var moment = require('moment');
moment().format();
const schedule = require('node-schedule');
const _async = require('async');
const app = express();
const PORT = process.env.PORT || 5000;
var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');
var request = require('request');
var coins = [
    'btc', 'bch', 'ltc', 'eth', 'xem', 'zec', 'dash', 'xmr', 'xvg', 'btg'
];
var newData = [];

//wrap function in this after i get it working

schedule.scheduleJob('25 * * * *', () => { 
    coins.forEach(coin => {
        request.get('https://min-api.cryptocompare.com/data/price?fsym=' +  coin.toUpperCase() + '&tsyms=USD', function(err, res, body) {
            var coinPrice = JSON.parse(body);
            newData.push([coin, moment().format('YYYY-MM-DD'), coinPrice.USD]);
            if (newData.length === 10) {
                var con = mysql.createConnection({
                    host: "cryptos.cvndjrqk9gtt.us-east-2.rds.amazonaws.com",
                    user: process.env.USERNAME,
                    password: process.env.PASSWORD,
                    database: "cryptos"
                  });
                  
                  con.connect(function(err) {
                    if (err) throw err;
                    console.log(err);
                    console.log("Connected!");
            
                    var sql = "INSERT INTO test (coin, date, price) VALUES ?";
                    con.query(sql, [newData], function(err, results) {
                        if (err) throw err;
                        console.log(err);
                        console.log('inserted correctly');
                        newData = [];
                    }); 
                });
                
            }
        });
    });
});

app.get('/', function(req,res) {
    res.send('hello world');
});

app.listen(PORT);