const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const {
  uploadImgPost,
  uploadAudioPost,
  uploadVideoPost,
} = require('../middleware/multer');
const validators = require('../middleware/validators');
const postController = require('../controllers/postController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/',
  validators.postRules(),
  validators.validateFields,
  postController.createPost
);

router.post(
  '/photo',
  uploadImgPost.single('image'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.createMediaPost
);

router.post(
  '/audio',
  uploadAudioPost.single('audio'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.createMediaPost
);

router.post(
  '/video',
  uploadVideoPost.single('video'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.createMediaPost
);

router.delete('/:postId', postController.deletePost);

router.put('/:postId', uploadImgPost.single('file'), postController.editPost);

router.get('/', postController.getFollowersPost);

router.get('/:postId', postController.getSinglePost);

router.get('/user/:userId', postController.getUsersPosts);

module.exports = router;
