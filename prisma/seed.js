const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  await reset();
  const [Ganondorf, Hilda, Link, Yuga, Tetra, Shantae] = await Promise.all([
    createUser(
      'king@gerudo.com',
      'Great King of Evil',
      'DemiseSky',
      'https://res.cloudinary.com/almagorge/image/upload/v1740523757/totk_dorf_wnteid.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740523757/OoT3D_Ganon_s_Castle_ii5lxx.png',
      "Great King of Evil. Hyrule's Scourge and Calamity. Claimer of the triforce of courage. Hyrule will be mine. And then the whole world will bow before me!"
    ),
    createUser(
      'hergrace@lorule.com',
      'Lorule Princess',
      'HyruleEnvy',
      'https://res.cloudinary.com/almagorge/image/upload/v1740538924/Hilda_d9ju1i.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740538924/loruleCastle_ellg0y.png',
      'Princess of Lorule. The fault of this dwindling kingdom lies with me. I have failed my people in every way.'
    ),
    createUser(
      'hero@hyrule.com',
      "Zelda's Knight",
      'MiphasGrace',
      'https://res.cloudinary.com/almagorge/image/upload/v1740542507/Link_j5mvgt.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740542507/ALttP_Link_s_House_t98l5z.webp',
      ''
    ),
    createUser(
      'painter@lorule.com',
      'Peerless Painter',
      'disobedience',
      'https://res.cloudinary.com/almagorge/image/upload/v1740545268/Yuga_uql8xl.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740545268/YugaGanon_kx2e01.webp',
      'Sorcerer of Lorule. My name is Yuga. And I have come here seeking nothing less than... perfection.'
    ),
    createUser(
      'pirate@ocean.com',
      'Miss Tetra',
      'SheikIscool',
      'https://res.cloudinary.com/almagorge/image/upload/v1740546513/Tetra_zc2teh.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740546513/LinkBarrelCatapult_a5oukf.png',
      'Captain of this ship'
    ),
    createUser(
      'genie@scuttletown.com',
      'Half Genie Hero',
      'WayForward',
      'https://res.cloudinary.com/almagorge/image/upload/v1740029471/wuln8n4vp5gohxjdlitt.png',
      'https://res.cloudinary.com/almagorge/image/upload/v1740027859/vs3ytpoqkxisqam86t79.webp',
      'Half Genie Guardian of Scuttletown. Risky Boots DNI'
    ),
  ]);

  await Promise.all([
    followUser(Yuga.id, Ganondorf.id),
    followUser(Yuga.id, Hilda.id),
  ]);

  await Promise.all([
    createTag('Gerudo King'),
    createTag('Hyrule'),
    createTag('Sky'),
    createTag('Bolo'),
    createTag('Rottytops'),
    createTag('Friends to the end'),
    createTag('Lorule'),
    createTag('Her Grace'),
    createTag('true beuaty'),
    createTag('my art'),
    createTag('masterpiece'),
    createTag('Great Sea'),
    createTag('Soon...'),
  ]);

  const [totkPost, wwPost, geniePost, hildaPost, yugaPost] = await Promise.all([
    createPost(
      Ganondorf.id,
      'quote',
      "Do not look away. You witness a king's revival. And the birth of his new world",
      ['Gerudo King', 'Hyrule']
    ),
    createPost(
      Ganondorf.id,
      'text',
      'This is foolishness...A future? For you?',
      ['Hyrule', 'Gerudo King']
    ),
    createPost(
      Shantae.id,
      'chat',
      `Bolo: If it'll help Shantae, I'll go.
      
      Sky: Ha ha, you?
      
      Sky: No offense, Bolo. But we're trying to save her. Not make things worse`,
      ['Sky', 'Bolo', 'Rottytops', 'Friends to the end']
    ),
    createPost(Hilda.id, 'text', 'Hey', ['Lorule', 'Hyrule']),
    createPost(
      Yuga.id,
      'photo',
      'https://res.cloudinary.com/almagorge/image/upload/v1740549104/ALBW_Zelda_Portrait_hf9ysu.webp',
      ['Her Grace', 'true beuaty', 'my art', 'masterpiece']
    ),
  ]);

  const [tetraReblog, linkReblog, yugaReblog] = await Promise.all([
    reblogPost(
      wwPost,
      Tetra.id,
      'text',
      "What are you laughing at, Ganondorf? You're insane!",
      ['Hyrule', 'Great Sea']
    ),
    reblogPost(hildaPost, Link.id, 'text', 'HYAAA!', ['Lorule', 'Hyrule']),
    reblogPost(hildaPost, Yuga.id, 'text', 'Our princess truly is the finest', [
      'Lorule',
      'Soon...',
    ]),
  ]);

  await Promise.all([
    createReply(linkReblog, Shantae.id, "You guys don't talk much, do you?"),
    createReply(
      totkPost,
      Yuga.id,
      'There is something truly beautiful about you...'
    ),
  ]);

  await Promise.all([
    createLikes(Link.id, tetraReblog),
    createLikes(Link.id, geniePost),
    createLikes(Link.id, hildaPost),
  ]);
}

