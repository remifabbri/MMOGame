const express = require('express');
const objectId = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'MMOGAME';

const router = express.Router();

router.get('/', function(req, res){

    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('players'); 

        collection.find({}).toArray(function(err, docs) {
            if(err){
                console.log(err); 
            }else{
                client.close();
                res.render('home.pug', {
                    value1: 'récupérer des infos de la base de donnée',
                    datas: docs
                });
            }
        });
    })
}); 




router.get('/user', function (req, res) {
    res.render('user.pug', {
        value1: req.session.idUser,
        value2: req.session.nomUser 
    });
}); 

router.post('/user', function (req, res) { 

    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('utilisateurs'); 
        
        collection.find({}).toArray(function(err, docs) {
            if(err){
                console.log(err); 
            }else{
                //console.log(req.session); 
                //console.log(req.body);
                for(var u=0; u<docs.length; u++){
                    if (docs[u].identifiant === req.body.identifiant && docs[u].mdp === req.body.mdp){
                        let idUser = docs[u]._id; 
                        let nomUser = docs[u].identifiant;

                        req.session.connect = true;
                        req.session.idUser = docs[u]._id; 
                        req.session.nomUser = docs[u].identifiant;

                        client.close();
                        res.render('user.pug', {
                            value1: idUser,
                            value2: nomUser
                        })
                    }else{
                        client.close();
                        res.render('login.pug', {
                            valueErr:'identifiant ou mots de passe inconnue',
                        })
                    }
                }
            }
            ;
        });
    })
});

router.get('/login', function(req, res){
    res.render('login.pug');
});



module.exports = router;
