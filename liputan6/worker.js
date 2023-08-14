const { workerData, parentPort } = require('worker_threads'); 
const liputan6 = require('./engine_liputan6_custom')

const link = workerData.link;
const nomor = workerData.nomor;

(async () => {
  await liputan6(link);
  parentPort.postMessage(`[Thread ${nomor}] Finished processing link: ${link}`);
})();
