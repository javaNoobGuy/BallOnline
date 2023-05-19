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

const ball = {

    x : screenWidth/2,
    y : screenHeight/2,
    radius : 30,
    angle : 0,
    speed : 5,
    velocityX : 5 * Math.cos(90 * π/180),
    velocityY: 5 * Math.sin(90 * π/180),

    color : "WHITE"


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

function update(){
    time++;

    let distanceX = ball.x - mouseX;
    let distanceY = ball.y - mouseY;
    console.log("distanceX=" +distanceX);
    console.log("distanceY=" +distanceY);

    
    console.log(distanceX + " distancia do player x");
    console.log(distanceY + " distancia do player y");

    let sin = distanceY / (Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)));
    let cos = distanceX / (Math.sqrt((distanceX * distanceX) + (distanceY * distanceY)));
    // console.log("sin=" +sin);
    // console.log("cos=" +cos);

    if(Math.abs((Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))) > (ball.radius * 0.2))){

        ball.velocityX = (ball.speed * cos) * -1//Math.cos(ball.angle * π/180);
        ball.velocityY = (ball.speed * sin) //Math.sin(ball.angle* π/180);

        ball.x += ball.velocityX * (Math.abs((Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))))/100); 
        ball.y -= ball.velocityY * (Math.abs((Math.sqrt((distanceX * distanceX) + (distanceY * distanceY))))/100);

    }

    


}

socket.on('connect',()=>{//conexão do cliente
    id = socket.id;
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
    render(renderData);//renderiza em base nas informações passadas

}

function Updaterender(data){//atualizar as informações que cliente desenha
    renderData = data;
}


setInterval(game, 1000/50)//gameloop


function render(data){

    drawRect(0, 0, screenWidth, screenHeight, "black")
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    for(let i = 0; i < data.length;i++){

        drawCircle(data[i].x, data[i].y, data[i].radius, data[i].color);
        console.log('renderizou');

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


