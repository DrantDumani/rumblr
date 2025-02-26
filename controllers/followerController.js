const client = require('../prisma/client');

exports.followUser = async (req, res, next) => {
  try {
    if (Number(req.params.userId) === req.user.id) {
      return res.status(403).json('Forbidden');
    }
    const newFollow = await client.follow.create({
      data: {
        follower_id: req.user.id,
        following_id: Number(req.params.userId),
      },
    });
    return res.json({ followed: newFollow.following_id });
  } catch (e) {
    return next(e);
  }
};

exports.unFollowUser = async (req, res, next) => {
  try {
    const deletedFollow = await client.follow.delete({
      where: {
        follower_id_following_id: {
          follower_id: req.user.id,
          following_id: Number(req.params.userId),
        },
      },
    });

    return res.json({ deleted_follow: deletedFollow.following_id });
  } catch (e) {
    return next(e);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const filterOpts = {
      where: {
        following: {
          some: {
            following_id: req.user.id,
          },
        },
      },
      take: 10,
      select: {
        id: true,
        uname: true,
        pfp: true,
      },
    };

    if (req.body.cursor) {
      filterOpts.cursor = req.body.cursor;
    }
    const followerList = await client.user.findMany(filterOpts);

    return res.json(followerList);
  } catch (e) {
    return next(e);
  }
};
