const { Worker, isMainThread, parentPort } = require('worker_threads');
const kompascom = require('./engine_kompas');

const links = [
  ,"https://medan.kompas.com/read/2023/08/07/081937778/saat-mayor-dedi-dan-anggotanya-geruduk-dan-berdebat-panas-di-mapolrestabes"
  ,"https://www.kompas.com/tren/read/2023/08/07/110000165/buntut-1.921-peserta-mengundurkan-diri-bkn-beri-informasi-gaji-pada"
  ,"https://www.kompas.com/tren/read/2023/08/07/090000465/4-perubahan-ujian-praktik-sim-c-terbaru-berlaku-mulai-hari-ini"
  ,"https://regional.kompas.com/read/2023/08/07/105837578/tki-ilegal-di-malaysia-dan-arab-saudi-banyak-yang-tidak-digaji"
  ,"https://www.kompas.com/tren/read/2023/08/07/110000165/buntut-1.921-peserta-mengundurkan-diri-bkn-beri-informasi-gaji-pada"
  ,"https://regional.kompas.com/read/2023/08/07/101918678/guru-smk-yang-celupkan-tangan-siswa-ke-air-panas-mengaku-salah-sebut-untuk"
  ,"https://regional.kompas.com/read/2023/08/07/113254278/pemkab-manggarai-barat-buat-aturan-warga-yang-memotong-bambu-wajib-menanam"
  ,"https://tekno.kompas.com/read/2023/08/07/11350437/unboxing-oppo-reno-10-pro-plus-5g-ada-charger-100-watt"
  ,"https://www.kompas.com/edu/read/2023/08/07/113211371/4-ptn-masih-buka-jurusan-kedokteran-hingga-minggu-kedua-agustus"
  ,"https://www.kompas.com/hype/read/2023/08/07/112604566/kuasa-hukum-ferry-irawan-berat-beri-nafkah-rp-30-juta-setelah-cerai-dari"
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
