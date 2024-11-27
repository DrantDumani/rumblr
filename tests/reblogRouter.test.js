const reblogRouter = require('../routes/reblogRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', reblogRouter);

describe('Cannot access if not logged in', () => {
  it('returns 401 when trying to reblog a post', (done) => {
    request(app).post('/').expect(401, done);
  });
});

describe('Successful reblog', () => {
  it('Returns id of new reblog', async () => {
    const userB = await client.user.findUnique({
      where: {
        uname: 'userB',
      },
    });

    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const token = signJwt(userB);
    const postToReblog = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const response = await request(app)
      .post(`/${postToReblog.id}`)
      .auth(token, { type: 'bearer' })
      .field('type', 'text')
      .field('content', 'Lorem Ipsum')
      .field('tags[]', ['no', 'more', 'music']);

    expect(response.statusCode).toBe(200);
    expect(response.body.post_id).not.toBe(postToReblog.id);
  });
});
