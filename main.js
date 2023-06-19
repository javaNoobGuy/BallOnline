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
      this.life = 3;
      this.direction = 0;
      this.shooted = false;
      this.team = undefined;
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

      //checa colisao com tiros

      for(let i = 0; i < mundo.shoots.length;i++){
        let currentShoot = mundo.shoots[i];
          if( currentShoot.di == 1 && currentShoot.x == this.x){
             console.log('teste');
             currentShoot.di = 0;
            let vetorNovo = [];

            for (let i = 0; i < mundo.shoots.length; i++) {
              if (mundo.shoots[i].id != currentShoot.id) {
                mundo.shoots[i].id = vetorNovo.length;
                vetorNovo.push(mundo.shoots[i]);
              }
            }
        
            mundo.shoots = vetorNovo;


          }

          if( currentShoot.di == -1 && currentShoot.y - currentShoot.height > this.y && currentShoot.y - currentShoot.height < this.y - this.height && currentShoot.x< this.x && currentShoot.x > this.x - this.width && currentShoot.team != this.team){
            console.log('teste');
           let vetorNovo = [];

           for (let i = 0; i < mundo.shoots.length; i++) {
             if (mundo.shoots[i].id != currentShoot.id) {
               mundo.shoots[i].id = vetorNovo.length;
               vetorNovo.push(mundo.shoots[i]);
             }
           }
       
           mundo.shoots = vetorNovo;


         }



      }

      if(this.shooted == true){//atira
        let shoot = undefined;
        this.shooted = false;

        if(this.team == 0){
          shoot = new Shoot0(this.x, this.y, 'green');
        }
        if(this.team == 1){
          shoot = new Shoot1(this.x, this.y, 'red');
        }

        shoot.id = mundo.shoots.length;
        mundo.shoots.push(shoot);

      }

    }

}

class AtackerTeam0 extends Atacker{
    
    constructor(id){

      super();
      this.x = 0;
      this.id = id;
      this.team = 0;
      this.y = screenHeight/2

    }


}

class AtackerTeam1 extends Atacker{
    
  constructor(id){

    super();
    this.x = screenWidth - this.width;
    this.id = id;
    this.team = 1;
    this.y = screenHeight/2

  }


}

class Defender {

  constructor(){
    this.keyDown = 'none';
    this.direction = 0;
    this.shooted = false;
    this.life = 3;
    this.team = undefined;
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

    if(this.shooted == true){//atira
      let shoot = undefined;
      this.shooted = false;

      if(this.team == 0){
        shoot = new Shoot0(this.x, this.y, 'green');
      }
      if(this.team == 1){
        shoot = new Shoot1(this.x, this.y, 'red');
      }
      shoot.id = mundo.shoots.length;
      mundo.shoots.push(shoot);


    }

  }

}

class DefenderTeam0 extends Defender{
    
  constructor(id){

    super();
    this.x = 0 + this.width * 2;
    this.id = id;
    this.team = 0;
    this.y = screenHeight/2

  }


}

class DefenderTeam1 extends Defender{
    
  constructor(id){

    super();
    this.x = screenWidth - (this.width * 3);
    this.id = id;
    this.team = 1;
    this.y = screenHeight/2

  }


}

class Shoot{

  constructor(x, y){
    this.di = 0;
    this.id = 0;
    this.x = x;
    this.y = y;
    this.team = undefined;
    this.width = 20;
    this.height = 20;

  }

  tick(){

    this.x += this.di;


  }

}

class Shoot0 extends Shoot{

  constructor(x, y, color){
    super(x, y);
    this.di = 1;
    this.team = 0;
    this.color = color;
  }

}

class Shoot1 extends Shoot{

  constructor(x, y, color){
    super(x, y);
    this.di = -1;
    this.team = 1;
    this.color = color;
  }

  
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

  socket.on('keyPre', (data) => {
    if(data.key == "z" || data.key == " "){
      getCurrentPlayer(socket.id).shooted = true;
    }
  });

  socket.on('keylea', (data) =>{
    if(data.key == "z" || data.key == " "){
      getCurrentPlayer(socket.id).shooted = false;
    }
  });

  socket.on('keyleave',(event)=>{
    if(event.key == "w" || event.key == "s"){
        getCurrentPlayer(socket.id).direction = 0;
    }
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

}

function update(player) {
  //update

  player.tick();

  for(let i = 0; i < mundo.shoots.length;i++){

    mundo.shoots[i].tick();

  }

  if(player.id == onlinePlayerOrder[0]){
    updateWorld();
  }


}

http.listen(3000, async() => {
  console.log('servidor rodando!');
});


