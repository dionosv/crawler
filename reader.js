const { readFileSync } = require('fs');


function reader(){
  const data = JSON.parse(readFileSync('./detik/masterlink.json'));
  var data_link = []
  const groupedLinks = [];
  const groupSize = 10;

  for (let a = 0; a < data.length; a++) {
    for (let b = 0; b < data[a].length; b++) {
      data_link.push(data[a][b])
    }
  }

  for (let i = 0; i < data_link.length; i += groupSize) {
    const linkGroup = data_link.slice(i, i + groupSize);
    groupedLinks.push(linkGroup);
  }
  return(groupedLinks)
}

for (let index = 0; index < array.length; index++) {
  const element = array[index];
  
}

console.log(reader())