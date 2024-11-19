const router = require('express').Router();
const userController = require('../controllers/userController');
const validators = require('../middleware/validators');
const passport = require('../middleware/passportConfig');
const upload = require('../middleware/multer');

router.post(
  '/',
  validators.signUpRules(),
  validators.validateFields,
  userController.signUp
);

router.post(
  '/auth',
  validators.loginRules(),
  validators.validateFields,
  passport.authenticate('local', { session: false }),
  userController.logIn
);

router.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  userController.getUser
);

router.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single(),
  userController.editUser
);

module.exports = router;
