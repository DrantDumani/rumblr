const userRouter = require('../routes/userRouter');
const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', userRouter);

describe('Handle bad sign up route user data', () => {
  it('400 on username longer than 20 chars', () => {});

  // it('400 on malformed email address', () => {});

  // it('400 if passwords do not match', () => {});

  // it('400 on duplicate username', () => {});

  // it('400 on duplicate email', () => {});
});

// describe('Successful sign up', () => {
//   // don't test that it sends a jwt token
//   it('Sends 200');
// });

// describe('Bad Log in', () => {
//   it('Responds 400 on incorrect email');
//   it("Responds 400 on incorrect password")
// });

// describe("Get user data", () => {
//   it("400 if not logged in", () => {})
//   it("Returns name, pfp, header, and about")
// })

// describe("Editing user data", () => {
//   it("Should change about, pfp, and header")
// })
