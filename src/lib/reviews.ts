import { prisma } from "./prisma";

export async function refreshUserRating(userId: string) {
  const agg = await prisma.review.aggregate({
    where: { toUserId: userId },
    _avg: { stars: true },
    _count: { stars: true },
  });

  const profile = await prisma.workshopProfile.findUnique({
    where: { userId },
  });

  if (profile) {
    await prisma.workshopProfile.update({
      where: { userId },
      data: {
        avgRating: agg._avg.stars ?? 0,
        reviewCount: agg._count.stars,
      },
    });
  }
}
