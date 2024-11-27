const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const upload = require('../middleware/multer');
const validators = require('../middleware/validators');
const reblogController = require('../controllers/reblogController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/:postId',
  upload.single('file'),
  validators.postRules(),
  validators.validateFields,
  reblogController.reblogPost
);

module.exports = router;
