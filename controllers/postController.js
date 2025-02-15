const client = require('../prisma/client');
const { handleUpload } = require('../utils/cloudinary');

exports.createPost = async (req, res, next) => {
  try {
    const post = await client.post.create({
      data: {
        author_id: req.user.id,
        segments: {
          create: {
            author_id: req.user.id,
            post_type: req.body.type,
            content: req.body.content,
          },
        },
        tags: {
          connectOrCreate: req.body.tags.map((t) => ({
            where: { content: t },
            create: { content: t },
          })),
        },
      },
    });

    return res.json({ postId: post.id });
  } catch (e) {
    console.log(e);
    // consider retrying the upload if P2022 error occurs
    return next(e);
  }
};

exports.createMediaPost = async (req, res, next) => {
  try {
    if (req.file) {
      let resource_type = '';
      if (req.body.type === 'photo') resource_type = 'image';
      else resource_type = 'video';

      const fileURL = await handleUpload(req.file, resource_type);

      const data = {
        author_id: req.user.id,
        segments: {
          create: {
            author_id: req.user.id,
            post_type: req.body.type,
            content: fileURL,
          },
        },
      };

      if (req.body.tags) {
        data.tags = {
          connectOrCreate: req.body.tags.map((t) => ({
            where: { content: t },
            create: { content: t },
          })),
        };
      }

      const post = await client.post.create({
        data: data,
      });

      return res.json({ post_id: post.id });
    }
  } catch (e) {
    console.log(e);
    return next(e);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    // archive the post to continue tracking notes

    const deletedPost = await client.post.update({
      where: {
        id: Number(req.params.postId),
        author_id: req.user.id,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.json({ deleted_postId: deletedPost.id });
  } catch (e) {
    if (e.code === 'P2025') return res.status(403).json('Forbidden');
    else return next(e);
  }
};

exports.editPost = async (req, res, next) => {
  try {
    const lastSegments = await client.segment.findMany({
      where: {
        posts: {
          some: {
            id: Number(req.params.postId),
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        author_id: true,
      },
      take: 2,
    });

    const updateObj = {
      where: {
        id: Number(req.params.postId),
        author_id: req.user.id,
      },
      data: {
        segments: {},
      },
    };

    if (!lastSegments.length && !req.body.content) {
      throw new Error('Cannot submit empty post');
    }

    if (lastSegments[0].author_id === req.user.id) {
      updateObj.data.segments.disconnect = {
        id: lastSegments[0].id,
      };
    }

    if (req.body.content) {
      updateObj.data.segments.create = {
        author_id: req.user.id,
        content: req.body.content,
        post_type: req.body.type,
      };
    }

    const updatedPost = await client.post.update(updateObj);

    return res.json({ edited_postId: updatedPost.id });
  } catch (e) {
    return next(e);
  }
};

exports.getFollowersPost = async (req, res, next) => {
  try {
    const posts = await client.post.findMany({
      take: 10,
      where: {
        isDeleted: false,
        OR: [
          {
            author_id: Number(req.user.id),
          },
          {
            author: {
              following: {
                some: {
                  follower_id: req.user.id,
                },
              },
            },
          },
        ],
      },
      orderBy: {
        id: 'desc',
      },
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
        usersLiked: {
          where: {
            user_id: req.user.id,
          },
          select: {
            id: true,
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
          },
        },
      },
    });

    return res.json(posts);
  } catch (e) {
    return next(e);
  }
};

exports.getUsersPosts = async (req, res, next) => {
  try {
    const usersPosts = await client.post.findMany({
      take: 10,
      where: {
        author_id: Number(req.params.userId),
        isDeleted: false,
      },
      orderBy: {
        id: 'desc',
      },
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
        _count: {
          select: {
            usersLiked: true,
            replies: true,
            children: true,
          },
        },
        children: {
          select: {
            _count: {
              select: {
                usersLiked: true,
                replies: true,
                children: true,
              },
            },
          },
        },
      },
    });

    return res.json(usersPosts);
  } catch (e) {
    console.error(e);
    return next(e);
  }
};

exports.getSinglePost = async (req, res, next) => {
  try {
    const post = await client.post.findUnique({
      where: {
        id: Number(req.params.postId),
        isDeleted: false,
      },
      include: {
        tags: true,
        segments: true,
        author: {
          select: {
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
        _count: {
          select: {
            replies: true,
            usersLiked: true,
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
          },
        },
      },
    });

    if (!post) return res.status(404).json('Post not Found');
    return res.json({ post });
  } catch (e) {
    return next(e);
  }
};
