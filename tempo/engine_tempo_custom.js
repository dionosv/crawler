const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

const tempo = async (link) => {
  try {
    var start = performance.now();
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0)
    await page.goto(link , { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1.title.margin-bottom-sm');
    
    const berita = await page.evaluate(() => {
      const detailKontenDiv = document.querySelector('.detail-konten');
      const elementsToRemove = detailKontenDiv.querySelectorAll('.bacajuga, .bggrey, .iklan, .lanjutkan, .parallax-box');
      elementsToRemove.forEach((div) => div.remove());
      const detailKontenContent = detailKontenDiv.textContent.trim();
      return detailKontenContent.replace(/[\n\t]/g, '');
    });   

    var jdl = await page.evaluate(() => { return document.querySelector('h1.title.margin-bottom-sm')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('div.box-avatar.margin-right-sm div.text-avatar p.title.bold a span')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('p.date.margin-bottom-sm')?.textContent?.trim() || null; });

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

    fs.writeFile(`./tempo/tempo/${titleText}.json`, final, (err) => {
      if (err) throw err;
    });
  } catch (err) {
    console.error(`Error processing link: ${link}`);
    console.error(err);
  }
};

module.exports = tempo;
// tempo('https://metro.tempo.co/read/1766345/abaikan-kritik-menkes-heru-budi-tetap-lanjutkan-penyiraman-jalan-untuk-kurangi-polusi-udara?tracking_page_direct')