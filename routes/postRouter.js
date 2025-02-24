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

router.put(
  '/:postId',
  validators.postRules(),
  validators.validateFields,
  postController.editPost
);

router.put(
  '/:postId/photo',
  uploadImgPost.single('image'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.editMediaPost
);

router.put(
  '/:postId/audio',
  uploadImgPost.single('audio'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.editMediaPost
);

router.put(
  '/:postId/video',
  uploadImgPost.single('video'),
  validators.postMediaRules(),
  validators.validateFields,
  postController.editMediaPost
);

router.get(
  '/',
  validators.checkCursor(),
  validators.validateFields,
  postController.getFollowersPost
);

router.get(
  '/user/:userId',
  validators.checkCursor(),
  validators.validateFields,
  postController.getUsersPosts
);

router.get(
  '/tag',
  validators.searchRules(),
  validators.validateFields,
  postController.getTaggedPosts
);

router.get('/:postId', postController.getSinglePost);
module.exports = router;
