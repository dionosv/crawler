const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

const jawapos = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(link, { waitUntil: 'networkidle0' });

    // await page.waitForSelector('article.read__content.clearfix');

    const berita = await page.evaluate(() => {
      const pp = document.querySelectorAll(`article.read__content.clearfix p`);
      const paragraphTexts = Array.from(pp).map((p) => p.textContent.trim());
      return paragraphTexts;
    });

    const beritalengkap = berita.join(' ');

    var jdl = await page.evaluate(() => { return document.querySelector('h1.read__title')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('div.read__info__author a')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('div.read__info__date')?.textContent?.trim() || null; });

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

    fs.writeFile(`./jawapos/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = jawapos;
// jawapos('https://www.jawapos.com/politik/012895364/bazaar-dan-pasar-murah-pia-ramaikan-hut-ke-78-dpr-ri')