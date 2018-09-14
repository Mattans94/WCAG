const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const receptSchema = new Schema({
  imgPath: String,
  title: String,
  livsmedel: {
    type: [Schema.Types.ObjectId],
    ref: 'Livsmedel',
    quantity: Number
  },
  instructions: [String],
  categories: [String],
  persons: Number
});

module.exports = Recept = mongoose.model('Recept', receptSchema);