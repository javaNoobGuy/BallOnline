
const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");

const screenWidth = 1600;
const screenHeight = 1400;
const π = Math.PI;

var time = 0;

var mouseX = 0;
var mouseY = 0;

var renderData;

context.fillStyle = "black";
context.fillRect(0, 0, screenWidth, screenHeight);

let rectX = 0;

var socket = io();

//classes

const net = {

    width : 2,
    height: 10,
    x : screenWidth/2 - 2/2,
    y : 0,
    color : "WHITE",


}

const user = {

    x : 0,
    width : 30,
    height : 100,
    y : screenHeight / 2 - 50,
    color : "WHITE",
    score : 10,



}

const com = {

    width : 30,
    height : 100,
    x : screenWidth - 30,
    y : screenHeight / 2 - 50,
    color : "WHITE",
    score : 0,


}

var presed = false;

socket.on('connect',()=>{//conexão do cliente
    id = socket.id;
    document.addEventListener('keydown', (event) =>{
        let key = event.key;

        if(presed == false && event.key == "z"){
            presed = true;
            socket.emit('keyPre', {key, presed});
            console.log('event key down : ' + event.key);
        }

        socket.emit('keydown', {key});
    });

    document.addEventListener('keyup',(event) =>{
        console.log('tecla solta' + event.key);
        let key = event.key;
        if(presed == true && event.key == "z"){
            presed = false;
            socket.emit('keylea', {key, presed});  
        }
        socket.emit('keyleave', {key});

    })

    canvas.addEventListener('mousemove', (event) => {//event listener para pegar o movimento do mouse quando ele se move
        mouseX = event.clientX;//guarda o x e y do mouse em duas variaveis globais
        mouseY = event.clientY;
        
        socket.emit('mouse',{mouseX, mouseY, id});//emite o evento mouse, que carrega um objeto com as informações do mouse e o id de quem conectou
      });
      //socket.emit('mouse',{mouseX, mouseY, id});
})

socket.on('render', (data) =>{//atualiza as informações para renderização
    Updaterender(data);
})

function game(){

    socket.emit('atualiza');//emite o evento atualiza
    console.log('entrou no loop');
    if(renderData != undefined){
        render(renderData);//renderiza em base nas informações passadas
    }
    

}

function Updaterender(data){//atualizar as informações que cliente desenha
    renderData = data;
}


socket.on('start',() =>{
    setInterval(game, 1000/50)//gameloop
})

function render(data){

    drawRect(0, 0, screenWidth, screenHeight, "black")
    //drawRect(user.x, user.y, user.width, user.height, user.color);
    //drawRect(com.x, com.y, com.width, com.height, com.color);
    for(let i = 0; i < data.times[0].atackers.length;i++){
        let att = data.times[0].atackers[i];
        drawRect(att.x, att.y, att.width, att.height, "white");

    }

    for(let i = 0; i < data.times[0].defenders.length;i++){
        let att = data.times[0].defenders[i];
        drawRect(att.x, att.y, att.width, att.height, "white");

    }

    for(let i = 0; i < data.times[1].atackers.length;i++){
        let att = data.times[1].atackers[i];
        drawRect(att.x, att.y, att.width, att.height, "white");

    }

    for(let i = 0; i < data.times[1].defenders.length;i++){
        let att = data.times[1].defenders[i];
        drawRect(att.x, att.y, att.width, att.height, "white");

    }

    for(let i = 0; i < data.shoots.length;i++){
        let sho = data.shoots[i] ;
        drawRect(sho.x, sho.y, sho.width, sho.height, sho.color);

    }

    drawNet();
    drawText(screenWidth/4, screenHeight/5, user.score, 'white', 75);
    drawText(3 * screenWidth/4, screenHeight/5, com.score, 'white', 75);


}

const framePerSecond = 50;

//setInterval(game, 1000/framePerSecond)

function drawNet(){
    for(let i = 0; i <= screenHeight; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}


function drawRect(x, y, w, h, color){

    context.fillStyle = color;
    context.fillRect(x, y, w, h);


}

function drawCircle(x, y, r, color){

    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r ,0 , 2*Math.PI, false);
    context.closePath();
    context.fill()

}

function drawText(x, y, text, color, fontSize){

    context.fillStyle  = color;
    context.font = fontSize + "px fantasy";
    context.fillText(text, x, y);


}


