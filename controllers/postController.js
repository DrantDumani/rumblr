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

    // const post_tags = oldPost.tags.map((el) => ({
    //   tags: {
    //     connectOrCreate: {
    //       where: {
    //         content: el.tags.content,
    //       },
    //       create: {
    //         content: el.tags.content,
    //       },
    //     },
    //   },
    // }));

    // const relatedSegments = await client.segment.findMany({
    //   where: {
    //     posts: {
    //       every: {
    //         author_id: true,
    //         id: true,
    //       },
    //     },
    //   },
    //   select: {
    //     id: true,
    //     author_id: true,
    //     created_at: true,
    //   },
    //   orderBy: {
    //     created_at: 'asc',
    //   },
    // });

    // if (
    //   !relatedSegments.length ||
    //   relatedSegments[relatedSegments.length - 1].author_id !== req.user.id
    // ) {
    //   throw new Error('Forbidden');
    // }

    if (
      !oldPost.segments.length ||
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

    // delete the old post
    // await client.post_segments.deleteMany({
    //   where: {
    //     post_id: Number(req.params.postId),
    //   },
    // });
    // await client.posts.delete({
    //   where: {
    //     id: Number(req.params.postId),
    //   },
    // });

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
              // followers: {
              //   some: {
              //     follower_id: req.user.id,
              //   },
              // },
            },
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            uname: true,
            pfp: true,
          },
        },
        segments: {
          orderBy: {
            created_at: 'asc',
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
        // likes: {
        //   select: {
        //     _count: {
        //       select: {

        //       }
        //     }
        //   }
        // },
        // replies: {
        //   select: {
        //     id: true
        //   }
        // },
      },
    });

    // const postsOLD = await client.post.findMany({
    //   // Gather all posts that were created by people the user is following
    //   // in order
    //   // posts will need their segments and tags as well
    //   where: {
    //     users: {
    //       followers_followers_following_idTousers: {
    //         some: {
    //           follower_id: req.user.id,
    //         },
    //       },
    //     },
    //   },
    //   include: {
    //     users: {
    //       select: {
    //         id: true,
    //         uname: true,
    //         pfp: true,
    //       },
    //     },
    //     post_segments: {
    //       orderBy: {
    //         segment_id: 'asc',
    //       },
    //       select: {
    //         segments: {
    //           include: {
    //             users: {
    //               select: {
    //                 uname: true,
    //                 pfp: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //     post_tags: {
    //       orderBy: {
    //         tag_id: 'asc',
    //       },
    //       select: {
    //         tags: {
    //           select: {
    //             id: true,
    //             content: true,
    //           },
    //         },
    //       },
    //     },
    //     // a parent post won't have a parent, so query likes, reblogs, and likes anyway
    //     posts: {
    //       select: {
    //         likes: {
    //           select: {
    //             author_id: true,
    //           },
    //         },
    //         replies: {
    //           select: {
    //             author_id: true,
    //           },
    //         },
    //         other_posts: {
    //           select: {
    //             id: true,
    //           },
    //         },
    //       },
    //     },
    //     likes: {
    //       select: {
    //         author_id: true,
    //       },
    //     },
    //     replies: {
    //       select: {
    //         author_id: true,
    //       },
    //     },
    //     other_posts: {
    //       select: {
    //         id: true,
    //       },
    //     },
    //   },
    // });
    // get all the notes. Use stackoverflow answer etc
    // console.dir(posts, { depth: Infinity });
    return res.json(posts);
  } catch (e) {
    return next(e);
  }
};
