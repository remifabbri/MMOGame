
const express = require('express');
const app = express();
const http = require('http').Server(app); 
const io = require('socket.io').listen(http);

const session = require('express-session');
const objectId = require('mongodb').ObjectID;

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
app.set('socketio', io);


app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/', express.static(__dirname +'/public'));



/* var roomno = 1;
var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket) {
   console.log('someone connected');
   nsp.emit('hi', 'Hello everyone!');

   if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;
   socket.join("room-"+roomno);

   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);

}); */

app.use('/', root); 

app.use(function(req,res) {
    res.status('404').send('Erreur');
});

http.listen(8090, function(){
    console.log('Server en écoute sur le port : 8090'); 
});

 