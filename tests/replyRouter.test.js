const replyRouter = require('../routes/replyRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', replyRouter);

describe('Unsuccessful replies', () => {
  it('Returns 401 if not logged in', (done) => {
    request(app).post('/1').expect(401, done);
  });

  it('Returns 400 if empty reply', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const token = signJwt(userA);
    const response = await request(app)
      .post(`/${testPost.id}`)
      .auth(token, { type: 'bearer' })
      .send({
        content: '',
      });

    expect(response.statusCode).toBe(400);
  });

  it('Returns 400 if reply length exceeds 1000 characters', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const token = signJwt(userA);
    const response = await request(app)
      .post(`/${testPost.id}`)
      .auth(token, { type: 'bearer' })
      .send({
        content: 'x'.repeat(1001),
      });

    expect(response.statusCode).toBe(400);
  });

  it('Returns 400 if the post does not exist', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const token = signJwt(userA);
    const response = await request(app)
      .post(`/fakePost`)
      .auth(token, { type: 'bearer' })
      .send({
        content: 'test',
      });

    expect(response.statusCode).toBe(400);
  });
});

describe('Successfully create reply', () => {
  it('Returns newly created reply id', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const token = signJwt(userA);
    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const response = await request(app)
      .post(`/${testPost.id}`)
      .auth(token, { type: 'bearer' })
      .send({
        content: 'test',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.reply_id).toBeDefined();
  });
});

describe('Deleting replies', () => {
  it('Returns id of deleted reply', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const token = signJwt(userA);
    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const testReply = await client.reply.create({
      data: {
        content: 'Lorem Ipsum',
        author_id: userA.id,
        post_id: testPost.id,
      },
    });

    const response = await request(app)
      .delete(`/${testReply.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.deleted_id).toBe(testReply.id);
  });

  it('Cannot delete replies the user did not make', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const userB = await client.user.findUnique({
      where: {
        uname: 'userB',
      },
    });

    const token = signJwt(userB);
    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const testReply = await client.reply.create({
      data: {
        content: 'Lorem Ipsum',
        author_id: userA.id,
        post_id: testPost.id,
      },
    });

    const response = await request(app)
      .delete(`/${testReply.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(403);
  });
});

describe('Get replies', () => {
  it('Should return an array of replies', async () => {
    const userA = await client.user.findUnique({
      where: {
        uname: 'userA',
      },
    });

    const token = signJwt(userA);
    const testPost = await client.post.findFirst({
      where: {
        author_id: userA.id,
      },
    });

    const response = await request(app)
      .get(`/${testPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
