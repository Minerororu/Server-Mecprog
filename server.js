const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
let request = require('request-promise');
const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar });
const browserObject = require('./browser');
const scraperController = require('./pageController');
const puppeteer = require('puppeteer');
const cors = require('cors');
app.use(cors());
app.use(express.json());
const equipamentos = [];
const equipamentosNomes = [];
// Required for side-effects

async function main(hoje, ontem, erro, index) {
  let browserInstance = puppeteer.launch({
    //executablePath: '/usr/bin/google-chrome-stable',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  //if(equipamentos.contains(equipamento.equipamento))
  // Pass the browser instance to the scraper controller
  await scraperController(browserInstance, equipamentos[index], hoje, ontem, index);
}

let intervalTimer = '';
app.post('/', function (req, res) {
  let loopavel = true;
  console.log(req.body)
  req.body.map((element, index) => {
    if(index < req.body.length -1){
      if (!equipamentosNomes.includes(element.equipamento)) {
        equipamentos.push(element);
        equipamentosNomes.push(element.equipamento);
        loopavel = true;
      }else{
        loopavel = false;
      }
    }
  });

  const loop = async () => {
    for (let i = 0; i < equipamentos.length; i++) {
      if(loopavel){
        await main(req.body[req.body.length-1].dataHoje, req.body[req.body.length-1].dataOntem, false, i);
      }
    }
  };
  
  loop();
  clearInterval(intervalTimer);

  intervalTimer = setInterval(() => {
    loop();
  }, 24 * 60 * 60 * 1000);
});

app.get('/', function (req, res) {
  res.send('teste');
});

module.exports.main = main;

https.createServer(options, function(req, res) {
    console.log('ta no 443')
    res.end("hello world\n");
    res.writeHead(200);
}).listen(443);