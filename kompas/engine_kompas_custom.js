const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');
const blacklistedWord = ['ADVERTISEMENT', 'SCROLL TO RESUME CONTENT', 'Saksikan Live DetikPagi:','',
'Megapolitan',
'Megapolitan',
'Data dan fakta',
'Global',
'Internasional',
'Global',
'Megapolitan',
'Megapolitan',
'Megapolitan',
'Internasional',
'Hoaks atau fakta',
'Nasional',
'Megapolitan',
'Global','Money','Whats new','Regional Tren News',
'Tulis komentarmu dengan tagar #JernihBerkomentar dan menangkan  untuk  pemenang!',
'Dapatkan informasi dan insight pilihan redaksi Kompas.com'];

const kompascom = async (link) => {
      var start = performance.now();
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0)
      await page.goto(link+"?page=all#page2", { waitUntil: 'networkidle0' });
      await page.waitForSelector('.clearfix');
      const berita = await page.evaluate(() => { 
      const paragraphs = document.querySelectorAll(`.clearfix p`);
    
      return Array.from(paragraphs).map((p) => {
        p.querySelectorAll('strong').forEach((strong) => {
          strong.textContent = '';
        });
        return p.textContent.trim();
      });
    });
       
    const filteredtext = berita.filter(word => !blacklistedWord.includes(word)).join(' ');
 
    var jdl = await page.evaluate(() => { return document.querySelector('.read__title')?.textContent?.trim() || null; });
    const author = await page.evaluate(() => { return document.querySelector('#penulis > a')?.textContent?.trim() || null; });
    const tanggal = await page.evaluate(() => { return document.querySelector('.read__time')?.textContent?.trim() || null; });

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
      titleText.replace(":", " -");
    }

    if (titleText.includes('"')) {
      titleText.replace('"', " ");
    }

    fs.writeFile(`./kompas/kompas/${titleText}.json`, final, (err) => {
      if (err) throw err;
      // console.log('Done');
    });

};

module.exports = kompascom;