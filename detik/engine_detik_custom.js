const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');
const blacklistedWord = ['ADVERTISEMENT', 'SCROLL TO RESUME CONTENT', 'Saksikan Live DetikPagi:'];

const detikcom = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)

    await page.goto(link + "?single=1", { waitUntil: 'networkidle0' });

    await page.waitForSelector('.detail__body-text.itp_bodycontent');

    const berita = await page.evaluate(() => {
      const divSelector = '.detail__body-text.itp_bodycontent';
      const pp = document.querySelectorAll(`${divSelector} p`);
      const paragraphTexts = Array.from(pp).map((p) => p.textContent.trim());
      return paragraphTexts;
    });

    const filteredtext = berita.filter(word => !blacklistedWord.includes(word)).join(' ');

    var jdl = await page.evaluate(() => { return document.querySelector('.detail__title')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('.detail__author')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('.detail__date')?.textContent?.trim() || null; });

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
      content: filteredtext,
      crawltime: new Date().toJSON(),
      runtime: hit + " s"
    };

    let final = JSON.stringify(data, null, 2);

    if (titleText.includes(':')) {
      titleText.replace(":", "-");
    }

    fs.writeFile(`./detik/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = detikcom;