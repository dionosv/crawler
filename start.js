const { Worker, isMainThread, parentPort } = require('worker_threads');
const { readFileSync } = require('fs');
const detikcom = require('./engine_detik');

// const alllinks = [
//     'https://news.detik.com/pemilu/d-6859356/uu-pemilu-digugat-syarat-usia-capres-cawapres-dinilai-bukan-urusan-mk',
//     'https://news.detik.com/pemilu/d-6859353/said-aqil-kalau-pkb-kalah-berarti-dosa-cak-imin-harus-menang',
//     'https://news.detik.com/pemilu/d-6859319/sandiaga-soal-cawapres-pimpinan-mencalonkan-tapi-aspirasi-rakyat-penting',
//     'https://news.detik.com/pemilu/d-6859299/survei-spin-477-responden-akan-pilih-gibran-jadi-cawapres-prabowo',
//     'https://news.detik.com/pemilu/d-6859228/survei-spin-ini-cawapres-potensial-untuk-prabowo-ganjar-dan-anies',
// ];

async function reader(xnumberOfThreads = 10){
  const data = JSON.parse(readFileSync('./detik/masterlink.json'));
  var data_link = []
  const groupedLinks = [];
  const groupSize = xnumberOfThreads;

  for (let a = 0; a < data.length; a++) {
    for (let b = 0; b < data[a].length; b++) {
      data_link.push(data[a][b])
    }
  }

  for (let i = 0; i < data_link.length; i += groupSize) {
    const linkGroup = data_link.slice(i, i + groupSize);
    groupedLinks.push(linkGroup);
  }
  return groupedLinks
}

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


async function start() {
    const page = 10
    const alllinks = await reader(page)
    for (let index = 0; index < alllinks.length; index++) {
        await execute(alllinks[index],page)
        console.log(index+1)
    }
    console.log("Done !")
}

start()