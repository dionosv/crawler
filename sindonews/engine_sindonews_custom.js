const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

const sindonews = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)

    await page.goto(link, { waitUntil: 'networkidle0' });

    await page.waitForSelector('div.detail-title h1');

    const berita = await page.evaluate(() => {
      // ini logic untuk filtering div didalam teks
      const detailDescDiv = document.querySelector('#detail-desc');
  
      const bacanewsBoxDiv = detailDescDiv.querySelector('.bacanews-box');
      if (bacanewsBoxDiv) {
        bacanewsBoxDiv.remove();
      }
      const youtubeDiv = detailDescDiv.querySelector('.v-youtube');
      if (youtubeDiv) {
        youtubeDiv.remove();
      }
      const editorDiv = detailDescDiv.querySelector('.editor');
      if (editorDiv) {
        editorDiv.remove();
      }
      const outlinkDiv = detailDescDiv.querySelector('.box-outlink');
      if (outlinkDiv) {
        outlinkDiv.remove();
      }
      let content = detailDescDiv.textContent.trim();
      content = content.replace(/<br>/g, '');
      return content;
    });
    
    // const filteredtext = berita.join(' ');

    var jdl = await page.evaluate(() => { return document.querySelector('div.detail-title h1')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('div.detail-nama-redaksi a')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('.detail-date-artikel')?.textContent?.trim() || null; });

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
      content: berita,
      crawltime: new Date().toJSON(),
      runtime: hit + " s"
    };

    let final = JSON.stringify(data, null, 2);

    if (titleText.includes(':')) {
      titleText.replace(":", "-");
    }

    fs.writeFile(`./sindonews/sindonews/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = sindonews;