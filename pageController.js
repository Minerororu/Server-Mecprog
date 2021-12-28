const pageScraper = require('./pageScrapper').default;
async function scrapeAll(browserInstance, nomeEquipamento, index) {
  let browser;
  try {
    browser = await browserInstance;
    await console.log('chamou scrape')
    await pageScraper.scraperHomePage(browser, nomeEquipamento, index);
  } catch (err) {
    console.log('Could not resolve the browser instance => ', err);
  }
}

module.exports = (browserInstance, nomeEquipamento, index) =>
  scrapeAll(browserInstance, nomeEquipamento, index);