async function reset() {
  await Promise.all([
    prisma.likesOnPost.deleteMany({}),
    prisma.tag.deleteMany({}),
    prisma.reply.deleteMany({}),
    prisma.follow.deleteMany({}),
    prisma.dm.deleteMany({}),
  ]);

  await prisma.post.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.user.deleteMany({});
}

async function createUser(email, uname, pw, pfp, h_img, about) {
  const user = await prisma.user.create({
    data: {
      email: email,
      uname: uname,
      pw: await bcrypt.hash(pw, 10),
      about: about,
      pfp: pfp,
      h_img: h_img,
    },
  });

  return user;
}

async function followUser(follower_id, following_id) {
  await prisma.follow.create({
    data: {
      follower_id: follower_id,
      following_id: following_id,
    },
  });
}

async function createPost(authorId, segType, segContent, tags) {
  try {
    const tagMap = tags.map((t) => ({
      where: { content: t },
      create: { content: t },
    }));

    const post = await prisma.post.create({
      data: {
        author_id: authorId,
        segments: {
          create: {
            author_id: authorId,
            post_type: segType,
            content: segContent,
          },
        },
        tags: {
          connectOrCreate: tagMap,
        },
      },
    });

    return post;
  } catch (e) {
    if (e.code === 'P2002') {
      createPost(authorId, segType, segContent, tags);
    }
  }
}

async function reblogPost(prevPost, authorId, segType, segContent, tags) {
  try {
    const tagMap = tags.map((t) => ({
      where: { content: t },
      create: { content: t },
    }));

    const postSegments = await prisma.segment.findMany({
      where: {
        posts: {
          some: {
            id: prevPost.id,
          },
        },
      },
      select: { id: true },
      orderBy: {
        id: 'asc',
      },
    });

    const rebloggedPost = await prisma.post.create({
      data: {
        author_id: authorId,
        parent_id: prevPost.parent_id || prevPost.id,
        prev_id: prevPost.id,
        segments: {
          connect: postSegments,
          create: {
            author_id: authorId,
            post_type: segType,
            content: segContent,
          },
        },
        tags: {
          connectOrCreate: tagMap,
        },
      },
    });

    return rebloggedPost;
  } catch (e) {
    if (e.code === 'P2002') {
      reblogPost(prevPost, authorId, segType, segContent, tags);
    }
  }
}

async function createReply(post, authorId, content) {
  await prisma.reply.create({
    data: {
      author_id: authorId,
      content: content,
      post_id: post.parent_id || post.id,
    },
  });
}

async function createLikes(userId, post) {
  await prisma.likesOnPost.create({
    data: {
      user_id: userId,
      post_id: post.parent_id || post.id,
      parent_id: post.parent_id || post.id,
    },
  });
}

async function createTag(tag) {
  await prisma.tag.create({
    data: {
      content: tag,
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
