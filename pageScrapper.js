const server = require('./server');
const axios = require('axios')
const scraperObject = {
  urlHome: 'http://www16.itrack.com.br/mecprog/controlemonitoramento',
  equipamentos: [],
  scrapeRelatorio: async (browser, equipamento, equipamentoIndex) => {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear();
    let hoje = dd +'/' +mm + '/' + yyyy;
    let ontem = parseInt(dd) - 1 +'/' +mm + '/' + yyyy;

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
      let today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      let hoje = dd + '/' + mm + '/' + yyyy;
      let tdsArr = [];
      let tds = Array.from(document.querySelectorAll('.small'));
      let dadoDeOntem;
      for (let i = 0; i + 1 < tds.length; i++) {
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
          if (texto.charAt(1) != 'h') {
            if (texto.charAt(4) != 'm') {
              minutos = parseInt(texto.charAt(3) + texto.charAt(4));
            } else {
              minutos = parseInt(texto.charAt(3));
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
    for (let i = 0; i < tds.length; i++) {
      if ((i + 1) % 2 == 1) {
        totalHoras += tds[i];
      } else {
        console.log(tds)
        somaMinutos = parseInt(tds[i] * 1.667);
      }
    }
    console.log(somaMinutos + ' somaMinutos')
    horarioTotal = ((await totalHoras) + somaMinutos / 100) + equipamento?.valorUltimoApontamento;

    if (horarioTotal - equipamento?.valorUltimoApontamento != 0) {
      console.log(equipamento.uid + ' uid')
      console.log(horarioTotal +' valor')
      apontamentoObj = {
        cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
        dataLeitura: hoje,
        equipamento: {
          cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
          uid: equipamento.uid,
          equipamento: equipamento.equipamento,
          id: equipamento.id,
          modelo: equipamento?.modelo,
          tipoEquipamento: JSON.parse(JSON.stringify(equipamento?.tipoEquipamento)),
        },
        observacoes: '',
        uid: equipamento.uid,
        unidadeMedida: 'HORAS',
        valorReal: horarioTotal,
        geradoPor: 'Automaticamente'
      }
      axios.post('https://server-mecprog-firebase.herokuapp.com', ['apontamentos',apontamentoObj])
        .catch(err => console.log(err.message))
        .then(data => console.log(data));
      equipamento.valorUltimoApontamento = horarioTotal;
      axios.post('https://server-mecprog-firebase.herokuapp.com', ['equipamentos',apontamentoObj])
        .catch(err => console.log(err.message))
        .then(data => console.log(data));
    };
    browser.close()
  },

  async scraperHomePage(browser, equipamento, index) {
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
      server.main(index);
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
      equipamentosNomes.indexOf(equipamento.equipamento) + 1
    );
    return ''
  },
};


module.exports = scraperObject;