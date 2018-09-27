const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const receptSchema = new Schema({
  imgPath: String,
  title: String,
  description: String,
  livsmedel: [
    {
      livsmedelId: {
        type: Schema.Types.ObjectId,
        ref: 'Livsmedel'
      },
      volume: Number,
      unit: String,
      inGram: Number
    }
  ],
  instructions: [String],
  categories: [String],
  portions: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = Recept = mongoose.model('Recept', receptSchema);
