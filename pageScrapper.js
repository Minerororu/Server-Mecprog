const firebase = require("firebase");
require("firebase/firestore");

const scraperObject = {
    urlHome: 'http://www17.itrack.com.br/mecprog/controlemonitoramento',
    equipamentos: [],
    scrapeRelatorio: async (browser, equipamento, hoje, ontem) => {
        nomeEquipamento = equipamento.equipamento;
        console.log(nomeEquipamento + ' equipamento');
        let equipamentoID = (equipamentos.indexOf(nomeEquipamento) + 1) + '';
        console.log(equipamentoID); 
        console.log(ontem);
        let urlRelatorio = `http://www17.itrack.com.br/mecprog/controlerelatoriopontopercurso?VEIID=${equipamentoID}&tipoConsulta=5&dtI=${ontem.charAt(0) + ontem.charAt(1)}%2F${ontem.charAt(3) + ontem.charAt(4)}%2F${ontem.charAt(6) + ontem.charAt(7) + ontem.charAt(8) + ontem.charAt(9)}&dtF=${hoje.charAt(0) + hoje.charAt(1)}%2F${hoje.charAt(3) + hoje.charAt(4)}%2F${hoje.charAt(6) + hoje.charAt(7) + hoje.charAt(8) + hoje.charAt(9)}`
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
          for(let i = 0;(i +1) < tds.length; i++){
            if((i + 1) % 3 == 2){
              let texto = tds[i].innerText;
              if(texto.charAt(0) + texto.charAt(1) == hoje.charAt(0) + hoje.charAt(1)){
                dadoDeOntem = false;
              }else{
                dadoDeOntem = true;
              }
            } 
            if((i + 1) % 3 == 0 && dadoDeOntem){
              let texto = tds[i].innerText;
              if(texto.charAt(1) != 'h'){
                if(texto.charAt(4) != 'm'){
                  minutos = parseInt(texto.charAt(3) + texto.charAt(4));
                }else{
                  minutos = parseInt(texto.charAt(3));
                };
                horas = parseInt(texto.charAt(0) + texto.charAt(1));;
              }else{
                if(texto.charAt(4) != 'm'){
                  minutos = parseInt(texto.charAt(3) + texto.charAt(4));
                }else{
                  minutos = parseInt(texto.charAt(3));
                }
                horas = parseInt(texto.charAt(0));
              }
            tdsArr.push(horas);
            tdsArr.push(minutos);
          }
        } 
          return tdsArr
      });
      console.log(tds);
        totalHoras = 0;
        totalMinutos = 0;
        somaMinutos = 0;
        for(let i = 0; i < tds.length; i++){
          if((i+1) % 2 == 1){
            totalHoras += tds[i];
          }else{
            somaMinutos += tds[i];
            totalHoras += parseInt(somaMinutos / 60);
            totalMinutos += somaMinutos % 60;
          }
        }
        horarioTotal = totalHoras + (totalMinutos / 100)
        console.log(totalHoras);
        console.log(totalMinutos)
        salvarApontamentoUso(equipamento, horarioTotal);
    },

    async scraperHomePage(browser, nomeEquipamento, hoje, ontem){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.urlHome}...`);
        await page.goto(this.urlHome);
        await page.type('[name="usuario"]', 'prvfazendas');
        await page.type('[name="senha"]', '1234');
        await page.click('.btn');
        await page.waitForSelector('.trLink');
        equipamentos = await page.evaluate(() => {
            let equipamentosArr = []
            let tds = Array.from(document.querySelectorAll('div table tr td'))
            for(let i = 26;i <= tds.length; i = i+17){
                equipamentosArr.push(tds[i].innerText)
            } 
            return equipamentosArr
        });
        await console.log(equipamentos);

        await this.scrapeRelatorio(browser, nomeEquipamento, hoje, ontem);
    },
}
// 54

  function salvarApontamentoUso(equipamento, valor){
    firebase.initializeApp({
        apiKey: "AIzaSyBJupSNTmCtRSlH9kQbOZwC1zXsfTC0YBI",
        authDomain: "svg-angular.firebaseapp.com",
        databaseURL: "https://svg-angular-default-rtdb.firebaseio.com",
        projectId: "svg-angular",
        storageBucket: "svg-angular.appspot.com",
        messagingSenderId: "402634435212",
        appId: "1:402634435212:web:f97eb51809195d654869a9",
        measurementId: "G-TD2M0NTKC1"
    });
        
    var db = firebase.firestore();
    
    db.collection("apontamentos").add({
      cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
      dataLeitura: equipamento.dataHoje,
      equipamento: {
        cliente: JSON.parse(JSON.stringify(equipamento.cliente)),
        equipamento: equipamento.equipamento,
        id: equipamento.id,
        modelo: equipamento.modelo,
        tipoEquipamento: JSON.parse(JSON.stringify(equipamento.tipoEquipamento)),
        uid: equipamento.uid,
      },
      observacoes: '',
      uid: equipamento.uid,
      unidadeMedida: "HORAS",
      valorReal: valor,
    })
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
  }

module.exports = scraperObject;