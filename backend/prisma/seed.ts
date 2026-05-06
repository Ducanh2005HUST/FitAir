import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Keep seed minimal: no demo spots or demo users.
  // Populate some indoor videos only if none exist, so the indoor popup can work.
  const existingVideoCount = await prisma.indoorVideo.count();
  if (existingVideoCount === 0) {
    await prisma.indoorVideo.createMany({
      data: [
        {
          id: 'stretch-10m-1',
          titleJp: '全身ストレッチ',
          titleVn: 'Giãn cơ toàn thân',
          youtubeUrl: 'https://www.youtube.com/watch?v=2pLT-olgUJs',
          category: 'stretch',
          level: 'easy',
          duration: '10:00',
          calories: 50,
          instructor: 'YouTube',
          description: 'Starter stretch routine.',
        },
      ],
      skipDuplicates: true,
    });
  }
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
