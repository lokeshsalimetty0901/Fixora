import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { Role, VerificationStatus } from '@prisma/client';

const router = Router();

// Helper: Haversine distance in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/professionals - List professionals with category, search, price, rating, emergency, and radius filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      search,
      isEmergency,
      minRating,
      minPrice,
      maxPrice,
      sortBy,
      lat,
      lng,
      radiusKm,
    } = req.query;

    const where: any = {
      isVerified: VerificationStatus.VERIFIED,
      isAvailable: true,
    };

    // Category resolution: support either UUID or category slug (e.g. 'auto-mechanic')
    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (isUUID) {
        where.categoryIds = {
          has: categoryId,
        };
      } else {
        const cat = await prisma.serviceCategory.findUnique({
          where: { slug: categoryId },
        });
        if (cat) {
          where.categoryIds = {
            has: cat.id,
          };
        } else {
          return res.json([]);
        }
      }
    }

    // Emergency filter: only pros having categories that support emergency dispatch
    if (isEmergency === 'true') {
      const emergencyCategories = await prisma.serviceCategory.findMany({
        where: { isEmergencySupported: true },
        select: { id: true },
      });
      const emergencyCategoryIds = emergencyCategories.map((c) => c.id);
      where.categoryIds = {
        hasSome: emergencyCategoryIds,
      };
    }

    // Keyword search
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { bio: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { user: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    // Price range filters
    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.gte = Number(minPrice);
      if (maxPrice) where.hourlyRate.lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      where.rating = {
        gte: Number(minRating),
      };
    }

    // Sorting definition
    let orderBy: any = { rating: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { hourlyRate: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { hourlyRate: 'desc' };
    } else if (sortBy === 'experience') {
      orderBy = { experienceYears: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const professionals = await prisma.professionalProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        reviewsReceived: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy,
    });

    // Fetch all categories to enrich professionals with real category names and icons
    const allCategories = await prisma.serviceCategory.findMany({
      include: {
        services: true,
      },
    });
    const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

    const userLat = lat ? Number(lat) : null;
    const userLng = lng ? Number(lng) : null;
    const maxRadius = radiusKm ? Number(radiusKm) : null;

    let enrichedPros = professionals.map((pro) => {
      const proCategories = pro.categoryIds
        .map((catId) => categoryMap.get(catId))
        .filter(Boolean);

      const proServices = proCategories.flatMap((c) => c?.services || []);

      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        const dist = calculateHaversineDistance(userLat, userLng, pro.latitude, pro.longitude);
        distanceKm = Math.round(dist * 10) / 10;
      }

      return {
        ...pro,
        categories: proCategories,
        services: proServices,
        distanceKm,
      };
    });

    // Apply radius filtering if user location and radius are provided
    if (userLat !== null && userLng !== null && maxRadius !== null && !isNaN(maxRadius)) {
      enrichedPros = enrichedPros.filter((pro) => pro.distanceKm !== null && pro.distanceKm <= maxRadius);
    }

    // Distance sorting if requested
    if (sortBy === 'distance' && userLat !== null && userLng !== null) {
      enrichedPros.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    return res.json(enrichedPros);
  } catch (error: any) {
    next(error);
  }
});

// GET /api/professionals/:id - Single professional profile details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pro = await prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        reviewsReceived: {
          include: {
            customer: { select: { fullName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!pro) {
      return res.status(404).json({ error: 'Professional profile not found.' });
    }

    // Enrich with categories and services
    const categories = await prisma.serviceCategory.findMany({
      where: { id: { in: pro.categoryIds } },
      include: { services: true },
    });

    const services = categories.flatMap((c) => c.services);

    return res.json({
      ...pro,
      categories,
      services,
    });
  } catch (error: any) {
    next(error);
  }
});

// PATCH /api/professionals/toggle-availability - Professional toggle online/offline
router.patch('/toggle-availability', requireAuth, requireRole(Role.PROFESSIONAL), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proProfile = await prisma.professionalProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!proProfile) {
      return res.status(404).json({ error: 'Professional profile not found.' });
    }

    const updated = await prisma.professionalProfile.update({
      where: { id: proProfile.id },
      data: { isAvailable: !proProfile.isAvailable },
    });

    return res.json(updated);
  } catch (error: any) {
    next(error);
  }
});

export default router;
