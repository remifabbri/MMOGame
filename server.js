
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

app.set('view engine', 'pug');
app.set('views', './viewsPug');

app.set('socketio', io);

app.use('/node', express.static(__dirname + '/node_modules'));
app.use('/', express.static(__dirname +'/public'));


app.use(session({
    secret:'123456789SECRET',
    saveUninitialized : false,
    resave: false,
    cookie:{
        secure: false
    }
    
}));

let joueurCo = [];


app.get('/', function(req, res){
    console.log(req.session);
    var messageConnexion = req.query.message;
    console.log('object joueur Conect',joueurCo);

    
    
    io.on('connection', function(client) {
        console.log('Client connected...'); 
    
        //console.log(client.id);
        
        /* if(.hasOwnProperty('name')){
            function findInjoueurCo(tabObj){
                return tabObj.name === userCo.name;  
            }
        } */
        
        /* var result = joueurCo.filter(obj => {
            return obj.name === currentPlayer; 
        }) */
    
    
        console.log(req.session.infoUser);
        if(req.session.infoUser !== undefined){
            req.session.infoUser.idSocket = client.id;
            //joueurCo.idSocket = client.id;
            var result = joueurCo.filter(obj => {
                return obj.name === req.session.infoUser.name; 
            })
            result[0].idSocket = client.id;
            console.log('result de la fonction', result)
            console.log('tabof joureurco', joueurCo);
            console.log(req.session.infoUser.idSocket)  
        }
        
    
        client.emit('listUser', joueurCo);
        client.broadcast.emit('listUser', joueurCo);
    
        client.on('userJoin', function(data) {
            console.log(data);
        });
    
        client.emit('messages', 'Hello from server');
        
        client.on('messages', function(data) {
            client.emit('broad', data);
            client.broadcast.emit('broad',data);
        });
    }); 




    if(req.session.userIsConnect){
        res.render('home.pug',{
            userIsConnect: true,
            messageConnexion: messageConnexion 
        });
    }else{
        res.render('home.pug', {
            userIsConnect: false
        });
    } 
});

app.get('/creation', function(req, res){
    res.render('creation.pug');
});


app.post('/connexion', function (req, res) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, client) {
        const db = client.db(dbName);
    
        db.collection('utilisateurs', function (err, collection) {

            let cursor = collection.find({pseudo:req.body.pseudo});
            cursor.toArray(function (err, docs) {
                console.log(docs);
                client.close();
                if( docs[0] != undefined){
                    if (docs[0].password === req.body.password) {
                        req.session.identifiantSession = 1234;
                        req.session.userName = docs[0].pseudo;
                        res.status(200); 
                        req.session.userIsConnect = true
                        
                        req.session.infoUser = {
                            name: req.session.userName,
                            idSocket : undefined
                        }

                        joueurCo.push(req.session.infoUser);
                        var message = "Bravo vous êtes maintenant authentifier :)"
                        res.redirect('/?message='+ message)
                        
                        
                    }else{
                        req.session.userIsConnect = false
                        res.render('home',{
                            messageConnexion: "Nom de Compte ou mot de passe incorrect :/"
                        })
                    }
                }
            })
        })
    })        
})    



app.post('/creerCompte', function (req, res) {
    MongoClient.connect(url, {useNewUrlParser: true}, function (error, client) {
        const db = client.db(dbName);
        const collection = db.collection('utilisateurs'); 

        let user = {
            pseudo: req.body.pseudo,
            mdp: req.body.mdp
        };

        console.log(user)

        collection.find({}).toArray(function(err, docs) {
            if (err){
                console.log(err); 
            }else{
                let find; 
                 
                for(f=0; f<docs.length; f++){
                    let propsobj = Object.values(docs[f]);
                    if(propsobj[1] === user.pseudo){
                        find = true; 
                    }
                }
                console.log(find)
                if(find){

                        client.close();
                        res.render('creation.pug', {
                            valueErr: 'nom de compte déjà utilisé !!'
                        });

                }else{
                    collection.insertOne(user, function (err) {
                        client.close();
                        res.render('home.pug', {
                            messageCrea : 'votre compte a bien été créé, vous pouvez maintenant vous connectez :)'
                        });
                    }); 
                }
            client.close();  
            }
        })

        
    });
});








var players = {};

app.get('/game', function(req, res){
    const io = req.app.get('socketio');
    
    var nspGame = io.of('/game'); 

    nspGame.on('connection', function(socket) {

        console.log('a user connected', socket.id);
        // create a new player and add it to our players object
        players[socket.id] = {
            playerId: socket.id,
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 600),
            rayon: 15,
            balises: [],
            targetBalises: 0, 
            onTarget: false
        };
        // send the players object to the new player
        socket.emit('currentPlayers', players);

        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);

        socket.on('changeInfoJoueur', function(infoJoueur){
            console.log(infoJoueur);
            players[socket.id].x = infoJoueur.x; 
            players[socket.id].y = infoJoueur.y;
            players[socket.id].balises = infoJoueur.balises;
            players[socket.id].targetBalises = infoJoueur.targetBalises; 
            players[socket.id].onTarget = infoJoueur.onTarget; 
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







app.use(function(req,res) {
    res.status('404').send('Erreur');
});

http.listen(8090, function(){
    console.log('Server en écoute sur le port : 8090'); 
});

 