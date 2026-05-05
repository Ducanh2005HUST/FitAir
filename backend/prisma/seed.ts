import 'dotenv/config';
import { PrismaClient, SpotType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const demoEmail = 'demo@fitair.local';
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: { email: demoEmail, name: 'Demo User', passwordHash },
  });

  const spots = [
    {
      name: 'Hồ Gươm (Outdoor Run)',
      address: 'Hoàn Kiếm, Hà Nội',
      district: 'Hoàn Kiếm',
      lat: 21.028511,
      lng: 105.852019,
      type: SpotType.outdoor,
      sports: ['running', 'walking'],
      facilities: ['toilet', 'water'],
      price: 'free',
      hours: '24/7',
      imageUrls: [],
    },
    {
      name: 'Công viên Thống Nhất',
      address: 'Hai Bà Trưng, Hà Nội',
      district: 'Hai Bà Trưng',
      lat: 21.0128,
      lng: 105.8412,
      type: SpotType.outdoor,
      sports: ['running', 'cycling'],
      facilities: ['water'],
      price: 'free',
      hours: '05:00-22:00',
      imageUrls: [],
    },
    {
      name: 'Gym Indoor (Demo)',
      address: 'Đống Đa, Hà Nội',
      district: 'Đống Đa',
      lat: 21.023,
      lng: 105.823,
      type: SpotType.indoor,
      sports: ['gym', 'yoga'],
      facilities: ['parking', 'shower'],
      price: 'paid',
      hours: '06:00-22:00',
      imageUrls: [],
    },
  ];

  for (const s of spots) {
    await prisma.spot.upsert({
      where: { id: `${s.district ?? 'HN'}-${s.name}` },
      update: {},
      create: {
        id: `${s.district ?? 'HN'}-${s.name}`,
        ...s,
      },
    });
  }

  await prisma.indoorVideo.upsert({
    where: { id: 'demo-video-1' },
    update: {},
    create: {
      id: 'demo-video-1',
      titleJp: '全身ストレッチ (Demo)',
      titleVn: 'Giãn cơ toàn thân (Demo)',
      youtubeUrl: 'https://www.youtube.com/watch?v=2pLT-olgUJs',
      category: 'stretch',
      level: 'easy',
      duration: '10:00',
      calories: 50,
      instructor: 'Demo',
      description: 'Demo video for MVP scaffold.',
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
