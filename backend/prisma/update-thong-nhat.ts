import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const spotId = 'ChIJfyTf5o6rNTER6dKWJmY9GOY';
  
  const spot = await prisma.spot.findUnique({
    where: { id: spotId }
  });

  if (spot) {
    const updated = await prisma.spot.update({
      where: { id: spotId },
      data: {
        lat: 21.0115,
        lng: 105.8415,
        address: 'Đường Lê Duẩn, Hai Bà Trưng, Hà Nội',
        district: 'Hai Bà Trưng',
      }
    });
    console.log('Successfully updated Thong Nhat Park:', updated.name, updated.lat, updated.lng, updated.address);
  } else {
    console.log('Spot not found in database. It might be fetched correctly upon next search.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
