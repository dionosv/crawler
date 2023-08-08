const { Worker, isMainThread, parentPort } = require('worker_threads');
const { readFileSync } = require('fs');
const detikcom = require('./engine_detik');
const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs');

async function execute(links, xnumberOfThreads = 10){
  const numberOfThreads = xnumberOfThreads; 
  if (isMainThread) {
    const numWorkers = Math.min(links.length, numberOfThreads);
    let workersCreated = 0;
    let workersFinished = 0;
    let startTime = process.hrtime();
    console.log(links.length+" links processed")

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__filename);
      workersCreated++;

      worker.on('message', (message) => {
        console.log(message);
        workersFinished++;

        if (workersFinished === numWorkers) {
          const endTime = process.hrtime(startTime);
          const elapsedSeconds = endTime[0] + endTime[1] / 1e9;
          console.log(`All workers finished in ${elapsedSeconds.toFixed(2)} seconds.`);
          process.exit(0);
        }
      });

      worker.on('error', (error) => {
        console.error('Worker error:', error);
        workersFinished++;

        if (workersFinished === numWorkers) {
          const endTime = process.hrtime(startTime);
          const elapsedSeconds = endTime[0] + endTime[1] / 1e9;
          console.log(`All workers finished in ${elapsedSeconds.toFixed(2)} seconds.`);
          process.exit(1);
        }
      });

      worker.postMessage(links[i]);
    }
  } else {  

    parentPort.on('message', async (link) => {
      try {
        await detikcom(link);
        parentPort.postMessage(`Finished processing link: ${link}`);
      } catch (error) {
        parentPort.postMessage(`Error processing link: ${link}`);
        console.error(`Error processing link: ${link}`);
        console.error(error);
      }
    });
  }
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


async function start(number = 1) {
    var start = performance.now();  
  const promises = [];

  for (let i = 1; i <= number; i++) {
    promises.push(crawl(i))
  }
  const results = await Promise.all(promises);
  // const out_json = JSON.stringify(results)
  // fs.writeFile('./detik/masterlink.json', out_json, (err) => {
  //   if (err) throw err;
  // });
  console.log('Get link done in '+((performance.now() - start) / 1000).toFixed(2)+' s')
  return results
}

(async()=>{
  const infolink = await start(1)
  await execute(infolink[0],infolink[0].length)
})()
