const parseString = require('xml2js').parseString;
const mongoose = require('mongoose');
const Livsmedel = require('./models/Livsmedel');
const http = require('http');

function getCurrentDate() {
  const currentDate = new Date();
  let dd = currentDate.getDate();
  let mm = currentDate.getMonth() + 1;
  let yyyy = currentDate.getFullYear();
  dd < 10 ? (dd = '0' + dd) : dd;
  mm < 10 ? (mm = '0' + mm) : mm;
  return yyyy + mm + dd;
}

mongoose
  .connect(
    'mongodb://admin:admin123@ds151049.mlab.com:51049/wcag',
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('DB Connected!');
    Livsmedel.remove({}, () => {
      console.log('Removed all documents');

      /**
       * Fetch the file from Livsmedelsverket's API.
       * The URL will always contain today's date to get the newest possible
       * data from the API.
       */
      http.get(
        `http://www7.slv.se/apilivsmedel/LivsmedelService.svc/Livsmedel/Naringsvarde/${getCurrentDate()}`,
        res => {
          let xml = ''; // The XML fetched from the API will get appended here.

          res.on('data', chunk => (xml += chunk)); // This will append data to the xml variable.

          res.on('error', error => console.log(error)); // Error handler

          /**
           * The end of the request to the API.
           * It is at this event we want to parse the XML to JSON.
           */
          res.on('end', () => {
            console.log('Fetched data from date', getCurrentDate());

            // Parse the XML to JSON format.
            parseString(xml, (err, result) => {
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
                  /**
                   * Loop through all livsmedel and save to the DB
                   * A forEach loop that creates a new Livsmedel on every iteration
                   * and then saves it to the database.
                   */
                  const [{ Naringsvarde: Naringsvarden }] = obj.Naringsvarden;
                  const { Namn, Nummer, ViktGram, Huvudgrupp } = obj;
                  new Livsmedel({
                    Namn,
                    Nummer: parseInt(Nummer),
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

              // Call the promise and let the magic begin...
              livsmedelPromise.then(() => {
                console.log('DONE!');
                process.exit();
              });
            });
          });
        }
      );
    });
  });
