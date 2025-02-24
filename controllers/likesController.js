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
    const cursor = Number(req.query.cursor);

    const likedPosts = await client.likesOnPost.findMany({
      take: 10,
      ...(cursor && { cursor: { id: cursor } }),
      ...(cursor && { skip: 1 }),
      where: {
        user_id: req.user.id,
        post: {
          isDeleted: false,
        },
      },
      orderBy: {
        id: 'desc',
      },
      include: {
        selfPost: {
          include: {
            author: {
              select: {
                id: true,
                uname: true,
                pfp: true,
              },
            },
            previous: {
              select: {
                author: {
                  select: {
                    uname: true,
                  },
                },
              },
            },
            segments: {
              orderBy: {
                id: 'asc',
              },
              include: {
                author: {
                  select: {
                    uname: true,
                    pfp: true,
                  },
                },
              },
            },
            tags: {
              orderBy: {
                id: 'asc',
              },
            },
            selfLiked: {
              where: {
                user_id: req.user.id,
              },
              select: {
                id: true,
                user_id: true,
              },
            },
            _count: {
              select: {
                usersLiked: true,
                replies: true,
                children: true,
              },
            },
            parent: {
              select: {
                _count: {
                  select: {
                    usersLiked: true,
                    replies: true,
                    children: true,
                  },
                },
                author_id: true,
              },
            },
          },
        },
      },
    });

    return res.json({ posts: likedPosts });
  } catch (e) {
    return next(e);
  }
};
