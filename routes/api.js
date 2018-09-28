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
  folder: 'recipes',
  allowedFormats: ['jpg', 'png', 'gif'],
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
    portions: req.body.portions,
    description: req.body.description
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

router.get('/all-recipes/:name', (req, res) => {
  const query = req.params.name;
  Recept.find({
    $or: [
      // { title: { $regex: query, $options: 'i' } }, { categories: { $regex: query, $options: 'i' } }]
      { title: { $regex: query, $options: 'i' } }
    ]
  }).then(result => res.json(result));
});

router.get('/recipe/:id', (req, res) => {
  const query = req.params.id;
  Recept.findById(query)
    .populate('livsmedel.livsmedelId')
    .then(recipe => res.json(recipe));
});

router.get('/first-time', (req, res) => {
  let maxAge = 604800000; // <-- This is one week
  if (req.cookies.visited === undefined) {
    // If no cookie then return firstTime true and set cookie
    res.cookie('visited', true, { maxAge, httpOnly: true });
    res.json({ firstTime: true });
  } else if (req.cookies.visited) {
    /**
     * If we have a visited cookie that's true
     * then we want to return firstTime false
     * and then re-set the cookie to make its
     * maxAge last longer
     */
    res.cookie('visited', true, { maxAge, httpOnly: true });
    res.json({ firstTime: false });
  }
});

module.exports = router;
