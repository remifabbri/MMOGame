
const express = require('express');
const session = require('express-session');
const objectId = require('mongodb').ObjectID;

const app = express(); 
//const server = app.listen(8090);
const serv = require('http').Server(app);
const io = require('socket.io-client')(serv);


const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'MMOGame';

const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(session({
  secret:'123456789SECRET',
  saveUninitialized : false,
  resave: false
}));

app.set('view engine', 'pug');
app.set('views', './viewsPug');

const root = require('./router/root');

app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/', express.static(__dirname +'/public'));

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(data) {
      console.log(data);
      client.emit('messages', 'Hello from server');
  });
  
  client.on('messages', function(data) {
      client.emit('broad', data);
      client.broadcast.emit('broad',data);
  });
});

app.use('/', root); 

app.use(function(req,res) {
    res.status('404').send('Erreur');
});

app.listen(8090, function(){
    console.log('Server en écoute sur le port : 8090'); 
}); 
