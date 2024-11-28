const client = require('../prisma/client');
const { Prisma } = require('@prisma/client');

exports.createReply = async (req, res, next) => {
  try {
    const reply = await client.reply.create({
      data: {
        author_id: req.user.id,
        content: req.body.content,
        post_id: Number(req.params.postId),
      },
    });

    return res.json({ reply_id: reply.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError)
      return res.status(400).json('Bad Request');
    return next(e);
  }
};

exports.deleteReply = async (req, res, next) => {
  try {
    const replyToDelete = await client.reply.delete({
      where: {
        author_id: req.user.id,
        id: Number(req.params.replyId),
      },
    });

    return res.json({ deleted_id: replyToDelete.id });
  } catch (e) {
    if (e.code === 'P2025') return res.status(403).json('Forbidden');
    return next(e);
  }
};

exports.getReplies = async (req, res, next) => {
  try {
    const filterOpts = {
      take: 10,
      orderBy: {
        id: 'desc',
      },
    };
    if (req.body.cursor) {
      filterOpts.cursor = req.body.cursor;
    }
    const replies = await client.reply.findMany(filterOpts);
    return res.json(replies);
  } catch (e) {
    return next(e);
  }
};
