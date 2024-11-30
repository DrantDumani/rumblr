const client = require('../prisma/client');

exports.likePost = async (req, res, next) => {
  try {
    const likedPost = await client.post.update({
      where: {
        id: Number(req.params.postId),
      },
      data: {
        likes: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.json({ liked: likedPost.id });
  } catch (e) {
    return next(e);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const unlikedPost = await client.post.update({
      where: {
        id: Number(req.params.postId),
      },
      data: {
        likes: {
          disconnect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.json({ unliked: unlikedPost.id });
  } catch (e) {
    return next(e);
  }
};

exports.getLikedPosts = async (req, res, next) => {
  try {
    const likedPosts = await client.post.findMany({
      where: {
        likes: {
          some: {
            id: req.user.id,
          },
        },
      },
    });

    return res.json(likedPosts);
  } catch (e) {
    return next(e);
  }
};
