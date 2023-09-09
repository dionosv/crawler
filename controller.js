const rundetik = require('./detik/start')
const runkompas = require('./kompas/start')
const runjawapos = require('./jawapos/start')
const runliputan6 = require('./liputan6/start')
const runsindonews = require('./sindonews/start')
const runtempo = require('./tempo/start')

const fs = require('fs-extra')

const reset = (dir="detik") => {
    fs.emptyDir(`./${dir}/${dir}`).then(() => {
        console.log(`${dir} reset success`);
    })
    .catch((err) => {
      console.error(`Error: ${err.message}`);
    });
}

const resetall = ()=>{
    item = ["detik","kompas","liputan6","jawapos","sindonews","tempo"]
    item.forEach(x => {
        reset(x)
    });
}

const run = async (option = 1, value = 1, tabopened =5) =>{
    switch (option) {
        case 1:{
            // reset('detik')
            rundetik(value,tabopened)
            break
        }

        case 2:{
            // reset('kompas')
            runkompas(value,tabopened)
            break
        }

        case 3:{
            // reset('jawapos')
            runjawapos(value,tabopened)
            break
        }

        case 4:{
            // reset('tempo')
            runtempo(value,tabopened)
            break
        }

        case 5:{
            // reset('sindonews')
            runsindonews(value,tabopened)
            break
        }

        case 6:{
            // reset('liputan6')
            runliputan6(value,tabopened)
            break
        }
    
        default:
            break;
    }

}

module.exports = {run,reset,resetall}
// run(1,1,5)
// resetall()
