import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all reviews...');
  const allReviews = await prisma.spotReview.findMany();

  // Group by spotId + userId
  const groupedReviews: Record<string, typeof allReviews> = {};

  for (const review of allReviews) {
    const key = `${review.spotId}_${review.userId}`;
    if (!groupedReviews[key]) {
      groupedReviews[key] = [];
    }
    groupedReviews[key].push(review);
  }

  const reviewIdsToDelete: string[] = [];
  const affectedSpotIds = new Set<string>();

  for (const [key, reviews] of Object.entries(groupedReviews)) {
    if (reviews.length > 1) {
      // Sort by rating desc, then createdAt desc
      reviews.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating; // Highest rating first
        }
        return b.createdAt.getTime() - a.createdAt.getTime(); // Newest first if tied
      });

      // Keep the first one, mark others for deletion
      const reviewsToDrop = reviews.slice(1);
      for (const r of reviewsToDrop) {
        reviewIdsToDelete.push(r.id);
        affectedSpotIds.add(r.spotId);
      }
    }
  }

  if (reviewIdsToDelete.length === 0) {
    console.log('No duplicate reviews found.');
    return;
  }

  console.log(`Found ${reviewIdsToDelete.length} duplicate reviews to delete across ${affectedSpotIds.size} spots.`);

  // Delete duplicate reviews
  const deleteResult = await prisma.spotReview.deleteMany({
    where: {
      id: {
        in: reviewIdsToDelete,
      },
    },
  });

  console.log(`Deleted ${deleteResult.count} reviews.`);

  // Recalculate avgRating and reviewCount for affected spots
  console.log('Recalculating ratings for affected spots...');
  for (const spotId of affectedSpotIds) {
    const spotReviews = await prisma.spotReview.findMany({
      where: { spotId },
      select: { rating: true },
    });

    const count = spotReviews.length;
    let avg = 0;
    if (count > 0) {
      const sum = spotReviews.reduce((acc, r) => acc + r.rating, 0);
      avg = sum / count;
    }

    await prisma.spot.update({
      where: { id: spotId },
      data: {
        reviewCount: count,
        avgRating: avg,
      },
    });
  }

  console.log('Done recalculating ratings.');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
