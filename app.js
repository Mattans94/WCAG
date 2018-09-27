const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const apiRouter = require('./routes/api');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

mongoose
  .connect(
    'mongodb://admin:admin123@ds151049.mlab.com:51049/wcag',
    { useNewUrlParser: true }
  )
  .then(() => console.log('DB Connected!'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api', apiRouter);

app.get(/^[^\.]*$/, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log('listening on port 3000');
});
