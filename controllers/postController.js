const client = require('../prisma/client');

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
      },
    });

    return res.json({ postId: post.id });
  } catch (e) {
    return next(e);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deletedPost = await client.post.delete({
      where: {
        id: Number(req.params.postId),
        author_id: req.user.id,
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
    const oldPost = await client.post.findUnique({
      where: {
        id: Number(req.params.postId),
        author_id: req.user.id,
      },
      select: {
        id: true,
        parent_id: true,
        tags: true,
        segments: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    const post_tags = oldPost.tags.map((el) => ({
      id: el.id,
    }));

    if (
      !oldPost ||
      oldPost.segments[oldPost.segments.length - 1].author_id !== req.user.id
    ) {
      throw new Error('Forbidden');
    }

    // create new post and delete the old one
    const originalSegments = oldPost.segments.map((el) => ({
      id: el.id,
    }));
    originalSegments.pop();

    const updatedPost = await client.post.create({
      data: {
        author_id: req.user.id,
        parent_id: oldPost.parent_id,
        segments: {
          connect: originalSegments,
          create: {
            author_id: req.user.id,
            content: req.body.content,
            post_type: req.body.type,
          },
        },
        tags: {
          connect: post_tags,
        },
      },
    });

    // update every reblog of the old post to point to the new one
    await client.post.updateMany({
      where: {
        parent_id: Number(req.params.postId),
      },
      data: {
        parent_id: updatedPost.id,
      },
    });

    await client.post.deleteMany({
      where: {
        id: Number(req.params.postId),
      },
    });

    return res.json({ edited_postId: updatedPost.id });
  } catch (e) {
    console.error(e);
    return next(e);
  }
};

exports.getFollowersPost = async (req, res, next) => {
  try {
    const posts = await client.post.findMany({
      where: {
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
        _count: {
          select: {
            likes: true,
            replies: true,
            children: true,
          },
        },
        children: {
          select: {
            _count: {
              select: {
                likes: true,
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
      where: {
        author_id: Number(req.params.userId),
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
            likes: true,
            replies: true,
            children: true,
          },
        },
        children: {
          select: {
            _count: {
              select: {
                likes: true,
                replies: true,
                children: true,
              },
            },
          },
        },
      },
    });

    console.log(usersPosts);

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
            likes: true,
            children: true,
          },
        },
        parent: {
          select: {
            _count: {
              select: {
                likes: true,
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
