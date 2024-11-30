const likeRouter = require('../routes/likesRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', likeRouter);

describe('Like Route', () => {
  it('Returns id of liked post', async () => {
    const [testUser, testPost] = await Promise.all([
      client.user.findUnique({
        where: { uname: 'userA' },
      }),
      client.post.findFirst({
        where: {
          author: {
            uname: 'userA',
          },
        },
      }),
    ]);

    const token = signJwt(testUser);

    const response = await request(app)
      .post(`/${testPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.liked).toBe(testPost.id);
  });

  it('Returns id of unliked post', async () => {
    const [testUser, testPost] = await Promise.all([
      client.user.findUnique({
        where: { uname: 'userA' },
      }),
      client.post.findFirst({
        where: {
          author: {
            uname: 'userA',
          },
        },
      }),
    ]);

    await client.post.update({
      where: {
        id: testPost.id,
      },
      data: {
        likes: {
          connect: {
            id: testUser.id,
          },
        },
      },
    });

    const token = signJwt(testUser);

    const response = await request(app)
      .delete(`/${testPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.unliked).toBe(testPost.id);
  });

  it('Fetches array of liked posts', async () => {
    const testUser = client.user.findUnique({
      where: { uname: 'userA' },
    });

    const token = signJwt(testUser);

    const response = await request(app)
      .get('/')
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
