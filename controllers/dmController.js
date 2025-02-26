const client = require('../prisma/client');

exports.sendDM = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const receiverId = Number(req.params.userId);

    const id1 = senderId > receiverId ? receiverId : senderId;
    const id2 = id1 === senderId ? receiverId : senderId;
    const msg = await client.dm.create({
      data: {
        user1_id: id1,
        user2_id: id2,
        sender_id: senderId,
        content: req.body.content,
      },
    });

    return res.json({ msg_id: msg.id });
  } catch (e) {
    return next(e);
  }
};

exports.getDms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = Number(req.params.userId);

    const id1 = userId > otherUserId ? otherUserId : userId;
    const id2 = id1 === userId ? otherUserId : userId;

    const filterOpts = {
      where: {
        user1_id: id1,
        user2_id: id2,
      },
      orderBy: {
        id: 'desc',
      },
      take: 10,
    };

    if (req.query.cursor) {
      filterOpts.cursor = { id: Number(req.query.cursor) };
      filterOpts.take = -filterOpts.take;
      filterOpts.skip = 1;
    }

    const dms = await client.dm.findMany(filterOpts);

    return res.json(dms);
  } catch (e) {
    console.error(e);
    return next(e);
  }
};
