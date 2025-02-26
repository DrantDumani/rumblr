const userRouter = require('../routes/userRouter');
const request = require('supertest');
const express = require('express');
const client = require('../prisma/client');
const bcrypt = require('bcrypt');
const sign_jwt = require('../utils/jwt');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', userRouter);

const testUser = {
  uname: 'test',
  email: 'super@test.com',
  pw: '123',
};

afterEach(async () => {
  // remove the test user if its been inserted
  try {
    await client.user.delete({
      where: {
        email: testUser.email,
      },
    });
    return;
  } catch (err) {
    if (err.code === 'P2025') return err;
    else console.dir(err);
  }
});

describe('Handle bad sign up route user data', () => {
  it('400 on username longer than 20 chars', (done) => {
    const longName = 'x'.repeat(21);
    request(app)
      .post('/')
      .type('form')
      .send({
        username: longName,
        email: 'foo@bar.com',
        pw: '123',
        confirmPw: '123',
      })
      .expect(400, done);
  });

  it('400 on malformed email address', (done) => {
    request(app)
      .post('/')
      .type('form')
      .send({
        username: 'foo',
        email: 'badmail',
        pw: '123',
        confirmPw: '123',
      })
      .expect(400, done);
  });

  it('400 if passwords do not match', (done) => {
    request(app)
      .post('/')
      .type('form')
      .send({
        username: 'foo',
        email: 'foo@bar.com',
        pw: '000',
        confirmPw: '999',
      })
      .expect(400, done);
  });

  it('400 on duplicate username', async () => {
    await client.user.create({
      data: testUser,
    });

    const response = await request(app).post('/').type('form').send({
      username: testUser.uname,
      email: 'foo@bar.com',
      pw: '000',
      confirmPw: '000',
    });

    expect(response.statusCode).toBe(400);
  });

  it('400 on duplicate email', async () => {
    await client.user.create({
      data: testUser,
    });

    const response = await request(app).post('/').type('form').send({
      username: 'foo',
      email: testUser.email,
      pw: '000',
      confirmPw: '000',
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('Successful sign up', () => {
  it('Sends 200 on valid data', async () => {
    const response = await request(app).post('/').type('form').send({
      username: testUser.uname,
      email: testUser.email,
      pw: testUser.pw,
      confirmPw: testUser.pw,
    });

    expect(response.statusCode).toBe(200);
  });
});

describe('Bad Log in', () => {
  it('Responds 401 on incorrect email', async () => {
    await client.user.create({
      data: testUser,
    });

    const response = await request(app).post('/auth').type('form').send({
      email: 'badEmail',
      pw: testUser.pw,
    });

    expect(response.statusCode).toBe(401);
  });

  it('Responds 401 on incorrect password', async () => {
    await client.user.create({
      data: testUser,
    });

    const response = await request(app)
      .post('/auth')
      .type('form')
      .send({
        email: testUser.email,
        pw: testUser.pw + 'badpw',
      });

    expect(response.statusCode).toBe(401);
  });

  it('200 on successful login', async () => {
    await client.user.create({
      data: {
        uname: testUser.uname,
        email: testUser.email,
        pw: await bcrypt.hash(testUser.pw, 10),
      },
    });

    const response = await request(app).post('/auth').type('form').send({
      email: testUser.email,
      pw: testUser.pw,
    });

    expect(response.statusCode).toBe(200);
  });
});

describe('Get user data', () => {
  it('401 if not logged in', (done) => {
    request(app).get('/100').expect(401, done);
  });

  it('Returns name, pfp, header, and about', async () => {
    const user = await client.user.create({
      data: {
        uname: testUser.uname,
        email: testUser.email,
        pw: await bcrypt.hash(testUser.pw, 10),
        h_img: 'headerImg.png',
        pfp: 'pfp_img.webp',
        about: 'Lorem Ipsum dolor',
      },
    });
    const token = sign_jwt(user);

    const response = await request(app)
      .get(`/${user.id}`)
      .auth(token, { type: 'bearer' });

    expect(response.body.uname).toBe(user.uname);
    expect(response.body.pfp).toBe(user.pfp);
    expect(response.body.about).toBe(user.about);
    expect(response.body.h_img).toBe(user.h_img);
  });
});

describe('Editing user data', () => {
  it("Should change user's about section", async () => {
    const user = await client.user.create({
      data: {
        uname: testUser.uname,
        email: testUser.email,
        pw: await bcrypt.hash(testUser.pw, 10),
        h_img: 'headerImg.png',
        pfp: 'pfp_img.webp',
        about: 'Lorem Ipsum dolor',
      },
    });

    const token = sign_jwt(user);

    const response = await request(app)
      .put('/')
      .auth(token, { type: 'bearer' })
      .type('form')
      .field('about', 'Edit the bio');

    expect(response.body.about).toBe('Edit the bio');
  });
});
