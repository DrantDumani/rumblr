const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const validators = require('../middleware/validators');
const replyController = require('../controllers/replyController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/:postId',
  validators.replyRules(),
  validators.validateFields,
  replyController.createReply
);

router.delete('/:replyId', replyController.deleteReply);

router.get('/:postId', replyController.getReplies);

module.exports = router;
