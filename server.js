const express = require('express');
const app = express();
const port = 1407;
const {run,reset,resetall} = require('./controller.js')
const bodyparser = require('body-parser')
const cron = require('node-cron');

var work = false 
var statuskerjaan = null

app.use(bodyparser.json())

app.get('/',(req,res) => {
    res.send(res.statusCodes)
})

app.get('/rst', (req, res) => {
    res.send('ok');
    console.log("reset")
    resetall()
});

app.get('/list', (req, res) => {
    res.send('1 : detikcom\n2 : kompascom\n3 : jawapos\n4 : tempo\n5 : sindonews\n6 : liputan6');
});

// app.post('/run', (req, res) => {

//     async () => {
//         if(work == false){
//             work = true
//             res.send("Ok");
//             console.log(`Task :\n${req.ip}\n[Service : ${req.body.service}]\n[Ammount : ${req.body.ammount}]\n[Tab : ${req.body.tab}]`)
//             statuskerjaan = run(req.body.service,req.body.ammount,req.body.tab)
//             await statuskerjaan
//             work = false
//         }
//         else {
//             res.send({
//                 status : "Work already in progress"
//             })
//             console.log("Work already in progress")
//         }
//     }
    
// });

async function execute(service, ammount, tab) {
    return new Promise((resolve, reject) => {
        console.log(`Running task: [Service: ${service}] [Amount: ${ammount}] [Tab: ${tab}]`);
        run(service,ammount, tab)
        resolve();
    });
  }
  
  app.post('/run', async (req, res) => {
    if (!work) {
      work = true;
  
      try {
        statuskerjaan = execute(req.body.service, req.body.ammount, req.body.tab);
        await statuskerjaan;
        work = false;
  
        res.send("Work completed.");
        console.log("Work completed.");
      } catch (error) {
        work = false;
        res.status(500).send("Internal Server Error");
        console.error("Error in run:", error);
      }
    } else {
      res.send("Work already in progress.");
      console.log("Work already in progress.");
    }
  });

    //ini masih belum bisa nge stop running task nya.
    app.post('/stop', async (req, res) => {
        if (work && statuskerjaan) {
        try {
            statuskerjaan.cancel(); 
            work = false;
            res.send("Work stopped.");
            console.log("Work stopped.");
        } catch (error) {
            res.status(500).send("Error stopping work.");
            console.error("Error stopping work:", error);
        }
        } else {
        res.send("No work in progress.");
        console.log("No work in progress.");
        }
    });

    async function taskscheduler() {
        // eksekusi setiap 1 menit
        cron.schedule('*/5 * * * *', () => {
            run(1,1,5)
        });
    }

    

    app.get('/q',(req,res) => {
        console.log({urlparam : req.query})
        res.send(req.query)
    })


// Start the server
app.listen(port,'0.0.0.0' ,() => {
    console.log(`Server is running on port ${port}`);
    taskscheduler()
});
