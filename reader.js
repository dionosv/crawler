const { log } = require('console');
const { readFileSync } = require('fs');
const data = JSON.parse(readFileSync('./detik/masterlink.json'));
var data_link = []
// console.log(data.length);
let total = 0
for (let a = 0; a < data.length; a++) {
  total += data[a].length
  let start=0, count = 5
  while(start < data[a].length) {
    // console.log(data[a][start]);
    data_link.push(data[a][start])
    start++
    // let arrLink = data[a].slice(start,count)
    // // console.log(arrLink);
    // // console.log(start,count,arrLink);
    // // data_link.push(data[a].slice(start, count))
    // data_link.push(arrLink)
    // // console.log(data_link);
    // // console.log(data[a].slice(start, count));
    // start += 5
    // count += 5
  }
  // for (let b = 0; b < data[a].length; b++) {
  //     data_link.push(data[a][b]) 
  // }
  // console.log(data[a].length);
  // console.log(data[0].slice(0, 5))
  // console.log(data[0].slice(5, 10))
}
// console.log(total)
console.log(data_link.length)
console.log(data_link)