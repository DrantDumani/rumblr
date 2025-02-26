const followRouter = require('../routes/followerRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', followRouter);

describe('Follow router', () => {
  it('Follows a user', async () => {
    const testUser1 = await client.user.create({
      data: {
        uname: 'testUser1',
        email: 'foo@bar.com',
        pw: '123',
      },
    });

    const testUser2 = await client.user.create({
      data: {
        uname: 'testUser2',
        email: 'bar@baz.com',
        pw: '123',
      },
    });

    const token = signJwt(testUser2);

    const response = await request(app)
      .post(`/${testUser1.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.followed).toBe(testUser1.id);

    await client.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: testUser2.id,
          following_id: testUser1.id,
        },
      },
    });
    await client.user.deleteMany({
      where: {
        OR: [
          {
            id: testUser1.id,
          },
          { id: testUser2.id },
        ],
      },
    });
  });

  it('Returns 403 if a user tries to follow themselves', async () => {
    const testUser1 = await client.user.create({
      data: {
        uname: 'testUser1',
        email: 'foo@bar.com',
        pw: '123',
      },
    });
    const token = signJwt(testUser1);

    const response = await request(app)
      .post(`/${testUser1.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(403);
    await client.user.delete({
      where: {
        id: testUser1.id,
      },
    });
  });

  it('Unfollows a user', async () => {
    const testUser1 = await client.user.create({
      data: {
        uname: 'testUser1',
        email: 'foo@bar.com',
        pw: '123',
      },
    });

    const testUser2 = await client.user.create({
      data: {
        uname: 'testUser2',
        email: 'bar@baz.com',
        pw: '123',
      },
    });

    await client.follow.create({
      data: {
        follower_id: testUser1.id,
        following_id: testUser2.id,
      },
    });
    const token = signJwt(testUser1);

    const response = await request(app)
      .delete(`/${testUser2.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.deleted_follow).toBe(testUser2.id);

    await client.user.deleteMany({
      where: {
        OR: [{ id: testUser1.id }, { id: testUser2.id }],
      },
    });
  });

  it('Fetches list of followers', async () => {
    const testUser1 = await client.user.create({
      data: {
        uname: 'testUser1',
        email: 'foo@bar.com',
        pw: '123',
      },
    });
    const token = signJwt(testUser1);

    const response = await request(app)
      .get('/')
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
