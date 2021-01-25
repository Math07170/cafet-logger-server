const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
var mysql = require('mysql');
const {
  generateSalt,
  hash,
  compare
} = require('./password_hash');
app.use(express.json());
app.use(cors());
const port = 5000;
const { connection } = require('./mysql');
//Current Cash in cafet
var currentCash;

const socketIo = require("socket.io");
// our server instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let interval;
io.on("connection", (socket) => {
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {

  });
  socket.on('getStock', ()=>{
    connection.query("SELECT * FROM `stock` WHERE amount>0 && name!='money'", (error, response)=> {
      io.emit('Stock', response);
    });
  });
  socket.on('sell', (items) => {
    console.log(items);    
  });
});
const getApiAndEmit = socket =>{
  socket.emit('Cash', currentCash);
}


//Login Check Password
app.post('/login', (req, res) =>{
  connection.query("SELECT * FROM `users` WHERE username='"+req.body.username+"'", function(error, response){
    if (error) throw error;
    if(response[0] === undefined){
      res.send({sucess: false, access: 0});
    } else{
      var hash = {
        salt: response[0].salt,
        hashedpassword: response[0].password
      }
      console.log(compare(req.body.password, hash));
      res.send({sucess: compare(req.body.password, hash),prenom:response[0].prenom, nom:response[0].nom, access: response[0].access});
    }
  });
});

//Make a SQL request
app.post('/mysql', (req, res)=>{
  console.log(req.body.request);
  connection.query(req.body.request, function (error, response){
    if (error) throw error;
    res.send(response);
  });
});

//Get the stock in cafet
app.post('/stock/getCafet', (req, res)=>{
  connection.query("SELECT * FROM `stock` WHERE amount>0 && name!='money'", function (error, response){
    console.log(response);
    res.send(response);
  });
});

//Get the amount of cash
app.get('/money/cash/get', (req, res) =>{
  res.send(currentCash);
});
//Set the amount of cash
app.post('/money/cash/set', (req, res) =>{
  currentCash = req.body.amount;
  res.send({done: true});
});
//Hello Word Test
app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('Hi!');
})

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  connection.query("SELECT amount FROM `stock` WHERE name='money'", (error, response) => {
    currentCash = response[0].amount;
  });
})

