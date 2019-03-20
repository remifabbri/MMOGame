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

var socket = io('ws://127.0.0.1:8090/game');

function clearRect(){ 
    ctx.clearRect(0,0,widthCanvas, heightCanvas); 
}

function background(){
    ctx.fillStyle= "black"; 
    ctx.fillRect(0, 0, widthCanvas, heightCanvas); 
}

/**
 * Fonction Constructeur des joueurs
 */

/* var monJoueur= {
    x : positionX, 
    y : posiitionY,
    nbBalises : 0,  
    balises : [
        balise= {
            id = 0, 
            x : positionBaliseX,
            y : positionBaliseY
        },
        balise = {
            id = 1, 
            x : positionBaliseX,
            y : positionBaliseY
        }
    ]
} */


var fonctionJoueur = function(monJoueur){
    
    
    
    /* function newBalise(){ // function Constructeur de balise
        var Balise = function(){
            id = nbBalises; 
            x = Math.floor(Math.random() * 700) + 50,
            y = Math.floor(Math.random() * 500) + 50
        }; 
        monJoueur.balises.push(balise = new Balise());
        monJoueur.nbBalises++; 
    } */


}

var Players = function(x,y,color){ // fonction constructeur des joueurs 
    this.posX = x;
    this.posY = y; 
    this.rayon = 25; 
    this.life = 3; 
    this.color = color; 
    this.baliseDisponible = [];
    this.baliseSelect = 0;
    this.baliseConnected = false;     

    this.Balise = function(){ // function Constructeur de balise
        this.posBaliseX = baliseX; 
        this.posBaliseY = baliseY;
        this.timeToUse = 5000; 
    }

    this.image = function (){ // image visuelle du joueur
        ctx.beginPath(); 
        ctx.fillStyle = this.color; 
        ctx.arc(this.posX, this.posY, this.rayon, 0, 2 * Math.PI );
        ctx.fill(); 
        //ctx.fillRect(this.posX, this.posY, 25, 25); 
    };
    
    this.selectBalise = function(){ // Modifie la balise selectionner par le joueur
        if(baliseSelect === baliseSelect.length){
            baliseSelect = 0; 
        }else{
            baliseSelect += 1; 
        } 
    }

    this.connectBalise = function(){
        if(baliseConnected){
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.moveTo(this.posX, this.posY); 
            ctx.lineTo(baliseDisponible[baliseSelect].PosBaliseX, baliseDisponible[baliseSelect].PosBaliseY);
            ctx.stroke(); 
        }else{ // pointeur indiquant la direction de la balise sélectionner

        }
    }
}

/**
 * Gestion du jeux 
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
        console.log(codeset[e.keyCode]); 
        if(codeset[90]){
            if(!interval90){
                idInterval90 = setInterval(function(){
                    if (joueur.posY > 25){
                        joueur.posY = joueur.posY - 10;
                        interval90 = true;
                        emitInfoJoueur(); 
                    }
                    else{
                        clearInterval(idInterval90);
                        for(var i = 0; i<5; i++){
                            joueur.posY = joueur.posY + Rebond;
                            emitInfoJoueur();
                        }
                    }  
                }, 1000/30);
            }
            
        }
        if(codeset[68]){
            if(!interval68){
                idInterval68 = setInterval(function(){
                    if (joueur.posX < widthCanvas - joueur.rayon){   
                        joueur.posX = joueur.posX + 10;
                        interval68 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval68);
                        for(var i = 0; i<5; i++){
                            joueur.posX = joueur.posX - Rebond;
                            emitInfoJoueur();
                        }
                    }
                }, 1000/30);
            }   
        }
        if(codeset[83]){
            if(!interval83){
                idInterval83 = setInterval(function(){
                    if (joueur.posY < heightCanvas - joueur.rayon){
                        joueur.posY = joueur.posY + 10;
                        interval83 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval83);
                        for(var i = 0; i<5; i++){
                            joueur.posY = joueur.posY - Rebond;
                            emitInfoJoueur();
                        }
                    }
                    
                }, 1000/30);
            }
        }
        if(codeset[81]){
            if(!interval81){
                idInterval81 = setInterval(function(){
                    if (joueur.posX > 25){
                        joueur.posX = joueur.posX - 10;
                        interval81 = true;
                        emitInfoJoueur();
                    }
                    else{
                        clearInterval(idInterval81);
                        for(var i = 0; i<5; i++){
                            joueur.posX = joueur.posX + Rebond;
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
        console.log('keyup listener ok ! touche '+ e.keyCode + ' UP'); 
        codeset[e.keyCode] = false;
        console.log(e.keyCode); 
        switch(e.keyCode){
            case 90:
                console.log('je passe ici'); 
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

/* function checkSetIntervalPosition(){
    if(!codeset[90]){
        clearInterval(idinterval90);
    }
    if(!codeset[68]){
        clearInterval(idinterval68);
    }
} */
 

function emitInfoJoueur(){
    socket.emit("changeInfoJoueur", joueur); 
}

function connectPlayer(){
    
    socket.on('currentPlayers', function(players){
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === socket.id) {
                console.log('trouvée');
                //console.log(players[id]); 
                joueur = new Players(players[id].x, players[id].y, 'blue');
                //console.log(joueur);  
              } else {
                console.log('pas trouvée');
                ennemy = new Players(players[id].x, players[id].y, 'red'); 
              }
        });
    });
    socket.on('newPlayer', function (playerInfo) {
        console.log(playerInfo);
        ennemy = new Players(playerInfo.x, playerInfo.y, 'red'); 
    });
    socket.on('playerMoved', function(playerInfo){
        console.log(playerInfo);
        ennemy.posX = playerInfo.x; 
        ennemy.posY = playerInfo.y; 
    })
}

var init = function(){ // Initialisation du canvas
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = widthCanvas; 
    ctx.canvas.height = heightCanvas;
    player2 = new Players(50, 100, 'red');
    connectPlayer(); 

    //checkSetIntervalPosition(); 
    moteurJeux();
}

var moteurJeux = function(){
    clearRect();
    background();
    if(joueur){
        joueur.image();
    }
    if(ennemy){
        ennemy.image();
    }    
    /* console.log(monJoueur);
    console.log(lesJoueurs); */  
    requestAnimationFrame(moteurJeux, 1000/30); 
    //moteur = setTimeout(moteurJeux, 1000/30); 
}

init();

