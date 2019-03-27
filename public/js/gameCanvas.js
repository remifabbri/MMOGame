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
    this.targetB = false;
    this.lifeChrono = 5000; 
}

function creationBalise(){
    var tempsExcution = Date.now();
    var calculTime = tempsExcution - timestampBalise; 
    if(calculTime > 5000 || isNaN(calculTime)){
        if(joueur.balises.length < 5){
            //console.log(joueur); 
            joueur.balises.push( new Balise());
            timestampBalise = Date.now();
            emitInfoJoueur(); 
        }
    }
};


/**
 * Gestion des éléments à afficher sur le canvas  
 */

function drawJoueur(player, color){ 
    // image visuelle du joueur
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

function drawLink(player){
    //console.log(player);
    ctx.strokeStyle = "#4dd2ff";
    ctx.moveTo(player.x,player.y);
    ctx.lineTo(player.balises[player.targetBalises].baliseX ,player.balises[player.targetBalises].baliseY);
    ctx.stroke();
}

/**
 * Gestion des mouvement du joueur 
 */
var codeset = {
    69 : false, // key e 
    70 : false, // key f
    68 : false, // key d
    83 : false,  // key s
    226 : false,
    32: false
}

var idInterval69,
    idInterval70,
    idInterval68,
    idInterval83

var interval69 = false,
    interval70 = false,
    interval68 = false,
    interval83 = false

var animation = false

document.addEventListener('keydown', function(e){
    var Rebond = 15;
    if(e.keyCode in codeset){
        codeset[e.keyCode] = true;
        //console.log(e.keyCode); 
        if(codeset[69]){
            if(!interval69){
                idInterval69 = setInterval(function(){
                    if (joueur.y > 25){
                        joueur.y = joueur.y- 10;
                        interval69 = true;
                        emitInfoJoueur(); 
                    }
                    else{
                        clearInterval(idInterval69);
                        for(var i = 0; i<5; i++){
                            joueur.y = joueur.y + Rebond;
                            emitInfoJoueur();
                        }
                    }  
                }, 1000/30);
            }
            
        }
        if(codeset[70]){
            if(!interval70){
                idInterval70 = setInterval(function(){
                    if (joueur.x < widthCanvas - joueur.rayon){   
                        joueur.x = joueur.x + 10;
                        interval70 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval70);
                        for(var i = 0; i<5; i++){
                            joueur.x = joueur.x - Rebond;
                            emitInfoJoueur();
                        }
                    }
                }, 1000/30);
            }   
        }
        if(codeset[68]){
            if(!interval68){
                idInterval68 = setInterval(function(){
                    if (joueur.y < heightCanvas - joueur.rayon){
                        joueur.y = joueur.y + 10;
                        interval68 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval68);
                        for(var i = 0; i<5; i++){
                            joueur.y = joueur.y - Rebond;
                            emitInfoJoueur();
                        }
                    }
                    
                }, 1000/30);
            }
        }
        if(codeset[83]){
            if(!interval83){
                idInterval83 = setInterval(function(){
                    if (joueur.x > 25){
                        joueur.x = joueur.x - 10;
                        interval83 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval83);
                        for(var i = 0; i<5; i++){
                            joueur.x = joueur.x + Rebond;
                            emitInfoJoueur();
                        }
                    }
                }, 1000/30);
            } 
        }

        if(codeset[226]){
            var nombreDeBalises = joueur.balises.length;
            var prochaineBalises = joueur.targetBalises+1;
            console.log(joueur.balises.length);
            console.log(joueur.targetBalises);
            if(!joueur.onTarget){
                if(prochaineBalises >  nombreDeBalises ){
                    joueur.targetBalises = 0; 
                    emitInfoJoueur(); 
                    console.log('max');
                }else{
                    joueur.targetBalises = prochaineBalises;
                    emitInfoJoueur(); 
                    console.log("pas max"); 
                }
            }
        }
        
        if(codeset[32]){
            console.log(joueur.targetBalises);
            if(joueur.onTarget){
                joueur.onTarget = false;
                emitInfoJoueur(); 
            }else{
                joueur.onTarget = true;
                emitInfoJoueur();  
            }
        }  
    }
}); 

document.addEventListener('keyup', function(e){
    if(e.keyCode in codeset){
        //console.log('keyup listener ok ! touche '+ e.keyCode + ' UP'); 
        codeset[e.keyCode] = false;
        switch(e.keyCode){
            case 69:
                clearInterval(idInterval69);
                interval69 = false; 
                break;
            case 70:
                clearInterval(idInterval70);
                interval70 = false; 
                break; 
            case 68:
                clearInterval(idInterval68);
                interval68 = false;
                break; 
            case 83:
                clearInterval(idInterval83);
                interval83 = false;
                break;
            default:
                //console.log('je passe dans le default du switch !'); 
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
         
        if(joueur.onTarget === true){
            //console.log(joueur.onTarget);
            drawLink(joueur); 
        }
    }
    if(ennemy){
        drawJoueur(ennemy, colorEnnemy); 
        drawBalise(ennemy, colorEnnemy);
    }
      
    requestAnimationFrame(moteurJeux, 1000/30); 
}

init();

