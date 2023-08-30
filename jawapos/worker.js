const { workerData, parentPort } = require('worker_threads'); 
const jawapos = require('./engine_jawapos_custom')

const link = workerData.link;
const nomor = workerData.nomor;

(async () => {
  await jawapos(link);
  parentPort.postMessage(`[Thread ${nomor}] Finished processing link: ${link}`);
})();
