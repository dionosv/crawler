const { Worker, isMainThread } = require('worker_threads');
const puppeteer = require('puppeteer');
const { link } = require('fs');


function executeMultiThreaded(links, numThreads) {
  return new Promise((resolve) => {
    if (isMainThread) {
      const numWorkers = Math.min(links.length, numThreads);
      let workersFinished = 0;

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker('./worker.js', { workerData: { link: links[i], nomor: i + 1 } });

        worker.on('message', (message) => {
          console.log(message);
          workersFinished++;

          if (workersFinished === numWorkers) {
            resolve();
          }
        });

        worker.on('error', (error) => {
          console.error('Worker error:', error);
          workersFinished++;

          if (workersFinished === numWorkers) {
            resolve();
          }
        });
      }
    }
  });
}
async function crawl(maksimal = 10) {
  if(maksimal>88) maksimal = 88
  try {
    var baselink = "https://www.liputan6.com/news/politik";
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    const mobileDevice = puppeteer.devices['iPhone 13 Pro Max'];
    await page.emulate(mobileDevice);
    await page.goto(baselink, { waitUntil: 'networkidle0' });

    const berita = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a.article-snippet__title-link')).map(element => element.href);
      return links;
    });
    await browser.close()
    return berita.slice(0,maksimal)

  } catch (error) {
    console.log('Crawler error : ' + error);
    return [];
  }
}

function splitArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function runall(berapalink = 1, berapatabsize = 5) {
  var hitstart = performance.now(); 
  console.log(`\n${berapalink} links pending`)
  const links = await splitArray(await crawl(berapalink), berapatabsize)
  for (let dion = 0; dion < links.length; dion++) {
      console.log(`\nExecuting task ${dion+1} of ${links.length}`)
      await executeMultiThreaded(links[dion], berapatabsize);
      console.log(`Done`)
  }
  const waktuDetik = (performance.now() - hitstart) / 1000;
  const waktuMenit = Math.floor(waktuDetik / 60);
  const detikSisa = (waktuDetik % 60).toFixed(1);
  console.log(`${berapaindex} task done in ${waktuMenit} m ${detikSisa} s`);
}

// khusus buat liputan6 ada 2 parameter yaitu jumlah links (maksimal 88 aja) sama jumlah tab yang akan dibuka
runall(5,5)
//note ini tinggal masukin angka di runall(disini), angka tsb per berapa indeks yg mau di scraping, 1 indeks ada 20 link, jadi nanti jalan berapa kali indeks