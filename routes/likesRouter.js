const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const likesController = require('../controllers/likesController');
const validators = require('../middleware/validators');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/:postId', likesController.likePost);

router.delete('/:postId', likesController.unlikePost);

router.get(
  '/',
  validators.checkCursor(),
  validators.validateFields,
  likesController.getLikedPosts
);

module.exports = router;
