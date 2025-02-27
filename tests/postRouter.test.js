const postRouter = require('../routes/postRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const signJwt = require('../utils/jwt');

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use('/', postRouter);

describe('Cannot access if not logged in', () => {
  it('Returns 401 when trying to post', (done) => {
    request(app).post('/').expect(401, done);
  });

  it('Returns 401 when attempting to delete posts', (done) => {
    request(app).delete('/1').expect(401, done);
  });

  it('Returns 401 when attempting to edit posts', (done) => {
    request(app).put('/1').expect(401, done);
  });

  it('Returns 401 when attempting to fetch posts', (done) => {
    request(app).get('/').expect(401, done);
  });
});

describe('Create posts', () => {
  it('Returns 400 if not allowed type', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);

    const response = await request(app)
      .post('/')
      .auth(token, { type: 'bearer' })
      .field('type', 'fakeType');

    expect(response.statusCode).toBe(400);
    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });

  it('Returns 400 if content exceeds 4000 characters', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);
    const str = 'x'.repeat(4001);

    const response = await request(app)
      .post('/')
      .auth(token, { type: 'bearer' })
      .field('type', 'text')
      .field('content', str);

    expect(response.statusCode).toBe(400);
    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });

  it('Returns 400 if any tag length exceeds 140 characters', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);
    const longTag = 'x'.repeat(141);

    const response = await request(app)
      .post('/')
      .auth(token, { type: 'bearer' })
      .field('type', 'text')
      .field('content', 'lorem ipsum')
      .field('tags[]', ['one', 'two', longTag]);

    expect(response.statusCode).toBe(400);

    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });

  it('Returns id of successfully created post', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);

    const response = await request(app)
      .post('/')
      .auth(token, { type: 'bearer' })
      .send({ type: 'text', content: 'Lorem Ipsum', tags: [] });

    expect(response.statusCode).toBe(200);
    expect(typeof response.body.postId).toBe('number');

    await client.post.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.segment.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });
});

describe('Delete posts', () => {
  it('Cannot delete posts user did not make', async () => {
    const dummy = await client.user.create({
      data: {
        uname: 'a',
        pw: '123',
        email: 'a@b.com',
      },
    });

    const dummyPost = await client.post.create({
      data: {
        author_id: dummy.id,
        segments: {
          create: {
            content: 'b',
            author_id: dummy.id,
          },
        },
      },
    });

    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);

    const response = await request(app)
      .delete(`/${dummyPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(403);

    await client.post.deleteMany({
      where: {
        author_id: dummy.id,
      },
    });
    await client.segment.deleteMany({
      where: {
        author_id: dummy.id,
      },
    });
    await client.user.deleteMany({
      where: {
        id: {
          in: [dummy.id, testUser.id],
        },
      },
    });
  });

  it('Returns id of deleted post', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);

    const testPost = await client.post.create({
      data: {
        author_id: testUser.id,
        segments: {
          create: {
            content: 'b',
            author_id: testUser.id,
          },
        },
      },
    });

    const response = await request(app)
      .delete(`/${testPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.deleted_postId).toBe(testPost.id);

    await client.post.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.segment.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });
});

describe('Editing posts', () => {
  it('Should return new id of edited post', async () => {
    const testUser = await client.user.create({
      data: {
        uname: 'testUser',
        pw: '123',
        email: 'test@mail.com',
      },
    });
    const token = signJwt(testUser);

    const testPost = await client.post.create({
      data: {
        author_id: testUser.id,
        segments: {
          create: [
            {
              content: 'b',
              author_id: testUser.id,
              created_at: new Date(40000000000),
            },
            {
              content: 'The second',
              author_id: testUser.id,
              created_at: new Date(49000000000),
            },
          ],
        },
        tags: {
          connectOrCreate: [
            {
              where: {
                content: 'tag test',
              },
              create: {
                content: 'tag test',
              },
            },
          ],
        },
      },
    });

    const response = await request(app)
      .put(`/${testPost.id}`)
      .auth(token, { type: 'bearer' })
      .send({ type: 'text', content: 'Lorem Ipsum', tags: [] });

    expect(response.statusCode).toBe(200);
    expect(typeof response.body.id).toBe('number');
    expect(response.body.id).toBe(testPost.id);

    await client.post.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.segment.deleteMany({
      where: {
        author_id: testUser.id,
      },
    });
    await client.user.delete({
      where: {
        id: testUser.id,
      },
    });
  });
});

describe('Get posts', () => {
  it('Fetches array of posts', async () => {
    const userB = await client.user.findUnique({
      where: {
        uname: 'userB',
      },
    });

    const token = signJwt(userB);

    const response = await request(app)
      .get('/')
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.posts)).toBe(true);
  });

  it('Fetches a specific post', async () => {
    const userB = await client.user.findUnique({
      where: {
        uname: 'userB',
      },
    });

    const token = signJwt(userB);

    const testPost = await client.post.findFirst({
      where: {
        author: {
          uname: 'userA',
        },
      },
    });

    const response = await request(app)
      .get(`/${testPost.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(response.body.post.id).toBe(testPost.id);
  });

  it('Get posts user has made', async () => {
    const userB = await client.user.findUnique({
      where: {
        uname: 'userB',
      },
    });

    const token = signJwt(userB);

    const response = await request(app)
      .get(`/user/${userB.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.posts)).toBe(true);
  });

  it('Gets array of posts tagged with tag param', async () => {
    const userA = await client.user.findUnique({
      where: { uname: 'userA' },
    });

    const token = signJwt(userA);
    const tagName = 'test tag';
    const testPost = await client.post.create({
      data: {
        author_id: userA.id,
        segments: {
          create: {
            author_id: userA.id,
            post_type: 'text',
            content: 'This is a test post',
          },
        },
        tags: {
          connectOrCreate: {
            where: { content: tagName },
            create: { content: tagName },
          },
        },
      },
    });

    const response = await request(app)
      .get(`/tag?tagName=${tagName}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.findIndex((p) => p.id === testPost.id)).not.toBe(-1);

    await client.post.delete({
      where: { id: testPost.id },
    });
    await client.tag.delete({
      where: { content: tagName },
    });
  });

  it('Does not include any post without the related tag', async () => {
    const userA = await client.user.findUnique({
      where: { uname: 'userA' },
    });

    const token = signJwt(userA);
    const tagName = 'test tag';
    const testPost = await client.post.create({
      data: {
        author_id: userA.id,
        segments: {
          create: {
            author_id: userA.id,
            post_type: 'text',
            content: 'This is a test post',
          },
        },
        tags: {
          connectOrCreate: {
            where: { content: tagName },
            create: { content: tagName },
          },
        },
      },
    });

    const response = await request(app)
      .get(`/tag?tagName=${tagName + 'invalid'}`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.findIndex((p) => p.id === testPost.id)).toBe(-1);

    await client.post.delete({
      where: { id: testPost.id },
    });
    await client.tag.delete({
      where: { content: tagName },
    });
  });

  it('Returns 400 if no tag is supplied', async () => {
    const userA = await client.user.findUnique({
      where: { uname: 'userA' },
    });

    const token = signJwt(userA);

    const response = await request(app)
      .get(`/tag?tagName=`)
      .auth(token, { type: 'bearer' });

    expect(response.statusCode).toBe(400);
  });
});
