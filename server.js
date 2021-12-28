const express = require('express');
const app = express();

let request = require('request-promise');
const cookieJar = request.jar();
request = request.defaults({ jar: cookieJar });
const browserObject = require('./browser');
const scraperController = require('./pageController');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer')
const cors = require('cors');
app.use(cors());
app.use(express.json());
const equipamentos = [];
const equipamentosNomes = [];
const documentos = [];
// Required for side-effects

async function main(index) {
  console.log('main')
  let browserInstance = puppeteer.launch({
    //executablePath: '/usr/bin/google-chrome-stable',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  //if(equipamentos.contains(equipamento.equipamento))
  // Pass the browser instance to the scraper controller
  
  await scraperController(browserInstance, equipamentos[index], index);
}

let intervalTimer = '';
app.post('/', function (req, res) {
//   const callMain = async (i) => {
//         console.log(equipamentos.length + ' lentgh')
//         await main(i);

//   };

//   const mapBody = async () => {
//     for(let index = 0; index < req.body.length; index++){
//       element = req.body[index]
//       if (!equipamentosNomes.includes(element.equipamento + element.cliente.nomeFantasia)) {
//         equipamentos.push(element);
//         equipamentosNomes.push(element.equipamento + element.cliente.nomeFantasia);
//         await callMain(index);
//       }
//     }
//   };
//   if(req.body.length){
//     mapBody();
//   } 

//   else if(req.body.documento){
//     if(documentos.filter(e => e.id === req.body.id).length == 0 && documentos.filter(e => JSON.parse(JSON.stringify(e)) === JSON.parse(JSON.stringify(req.body))).length == 0){
//       documentos.push(req.body);
//     } else {
//       let index = documentos.map(function(e) { return e.id}).indexOf(req.body.id);
//       documentos.splice(index, 1, req.body)
//     }
//     console.log(documentos)
//   } else if(req.body.assunto){
//     console.log(req.body)
//     mandarEmail(req.body['assunto'], req.body['email'], req.body['corpo'], req.body['anexo']);
//   }
//   clearInterval(intervalTimer);
//   intervalTimer = setInterval(() => {
//     if(req.body.documento){
//       documentos.map(documento => {
//         let dataValidade = new Date();
//         let strSplit = documento.dataValidade.split('/');
//         dataValidade.setDate(parseInt(strSplit[0]));
//         dataValidade.setMonth(parseInt(strSplit[1] - 1))
//         dataValidade.setFullYear(parseInt(strSplit[2]));
//         dataValidade.setDate(dataValidade.getDate() - documento.antecedencia);
//         console.log(dataValidade);
//         if(new Date() >= dataValidade){
//           console.log('chamei email linha 62');
//           mandarEmail("Documento próximo da Data de Validade", documento.email, "O documento: " + documento.documento + ", está próximo da data de validade, no dia: " + documento.dataValidade);
//         }
//       })
//     }
//   }, 24 * 60 * 60 * 1000);
  const pageScraper = require('./pageScrapper');  
  pageScraper.salvarApontamentoUso({cliente: {nomeFantasia: 'Teste Heroku'}, uid: 'mrXK8eovFJYfVwdyybozR5N44b02', modelo: 'Teste Heroku', equipamento: 'Teste Heroku', tipoEquipamento: {tipoEquipamento: 'Teste Heroku'}}, 10, '28/12/2021')
  res.send('me acharam uuuuuu');
});

function mandarEmail(assunto, destinatario, corpo, anexo = null){
  console.log("Email enviado para " + destinatario)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mecprogadm@gmail.com',
      pass: 'mecprog123'
    }
   })
   let email = {
     from: 'mecprogadm@gmail.com',
     to: destinatario,
     subject: assunto,
     text: corpo,
     attachments: anexo ?  [
      {
          filename: "OrdemDeServico.pdf",
          content: anexo?.output('arraybuffer')
      }
   ] : '',
   };
   transporter.sendMail(email, (error, info) => {
     if(error){
       return console.log(error);
     }
     console.log('Mensagem %s enviada %s', info.messageId, info.response);
   })
}

app.get('/', function (req, res) {
  res.send('teste');
});

module.exports.main = main;

app.listen(process.env.PORT || 8080, () => {
  console.log('Ta aberto no 8080')
});