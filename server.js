const express = require('express');
const app = express()
let request = require("request-promise")
const cookieJar = request.jar();
request = request.defaults({jar: cookieJar})
const browserObject = require('./browser');
const scraperController = require('./pageController');
const cors = require("cors");
app.use(cors());
app.use(express.json());
const equipamentos = []
const equipamentosNomes = []
// Required for side-effects

async function main(equipamentos, hoje, ontem, user, senha){
  //Start the browser and create a browser instance
  let browserInstance = browserObject.startBrowser();
  
  // Pass the browser instance to the scraper controller
  await scraperController(browserInstance, equipamentos, hoje, ontem, user, senha);
}


app.post("/", function(req, res) {
  equipamentosNomes.includes(req.body.equipamento)? '':(equipamentos.push(req.body), equipamentosNomes.push(req.body.equipamento));
  main(equipamentos, req.body.dataHoje, req.body.dataOntem, req.body.cliente.usuarioRastreamento, req.body.cliente.senhaRastreamento);
  res.send('<div><h1>uuuuu me acahram</h1></div> <h1>ffgrgrg</h1> ');
});

app.get("/", function(req, res) {
  res.send('teste');
});


app.listen(8080, '0.0.0.0',() => {
  console.log('ta no 8080')
});
