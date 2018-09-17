const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const livsmedelSchema = new Schema({
  Nummer: Number,
  Namn: String,
  ViktGram: String,
  Huvudgrupp: String,
  Naringsvarden: [
    {
      Namn: String,
      Forkortning: String,
      Varde: String,
      Enhet: String,
      SenastAndrad: Date
    }
  ]
});

module.exports = Livsmedel = mongoose.model('Livsmedel', livsmedelSchema);
