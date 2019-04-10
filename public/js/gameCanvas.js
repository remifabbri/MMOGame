'use_strict'; 
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
        ctx.beginPath(); 
        ctx.fillStyle = color; 
        ctx.arc(player.balises[b].baliseX, player.balises[b].baliseY, player.balises[b].baliseR, 0, 2 * Math.PI );
        ctx.fill();
    }
}

function drawLink(player, color){
    //console.log(player);
    ctx.strokeStyle = color;
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
}

document.addEventListener('keydown', function(e){
    if(e.keyCode in codeset){
        codeset[e.keyCode] = true;
    }
}); 

document.addEventListener('keyup', function(e){
    if(e.keyCode in codeset){ 
        codeset[e.keyCode] = false; 
    }
}); 

function checkCodeSetIstrue(ObjControle){
    var Rebond = 15;

    if(ObjControle[69] === true){
        (function(){
            if (joueur.y > 25){
                joueur.y = joueur.y- 10;
                interval69 = true;
                emitInfoJoueur(); 
            }
            else{
                for(var i = 0; i<5; i++){
                    joueur.y = joueur.y + Rebond;
                    emitInfoJoueur();
                }
            }  
        })();
    }
    if(ObjControle[70] === true){
        (function(){
            if (joueur.x < widthCanvas - joueur.rayon){   
                joueur.x = joueur.x + 10;
                interval70 = true;
                emitInfoJoueur();
            }
            else{
                for(var i = 0; i<5; i++){
                    joueur.x = joueur.x - Rebond;
                    emitInfoJoueur();
                }
            }
        })();
    }
    if(ObjControle[68] === true){
        (function(){
            if (joueur.y < heightCanvas - joueur.rayon){
                joueur.y = joueur.y + 10;
                interval68 = true;
                emitInfoJoueur();
            }
            else{
                for(var i = 0; i<5; i++){
                    joueur.y = joueur.y - Rebond;
                    emitInfoJoueur();
                }
            }
        })();  
    }
    if(ObjControle[83] === true){
        (function(){
            if (joueur.x > 25){
                joueur.x = joueur.x - 10;
                interval83 = true;
                emitInfoJoueur();
            }
            else{
                for(var i = 0; i<5; i++){
                    joueur.x = joueur.x + Rebond;
                    emitInfoJoueur();
                }
            }
        })();
    }
}

document.addEventListener('keydown', function(e){
    if(e.keyCode === 226){
        var nombreDeBalises = joueur.balises.length;
        var prochaineBalises = joueur.targetBalises+1;
        if(!joueur.onTarget){
            if(prochaineBalises ===  nombreDeBalises ){
                joueur.targetBalises = 0; 
                emitInfoJoueur();
            }else{
                joueur.targetBalises = prochaineBalises;
                emitInfoJoueur(); 
            }
        }
    }
    
    if(e.keyCode === 32){
        if(joueur.onTarget){
            joueur.onTarget = false;
            emitInfoJoueur(); 
        }else{
            joueur.onTarget = true;
            emitInfoJoueur();  
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
                //console.log('trouvée');
                joueur = players[id];  
              } else {
                //console.log('pas trouvée');
                ennemy = players[id];
              }
        });
    });
    socket.on('newPlayer', function (playerInfo) {
        //console.log(playerInfo);
        ennemy = playerInfo;  
    });
    socket.on('playerMoved', function(playerInfo){
        //console.log(playerInfo);
        ennemy.x = playerInfo.x; 
        ennemy.y = playerInfo.y;
        ennemy.balises = playerInfo.balises;
        ennemy.onTarget = playerInfo.onTarget;  
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
    checkCodeSetIstrue(codeset);

    if(joueur){
        creationBalise(); 
        drawJoueur(joueur, colorJoueur);
        drawBalise(joueur, colorJoueur);
         
        if(joueur.onTarget === true){
            drawLink(joueur, colorJoueur); 
        }
    }
    if(ennemy){
        drawJoueur(ennemy, colorEnnemy); 
        drawBalise(ennemy, colorEnnemy);
        if(ennemy.onTarget === true){ 
            drawLink(ennemy, colorEnnemy); 
        }
    }
    // si prob d'affichage de l'ennemy pensé a mettre l'aobjet de retour a jour (pensé a la factorisation de l'objet en retour) 
    requestAnimationFrame(moteurJeux, 1000/30); 
}

init();

