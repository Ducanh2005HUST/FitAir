import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.communityPost.findMany({
    include: {
      likes: true,
      participants: true,
      comments: true,
    }
  });
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
