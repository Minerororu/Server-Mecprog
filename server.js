const express = require('express');
const app = express();
let request = require('request-promise');
const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar });
const scraperController = require('./pageController');
const puppeteer = require('puppeteer');
app.use(express.json());
const equipamentos = [];
const equipamentosNomes = [];
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// Required for side-effects

async function main(index) {
  console.log('main')
  let browserInstance = puppeteer.launch({
    //executablePath: '/usr/bin/google-chrome-stable',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  //if(equipamentos.contains(equipamento.equipamento))
  // Pass the browser instance to the scraper controller
  console.log(equipamentos[index])
  await scraperController(browserInstance, equipamentos[index], index);
}

let intervalTimer = '';
app.post('/', function (req, res) {
  const callMain = async (i) => {
    console.log(equipamentos.length + ' lentgh')
    await main(i);
  };

  const mapBody = async () => {
    for(let index = 0; index < req.body.length; index++){
      element = req.body[index]
      if (!equipamentosNomes.includes(element.equipamento + element.cliente.nomeFantasia)) {
        equipamentos.push(element);
        equipamentosNomes.push(element.equipamento + element.cliente.nomeFantasia);
        await callMain(index);
      }
    }
  };
  mapBody(); 
  clearInterval(intervalTimer);
  intervalTimer = setInterval(() => {
    mapBody();
  }, 60 * 1000);
  
  res.send('me acharam uuuuuu');
});

app.get('/', function (req, res) {
  res.send('teste');
});

module.exports.main = main;

app.listen(process.env.PORT || 8080, () => {
  console.log('Ta aberto no 8080')
});