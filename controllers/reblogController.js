const client = require('../prisma/client');

exports.reblogPost = async (req, res, next) => {
  try {
    const postToReblog = await client.post.findUnique({
      where: {
        id: Number(req.params.postId),
      },
      select: {
        id: true,
        parent_id: true,
        prev_id: true,
        segments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!postToReblog) throw new Error('Forbidden');

    // tags are optional, so handle this appropriately
    const postTags = req.body.tags.map((t) => ({
      where: { content: t },
      create: { content: t },
    }));

    const reblog = await client.post.create({
      data: {
        author_id: req.user.id,
        parent_id: postToReblog.parent_id,
        prev_id: postToReblog.prev_id,
        segments: {
          connect: postToReblog.segments,
          create: {
            author_id: req.user.id,
            content: req.body.content,
            post_type: req.body.type,
          },
        },
        tags: {
          connectOrCreate: postTags,
        },
      },
    });

    return res.json({ post_id: reblog.id });
  } catch (e) {
    console.error(e);
    return next(e);
  }
};
