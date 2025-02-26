const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const {
  uploadImgPost,
  uploadAudioPost,
  uploadVideoPost,
} = require('../middleware/multer');
const validators = require('../middleware/validators');
const reblogController = require('../controllers/reblogController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/:postId',
  uploadImgPost.single('image'),
  validators.reblogRules(),
  validators.validateFields,
  reblogController.reblogPost
);

router.post(
  '/:postId/photo',
  uploadImgPost.single('image'),
  validators.postMediaRules(),
  validators.validateFields,
  reblogController.reblogPostWithMedia
);

router.post(
  '/:postId/audio',
  uploadAudioPost.single('audio'),
  validators.postMediaRules(),
  validators.validateFields,
  reblogController.reblogPostWithMedia
);

router.post(
  '/:postId/video',
  uploadVideoPost.single('video'),
  validators.postMediaRules(),
  validators.validateFields,
  reblogController.reblogPostWithMedia
);

module.exports = router;
