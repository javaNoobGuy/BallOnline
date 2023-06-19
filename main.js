const express = require("express");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static(__dirname + "/js"));

var time1 = {atackers : [], defenders : [], centers : []};
var time2 = {atackers : [], defenders : [], centers : []};

var onlinePlayerOrder = [];
var mundo = {times : [time1, time2], shoots : []};

const screenWidth = 1200;
const screenHeight = 900;
const π = Math.PI;

var teamadd = 0;
var aod = 0;

class Atacker{
    constructor(){
      this.keyDown = 'none';
      this.direction = 0;
      this.shooted = false;
      this.width = 20;
      this.height = 20;
      this.x = 0;
      this.y = 0;
    }



    tick(){

      if(this.direction == -1){
        this.y++;
      }else if( this.direction == 1){
        this.y--;
      }

      if(this.shooted = true){//atira
        this.shooted = false;
      }

    }

}

class AtackerTeam0 extends Atacker{
    
    constructor(id){

      super();
      this.x = 0;
      this.id = id;
      this.y = screenHeight/2

    }


}

class AtackerTeam1 extends Atacker{
    
  constructor(id){

    super();
    this.x = screenWidth - this.width;
    this.id = id;
    this.y = screenHeight/2

  }


}

class Defender {

  constructor(){
    this.keyDown = 'none';
    this.direction = 0;
    this.width = 20;
    this.height = 20;
    this.x = 0;
    this.y = 0;
  }



  tick(){

    if(this.direction == -1){
      this.y++;
    }else if(this.direction == 1){
      this.y--;
    }

  }

}

class DefenderTeam0 extends Defender{
    
  constructor(id){

    super();
    this.x = 0 + this.width * 2;
    this.id = id;
    this.y = screenHeight/2

  }


}

class DefenderTeam1 extends Defender{
    
  constructor(id){

    super();
    this.x = screenWidth - (this.width * 3);
    this.id = id;
    this.y = screenHeight/2

  }


}

function Shoot(id, team){

}

function Center(team){

}

