const client = require('../prisma/client');

exports.likePost = async (req, res, next) => {
  try {
    const postToLike = await client.post.findUnique({
      where: {
        id: Number(req.params.postId),
      },
    });

    const newLike = await client.likesOnPost.create({
      data: {
        user_id: req.user.id,
        post_id: Number(req.params.postId),
        parent_id: postToLike.parent_id || postToLike.id,
      },
    });

    return res.json({
      liked: newLike.post_id,
      id: newLike.id,
      user_id: newLike.user_id,
    });
  } catch (e) {
    return next(e);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const unlikedPost = await client.likesOnPost.delete({
      where: {
        user_id_post_id: {
          user_id: req.user.id,
          post_id: Number(req.params.postId),
        },
      },
    });

    return res.json({ unliked: unlikedPost.post_id });
  } catch (e) {
    return next(e);
  }
};

exports.getLikedPosts = async (req, res, next) => {
  try {
    const likedPosts = await client.post.findMany({
      take: 10,
      where: {
        usersLiked: {
          some: {
            user_id: req.user.id,
          },
        },
        isDeleted: false,
      },
      include: {
        segments: true,
        usersLiked: {
          select: {
            id: true,
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    return res.json(likedPosts);
  } catch (e) {
    return next(e);
  }
};
