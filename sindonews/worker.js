const { workerData, parentPort } = require('worker_threads');
const sindonews = require('./engine_sindonews_custom');

const link = workerData.link;
const nomor = workerData.nomor;

(async () => {
  await sindonews(link);
  parentPort.postMessage(`[Thread ${nomor}] Finished processing link: ${link}`);
})();
