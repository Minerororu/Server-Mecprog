const pageScraper = require('./pageScrapper');
async function scrapeAll(browserInstance, nomeEquipamento, hoje, ontem){
    let browser;
    try{
        browser = await browserInstance;
        await pageScraper.scraperHomePage(browser, nomeEquipamento, hoje, ontem);
    }
    
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance, nomeEquipamento, hoje, ontem) => scrapeAll(browserInstance, nomeEquipamento, hoje, ontem)