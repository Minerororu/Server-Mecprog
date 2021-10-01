const express = require('express');
const app = express()
let request = require("request-promise")
const cookieJar = request.jar();
request = request.defaults({jar: cookieJar})
const browserObject = require('./browser');
const scraperController = require('./pageController');
const puppeteer = require('puppeteer')
const cors = require("cors");
app.use(cors());
app.use(express.json());
const equipamentos = []
const equipamentosNomes = []
// Required for side-effects

async function main(equipamentos, hoje, ontem, user, senha){
  let browserInstance = puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox']})

  // Pass the browser instance to the scraper controller
  console.log('req.body');
  await scraperController(browserInstance, equipamentos, hoje, ontem, user, senha);
}


app.post("/", function(req, res) {
  equipamentosNomes.includes(req.body.equipamento)? '':(equipamentos.push(req.body), equipamentosNomes.push(req.body.equipamento));
  const interval = async () => {
    main(equipamentos, req.body.dataHoje, req.body.dataOntem, req.body.cliente.usuarioRastreamento, req.body.cliente.senhaRastreamento);

    setInterval(() => {
      console.log('w')
      main(equipamentos, req.body.dataHoje, req.body.dataOntem, req.body.cliente.usuarioRastreamento, req.body.cliente.senhaRastreamento);
    }, (60*1000));
  };
  interval()
});

app.get("/", function(req, res) {
  res.send('teste');
});


app.listen(80, () => {
  console.log('ta no 80')
});
