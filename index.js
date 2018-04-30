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
/*
schedule.scheduleJob('0 0 * * *', () => { 
........
 });
*/

coins.forEach(coin => {
    request.get('https://coinmetrics.io/data/' + coin + '.csv', function(err, res, body) {
        var newRow = [];
        var csv = body.split(',');
        for (var i = 0; i < 9; i++) {
            newRow.unshift(csv[csv.length - 2 - i]);
        }
        newRow.unshift(coin);
        console.log(newRow);

    });
});

app.get('/', function(req,res) {
    res.send('hello world');
});

app.listen(PORT);