const express = require('express');
const app = express();

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
  console.log('main')
  //if(equipamentos.contains(equipamento.equipamento))
  // Pass the browser instance to the scraper controller
  
  await scraperController(browserInstance, equipamentos[index], hoje, ontem, index);
}

let intervalTimer = '';
app.post('/', function (req, res) {
  let loopavel = true;
  const callMain = async (loop) => {
    if(loop){
      for (let i = 0; i < equipamentos.length; i++) {
        if(loopavel){
          console.log('chamou main com loop')
          await main(req.body[req.body.length-1].dataHoje, req.body[req.body.length-1].dataOntem, false, 0);
        }
      }
    }else {
      if(loopavel){
        await main(req.body[req.body.length-1].dataHoje, req.body[req.body.length-1].dataOntem, false, 0);
      }
    }
  };

  const mapBody = async () => {
    for(let index = 0; index < req.body.length -1; index++){
      element = req.body[index]
      if (!equipamentosNomes.includes(element.equipamento)) {
        equipamentos.push(element);
        equipamentosNomes.push(element.equipamento);
        loopavel = true;
        // console.log(equipamentos)
        // console.log(equipamentosNomes)
      }else{
        loopavel = false;
      }
      await console.log('chamou main sem loop');
      await callMain(false);
    }
  };
  mapBody()
  
  clearInterval(intervalTimer);

  intervalTimer = setInterval(() => {
    callMain(true);
  }, 24 * 60 * 60 * 1000);
});

app.get('/', function (req, res) {
  res.send('teste');
});

module.exports.main = main;

app.listen(443, () => {
  console.log('Ta aberto no 443')
});

app.listen(80, () => {
  console.log('Ta aberto na 80')
});