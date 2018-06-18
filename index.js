const express = require('express');
var moment = require('moment');
moment().format();
const schedule = require('node-schedule');
const app = express();
const PORT = process.env.PORT || 5000;
var mostRecentDataPoint = moment().format('YYYY-MM-DD');
var labels = [];
const mysql = require('mysql');
var request = require('request');
var coins = [
    'btc', 'bch', 'ltc', 'eth', 'xem', 'zec', 'dash', 'xmr', 'xvg', 'btg'
];
var newData = [];
var cors = require('cors'); app.use(cors());

//wrap function in this after i get it working

schedule.scheduleJob('15 7 * * *', () => {
    mostRecentDataPoint = moment().format('YYYY-MM-DD');
    coins.forEach(coin => {
        request.get('https://min-api.cryptocompare.com/data/price?fsym=' +  coin.toUpperCase() + '&tsyms=USD', function(err, res, body) {
            var coinPrice = JSON.parse(body);
            newData.push([coin, moment().format('YYYY-MM-DD'), coinPrice.USD]);
            if (newData.length === 10) {
                var con = mysql.createConnection({
                    host: process.env.HOST,
                    user: process.env.USERNAME,
                    password: process.env.PASSWORD,
                    database: process.env.DATABASE
                  });
                  
                  con.connect(function(err) {
                    if (err) throw err;
                    console.log("Connected!");
            
                    var sql = "INSERT INTO coins (coin, date, price) VALUES ?";
                    con.query(sql, [newData], function(err, results) {
                        if (err) throw err;
                        console.log('inserted correctly');
                        newData = [];
                    }); 
                });
                
            }
        });
    });
});

var coinColors = {
	'btc': {
		color: '#FF5757'
	},
	'bch': {
		color: '#ABFF57'
	},
	'btg': {
		color: '#57FFFF'
	},
	'ltc': {
		color: '#AB57FF'
	},
	'eth': {
		color: '#5784FF'
	},
	'dash': {
		color: '#57FF97'
	},
	'xem': {
		color: '#FF57F4'
	},
	'xmr': {
		color: '#FFB657'
	},
	'zec': {
		color: '#FFFF57'
	},
	'xvg': {
		color: '#001EFF'
	},
};

