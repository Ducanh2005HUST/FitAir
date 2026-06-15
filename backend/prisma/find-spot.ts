import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const spots = await prisma.spot.findMany({
    where: {
      OR: [
        { name: { contains: 'Thong Nhat' } },
        { name: { contains: 'Thống Nhất' } },
        { address: { contains: '354A' } }
      ]
    }
  });
  console.log(JSON.stringify(spots, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
