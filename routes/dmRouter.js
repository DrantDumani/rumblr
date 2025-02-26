const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const validators = require('../middleware/validators');
const dmController = require('../controllers/dmController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/:userId',
  validators.dmRules(),
  validators.validateFields,
  dmController.sendDM
);

router.get(
  '/:userId',
  validators.checkCursor(),
  validators.validateFields,
  dmController.getDms
);

module.exports = router;
