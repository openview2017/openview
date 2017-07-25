var http = require('http');
var express = require('express');
var httpProxy = require('http-proxy');
var kafka = require('kafka-node');
var kafkaConsumer = kafka.HighLevelConsumer;
var kafkaProducer = kafka.HighLevelProducer;

var app = express();

//var kafkaClient = process.env.KAFKA_CLIENT && (process.env.KAFKA_CLIENT == 'openview-web');
var kafkaClient = false;

var server = require('http').Server(app);
var io = require('socket.io')(server);

var storedData = {};
app.get('/ml', function (req, res) {
  var appname = req.query.appname;
  var data = storedData[appname] || {}
  res.json(data);
});

if (kafkaClient) {
  var saveAppData = function(value) {
    if (!value.app || !value.type) { return; }
    var appname = value.app;
    storedData[appname] = storedData[appname] || {};
    storedData[appname][value.type] = value;
  }

  var client, producer, consumer;
  var timeToRetryConnection = 120*1000; // 120 seconds
  var reconnectInterval = null;
  var topic = 'producer_api_alert_messages';
  var setupKafka = function(){
    client = new kafka.Client('zookeeper.openview:2181','openview-web');
    producer = new kafkaProducer(client);
    producer.on('ready', function(){
      producer.createTopics([topic], false, function (err, data) {
        if (err) {
          console.error("Create topic %s error %s", topic, err);
        }
        consumer = new kafkaConsumer(client,[{topic: 'producer_api_alert_messages'}]);
        consumer.on('message', function(msg){
          console.log(msg.offset);
          try {
            var value = JSON.parse(msg.value);
          } catch (err) {
            console.error("Can not parse data {}. Error is ", msg.value, err);
            return;
          }
          console.log(value);
          if (value && Array.isArray(value) && value.length){
              if (value[0].type) {
                io.emit(value[0].type, value);
              }
          }
          else if (value && value.type){
            saveAppData(value);
            io.emit(value.type, value);
          }
        });
        consumer.on('error', function(err) {
          console.error('Kafka consumer error %s', err);
        });
      });
    });

    client.on('error',function(err){
      producer.close();
      consumer.close();
      client.close();
      if ( reconnectInterval == null) { // Multiple Error Events may fire, only set one connection retry.
        reconnectInterval = setTimeout(function () {
          clearTimeout(reconnectInterval);
          reconnectInterval = null;
          console.log("reconnect is called on client error event");
          setupKafka();
        }, timeToRetryConnection);
      }
    });

    client.on('close',function(err){
      producer.close();
      consumer.close();
      client.close();
      if ( reconnectInterval == null) { // Multiple Error Events may fire, only set one connection retry.
        reconnectInterval = setTimeout(function () {
          clearTimeout(reconnectInterval);
          reconnectInterval = null;
          console.log("reconnect is called on client error event");
          setupKafka();
        }, timeToRetryConnection);
      }
    });
  }

  setupKafka();

}

var influxdbProxy = httpProxy.createProxyServer({
  target: "http://influxdb.openview:8086"
});
// Proxy to influxdb server
app.use('/influxdb', (req, res) => {
  influxdbProxy.web(req, res, {target: "http://influxdb.openview:8086"}, function(err) {
    console.error("Can not connect to influxdb. Error %s", err);
  });
});

var apiProxy = new httpProxy.createProxyServer({
	target: "http://localhost:9000"
});
// Proxy to api server
app.use('/api', (req, res) => {
  apiProxy.web(req, res, {target: "http://localhost:9000"}, function(err) {
    console.error("Can not connect to backend api. Error %s", err);
  });
});


app.use(express.static('public'));

server.listen(5000, function () {
  console.log('app listening on port 5000!');
});

process.on('SIGINT', function() {
  process.exit();
});
