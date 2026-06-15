import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Starting data update...");

  // 1. Delete all community posts
  await prisma.communityPost.deleteMany();
  console.log("Deleted all community posts.");

  // 2. Add Japanese community posts with Japanese user names (Kanji)
  const jpPostersData = [
    { email: 'jp_poster1@fitair.com', name: '田中' },
    { email: 'jp_poster2@fitair.com', name: '山本' },
    { email: 'jp_poster3@fitair.com', name: '中村' }
  ];

  const jpPosters = [];
  for (const data of jpPostersData) {
    let user = await prisma.user.findFirst({ where: { email: data.email } });
    if (!user) {
      user = await prisma.user.create({ data });
    } else {
      user = await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });
    }
    jpPosters.push(user);
  }

  const posts = [
    { content: "週末に一緒にランニングしませんか？", sport: "ランニング", location: "代々木公園" },
    { content: "バスケットボールのメンバーを募集しています！", sport: "バスケットボール", location: "渋谷区" },
    { content: "初心者歓迎のヨガクラスです。", sport: "ヨガ", location: "新宿" }
  ];

  for (let i = 0; i < posts.length; i++) {
    await prisma.communityPost.create({
      data: {
        ...posts[i],
        userId: jpPosters[i % jpPosters.length].id
      }
    });
  }
  console.log("Added Japanese community posts.");

  // 3. Update reviewer names to Japanese (Kanji/Kana, no Romaji)
  // Looking for names like Sato, Suzuki, E2E, Reviewer, etc.
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    let newName = null;
    const currentName = user.name.toLowerCase();
    
    if (currentName.includes('sato')) {
      newName = '佐藤';
    } else if (currentName.includes('suzuki')) {
      newName = '鈴木';
    } else if (currentName.includes('e2e')) {
      newName = '伊藤';
    } else if (currentName.includes('reviewer')) {
      newName = '高橋';
    } else if (currentName === 'hehehe' || currentName === 'test') {
      // Just in case there are other test users like "hehehe" in image 1
      newName = '渡辺';
    }

    if (newName && user.name !== newName) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: newName }
      });
      console.log(`Updated user ${user.email} name from ${user.name} to ${newName}`);
    }
  }

  console.log("Finished updating reviewer names to Japanese.");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