function newBall(idConnection) {
  return {
    x: screenWidth / 2,
    y: screenHeight / 2,
    radius: 30,
    angle: 0,
    speed: 5,
    id: idConnection,
    dataInputs: {
      mouseX: screenWidth / 2,
      mouseY: screenHeight / 2,
      id: idConnection,
    },
    keyInputs: {

      keyDown : 'none',

    },
    velocityX: 5 * Math.cos((90 * π) / 180),
    velocityY: 5 * Math.sin((90 * π) / 180),
    tick: function () {
      let distanceX = this.x - this.dataInputs.mouseX;
      let distanceY = this.y - this.dataInputs.mouseY;

      let sin =
        distanceY / Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      let cos =
        distanceX / Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      // console.log("sin=" +sin);
      // console.log("cos=" +cos);

      /*if(this.keyInputs.keyDown != 'none'){
        this.velocityX = this.speed * Math.cos(angles[1] * π/180);
        this.velocityY = this.speed * Math.sin(angles[0] * π/180);
        this.x += this.velocityX;
        this.y += this.velocityY;
      }*/

      if (
        Math.abs(
          Math.sqrt(distanceX * distanceX + distanceY * distanceY) >
            this.radius * 0.2
        )
      ) {
        this.velocityX = this.speed * cos * -1; //Math.cos(ball.angle * π/180);
        this.velocityY = this.speed * sin; //Math.sin(ball.angle* π/180);

        this.x +=this.velocityX *(Math.abs(Math.sqrt(distanceX * distanceX + distanceY * distanceY)) /100);
            this.y -=
            this.velocityY *
          (Math.abs(Math.sqrt(distanceX * distanceX + distanceY * distanceY)) /
            100);
      }
    },

    color: "WHITE",
  };
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  // eventod e conexão de um cliente
  let id = socket.id;

  if(aod == 0){// add atacker
    if(teamadd == 0){
      mundo.times[teamadd].atackers.push(new AtackerTeam0(id));
    }else if(teamadd == 1){
      mundo.times[teamadd].atackers.push(new AtackerTeam1(id));
    }
    aod++;
  }else if(aod == 1){// add defender

    if(teamadd == 0){
      mundo.times[teamadd].defenders.push(new DefenderTeam0(id));
    }else if(teamadd == 1){
      mundo.times[teamadd].defenders.push(new DefenderTeam1(id));
    }
    aod++;
  }

  if(aod > 1){
    aod = 0;
    teamadd++;
  }

  if(teamadd > 1){
    teamadd = 0;
  }
  
  onlinePlayerOrder.push[socket.id];
  socket.emit('start',{});

  socket.on('keydown', (data) =>{

    if(data.key == "w"){
      getCurrentPlayer(socket.id).direction = 1;
    }else if(data.key == "s"){
      getCurrentPlayer(socket.id).direction = -1;
    }

  });

  socket.on('keyleave',()=>{
    getCurrentPlayer(socket.id).direction = 0;
  })


  /*socket.on("mouse", (data) => {
    //evento mouse
    updateData(data, getCurrentPlayer(socket.id)); //altera as informações de input do cliente conectado no server
  });*/

  socket.on("atualiza", () => {
    send(socket.id);
  }); //quando o evento atualizar for recebido o metodo send é executado

  function deleteItem(lista, item){
    let vetorNovo = [];

    for (let i = 0; i < lista.length; i++) {
      if (lista[i].id != item.id) {
        vetorNovo.push(lista[i]);
      }
    }

    lista = vetorNovo;
    return lista;
  }

  socket.on("disconnect", () => {
    let id = socket.id;
    let vetorNovo = [];

    for (let i = 0; i < onlinePlayerOrder.length; i++) {
      if (onlinePlayerOrder[i].id != id) {
        vetorNovo.push(onlinePlayerOrder[i]);
      }
    }

    onlinePlayerOrder = vetorNovo;

    let lista = undefined;
    let player = getCurrentPlayer(id);

    if(mundo.times[0].atackers.includes(player)){

      lista = mundo.times[0].atackers;
      mundo.times[0].atackers = deleteItem(lista, player);

    }else if(mundo.times[0].defenders.includes(player)){

      lista = mundo.times[0].defenders;
      mundo.times[0].defenders = deleteItem(lista, player);

    }else if(mundo.times[1].atackers.includes(player)){

      lista = mundo.times[1].atackers;
      mundo.times[1].atackers = deleteItem(lista, player);

    } else if(mundo.times[1].defenders.includes(player)){

      lista = mundo.times[1].defenders
      mundo.times[1].defenders = deleteItem(lista, player);

    }

  });
});

function updateData(data, ball) {
  //atualiza os dados de input de um determinado cliente
  ball.dataInputs = data;

}

function send(id) {
  //recebe o id de quem conectou

  update(getCurrentPlayer(id)); //passa o player para o server atualizar
  
  io.emit("render", mundo); //emite o evento render, com as informações dos players e do server
}

function getCurrentPlayer(id) {
  //pega um player dentro do vetor lista players usando a id de conexão
  for (let i = 0; i < mundo.times[0].atackers.length; i++) {
    if (mundo.times[0].atackers[i].id == id) {
      return mundo.times[0].atackers[i];
    }
  }

  for (let i = 0; i < mundo.times[0].defenders.length; i++) {
    if (mundo.times[0].defenders[i].id == id) {
      return mundo.times[0].defenders[i];
    }
  }

  for (let i = 0; i < mundo.times[1].atackers.length; i++) {
    if (mundo.times[1].atackers[i].id == id) {
      return mundo.times[1].atackers[i];
    }
  }

  for (let i = 0; i < mundo.times[1].defenders.length; i++) {
    if (mundo.times[1].defenders[i].id == id) {
      return mundo.times[1].defenders[i];
    }
  }


}

function updateWorld(){
  for(let i = 0; i < mundo.shoots.length;i++){

    shoots[i].tick();

  }
}

function update(player) {
  //update


  if(player.id == onlinePlayerOrder[0]){
      updateWorld();
  }

  player.tick();
}

http.listen(3000, async() => {
  console.log('servidor rodando!');
});


