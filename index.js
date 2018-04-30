const express = require('express');
const path = require('path');
var moment = require('moment');
moment().format();
const schedule = require('node-schedule');
const app = express();
const PORT = process.env.PORT || 5000;
var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');
var request = require('request');
var coins = [
    'btc', 'bch', 'ltc', 'eth', 'xem', 'zec', 'dash', 'xmr', 'xvg', 'btg'
];

//wrap function in this after i get it working
/*
schedule.scheduleJob('0 0 * * *', () => { 
........
 });
*/

coins.forEach(coin => {
    request.get('https://coinmetrics.io/data/' + coin + '.csv', function(req,res) {
        console.log(coin);
    });
});

app.get('/', function(req,res) {
    res.send('hello world');
});

app.listen(PORT);