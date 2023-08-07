const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');

async function crawl(loop = 1){
    try {
        // var start = performance.now();
        var baselink = "https://news.detik.com/pemilu/indeks/"+loop
        const browser = await puppeteer.launch({ headless: 'new'});
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(0)

        await page.goto( baselink, { waitUntil: 'networkidle0' });

        const berita = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('h3.media__title a.media__link')).map(element => element.href)
            return links
        });
        await browser.close();
        // return berita
        console.log(berita)
    } catch (error) {
        console.log('Crawler error : '+error)
    }
}

for (let index = 1; index <= 5; index++) {
    crawl(index)
}
