const { Worker, isMainThread } = require('worker_threads');
const puppeteer = require('puppeteer');


function executeMultiThreaded(links, numThreads) {
  return new Promise((resolve) => {
    if (isMainThread) {
      const numWorkers = Math.min(links.length, numThreads);
      let workersFinished = 0;

      for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker('./detik/worker.js', { workerData: { link: links[i], nomor: i + 1 } });

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
async function crawl(loop = 1) {
  try {
    var baselink = "https://news.detik.com/pemilu/indeks/" + loop;
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto(baselink, { waitUntil: 'networkidle0' });

    const berita = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('h3.media__title a.media__link')).map(element => element.href);
      return links;
    });
    await browser.close();
    return berita

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

const rundetik = async (berapaindex = 1, berapatabsize = 5 , mode = false) => {
  var hitstart = performance.now(); 
  console.log(`\n${berapaindex} task pending`)
  for (let i = 0; i < berapaindex; i++) {
    console.log(`Doing task ${i+1} of ${berapaindex}\n`)
    const links = await splitArray(await crawl(i+1, mode), berapatabsize)
    for (let index = 0; index < links.length; index++) {
      console.log(`Proccessing MultiThread ${index+1} of ${links.length} (${berapatabsize} Single Thread)`)
      const numThreads=links[index].length
      await executeMultiThreaded(links[index], numThreads, index+1, mode);
      console.log(`Done\n\n`)
    }
    console.log(`Finished task ${i+1} of ${berapaindex}\n\n`)
  }

  const waktuDetik = (performance.now() - hitstart) / 1000;
  const waktuMenit = Math.floor(waktuDetik / 60);
  const detikSisa = (waktuDetik % 60).toFixed(1);
  console.log(`${berapaindex} task done in ${waktuMenit} m ${detikSisa} s`);

}

module.exports = rundetik;

//note ini tinggal masukin angka di rundetik(disini), angka tsb per berapa indeks yg mau di scraping, 1 indeks ada 20 link, jadi nanti jalan berapa kali indeks