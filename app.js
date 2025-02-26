const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const reblogRouter = require('./routes/reblogRouter');
const likeRouter = require('./routes/likesRouter');
const followRouter = require('./routes/followerRouter');
const replyRouter = require('./routes/replyRouter');

const port = process.env.PORT || 3000;

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://rumblr.netlify.app'],
  })
);

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/reblogs', reblogRouter);
app.use('/likes', likeRouter);
app.use('/followers', followRouter);
app.use('/replies', replyRouter);

app.use((err, req) => {
  if (req.app.get('env') === 'development') console.error(err);
});

app.listen(port, () => {
  console.log(`Currently running on port ${port}`);
});
