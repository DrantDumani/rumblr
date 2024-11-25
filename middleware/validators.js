const { body, validationResult } = require('express-validator');

exports.signUpRules = () => [
  body('username').isString().trim().isLength({ max: 20, min: 1 }),
  body('email').isEmail(),
  body('pw').isString().trim().isLength({ min: 1 }),
  body('confirmPw').custom((value, { req }) => value === req.body.pw),
];

exports.loginRules = () => [
  body('email').isString().trim().isLength({ min: 1 }),
  body('pw').isString().trim().isLength({ min: 1 }),
];

// make sure types are allowed
exports.postRules = () => [
  body('type')
    .isString()
    .trim()
    .isIn(['text', 'photo', 'quote', 'link', 'chat', 'audio', 'video']),
  body('content').isString().trim().isLength({ min: 1, max: 4000 }),
  body('tags.*').isString().trim().isLength({ max: 140 }),
];

exports.validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  else return res.status(400).json(errors);
};
