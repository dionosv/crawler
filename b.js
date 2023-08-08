const { Worker, isMainThread, parentPort } = require('worker_threads');
const { readFileSync } = require('fs');
const detikcom = require('./engine_detik');

function reader(){
  const data = JSON.parse(readFileSync('./detik/masterlink.json'));
  var data_link = []
  const groupSize = 10;
  const xlinks = [];

  for (let a = 0; a < data.length; a++) {
    for (let b = 0; b < data[a].length; b++) {
      data_link.push(data[a][b])
    }
  }

  for (let i = 0; i < data_link.length; i += groupSize) {
    const linkGroup = data_link.slice(i, i + groupSize);
    xlinks.push(linkGroup);
  }
  return(xlinks[4])
}

async function execute(){
    const links = await reader()
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
      });}
}

execute()