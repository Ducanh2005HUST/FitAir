import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Keep seed minimal: no demo spots or demo users.
  // Populate indoor videos (safe to run multiple times).
  await prisma.indoorVideo.createMany({
    data: [
      // Yoga
      {
        id: 'yoga-01',
        titleJp: '初心者ヨガ（全身）',
        titleVn: 'Yoga cho người mới (toàn thân)',
        youtubeUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
        category: 'yoga',
        level: 'easy',
        duration: '20:00',
        calories: 120,
        instructor: 'Yoga With Adriene',
        description: 'Beginner-friendly full body yoga.',
      },
      {
        id: 'yoga-02',
        titleJp: '朝ヨガ（リフレッシュ）',
        titleVn: 'Yoga buổi sáng (tỉnh táo)',
        youtubeUrl: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        category: 'yoga',
        level: 'easy',
        duration: '10:00',
        calories: 60,
        instructor: 'Yoga With Adriene',
        description: 'Quick morning flow.',
      },
      {
        id: 'yoga-03',
        titleJp: 'リラックスヨガ（ストレス解消）',
        titleVn: 'Yoga thư giãn (giảm stress)',
        youtubeUrl: 'https://www.youtube.com/watch?v=Yzm3fA2HhkQ',
        category: 'yoga',
        level: 'easy',
        duration: '15:00',
        calories: 80,
        instructor: 'Yoga With Adriene',
        description: 'Relaxing yoga session.',
      },

      // Stretch
      {
        id: 'stretch-01',
        titleJp: '全身ストレッチ（10分）',
        titleVn: 'Giãn cơ toàn thân (10 phút)',
        youtubeUrl: 'https://www.youtube.com/watch?v=2pLT-olgUJs',
        category: 'stretch',
        level: 'easy',
        duration: '10:00',
        calories: 50,
        instructor: 'YouTube',
        description: 'Starter stretch routine.',
      },
      {
        id: 'stretch-02',
        titleJp: '首・肩ストレッチ',
        titleVn: 'Giãn cơ cổ & vai',
        youtubeUrl: 'https://www.youtube.com/watch?v=SedzswEwpPw',
        category: 'stretch',
        level: 'easy',
        duration: '10:00',
        calories: 30,
        instructor: 'YouTube',
        description: 'Neck/shoulder relief.',
      },
      {
        id: 'stretch-03',
        titleJp: '股関節ストレッチ',
        titleVn: 'Giãn cơ hông',
        youtubeUrl: 'https://www.youtube.com/watch?v=Ho9em79_0qg',
        category: 'stretch',
        level: 'easy',
        duration: '12:00',
        calories: 40,
        instructor: 'YouTube',
        description: 'Hip mobility & stretch.',
      },

      // Cardio (Aerobic)
      {
        id: 'cardio-01',
        titleJp: '室内有酸素（15分）',
        titleVn: 'Cardio trong nhà (15 phút)',
        youtubeUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
        category: 'cardio',
        level: 'medium',
        duration: '15:00',
        calories: 150,
        instructor: 'YouTube',
        description: 'No equipment cardio.',
      },
      {
        id: 'cardio-02',
        titleJp: '脂肪燃焼HIIT（10分）',
        titleVn: 'HIIT đốt mỡ (10 phút)',
        youtubeUrl: 'https://www.youtube.com/watch?v=iee2TATGMyI',
        category: 'cardio',
        level: 'hard',
        duration: '10:00',
        calories: 140,
        instructor: 'YouTube',
        description: 'Short HIIT session.',
      },
      {
        id: 'cardio-03',
        titleJp: '低負荷有酸素（初心者）',
        titleVn: 'Cardio nhẹ (người mới)',
        youtubeUrl: 'https://www.youtube.com/watch?v=IT94xC35u6k',
        category: 'cardio',
        level: 'easy',
        duration: '20:00',
        calories: 140,
        instructor: 'YouTube',
        description: 'Low impact cardio.',
      },

      // Strength (Muscle training)
      {
        id: 'strength-01',
        titleJp: '自重筋トレ（全身）',
        titleVn: 'Tập cơ không dụng cụ (toàn thân)',
        youtubeUrl: 'https://www.youtube.com/watch?v=UItWltVZZmE',
        category: 'strength',
        level: 'medium',
        duration: '20:00',
        calories: 160,
        instructor: 'YouTube',
        description: 'Bodyweight full body.',
      },
      {
        id: 'strength-02',
        titleJp: '腹筋（10分）',
        titleVn: 'Cơ bụng (10 phút)',
        youtubeUrl: 'https://www.youtube.com/watch?v=AnYl6Nk9GOA',
        category: 'strength',
        level: 'medium',
        duration: '10:00',
        calories: 120,
        instructor: 'YouTube',
        description: 'Core workout.',
      },
      {
        id: 'strength-03',
        titleJp: '下半身（脚・お尻）',
        titleVn: 'Thân dưới (chân & mông)',
        youtubeUrl: 'https://www.youtube.com/watch?v=2MoGxae-zyo',
        category: 'strength',
        level: 'medium',
        duration: '15:00',
        calories: 150,
        instructor: 'YouTube',
        description: 'Legs & glutes.',
      },
    ],
    skipDuplicates: true,
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
