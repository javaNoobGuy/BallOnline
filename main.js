const express = require("express");
const { render } = require("express/lib/response");
const { lstat } = require("fs");
const { platform } = require("os");
const { start } = require("repl");
const app = express();
const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static(__dirname + "/js"));

var listaPlayers = [];

const screenWidth = 1600;
const screenHeight = 1400;
const π = Math.PI;

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
  listaPlayers.push(newBall(socket.id)); //adiciona um objeto bola que vai representar o cliente conectado tendo a id de conexão e as informaçoes de input a ele relacionado
  socket.emit('start',{});

  socket.on("mouse", (data) => {
    //evento mouse
    updateData(data, getCurrentBall(io.id)); //altera as informações de input do cliente conectado no server
  });

  socket.on("atualiza", () => {
    send(socket.id);
  }); //quando o evento atualizar for recebido o metodo send é executado

  io.on("disconnect", () => {
    let vetorNovo = [];

    for (let i = 0; i < listaPlayers.length; i++) {
      if (listaPlayers[i].id != id) {
        vetorNovo.push(listaPlayers[i]);
      }
    }

    listaPlayers = vetorNovo;
  });
});

function updateData(data, ball) {
  //atualiza os dados de input de um determinado cliente
  ball.dataInputs = data;

}

function send(id) {
  //recebe o id de quem conectou

  update(getCurrentBall(id).dataInputs); //passa os inputs do cliente para o server utilizar
  io.emit("render", listaPlayers); //emite o evento render, com as informações dos players e do server
}

function getCurrentBall(id) {
  //pega um player dentro do vetor lista players usando a id de conexão
  for (let i = 0; i < listaPlayers.length; i++) {
    if (listaPlayers[i].id == id) {
      return listaPlayers[i];
    }
  }
}

function updateWorld(){
  //console.log('atualizando Mundo');
}

function update(data) {
  //update

  let ball = getCurrentBall(data.id);
  if(ball == listaPlayers[0]){
      updateWorld();
  }
  if(ball == listaPlayers[1]){
    console.log('bug');
  }
  ball.tick();
}

http.listen(3000, async() => {
  console.log('servidor rodando!');
});


