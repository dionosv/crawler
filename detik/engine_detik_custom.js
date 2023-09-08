const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

const detikcom = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)

    await page.goto(link + "?single=1", { waitUntil: 'networkidle0' });

    await page.waitForSelector('.detail__body-text.itp_bodycontent');

    const berita = await page.evaluate(() => {
      const divSelector = 'div.detail__body-text.itp_bodycontent'; 
      document.querySelectorAll(`${divSelector} table.linksisip, ${divSelector} div.paradetail, ${divSelector} strong, ${divSelector} em`)
        .forEach((div) => {
          div.remove();
        });
    
      const pp = document.querySelectorAll(`${divSelector} p`);
      const paragraphTexts = [];
    
      pp.forEach((p) => { 
        const strongElements = p.querySelectorAll('strong');
        const emElements = p.querySelectorAll('em');
        const textContent = p.textContent.trim();
        
        if (strongElements.length === 0 && emElements.length === 0 && textContent !== '') {
          paragraphTexts.push(textContent);
        }
      });
    
      return paragraphTexts.join(' '); 
    });
    
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
      content: berita,
      crawltime: new Date().toJSON(),
      runtime: hit + " s"
    };

    let final = JSON.stringify(data, null, 2);

    if (titleText.includes(':')) {
      titleText.replace(":", "-");
    }

    fs.writeFile(`./detik/detik/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });

  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = detikcom;
// detikcom('https://news.detik.com/internasional/d-6919675/ancaman-10-tahun-bui-ke-putra-biden-buntut-langgar-aturan-senpi')