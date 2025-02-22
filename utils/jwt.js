const jwt = require('jsonwebtoken');

const sign_jwt = (user) => {
  const payload = {
    id: user.id,
    username: user.uname,
    pfp_id: user.pfp_id,
    h_img_id: user.h_img_id,
    pfp: user.pfp,
  };

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '2 days' });
  return token;
};

module.exports = sign_jwt;
