const pageScraper = require('./pageScrapper');
async function scrapeAll(browserInstance, nomeEquipamento, hoje, ontem, index){
    let browser;
    try{
        browser = await browserInstance;
        await pageScraper.scraperHomePage(browser, nomeEquipamento, hoje, ontem, index);
    }
    
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, nomeEquipamento, hoje, ontem, index) => scrapeAll(browserInstance, nomeEquipamento, hoje, ontem, index)