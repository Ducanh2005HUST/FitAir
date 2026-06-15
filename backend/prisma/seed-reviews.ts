import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find a user or create a dummy user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'reviewer@fitair.com',
        name: 'FitAir Reviewer',
      }
    });
  }

  // Find all spots with 0 reviews
  const spots = await prisma.spot.findMany({
    where: {
      OR: [
        { reviewCount: 0 },
        { avgRating: 0 }
      ]
    }
  });

  console.log(`Found ${spots.length} spots with 0 reviews/rating.`);

  for (const spot of spots) {
    // Generate a random rating between 3 and 5 (inclusive)
    const rating = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5

    // Create a review
    await prisma.spotReview.create({
      data: {
        spotId: spot.id,
        userId: user.id,
        rating: rating,
        comment: 'Good place for workout!',
      }
    });

    // Update the spot's average rating and review count
    await prisma.spot.update({
      where: { id: spot.id },
      data: {
        avgRating: rating,
        reviewCount: 1,
      }
    });
    console.log(`Updated spot ${spot.name} with rating ${rating}`);
  }

  console.log('Finished adding reviews.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
