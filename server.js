const express = require('express');
const app = express()
let request = require("request-promise")
const cookieJar = request.jar();
request = request.defaults({jar: cookieJar})
const browserObject = require('./browser');
const scraperController = require('./pageController');
const cors = require("cors");
app.use(cors());
const port = process.env.PORT || 8080;
app.use(express.json());
// Required for side-effects

async function main(nomeEquipamento, hoje, ontem){
  //Start the browser and create a browser instance
  let browserInstance = browserObject.startBrowser();
  
  // Pass the browser instance to the scraper controller
  await scraperController(browserInstance, nomeEquipamento, hoje, ontem);
}


app.post("/", function(req, res) {
  console.log(req.body.equipamento);
  main(req.body, req.body.dataHoje, req.body.dataOntem);
  res.send('<div><h1>uuuuu me acahram</h1></div> <h1>ffgrgrg</h1> ');
});

app.get("/", function(req, res) {
  res.send('teste');
});


app.listen(8080, () => {
  console.log('ta no 8080')
});
