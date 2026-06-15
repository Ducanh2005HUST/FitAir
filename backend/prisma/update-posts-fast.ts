import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany();
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
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const likesUsers = shuffledUsers.slice(0, 5); // 5 likes
    const partsUsers = shuffledUsers.slice(5, 8); // 3 participants
    const commsUsers = shuffledUsers.slice(8, 10); // 2 comments

    await prisma.postLike.createMany({
      data: likesUsers.map(u => ({ postId: post.id, userId: u.id })),
      skipDuplicates: true
    });

    await prisma.postParticipant.createMany({
      data: partsUsers.map(u => ({ postId: post.id, userId: u.id })),
      skipDuplicates: true
    });

    for (const u of commsUsers) {
      const comment = commentsData[Math.floor(Math.random() * commentsData.length)];
      await prisma.postComment.create({
        data: { postId: post.id, userId: u.id, content: comment }
      });
    }
    console.log(`Updated post ${post.id}`);
  }
  console.log("All done");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
