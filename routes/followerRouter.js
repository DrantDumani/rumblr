const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const followController = require('../controllers/followerController');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/:userId', followController.followUser);

router.delete('/:userId', followController.unFollowUser);

router.get('/', followController.getFollowing);

module.exports = router;
