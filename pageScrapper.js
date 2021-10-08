const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc } = require('firebase/firestore/lite');
const server = require('./server');
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBJupSNTmCtRSlH9kQbOZwC1zXsfTC0YBI',
  authDomain: 'svg-angular.firebaseapp.com',
  databaseURL: 'https://svg-angular-default-rtdb.firebaseio.com',
  projectId: 'svg-angular',
  storageBucket: 'svg-angular.appspot.com',
  messagingSenderId: '402634435212',
  appId: '1:402634435212:web:f97eb51809195d654869a9',
  measurementId: 'G-TD2M0NTKC1',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const scraperObject = {
  urlHome: 'http://www16.itrack.com.br/mecprog/controlemonitoramento',
  equipamentos: [],
  scrapeRelatorio: async (browser, equipamento, hoje, ontem, equipamentoIndex) => {
    nomeEquipamento = equipamento.equipamento;
    let urlRelatorio = `http://www16.itrack.com.br/mecprog/controlerelatoriopontopercurso?VEIID=${equipamentoIndex}&tipoConsulta=5&dtI=${
      ontem.charAt(0) + ontem.charAt(1)
    }%2F${ontem.charAt(3) + ontem.charAt(4)}%2F${
      ontem.charAt(6) + ontem.charAt(7) + ontem.charAt(8) + ontem.charAt(9)
    }&dtF=${hoje.charAt(0) + hoje.charAt(1)}%2F${hoje.charAt(3) + hoje.charAt(4)}%2F${
      hoje.charAt(6) + hoje.charAt(7) + hoje.charAt(8) + hoje.charAt(9)
    }`;

    let page = await browser.newPage();
    console.log(`Navigating to ${urlRelatorio}...`);
    await page.goto(urlRelatorio);
    tds = await page.evaluate(() => {
      console.log('a')
      let today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      let hoje = dd + '/' + mm + '/' + yyyy;
      let tdsArr = [];
      let tds = Array.from(document.querySelectorAll('.small'));
      let dadoDeOntem;
      console.log(tds);
      for (let i = 0; i + 1 < tds.length; i++) {
        console.log(dadoDeOntem)
        if ((i + 1) % 3 == 2) {
          let texto = tds[i].innerText;
          if (texto.charAt(0) + texto.charAt(1) == hoje.charAt(0) + hoje.charAt(1)) {
            dadoDeOntem = false;
          } else {
            dadoDeOntem = true;
          }
        }
        
        if ((i + 1) % 3 == 0 && dadoDeOntem) {
          let texto = tds[i].innerText;
          console.log(texto)
          if (texto.charAt(1) != 'h') {
            if (texto.charAt(4) != 'm') {
              minutos = parseInt(texto.charAt(3) + texto.charAt(4));
              console.log(minutos)
            } else {
              minutos = parseInt(texto.charAt(3));
              console.log(minutos)
            }
            horas = parseInt(texto.charAt(0) + texto.charAt(1));
          } else {
            if (texto.charAt(4) != 'm') {
              minutos = parseInt(texto.charAt(3) + texto.charAt(4));
            } else {
              minutos = parseInt(texto.charAt(3));
            }
            horas = parseInt(texto.charAt(0));
          }
          tdsArr.push(horas);
          tdsArr.push(minutos);
        }
      }
      return tdsArr;
    });
    totalHoras = 0;
    somaMinutos = 0;
    console.log(tds)
    for (let i = 0; i < tds.length; i++) {
      if ((i + 1) % 2 == 1) {
        totalHoras += tds[i];
      } else {
        somaMinutos = parseInt(tds[i] * 1.667);
      }
    }
    horarioTotal = ((await totalHoras) + somaMinutos / 100) + equipamento?.valorUltimoApontamento;
    console.log(totalHoras)
    console.log(somaMinutos)
    if (horarioTotal != 0) {
      await salvarApontamentoUso(equipamento, horarioTotal, hoje);
    };
    await browser.close();
  },

  async scraperHomePage(browser, equipamento, hoje, ontem, index) {
    const context = await browser.createIncognitoBrowserContext();
    let page = await browser.newPage();
    console.log(`Navigating to ${this.urlHome}...`);
    // await page.deleteCookie({
    //   name : "JSESSIONID",
    //   domain : "http://www17.itrack.com.br/"
    // })
    await page.goto(this.urlHome);
    await page.deleteCookie({
      name: 'JSESSIONID',
      domain: 'http://www17.itrack.com.br/',
    });
    await page.type('[name="usuario"]', equipamento.cliente.usuarioRastreamento);
    await page.type('[name="senha"]', equipamento.cliente.senhaRastreamento);
    await page.click('.btn');
    try {
      await page.waitForSelector('.trLink');
    } catch (err) {
      browser.close();
      server.main(hoje, ontem, true, index);
    }
    equipamentosNomes = await page.evaluate(() => {
      let equipamentosArr = [];
      let tds = Array.from(document.querySelectorAll('div table tr td'));
      for (let i = 26; i <= tds.length; i = i + 17) {
        equipamentosArr.push(tds[i].innerText);
      }
      return equipamentosArr;
    });

    await this.scrapeRelatorio(
      browser,
      equipamento,
      hoje,
      ontem,
      equipamentosNomes.indexOf(equipamento.equipamento) + 1
    );
  },
};

async function salvarApontamentoUso(equipamento, valor, dataHoje) {
  // Get a list of cities from your database

  // TODO: Replace the following with your app's Firebase project configuration
  try {
    apontamentoObj = {
      cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
      dataLeitura: dataHoje,
      equipamento: {
        cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
        uid: equipamento.cliente.uid,
        equipamento: equipamento.equipamento,
        id: equipamento.id,
        modelo: equipamento.modelo,
        tipoEquipamento: JSON.parse(JSON.stringify(equipamento.tipoEquipamento)),
        uid: equipamento.uid,
      },
      observacoes: '',
      uid: equipamento.cliente.uid,
      unidadeMedida: 'HORAS',
      valorReal: valor,
    }
    const docRefApontamento = await addDoc(collection(db, 'apontamentos'), apontamentoObj);
    equipamento.valorUltimoApontamento = apontamentoObj.valorReal;
    const docRefEquipamento = await addDoc(collection(db, 'equipamentos'), equipamento);
    console.log('Document written with ID:' + docRefApontamento.id);
    console.log('Document written with ID:' + docRefEquipamento.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
}

module.exports = scraperObject;