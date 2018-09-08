const fs = require('fs');
const parseString = require('xml2js').parseString;

fs.readFile(__dirname + '/data.xml', (err, data) => {
  parseString(data, (err, result) => {
    if (err) console.log(err);
    const { Livsmedel } = result.LivsmedelDataset.LivsmedelsLista[0];
    let jsonData = JSON.stringify(Livsmedel, null, 4);
    // console.log(typeof result);
    fs.writeFile(__dirname + '/data.json', jsonData, 'utf8', err => {
      if (err) console.log(err);
      console.log('Saved');
      process.exit();
    });
  });
});
