const express = require('express');
const router = express.Router();
const Recept = require('../models/Recept');
const Livsmedel = require('../models/Livsmedel');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.id + '.jpg');
  }
});

const upload = multer({ storage: storage });

// const createRecipe = (req, res, next) => {
//   console.log(req.body);
//   const recipe = new Recept({
//     title: req.body.title,
//     livsmedel: req.body.livsmedel,
//     instructions: req.body.instructions,
//     categories: req.body.categories,
//     persons: req.body.persons
//   })
//     .save()
//     .then(recipe => {
//       req.recipe = recipe;
//       next();
//     })
//     .catch(err => console.log(err));
// };

router.post('/recept', (req, res) => {
  console.log(req.body.livsmedel);
  const recipe = new Recept({
    title: req.body.title,
    livsmedel: [...req.body.livsmedel],
    instructions: req.body.instructions,
    categories: req.body.categories,
    persons: req.body.persons
  })
    .save()
    .then(recipe => {
      Recept.findByIdAndUpdate(
        recipe.id,
        {
          imgPath: `/uploads/${recipe.id}.jpg`
        },
        { new: true }
      ).then(doc => {
        res.json(doc);
      });
    });
});

router.post('/uploadimg', upload.single('file'), (req, res) => {
  res.json({ success: true });
});

router.post('/multer', (req, res) => {
  res.send('Saved!');
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
