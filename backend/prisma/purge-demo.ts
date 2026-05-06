import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.spot.deleteMany({
    where: {
      OR: [
        { source: 'demo' },
        { id: { startsWith: 'Hoàn Kiếm-' } },
        { id: { startsWith: 'Hai Bà Trưng-' } },
        { id: { startsWith: 'Đống Đa-' } },
      ],
    },
  });

  const userRes = await prisma.user.deleteMany({
    where: { email: 'demo@fitair.local' },
  });

  // eslint-disable-next-line no-console
  console.log('Deleted demo spots:', res.count);
  // eslint-disable-next-line no-console
  console.log('Deleted demo users:', userRes.count);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

