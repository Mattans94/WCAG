const fs = require('fs');
const parseString = require('xml2js').parseString;
const mongoose = require('mongoose');
const Livsmedel = require('./models/Livsmedel');

mongoose
  .connect(
    'mongodb://admin:admin123@ds151049.mlab.com:51049/wcag',
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('DB Connected!');
    Livsmedel.remove({}, () => {
      console.log('Removed all documents');
      fs.readFile(__dirname + '/data.xml', (err, data) => {
        parseString(data, (err, result) => {
          if (err) console.log(err);
          const {
            Livsmedel: livsmedel
          } = result.LivsmedelDataset.LivsmedelsLista[0];
          console.log(livsmedel.length);

          let livsmedelLoop = new Promise((resolve, reject) => {
            livsmedel.forEach((obj, index, array) => {
              // Loop through all livsmedel and save to the DB
              const { Nummer, Namn, ViktGram, Huvudgrupp, Naringsvarden } = obj;
              new Livsmedel({
                ...obj
              })
                .save()
                .then(() => {
                  console.log('SAVED', index);
                  if (index === array.length - 1) resolve();
                })
                .catch(err => console.log(err));
            });
          });

          livsmedelLoop.then(() => {
            console.log('DONE!');
            process.exit();
          });
        });
      });
    });
  });

// fs.writeFile(__dirname + '/data.json', jsonData, 'utf8', err => {
//   if (err) console.log(err);
//   console.log('Saved');
//   process.exit();
// });
