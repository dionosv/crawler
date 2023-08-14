const { workerData, parentPort } = require('worker_threads');
const detikcom = require('./engine_detik_custom');

const link = workerData.link;
const nomor = workerData.nomor;

(async () => {
  await detikcom(link);
  parentPort.postMessage(`[Thread ${nomor}] Finished processing link: ${link}`);
})();
