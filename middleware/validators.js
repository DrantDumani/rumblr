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

exports.validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  else return res.status(400).json(errors);
};
