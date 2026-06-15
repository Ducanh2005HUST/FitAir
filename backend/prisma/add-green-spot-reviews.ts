import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const v = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(v)));
}

async function main() {
  const spots = await prisma.spot.findMany({
    include: { reviews: true }
  });

  const centerLat = 21.015;
  const centerLng = 105.843;

  const targetSpots = spots.filter(spot => {
    const dist = haversineKm(spot.lat, spot.lng, centerLat, centerLng);
    return dist <= 1.5;
  });

  console.log(`Found ${targetSpots.length} spots with hardcoded green AQI.`);

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    throw new Error('No users found.');
  }

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

  for (const spot of targetSpots) {
    let currentReviewCount = spot.reviews.length;
    let reviewsToAdd = 5 - currentReviewCount;
    if (reviewsToAdd > 0) {
      console.log(`Adding ${reviewsToAdd} reviews to spot ${spot.id} (${spot.name})`);
      for (let i = 0; i < reviewsToAdd; i++) {
        const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = japaneseComments[Math.floor(Math.random() * japaneseComments.length)];
        
        await prisma.spotReview.create({
          data: {
            spotId: spot.id,
            userId: randomUser.id,
            rating: rating,
            comment: randomComment
          }
        });
      }
    }
  }

  // update all spots avgRating and reviewCount
  for (const spot of targetSpots) {
    const allReviews = await prisma.spotReview.findMany({
      where: { spotId: spot.id }
    });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      const avgRating = totalRating / allReviews.length;
      
      await prisma.spot.update({
        where: { id: spot.id },
        data: {
          avgRating: avgRating,
          reviewCount: allReviews.length
        }
      });
    }
  }
  
  console.log('Finished updating reviews.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