function findLimit(period) {
  //check to make sure that coin queries isnt empty, if so just return
  if (period === '') {
    return null;
  }
  //check what time period is
  else {
    if (period === '1W') {
      var queryStart = moment().subtract(7, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
   
    else if (period === '1M') {
      var queryStart = moment().subtract(30, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    else if (period === '3M') {
      var queryStart = moment().subtract(90, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    else if (period === '1Y') {
      var queryStart = moment().subtract(365, 'days').format('YYYY-MM-DD').toString();
      return queryStart;
    }
    //time === ALL
    else {
      return "0000-00-00";
    } 
  }

}

// Answer API requests.
app.get('/addCoin', function (req, res) {
  var limit = findLimit(req.query.period);
  console.log(limit);
  const coinName = req.query.coin;
  const connection = mysql.createConnection({
    host: 'cryptocoins.cvndjrqk9gtt.us-east-2.rds.amazonaws.com',
    user: 'glandon22',
    password: 'taylord2278',
    database: 'cryptos'
  });

  connection.connect(function(err) {
    if (err) {
      console.log(err);
      res.send(err);
    }

    else {
      connection.query("SELECT DATE_FORMAT(date, '%m/%d/%y'), price FROM cryptos.coins WHERE (date > '" + limit + "' AND date <='" + mostRecentDataPoint + "') AND (coin='" + coinName + "');", function(err, results, fields) {
        if (err) {
          res.send(err);
        }

        else {
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
            };
            coinDataStructure.label = coinName;
            coinDataStructure.backgroundColor[0] = coinColors[coinName].color;
            coinDataStructure.borderColor = coinColors[coinName].color;
            coinDataStructure.pointHoverBackgroundColor = coinColors[coinName].color;
            coinDataStructure.data = results.map(result => result.price);
            labels = results.map(result => result['DATE_FORMAT(date, \'%m/%d/%y\')']);
            
            var finalObject = {
              labels: labels,
              datasets: [coinDataStructure]
            };
            res.send(finalObject);
        }
      });
    }
  });
});

app.get('/changePeriod', function(req,res) {
  //check to make sure that coin queries isnt empty, if so just return      
  if (req.query.coins === '') {
    console.log('no updates');
    res.send('no updates');
    return;
  }
  //check what time period is
  else {
    const connection = mysql.createConnection({
      host: 'cryptocoins.cvndjrqk9gtt.us-east-2.rds.amazonaws.com',
      user: 'glandon22',
      password: 'taylord2278',
      database: 'cryptos'
    });
    var coins = req.query.coins.split(',');
    var limit = findLimit(req.query.time, coins.length);
    //loop over coin name array and grab the data
    
    var coinParams = "(";
    for (var i = 0; i < coins.length; i++) {
      if (i === coins.length - 1) {
        coinParams += "coin='" + coins[i] + "') ";
        break;
      }

      coinParams += "coin='" + coins[i] + "' OR ";
    }

    connection.query("SELECT coin, DATE_FORMAT(date, '%m/%d/%y'), price FROM cryptos.coins WHERE date > '" + limit + "' AND date <= '" + mostRecentDataPoint + "' AND " + coinParams + "ORDER BY coin ASC, date ASC;", function(err, results, fields) {
      if (err) throw err;
      var currCoin = results[0].coin;
      var finalObject = {
        labels: [],
        datasets: []
      };
      var currCoinObj = {
        price: [],
        labels: []
      };

      for (var j = 0; j < results.length; j++) {
        if (j === results.length - 1) {
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
          };
          currCoinObj.price.push(results[j].price);
          currCoinObj.labels.push(results[j]['DATE_FORMAT(date, \'%m/%d/%y\')']); 
          //fill data structure
          coinDataStructure.label = currCoin;
          coinDataStructure.backgroundColor[0] = coinColors[currCoin].color;
          coinDataStructure.borderColor = coinColors[currCoin].color;
          coinDataStructure.pointHoverBackgroundColor = coinColors[currCoin].color;
          coinDataStructure.data = currCoinObj.price;
          finalObject.datasets.push(coinDataStructure);

          if (currCoinObj.price.length > finalObject.labels.length) {
            finalObject.labels = currCoinObj.labels;
          }
        }
        
        else if (results[j].coin === currCoin) {
          currCoinObj.labels.push(results[j]['DATE_FORMAT(date, \'%m/%d/%y\')']);
          currCoinObj.price.push(results[j].price);
        }

        else {
          //initialize data structure for use on front end loading into chart
          var coinDataStructure = {
            label: '',
            data: [],
            backgroundColor:[], 
            fill: false,
            borderColor: '',
            pointHoverBackgroundColor: '',
            pointHoverBorderColor: 'grey',
            pointRadius: 3,
            pointHoverRadius: 5
          };
          //fill data structure
          coinDataStructure.label = currCoin;
          coinDataStructure.backgroundColor[0] = coinColors[currCoin].color;
          coinDataStructure.borderColor = coinColors[currCoin].color;
          coinDataStructure.pointHoverBackgroundColor = coinColors[currCoin].color;
          coinDataStructure.data = currCoinObj.price;
          finalObject.datasets.push(coinDataStructure);

          if (currCoinObj.price.length > finalObject.labels.length) {
            finalObject.labels = currCoinObj.labels;
          }

          //reset currcoinobj and push new values into it
          currCoinObj = {
            price: [],
            labels: []
          };
          currCoin = results[j].coin;
          currCoinObj.labels.push(results[j]['DATE_FORMAT(date, \'%m/%d/%y\')']);
          currCoinObj.price.push(results[j].price); 
        }
      }
      for (var k = 0; k < finalObject.datasets.length; k++) {
        if (finalObject.datasets[k].data.length < finalObject.labels.length) {
          var difference = finalObject.labels.length - finalObject.datasets[k].data.length;
          const nullArray = new Array(difference).fill(null);
          finalObject.datasets[k].data = nullArray.concat(finalObject.datasets[k].data);
        }
      }

      res.send(finalObject);
      return false;
    });
  }
  
});

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
