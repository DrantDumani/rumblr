const router = require('express').Router();
const passport = require('../middleware/passportConfig');
const upload = require('../middleware/multer');
const validators = require('../middleware/validators');
const postController = require('../controllers/postController');

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  '/',
  upload.single('file'),
  validators.postRules(),
  validators.validateFields,
  postController.createPost
);

router.delete('/:postId', postController.deletePost);

router.put('/:postId', upload.single('file'), postController.editPost);

router.get('/', postController.getFollowersPost);

module.exports = router;
