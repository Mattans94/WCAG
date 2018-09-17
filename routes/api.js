const express = require('express');
const router = express.Router();
const Recept = require('../models/Recept');
const Livsmedel = require('../models/Livsmedel');

router.post('/recept', (req, res) => {
  const recipe = new Recept({
    imgPath: req.body.imgPath,
    title: req.body.title,
    livsmedel: req.body.livsmedel,
    instructions: req.body.instructions,
    categories: req.body.categories,
    persons: req.body.persons
  })
    .save()
    .then(recipe => {
      res.json(recipe);
    })
    .catch(err => console(err));
});

// GET livsmedel
router.get('/livsmedel/:name', (req, res) => {
  const { name } = req.params;

  Livsmedel.find({ Namn: { $regex: name, $options: 'i' } })
    .select('Namn')
    .limit(20)
    .then(result => res.json(result));
});

// Recept.findById(recipe.id).populate('livsmedel.livsmedelId')
//   .then(result => res.json(result));

// 5b95065f231998101e1df6dd 5b95065f231998101e1df245

module.exports = router;

// imgPath: req.body.persons,
// title: req.body.persons,
// livsmedel: [
//   {
//     id: {
//       type: Schema.Type.ObjectId,
//       ref: 'Livsmedel'
//     },
//     quantity: Number
//   }
// ],
// instructions: [String],
// categories: [String],
// persons: Number

// const json = {
//   imgPath: '',
//   title: 'Nisse Spagetti',
//   livsmedel: [
//     {
//       id: 127382197389,
//       quantity: 3
//     },
//     {
//       id: 23213123213,
//       quantity: 2
//     }
//   ],
//   instructions: ['Koka ägg', 'Stek bacon'],
//   categories: req.body.categories,
//   persons: req.body.persons
// }
