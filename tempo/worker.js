const { workerData, parentPort } = require('worker_threads');
const tempo = require('./engine_tempo_custom');

const link = workerData.link;
const nomor = workerData.nomor;

(async () => {
  await tempo(link);
  parentPort.postMessage(`[Thread ${nomor}] Finished processing link: ${link}`);
})();
