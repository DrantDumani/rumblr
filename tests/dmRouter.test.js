const dmRouter = require('../routes/dmRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', dmRouter);

describe('DM Route', () => {
  it('Returns 400 when message length exceeds 1000', async () => {
    const [userA, userB] = await Promise.all([
      client.user.findUnique({
        where: { uname: 'userA' },
      }),
      client.user.findUnique({
        where: {
          uname: 'userB',
        },
      }),
    ]);

    const token = signJwt(userA);

    const response = await request(app)
      .post(`/${userB.id}`)
      .send({ content: 'x'.repeat(1001) })
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(400);
  });

  it('Returns 200 after successfully sending a message', async () => {
    const [userA, userB] = await Promise.all([
      client.user.findUnique({
        where: { uname: 'userA' },
      }),
      client.user.findUnique({
        where: {
          uname: 'userB',
        },
      }),
    ]);

    const token = signJwt(userA);
    const response = await request(app)
      .post(`/${userB.id}`)
      .send({ content: 'Lorem Ipsum' })
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
  });

  it('Returns array of dms in descending order of id', async () => {
    const [userA, userB] = await Promise.all([
      client.user.findUnique({
        where: { uname: 'userA' },
      }),
      client.user.findUnique({
        where: {
          uname: 'userB',
        },
      }),
    ]);

    const token = signJwt(userA);
    const response = await request(app)
      .get(`/${userB.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[1].id).toBeLessThan(response.body[0].id);
  });
});
