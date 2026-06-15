import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany();
  
  const kanjiNames = [
    '佐藤', '鈴木', '高橋', '田中', '伊藤', 
    '渡辺', '山本', '中村', '小林', '加藤', 
    '吉田', '山田', '清水', '松本', '井上', 
    '木村', '林', '斎藤', '山口', '森'
  ];
  
  for (const user of users) {
    const name = user.name;
    // Check if name has Latin, numbers, Vietnamese characters, or Katakana
    const hasLatin = /[a-zA-Z0-9]/.test(name);
    const hasVietnamese = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ]/.test(name);
    const hasKatakana = /[\u30A0-\u30FF]/.test(name);
    
    if (hasLatin || hasVietnamese || hasKatakana || name === 'hehehe' || name === 'test' || name === 'ズン') {
      const newName = kanjiNames[Math.floor(Math.random() * kanjiNames.length)];
      await prisma.user.update({
        where: { id: user.id },
        data: { name: newName }
      });
      console.log(`Updated user ${user.email}: ${name} -> ${newName}`);
    }
  }
  
  console.log('Finished fixing names.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  });
