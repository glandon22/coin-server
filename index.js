const express = require('express');
const path = require('path');
var moment = require('moment');
moment().format();
const app = express();
const PORT = process.env.PORT || 5000;
var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');

app.get('/', function(req,res) {
    res.send('hello world');
});

app.listen(PORT);