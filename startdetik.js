const { Worker, isMainThread, parentPort } = require('worker_threads');
const detikcom = require('./engine_detik');

const links = [
    'https://news.detik.com/pemilu/d-6859356/uu-pemilu-digugat-syarat-usia-capres-cawapres-dinilai-bukan-urusan-mk',
    'https://news.detik.com/pemilu/d-6859353/said-aqil-kalau-pkb-kalah-berarti-dosa-cak-imin-harus-menang',
    'https://news.detik.com/pemilu/d-6859319/sandiaga-soal-cawapres-pimpinan-mencalonkan-tapi-aspirasi-rakyat-penting',
    'https://news.detik.com/pemilu/d-6859299/survei-spin-477-responden-akan-pilih-gibran-jadi-cawapres-prabowo',
    'https://news.detik.com/pemilu/d-6859228/survei-spin-ini-cawapres-potensial-untuk-prabowo-ganjar-dan-anies',
    'https://news.detik.com/pemilu/d-6859177/psi-masih-komunikasi-dengan-kakak-kakak-senior-pdip-usai-bertemu-prabowo',
    'https://news.detik.com/pemilu/d-6859158/cak-imin-kalau-saya-berhasil-berarti-produk-gus-dur',
    'https://news.detik.com/pemilu/d-6859024/jokowi-lagi-lagi-ingatkan-hati-hati-pilih-pemimpin-ppp-singgung-perubahan',
    'https://news.detik.com/pemilu/d-6859023/anies-bakal-rutin-temui-pendukung-tiap-jumat-di-rumah-relawan',
    'https://news.detik.com/pemilu/d-6858955/gugatan-batas-minimal-usia-capres-cawapres-anies-percaya-putusan-mk',
    'https://news.detik.com/pemilu/d-6858919/ditemani-ahy-anies-bakal-berkunjung-ke-bandung-besok',
    'https://news.detik.com/pemilu/d-6858910/survei-spin-prabowo-417-ganjar-303-anies-21',
    'https://news.detik.com/pemilu/d-6858876/anies-tidak-terkejut-golkar-tak-dukung-dirinya-di-pilpres-2024',
    'https://news.detik.com/pemilu/d-6858847/sudah-2-hari-jokowi-bareng-erick-thohir-rk-sinyal-dukungan-cawapres',
    'https://news.detik.com/pemilu/d-6858683/pdip-buka-suara-soal-effendi-simbolon-disebut-tak-maju-caleg-dpr-lagi',
    'https://news.detik.com/pemilu/d-6858669/tipis-tipis-soal-politik-putri-zulhas-ungkap-obrolan-dengan-raffi-ahmad',
    'https://news.detik.com/pemilu/d-6858659/jubir-anies-sambut-serikat-pekerja-nasional-yang-beralih-dari-ganjar',
    'https://news.detik.com/pemilu/d-6858654/2-mahasiswa-di-solo-gugat-batas-usia-capres-gibran-bilang-begini',
    'https://news.detik.com/pemilu/d-6858643/puan-sambut-positif-prabowo-temui-psi-tepis-pdip-tutup-pintu',
    'https://news.detik.com/pemilu/d-6858579/seru-dan-ngejokes-ini-kata-bintang-emon-hingga-chef-bobon-tentang-prabowo'
];

const numberOfThreads = 20; 

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
