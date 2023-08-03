const { Worker, isMainThread, parentPort } = require('worker_threads');
const kompascom = require('./engine_kompas');

const links = [
  ,"https://money.kompas.com/read/2023/08/03/123654226/jokowi-minta-masyarakat-maklum-soal-jembatan-lrt-yang-salah-desain?page=all#page2"
  ,"https://nasional.kompas.com/read/2023/08/03/12590281/ferdinand-hutahaean-mengaku-gantikan-effendi-simbolon-jadi-bacaleg-pdi-p"
  ,"https://nasional.kompas.com/read/2023/08/02/23221211/didatangi-prabowo-psi-kalau-partai-lain-kita-yang-diminta-ke-sana-kalau"
  ,"https://nasional.kompas.com/read/2023/08/03/05405481/tni-ungkap-maksud-para-pati-sambangi-gedung-kpk-usai-penetapan-tersangka"
  ,"https://nasional.kompas.com/read/2023/08/02/16230941/alasan-bareskrim-tahan-panji-gumilang-tidak-kooperatif-dan-dikhawatirkan"
  ,"https://nasional.kompas.com/read/2023/08/03/06150001/janji-pemerintah-selamatkan-ponpes-al-zaytun-usai-panji-gumilang-jadi"
];

const numberOfThreads = 8; 

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
      await kompascom(link);
      parentPort.postMessage(`Finished processing link: ${link}`);
    } catch (error) {
      parentPort.postMessage(`Error processing link: ${link}`);
      console.error(`Error processing link: ${link}`);
      console.error(error);
    }
  });
}
