const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const likesController = require('../controllers/likesController');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/:postId', likesController.likePost);

router.delete('/:postId', likesController.unlikePost);

router.get('/', likesController.getLikedPosts);

module.exports = router;
