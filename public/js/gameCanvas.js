/* 
* Socket.io    namspace = /game alias nspGame
*/

// var global du jeu
var canvas, 
    ctx,
    widthCanvas = 800,
    heightCanvas = 600,
    emitePosPlayer,
    joueur,
    ennemy
    colorEnnemy = "red"; 
    colorJoueur = "blue";  

var socket = io('ws://127.0.0.1:8090/game');

function clearRect(){ 
    ctx.clearRect(0,0,widthCanvas, heightCanvas); 
}

function background(){
    ctx.fillStyle= "black"; 
    ctx.fillRect(0, 0, widthCanvas, heightCanvas); 
}


/**
 * Gestion du jeux 
 */

var timestampBalise;  
var Balise = function(){
    this.baliseX = Math.floor(Math.random()*800); 
    this.baliseY = Math.floor(Math.random()*600);
    this.baliseR = 5; 
}

function creationBalise(){
    var tempsExcution = Date.now();
    var calculTime = tempsExcution - timestampBalise; 
    if(calculTime > 5000 || isNaN(calculTime)){
        if(joueur.balises.length < 5){
            console.log(joueur); 
            joueur.balises.push( new Balise());
            timestampBalise = Date.now();
            emitInfoJoueur(); 
        }
    }
};


/**
 * Gestion des éléments à afficher sur le canvas  
 */

function drawJoueur(player, color){ // image visuelle du joueur
    ctx.beginPath(); 
    ctx.fillStyle = color; 
    ctx.arc(player.x, player.y, player.rayon, 0, 2 * Math.PI );
    ctx.fill(); 
    //ctx.fillRect(this.posX, this.posY, 25, 25); 
};

function drawBalise(player, color){ // function Constructeur de balise
    for( var b=0; b<player.balises.length; b++ ){
        //console.log('je parcours les balises du joueur'); 
        ctx.beginPath(); 
        ctx.fillStyle = color; 
        ctx.arc(player.balises[b].baliseX, player.balises[b].baliseY, player.balises[b].baliseR, 0, 2 * Math.PI );
        ctx.fill();
    }
}

/**
 * Gestion des mouvement du joueur 
 */
var codeset = {
    90 : false, // key z 
    68 : false, // key d
    83 : false, // key s
    81 : false  // key q
}

var idInterval90,
    idInterval68,
    idInterval83,
    idInterval81

var interval90 = false,
    interval68 = false,
    interval83 = false,
    interval81 = false

var animation = false; 

document.addEventListener('keydown', function(e){
    //Valeur du margin a * par 5
    var Rebond = 15;
    if(e.keyCode in codeset){
        codeset[e.keyCode] = true;
        //console.log(codeset[e.keyCode]); 
        if(codeset[90]){
            if(!interval90){
                idInterval90 = setInterval(function(){
                    if (joueur.y > 25){
                        joueur.y = joueur.y- 10;
                        interval90 = true;
                        emitInfoJoueur(); 
                    }
                    else{
                        clearInterval(idInterval90);
                        for(var i = 0; i<5; i++){
                            joueur.y = joueur.y + Rebond;
                            emitInfoJoueur();
                        }
                    }  
                }, 1000/30);
            }
            
        }
        if(codeset[68]){
            if(!interval68){
                idInterval68 = setInterval(function(){
                    if (joueur.x < widthCanvas - joueur.rayon){   
                        joueur.x = joueur.x + 10;
                        interval68 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval68);
                        for(var i = 0; i<5; i++){
                            joueur.x = joueur.x - Rebond;
                            emitInfoJoueur();
                        }
                    }
                }, 1000/30);
            }   
        }
        if(codeset[83]){
            if(!interval83){
                idInterval83 = setInterval(function(){
                    if (joueur.y < heightCanvas - joueur.rayon){
                        joueur.y = joueur.y + 10;
                        interval83 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval83);
                        for(var i = 0; i<5; i++){
                            joueur.y = joueur.y - Rebond;
                            emitInfoJoueur();
                        }
                    }
                    
                }, 1000/30);
            }
        }
        if(codeset[81]){
            if(!interval81){
                idInterval81 = setInterval(function(){
                    if (joueur.x > 25){
                        joueur.x = joueur.x - 10;
                        interval81 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval81);
                        for(var i = 0; i<5; i++){
                            joueur.x = joueur.x + Rebond;
                            emitInfoJoueur();
                        }
                    }
                }, 1000/30);
            } 
        }
    }
}); 

document.addEventListener('keyup', function(e){
    if(e.keyCode in codeset){
        //console.log('keyup listener ok ! touche '+ e.keyCode + ' UP'); 
        codeset[e.keyCode] = false;
        switch(e.keyCode){
            case 90:
                clearInterval(idInterval90);
                interval90 = false; 
                break;
            case 68:
                clearInterval(idInterval68);
                interval68 = false; 
                break; 
            case 83:
                clearInterval(idInterval83);
                interval83 = false;
                break; 
            case 81:
                clearInterval(idInterval81);
                interval81 = false;
                break;
            default:
                console.log('je passe dans le default du switch !'); 
        } 
    }
}); 



function emitInfoJoueur(){
    socket.emit("changeInfoJoueur", joueur); 
}

function connectPlayer(){
    
    socket.on('currentPlayers', function(players){
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === socket.id) {
                console.log('trouvée');
                joueur = players[id];  
              } else {
                console.log('pas trouvée');
                ennemy = players[id];
              }
        });
    });
    socket.on('newPlayer', function (playerInfo) {
        console.log(playerInfo);
        ennemy = playerInfo;  
    });
    socket.on('playerMoved', function(playerInfo){
        console.log(playerInfo);
        ennemy.x = playerInfo.x; 
        ennemy.y = playerInfo.y;
        ennemy.balises = playerInfo.balises;  
    })
}

var init = function(){ // Initialisation du canvas
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = widthCanvas; 
    ctx.canvas.height = heightCanvas;
    connectPlayer();

    moteurJeux();
}

var moteurJeux = function(){
    clearRect();
    background();
    if(joueur){
        creationBalise(); 
        drawJoueur(joueur, colorJoueur);
        drawBalise(joueur, colorJoueur);
    }
    if(ennemy){
        drawJoueur(ennemy, colorEnnemy); 
        drawBalise(ennemy, colorEnnemy);
    }
      
    requestAnimationFrame(moteurJeux, 1000/30); 
}

init();

