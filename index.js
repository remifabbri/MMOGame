

const express = require('express');
const session = require('express-session');
const objectId = require('mongodb').ObjectID;

const app = express(); 

const root = require('./router/root');

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

app.use('/', express.static(__dirname +'/public'));

app.use('/', root); 

app.use(function(req,res) {
    res.status('404').send('Erreur');
});

app.listen(8090, function(){
    console.log('Server en écoute sur le port : 8090'); 
});
