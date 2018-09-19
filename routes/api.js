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

router.post('/recept', (req, res) => {
  // console.log(req.body);
  new Recept({
    title: req.body.title,
    livsmedel: [...req.body.ingrediens],
    instructions: [...req.body.instructions],
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

// Upload image route
router.post('/uploadimage', upload.single('file'), (req, res) => {
  res.json({ success: true });
});

// GET livsmedel
router.get('/livsmedel/:name', (req, res) => {
  const { name } = req.params;

  Livsmedel.find(
    { Namn: { $regex: name, $options: 'i' } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .select('Namn')
    .then(result => {
      res.json(result);
    });
});

// get all the recipes from the database at /api/all-recipes
router.get('/all-recipes', (req, res) => {
  Recept.find()
    .sort('-createdAt')
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
