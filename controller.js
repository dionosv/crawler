const rundetik = require('./detik/start')
const runkompas = require('./kompas/start')
const runjawapos = require('./jawapos/start')
const runliputan6 = require('./liputan6/start')
const runsindonews = require('./sindonews/start')
const runtempo = require('./tempo/start')
const fs = require('fs-extra')

function reset() {
    fs.emptyDir("./detik/detik").then(() => {
        console.log(`ok`);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
    });
}
