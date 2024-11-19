const client = require('../prisma/client');
const sign_jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');

// send user token on successful sign up
exports.signUp = async (req, res, next) => {
  try {
    const hashedPw = await bcrypt.hash(req.body.pw, 10);
    const user = await client.users.create({
      data: {
        uname: req.body.username,
        pw: hashedPw,
        email: req.body.email,
      },
    });

    const token = sign_jwt(user);
    return res.json({ token });
  } catch (e) {
    if (e.code === 'P2002') {
      return res
        .status(400)
        .json({ err: 'An account with this username or email already exists' });
    } else return next(e);
  }
};

exports.logIn = async (req, res, next) => {
  try {
    const token = sign_jwt(req.user);
    return res.json({ token });
  } catch (e) {
    return next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await client.users.findUnique({
      where: {
        id: Number(req.params.userId),
      },
      select: {
        uname: true,
        h_img: true,
        pfp: true,
        about: true,
      },
    });

    if (!user) throw new Error('Not Found');
    else return res.json(user);
  } catch (e) {
    if (e === 'Not Found') {
      return res.status(404).json('User not found');
    } else return next(e);
  }
};

exports.editUser = async (req, res, next) => {
  try {
    const updatedUser = await client.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        about: req.body.about,
      },
    });

    return res.json({ about: updatedUser.about });
  } catch (e) {
    return next(e);
  }
};
