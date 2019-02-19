// var global du jeu
var canvas, 
    ctx,
    widthCanvas = 2000,
    heightCanvas = 2000
    timeGame = 

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

var player1, 
    player2

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




var init = function(){ // Initialisation du canvas
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
    ctx.canvas.width = widthCanvas; 
    ctx.canvas.height= heightCanvas;
    player1 = new Players(100, 50, 'blue'); 
    player2 = new Players(50, 100, 'red');

 
    moteurJeux();
}

var moteurJeux = function(){
    clearRect();
    background();
    player1.image(); 
    player2.image(); 

    requestAnimationFrame(moteurJeux, 1000/30); 
    //moteur = setTimeout(moteurJeux, 1000/30); 
}

init();