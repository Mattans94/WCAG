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

          //Make a constant called livsmedel that equals to the Livsmedel object in the data
          const {
            Livsmedel: livsmedel
          } = result.LivsmedelDataset.LivsmedelsLista[0];
          console.log('Found', livsmedel.length, 'objects');

          /**
           * Create a promise to handle async stuff.
           * Then we can call the exit method when the promise
           * is resolved, a.k.a in the .then() method
           */
          const livsmedelPromise = new Promise((resolve, reject) => {
            livsmedel.forEach((obj, index, array) => {
              /**Loop through all livsmedel and save to the DB
               * A forEach loop that creates a new Livsmedel on every iteration
               * and then saves it to the database.
               * The three dots (...) is called spread operator. It basically
               * copies all the properties from the obj variable and pastes it in the new object.
               */
              const [{ Naringsvarde: Naringsvarden }] = obj.Naringsvarden;
              const { Namn, Nummer, ViktGram, Huvudgrupp } = obj;
              new Livsmedel({
                Namn,
                Nummer,
                ViktGram,
                Huvudgrupp,
                Naringsvarden
              })
                .save()
                .then(() => {
                  console.log('Saved item', index + 1);
                  if (index === array.length - 1) resolve(); //If end of array, resolve the promise
                })
                .catch(err => console.log(err));
            });
          });

          livsmedelPromise.then(() => {
            console.log('DONE!');
            process.exit();
          });
        });
      });
    });
  });
