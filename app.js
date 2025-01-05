const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRouter');

const port = process.env.PORT || 3000;

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ['http://localhost:5173'],
  })
);

app.use('/users', userRouter);

app.use((err, req) => {
  if (req.app.get('env') === 'development') console.error(err);
});

app.listen(port, () => {
  console.log(`Currently running on port ${port}`);
});
