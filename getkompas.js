const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const fs = require('fs');

async function crawl(loop = 1) {
  try {
    var baselink = "https://news.detik.com/pemilu/indeks/" + loop;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto(baselink, { waitUntil: 'networkidle0' });

    const berita = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('h3.media__title a.media__link')).map(element => element.href);
      return links;
    });
    await browser.close();
    return berita

  } catch (error) {
    console.log('Crawler error : ' + error);
    return [];
  }
}


async function start(number = 1) {
  var start = performance.now();  
  const promises = [];

  for (let i = 1; i <= number; i++) {
    promises.push(crawl(i))
  }
  const results = await Promise.all(promises);
  const out_json = JSON.stringify(results)
  fs.writeFile('./detik/masterlink.json', out_json, (err) => {
    if (err) throw err;
  }); 
  console.log('Get link done in '+((performance.now() - start) / 1000).toFixed(2)+' s')
}

start(5)
// module.exports = start
