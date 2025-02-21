const client = require('../prisma/client');
const { handleUpload } = require('../utils/cloudinary');
const sign_jwt = require('../utils/jwt');
const bcrypt = require('bcrypt');

// send user token on successful sign up
exports.signUp = async (req, res, next) => {
  try {
    const hashedPw = await bcrypt.hash(req.body.pw, 10);
    const user = await client.user.create({
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
    console.error(e);
    return next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await client.user.findUnique({
      where: {
        id: Number(req.params.userId),
      },
      select: {
        id: true,
        uname: true,
        h_img: true,
        pfp: true,
        about: true,
        following: {
          where: {
            follower_id: req.user.id,
          },
        },
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
    const updateObj = {};
    if (req.files.pfp || req.files.header) {
      const { pfp, header } = req.files;
      let pfpResp = null;
      let headerImgResp = null;

      if (pfp) {
        pfpResp = await handleUpload(pfp[0], 'image', req.user.pfp_id || '');
        updateObj.pfp = pfpResp.secure_url;
        if (!req.user.pfp_id) {
          updateObj.pfp_id = pfpResp.public_id;
        }
      }
      if (header) {
        headerImgResp = await handleUpload(
          header[0],
          'image',
          req.user.h_img_id || ''
        );
        updateObj.h_img = headerImgResp.secure_url;
        if (!req.user.h_img_id) {
          updateObj.h_img_id = headerImgResp.public_id;
        }
      }
    }

    updateObj.about = req.body.about;

    const updatedUser = await client.user.update({
      where: {
        id: req.user.id,
      },
      data: updateObj,
    });

    const token = sign_jwt(updatedUser);

    return res.json({
      uname: updatedUser.uname,
      about: updatedUser.about,
      h_img: updatedUser.h_img,
      pfp: updatedUser.pfp,
      newToken: token,
    });
  } catch (e) {
    return next(e);
  }
};
