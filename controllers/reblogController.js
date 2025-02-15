const client = require('../prisma/client');
const { handleUpload } = require('../utils/cloudinary');

exports.reblogPost = async (req, res, next) => {
  try {
    const postToReblog = await client.post.findUnique({
      where: {
        id: Number(req.params.postId),
        isDeleted: false,
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

    const newPost = {
      data: {
        author_id: req.user.id,
        parent_id: postToReblog.parent_id || postToReblog.id,
        prev_id: postToReblog.id,
        segments: {
          connect: postToReblog.segments,
        },
        tags: {
          connectOrCreate: postTags,
        },
      },
    };

    if (req.body.content) {
      newPost.data.segments.create = {
        author_id: req.user.id,
        content: req.body.content,
        post_type: req.body.type,
      };
    }

    const reblog = await client.post.create(newPost);

    return res.json({ post_id: reblog.id });
  } catch (e) {
    console.error(e);
    return next(e);
  }
};

exports.reblogPostWithMedia = async (req, res, next) => {
  try {
    if (req.file) {
      let resource_type = '';
      if (req.body.type === 'photo') resource_type = 'image';
      else resource_type = 'video';

      const fileURL = await handleUpload(req.file, resource_type);

      const postToReblog = await client.post.findUnique({
        where: {
          id: Number(req.params.postId),
          isDeleted: false,
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

      const postTags = req.body.tags.map((t) => ({
        where: { content: t },
        create: { content: t },
      }));

      const newPost = {
        data: {
          author_id: req.user.id,
          parent_id: postToReblog.parent_id || postToReblog.id,
          prev_id: postToReblog.id,
          segments: {
            connect: postToReblog.segments,
            create: {
              author_id: req.user.id,
              content: fileURL,
              post_type: req.body.type,
            },
          },
          tags: {
            connectOrCreate: postTags,
          },
        },
      };

      const reblog = await client.post.create(newPost);

      return res.json({ post_id: reblog.id });
    }
  } catch (e) {
    return next(e);
  }
};
