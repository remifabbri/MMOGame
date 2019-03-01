

const express = require('express');
const session = require('express-session');
const objectId = require('mongodb').ObjectID;

const app = express(); 

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const dbName = 'MMOGAME';

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

app.get('/', function(req, res){

    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('players'); 
        
        /*if(req.session.connect){
            linkOpen = true; 
        }*/
        
        /* if(req.session.compteur){
            req.session.compteur += 1; 
        }else{
            req.session.compteur = 1;
        } */
        collection.find({}).toArray(function(err, docs) {
            if(err){
                console.log(err); 
            }else{
                client.close();
                res.render('home.pug', {
                    value1: 'récupérer des infos de la base de donnée',
                    datas: docs
                });
                //console.log(docs);
            }
            
        });
    })
    //console.log(req.session);
}); 


app.get('/login', function(req, res){
    res.render('login.pug');
});

app.get('/user', function (req, res) {
    res.render('user.pug', {
        value1: req.session.idUser,
        value2: req.session.nomUser 
    });
}); 

app.post('/user', function (req, res) { 

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

/* app.get('/listArticle', function(req, res){
    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('articles');

        if(req.query.supp){
            let idUrl = req.query.supp;  
            idRequete = new objectId(idUrl);
            //console.log(idRequete);
            collection.deleteOne({_id: idRequete}); 
        }
        if(req.query.modif){
            let idUrl = req.query.modif;  
            idRequete = new objectId(idUrl);
            collection.findOne({_id:idRequete}, function(err, docs){
                if(err){
                    console.log(err); 
                }else{
                    res.render('creatArticle.pug', {
                        datas: docs
                    }); 
                }
            }); 
        }else{
            collection.find({}).toArray(function(err, docs) {
                if(err){
                    console.log(err); 
                }else{
                    //console.log(docs);
                    client.close();
                    res.render('listArticle.pug', {
                        value1: 'récupérer des infos de la base de donnée',
                        datas: docs
                    });
                }
                
            });
        }

        
    })
});


app.get('/creatArticle', function(req, res){
    res.render('creatArticle.pug');
});

app.post('/postArticle', function(req, res){

    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('articles');
        let result=''; 

        if(req.query.id){
            let idUrl = req.query.id;  
            let idRequete = new objectId(idUrl);
            result= 'Article Modifier';
            collection.updateOne({_id:idRequete}, {$set:{
                id: req.body.id,
                titre: req.body.titre, 
                contenu: req.body.contenu,
                auteur: req.body.auteur, 
                date: req.body.date 
            }}, function(){ 
                    console.log(req.body); 
                    client.close();
                    res.render('postAricle.pug', {
                        value1: result
                    }); 
            });
              

        }else if(!req.query.id){

            collection.insertOne({ 
                titre: req.body.titre, 
                contenu: req.body.contenu,
                auteur: req.body.auteur, 
                date: req.body.date 
            });
            result=' Article Céer'
        }
        client.close();
        res.render('postAricle.pug', {
            value1: result
        });
    })
}); */


app.get('*', function (req, res) {
  res.status(404).render('error404.pug');
})

app.listen(8090, function(){
    console.log('Server en écoute sur le port : 8090'); 
});
