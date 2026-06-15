import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.communityPost.findMany({
    where: {
      content: {
        contains: "サイクリングに行きましょう！"
      }
    }
  });

  if (posts.length > 0) {
    for (const post of posts) {
      await prisma.communityPost.delete({
        where: { id: post.id }
      });
      console.log(`Deleted post ${post.id}`);
    }
  } else {
    console.log("Post not found");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
