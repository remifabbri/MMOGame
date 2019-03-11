const express = require('express');
const objectId = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'MMOGame';

const router = express.Router();


router.get('/', function(req, res){

    const io = req.app.get('socketio');

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

    let pseudoUser = req.session.pseudo; 

    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('players'); 

        collection.find({}).toArray(function(err, docs) {
            if(err){
                console.log(err); 
            }else{
                client.close();
                res.render('home.pug', {
                    pseudoUser: pseudoUser,
                    datas: docs
                });
            }
        });
    })
});

var players = {};

router.get('/game', function(req, res){
    const io = req.app.get('socketio');
    
    var nspGame = io.of('/game'); 

    nspGame.on('connection', function(socket) {

        console.log('a user connected', socket.id);
        // create a new player and add it to our players object
        players[socket.id] = {
            playerId: socket.id,
            x: Math.floor(Math.random() * 800) + 50,
            y: Math.floor(Math.random() * 600) + 50,
            balises: []
            
        };
        // send the players object to the new player
        socket.emit('currentPlayers', players);

        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);

        // when a player moves, update the player data
        socket.on('playerMovement', function (movementData) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].rotation = movementData.rotation;
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', players[socket.id]);
        });

        socket.on('changeInfoJoueur', function(infoJoueur){
            console.log(infoJoueur);
            players[socket.id].x = infoJoueur.posX; 
            players[socket.id].y = infoJoueur.posY;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        });     
        
        // when a player disconnects, remove them from our players object
        socket.on('disconnect', function () {
            console.log('user disconnected:', socket.id);
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });

        nspGame.clients((error, clients) => {
            if (error) throw error; 
            console.log(clients); 
        });
        console.log(players); 
    });

    res.render('game.pug');
});

router.get('/login', function(req, res){
    res.render('login.pug');
});

router.post('/login', function(req, res){
    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('utilisateurs'); 
        console.log(req.body); 
        if(req.body.email){

            let newUser = {
                pseudo: req.body.pseudo, 
                mdp: req.body.mdp,
                email: req.body.email
            }

            collection.insertOne(newUser, function(err){
                if (err){
                    console.log(err); 
                }else{
                    let pseudoUser = req.body.pseudo; 

                    req.session.connected = true;
                    req.session.pseudo = req.body.pseudo; 

                    client.close();
                    res.render('home.pug', {
                        pseudoUser: pseudoUser
                    }); 
                }
            }); 
        }

        if(!req.body.email){

            collection.find({}).toArray(function(err, docs) {
                if(err){
                    console.log(err); 
                }else{
                    //console.log(req.session); 
                    //console.log(req.body);
    
                    for(var u=0; u<docs.length; u++){
                        if (docs[u].pseudo === req.body.pseudo && docs[u].mdp === req.body.mdp){
                            
                            req.session.connected = true;
                            req.session.pseudo = req.body.pseudo;
                            
                            let pseudoUser= req.session.pseudo;
    
                            client.close();
                            res.render('home.pug', {
                                pseudoUser: pseudoUser
                            })
                        }else{
                            client.close();
                            res.render('login.pug', {
                                valueErr:'identifiant ou mots de passe inconnue',
                            })
                        }
                    }
                }
            });
        }
    })
})


module.exports = router;
