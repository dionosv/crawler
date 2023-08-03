const { Worker, isMainThread, parentPort } = require('worker_threads');
const detikcom = require('./engine_detik');

const links = [
  "https://news.detik.com/berita/d-6856608/polisi-jenguk-sultan-korban-kabel-menjuntai-tawari-perawatan-di-rs-polri",
  "https://news.detik.com/berita/d-6856614/menag-hingga-ridwan-kamil-merapat-ke-kantor-mahfud-bahas-ponpes-al-zaytun",
  "https://news.detik.com/berita/d-6856330/guruh-soekarnoputra-soal-sengketa-rumah-awalnya-hanya-pinjam-meminjam-uang",
  "https://news.detik.com/berita/d-6856428/eks-bupati-ricky-juga-didakwa-tppu-mengalir-ke-brigita-manohara-rp-380-juta",
  "https://news.detik.com/berita/d-6856541/4-polisi-langkat-disekap-dianiaya-saat-hendak-bekuk-pembunuh-ketua-pac-ipk",
  "https://finance.detik.com/infrastruktur/d-6856595/menhub-ungkap-operasi-lrt-jabodebek-bisa-mundur-ke-30-agustus",
  "https://finance.detik.com/berita-ekonomi-bisnis/d-6856399/modus-penipuan-makin-marak-bos-ojk-pun-jadi-sasaran",
  "https://hot.detik.com/celeb/d-6856481/detik-menegangkan-rendy-kjaernett-gendong-lady-nayoan-dari-mobil-penuh-asap"
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
      await detikcom(link);
      parentPort.postMessage(`Finished processing link: ${link}`);
    } catch (error) {
      parentPort.postMessage(`Error processing link: ${link}`);
      console.error(`Error processing link: ${link}`);
      console.error(error);
    }
  });
}
