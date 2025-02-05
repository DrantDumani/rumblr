const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const shantae = await prisma.user.upsert({
    where: {
      email: 'genie@scuttletown.com',
    },
    update: {
      email: 'genie@scuttletown.com',
      uname: 'Half Genie Hero',
      pw: await bcrypt.hash('WayForward', 10),
      about: 'Half genie guardian of Scuttletown! Risky Boots, DNI',
    },
    create: {
      email: 'genie@scuttletown.com',
      uname: 'Half Genie Hero',
      pw: await bcrypt.hash('WayForward', 10),
      about: 'Half genie guardian of Scuttletown! Risky Boots, DNI',
    },
  });

  const risky = await prisma.user.upsert({
    where: {
      email: 'piratequeen@seas.com',
    },
    update: {
      email: 'piratequeen@seas.com',
      uname: 'Pirate Queen',
      pw: await bcrypt.hash('SteamPower', 10),
      about:
        "Who am I? I'm Risky Boots, queen of the Seven Seas, and anyone who opposes me will be crushed flat!",
    },
    create: {
      email: 'piratequeen@seas.com',
      uname: 'Pirate Queen',
      pw: await bcrypt.hash('SteamPower', 10),
      about:
        "Who am I? I'm Risky Boots, queen of the Seven Seas, and anyone who opposes me will be crushed flat!",
    },
  });

  const rotty = await prisma.user.upsert({
    where: {
      email: 'rottytops@brains.com',
    },
    update: {
      email: 'rottytops@brains.com',
      uname: 'Rotty Tops',
      pw: await bcrypt.hash('ZombieCaravan', 10),
      about: 'I like brains',
    },
    create: {
      email: 'rottytops@brains.com',
      uname: 'Rotty Tops',
      pw: await bcrypt.hash('ZombieCaravan', 10),
      about: 'I like brains',
    },
  });

  // shantae follows risky
  await prisma.follow.upsert({
    where: {
      follower_id_following_id: {
        follower_id: shantae.id,
        following_id: risky.id,
      },
    },
    update: {},
    create: {
      follower_id: shantae.id,
      following_id: risky.id,
    },
  });

  // shantae follows rotty
  await prisma.follow.upsert({
    where: {
      follower_id_following_id: {
        follower_id: shantae.id,
        following_id: rotty.id,
      },
    },
    update: {},
    create: {
      follower_id: shantae.id,
      following_id: rotty.id,
    },
  });

  // rotty follows shantae
  await prisma.follow.upsert({
    where: {
      follower_id_following_id: {
        follower_id: rotty.id,
        following_id: shantae.id,
      },
    },
    update: {},
    create: {
      // follower_id_following_id: {
      follower_id: rotty.id,
      following_id: shantae.id,
      // },
    },
  });

  await prisma.post.deleteMany({});
  await prisma.segment.deleteMany({});

  await prisma.post.create({
    data: {
      author_id: shantae.id,
      created_at: new Date(1735361053167),
      segments: {
        create: {
          content: 'Ret-2-Go!',
          created_at: new Date(1735361053167),
          author_id: shantae.id,
        },
      },
      tags: {
        connectOrCreate: {
          where: {
            content: 'Scuttletown Hero',
          },
          create: {
            content: 'Scuttletown Hero',
          },
        },
      },
      likes: {
        connect: {
          id: rotty.id,
        },
      },
    },
  });

  const riskyPost = await prisma.post.create({
    data: {
      author_id: risky.id,
      created_at: new Date(1735000000000),
      tags: {
        connectOrCreate: {
          where: {
            content: 'Pirate Queen',
          },
          create: {
            content: 'Pirate Queen',
          },
        },
      },
    },
  });

  const riskySegment = await prisma.segment.create({
    data: {
      author_id: risky.id,
      content: 'Men!! Spank this one extra hard for mommy!',
      created_at: new Date(1735000000000),
      posts: {
        connect: {
          id: riskyPost.id,
        },
      },
    },
  });

  await prisma.post.create({
    data: {
      author_id: shantae.id,
      parent_id: riskyPost.id,
      prev_id: riskyPost.id,
      created_at: new Date(1735100000000),
      segments: {
        connect: {
          id: riskySegment.id,
        },
        create: {
          author_id: shantae.id,
          content: "Ugh...it's Risky Boots.",
          created_at: new Date(1735110000000),
        },
      },
      tags: {
        connectOrCreate: {
          where: {
            content: "I'll stop her!",
          },
          create: {
            content: "I'll stop her!",
          },
        },
      },
    },
  });

  await prisma.post.create({
    data: {
      author_id: rotty.id,
      created_at: new Date(1735220000000),
      segments: {
        create: {
          author_id: rotty.id,
          content: 'Shantae has the biggest brain',
          created_at: new Date(1735220000000),
        },
      },
      replies: {
        create: {
          author_id: shantae.id,
          content: "I hope you're just talking about me being smart...",
        },
      },
      likes: {
        connect: {
          id: shantae.id,
        },
      },
      tags: {
        connectOrCreate: {
          create: {
            content: 'I love Shantae',
          },
          where: {
            content: 'I love Shantae',
          },
        },
      },
    },
  });

  await prisma.dm.create({
    data: {
      user1_id: shantae.id,
      user2_id: rotty.id,
      content: 'Come over for dinner!',
      sender_id: rotty.id,
      created_at: new Date(1735200000000),
    },
  });

  await prisma.dm.create({
    data: {
      user1_id: shantae.id,
      user2_id: rotty.id,
      content: 'No',
      sender_id: shantae.id,
      created_at: new Date(1735220000000),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
