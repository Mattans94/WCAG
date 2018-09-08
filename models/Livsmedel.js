const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const livsmedelSchema = new Schema({
  Nummer: [String],
  Namn: [String],
  ViktGram: [String],
  Huvudgrupp: [String],
  Naringsvarden: Array
});

module.exports = Livsmedel = mongoose.model('Livsmedel', livsmedelSchema);
