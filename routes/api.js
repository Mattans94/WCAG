const express = require('express');
const router = express.Router();
const Recept = require('../models/Recept');
const Livsmedel = require('../models/Livsmedel');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'wcag',
  api_key: '885273841422454',
  api_secret: 'Sim82eWqLnFK1RR4pFz4vr_4Hkc'
});

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'test',
  allowedFormats: ['jpg', 'png'],
  filename: function(req, file, cb) {
    cb(undefined, req.body.id);
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
      res.json(recipe);
    });
});

// Upload image route
router.post('/uploadimage', upload.single('file'), (req, res) => {
  console.log(req.file);
  Recept.findByIdAndUpdate(
    req.body.id,
    {
      imgPath: req.file.url
    },
    { new: true }
  ).then(doc => {
    res.json(doc);
  });
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
