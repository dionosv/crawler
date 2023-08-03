const { Worker, isMainThread, parentPort } = require('worker_threads');
const detikcom = require('./detik');

const links = [
    "https://news.detik.com/pemilu/d-6856302/psi-kini-mesra-dengan-prabowo-bagaimana-nasib-baliho-dukung-ganjar",
    "https://news.detik.com/pemilu/d-6856276/psi-bertemu-prabowo-ppp-tanya-pdip-apa-selama-ini-nggak-komunikasi",
    "https://news.detik.com/pemilu/d-6856111/pkb-belum-ada-ruang-kompromi-selain-cak-imin-cawapres",
    "https://news.detik.com/pemilu/d-6856093/wasekjen-pkb-belum-ada-wanprestasi-prabowo-sejak-awal-berkoalisi",
    "https://www.detik.com/jatim/berita/d-6855135/khofifah-dinilai-masih-bisa-jadi-cawapres-meski-beri-sinyal-maju-pilgub-jatim",
    "https://www.detik.com/jatim/berita/d-6853717/nasdem-sarankan-anies-rebut-jateng-dan-jatim-jika-mau-jadi-presiden",
    "https://news.detik.com/pemilu/d-6856022/deddy-sitorus-jokowi-pusing-gibran-jadi-kandidat-cawapres"
];

const numberOfThreads = 8; 

if (isMainThread) {
  const numWorkers = Math.min(links.length, numberOfThreads);
  let workersCreated = 0;
  let workersFinished = 0;
  let startTime = process.hrtime();

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
