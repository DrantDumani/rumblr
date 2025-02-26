const client = require('../prisma/client');

module.exports = async () => {
  await client.follow.deleteMany({});
  await client.likesOnPost.deleteMany({});
  await client.dm.deleteMany({});
  await client.post.deleteMany({});
  await client.segment.deleteMany({});
  await client.tag.deleteMany({});
  await client.user.deleteMany({});
};
