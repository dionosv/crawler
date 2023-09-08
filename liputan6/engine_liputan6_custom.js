const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

const liputan6 = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)

    const mobileDevice = puppeteer.devices['iPhone 13 Pro Max'];
    await page.emulate(mobileDevice);
    await page.goto(link, { waitUntil: 'networkidle0' });

    await page.waitForSelector('.article-raw-content');

    const berita = await page.evaluate(() => {
      const divSelector = '.article-raw-content';
      const pp = document.querySelectorAll(`${divSelector} p`);
      const paragraphTexts = Array.from(pp).map((p) => p.textContent.trim());
      return paragraphTexts;
    });


    const beritalengkap = berita.join(' ');

    var jdl = await page.evaluate(() => { return document.querySelector('h1.article-header__title')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('a.article-header__author-link')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('.article-header__datetime')?.textContent?.trim() || null; });

    const illegalCharacters = /[\\/:"*?<>|]/g;
    var titleText = String(jdl).replace(illegalCharacters, ' ');

    await browser.close();
    var selesai = performance.now();
    var hit = ((selesai - start) / 1000).toFixed(2);

    const data = {
      judul: titleText,
      penulis: author,
      waktu: tanggal,
      link: link,
      content: beritalengkap,
      crawltime: new Date().toJSON(),
      runtime: hit + " s"
    };

    let final = JSON.stringify(data, null, 2);

    fs.writeFile(`./liputan6/liputan6/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = liputan6;
// liputan6('https://www.liputan6.com/news/read/5369818/7-fakta-ganjar-pranowo-lakukan-silaturahmi-temui-istri-gus-dur-dan-yenny-wahid-bahas-apa')