const pageScraper = require('./pageScrapper');
async function scrapeAll(browserInstance, nomeEquipamento, hoje, ontem, user, senha){
    let browser;
    try{
        browser = await browserInstance;
        await pageScraper.scraperHomePage(browser, nomeEquipamento, hoje, ontem, user, senha);
    }
    
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, nomeEquipamento, hoje, ontem, user, senha) => scrapeAll(browserInstance, nomeEquipamento, hoje, ontem, user, senha)