const puppeteer = require('puppeteer');


async function crawl(halaman = 1) {
    try {
      var baselink = "https://indeks.kompas.com/?site=news&page=" + halaman;
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
  
      await page.goto(baselink, { waitUntil: 'networkidle0' });
  
      const berita = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('h3.article__title.article__title--medium a.article__link')).map(element => element.href);
        return links;
      });
      await browser.close();
      return berita
  
    } catch (error) {
      console.log('Crawler error : ' + error);
      return [];
    }
  }

(async()=>{
    console.log(await crawl(1))
})()