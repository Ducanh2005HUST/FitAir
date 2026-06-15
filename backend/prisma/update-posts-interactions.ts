import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    throw new Error('No users found');
  }

  // 1. Add 3 new posts
  const newPostsData = [
    { content: "来週の日曜日にフットサルをしませんか？", sport: "フットサル", location: "フットサルコート" },
    { content: "仕事終わりにジムで筋トレする仲間を募集します。", sport: "筋トレ", location: "ジム" },
    { content: "サイクリングに行きましょう！", sport: "サイクリング", location: "ホアンキエム湖" }
  ];

  for (const data of newPostsData) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    await prisma.communityPost.create({
      data: {
        ...data,
        userId: randomUser.id
      }
    });
  }
  console.log("Added 3 new posts.");

  // 2. Add likes, participants, and comments to all posts
  const posts = await prisma.communityPost.findMany();

  const commentsData = [
    "参加したいです！",
    "よろしくお願いします。",
    "楽しみですね！",
    "時間帯は何時頃ですか？",
    "ぜひご一緒させてください！",
    "いいですね！"
  ];

  for (const post of posts) {
    // Add 2-8 likes
    const numLikes = Math.floor(Math.random() * 7) + 2;
    // Add 1-5 participants
    const numParticipants = Math.floor(Math.random() * 5) + 1;
    // Add 1-3 comments
    const numComments = Math.floor(Math.random() * 3) + 1;

    // Shuffle users to pick random ones for likes and participants without duplicates
    const shuffledUsers1 = [...users].sort(() => 0.5 - Math.random());
    const shuffledUsers2 = [...users].sort(() => 0.5 - Math.random());
    
    // Create likes
    for (let i = 0; i < Math.min(numLikes, shuffledUsers1.length); i++) {
      try {
        await prisma.postLike.upsert({
          where: { postId_userId: { postId: post.id, userId: shuffledUsers1[i].id } },
          update: {},
          create: { postId: post.id, userId: shuffledUsers1[i].id }
        });
      } catch(e) {}
    }

    // Create participants
    for (let i = 0; i < Math.min(numParticipants, shuffledUsers2.length); i++) {
      try {
        await prisma.postParticipant.upsert({
          where: { postId_userId: { postId: post.id, userId: shuffledUsers2[i].id } },
          update: {},
          create: { postId: post.id, userId: shuffledUsers2[i].id }
        });
      } catch(e) {}
    }

    // Create comments
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = commentsData[Math.floor(Math.random() * commentsData.length)];
      await prisma.postComment.create({
        data: {
          postId: post.id,
          userId: randomUser.id,
          content: randomComment
        }
      });
    }
    console.log(`Added interactions for post ${post.id}`);
  }

  console.log("Finished updating post interactions.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
