/*  servere  */
router.get('/pushChatHistory', function(req, res){

    var nameUser = req.query.user; 
    var messageUser = req.query.message;
    var timeMessage = req.query.time;
    let limiteMessage = 5;  
    console.log(nameUser); 
    console.log(messageUser);
    MongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
        const db = client.db(dbName); 
        const collection = db.collection('chatHistory');
        
        collection.insertOne({
            name : nameUser,
            message : messageUser,
            time: timeMessage
        });

        collection.estimatedDocumentCount().then(function(result){
            console.log(result);
            if(result > 5){
                collection.find({ $query: {}, $orderby: { time : 1} }).toArray(function(err, items){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(items);
                        let nbItems = items.length; 
                        for( var i = limiteMessage; i<items.length; i++ ){
                            //console.log(items[i]._id);
                            var objectid = items[i].time; 
                            collection.deleteOne({time: items[i].time}, function(err){
                                if(err){
                                    console.log(err); 
                                }else{
                                    console.log('fichier supprimer');

                                    
                                }
                            }); 
                        }
                        client.close(); 
                    }
                });
            }
            
            //collection.deleteMany({}});
            
        });
    }); 
});

/* Client */

$.ajax({
    url: '/pushChatHistory', 
    method: 'GET',
    dataType: 'json',
    data:{
        user: pseudoUser,
        message: message,
        time: Date.now()
    },
    success: function(objectObtenu){
        console.log(objectObtenu);
        $('#text').html(objectObtenu);  
    },
    error: function(objectJq){
        console.log(objectJq); 
    }
});


/* 
**************************************************
*/