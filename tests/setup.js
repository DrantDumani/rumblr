const client = require('../prisma/client');
const bcrypt = require('bcrypt');

// initialize test database
// make two users. UserA follows UserB. UserB creates two posts
module.exports = async () => {
  const [userA, userB] = await Promise.all([
    client.user.create({
      data: {
        uname: 'userA',
        pw: await bcrypt.hash('1', 10),
        email: 'a@mail.com',
      },
    }),
    client.user.create({
      data: {
        uname: 'userB',
        pw: await bcrypt.hash('1', 10),
        email: 'b@mail.com',
      },
    }),
  ]);

  await client.post.create({
    data: {
      author_id: userA.id,
      segments: {
        create: [
          {
            author_id: userA.id,
            content: 'Void Lord Add',
          },
          {
            author_id: userB.id,
            content: 'Void Lord Bee',
          },
        ],
      },
    },
  });

  await client.follow.create({
    data: {
      follower_id: userB.id,
      following_id: userA.id,
    },
  });

  const firstUser = userA.id > userB.id ? userB : userA;
  const secondUser = firstUser === userA ? userB : userA;
  await client.dm.createMany({
    data: [
      {
        user1_id: firstUser.id,
        user2_id: secondUser.id,
        content: 'Bubbles',
        sender_id: userA.id,
      },
      {
        user1_id: firstUser.id,
        user2_id: secondUser.id,
        content: 'Blossom',
        sender_id: userB.id,
      },
      {
        user1_id: firstUser.id,
        user2_id: secondUser.id,
        content: 'Buttercup',
        sender_id: userB.id,
      },
    ],
  });
};
