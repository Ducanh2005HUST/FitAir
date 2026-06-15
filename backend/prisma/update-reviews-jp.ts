import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const japaneseComments = [
  "素晴らしい場所です！",
  "とてもいいところです。",
  "また来たいです。",
  "トレーニングに最適です。",
  "設備が整っています。",
  "清潔で使いやすいです。",
  "雰囲気が良いです。",
  "スタッフが親切です。"
];

async function main() {
  // Find the reviewer user we created or use first user
  let user = await prisma.user.findFirst({
    where: { email: 'reviewer@fitair.com' }
  });
  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    throw new Error('No user found to write reviews.');
  }

  // Create two more users so we have 3 distinct reviewers
  let user2 = await prisma.user.findFirst({ where: { email: 'reviewer2@fitair.com' } });
  if (!user2) {
    user2 = await prisma.user.create({ data: { email: 'reviewer2@fitair.com', name: 'Sato' } });
  }
  let user3 = await prisma.user.findFirst({ where: { email: 'reviewer3@fitair.com' } });
  if (!user3) {
    user3 = await prisma.user.create({ data: { email: 'reviewer3@fitair.com', name: 'Suzuki' } });
  }

  const reviewers = [user.id, user2.id, user3.id];

  // Find spots that we updated earlier (they have the comment 'Good place for workout!')
  const reviewsToDelete = await prisma.spotReview.findMany({
    where: {
      comment: 'Good place for workout!'
    },
    select: {
      spotId: true
    }
  });

  const spotIdsToUpdate = [...new Set(reviewsToDelete.map(r => r.spotId))];
  
  console.log(`Found ${spotIdsToUpdate.length} spots to update.`);

  // Delete the old English reviews
  await prisma.spotReview.deleteMany({
    where: {
      comment: 'Good place for workout!'
    }
  });

  for (const spotId of spotIdsToUpdate) {
    let totalRating = 0;
    
    // Add 3 reviews per spot
    for (let i = 0; i < 3; i++) {
      const rating = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
      totalRating += rating;
      
      const randomComment = japaneseComments[Math.floor(Math.random() * japaneseComments.length)];
      const reviewerId = reviewers[i % reviewers.length];

      await prisma.spotReview.create({
        data: {
          spotId: spotId,
          userId: reviewerId,
          rating: rating,
          comment: randomComment,
        }
      });
    }

    const avgRating = totalRating / 3;

    // Update the spot's average rating and review count
    await prisma.spot.update({
      where: { id: spotId },
      data: {
        avgRating: avgRating,
        reviewCount: 3,
      }
    });
    console.log(`Updated spot ${spotId} with 3 Japanese reviews. New avg: ${avgRating.toFixed(1)}`);
  }

  console.log('Finished updating reviews to Japanese.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
