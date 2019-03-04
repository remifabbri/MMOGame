const express = require('express');
const objectId = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'MMOGame';

const router = express.Router();

router.get('/', function(req, res){

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

router.get('/pushChatHistory', function(req, res){

    var nameUser = req.query.user; 
    var messageUser = req.query.message; 
    console.log(nameUser); 
    console.log(messageUser);
    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('chatHistory');
        
        collection.countDocuments().then(function(result){
            console.log(result);
            var limiteStorage = result - 5; 
            /* if(result < 100){} */
            collection.insertOne({
                position: result+1, 
                name: nameUser,
                message : messageUser
            });
            collection.deleteMany({position: { $lte: limiteStorage} });
            client.close(); 
        });
    }); 
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
