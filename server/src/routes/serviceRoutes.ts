import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

// GET /api/services - Get services with category filter and search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, search, isEmergency } = req.query;

    const where: any = {};

    if (categoryId && typeof categoryId === 'string') {
      // Check if categoryId is a slug or UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
      if (isUUID) {
        where.categoryId = categoryId;
      } else {
        const cat = await prisma.serviceCategory.findUnique({
          where: { slug: categoryId },
        });
        if (cat) {
          where.categoryId = cat.id;
        } else {
          // No category found with this slug
          return res.json([]);
        }
      }
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isEmergency === 'true') {
      where.category = {
        isEmergencySupported: true,
      };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            imageUrl: true,
            isEmergencySupported: true,
          },
        },
      },
      orderBy: { price: 'asc' },
    });

    return res.json(services);
  } catch (error: any) {
    next(error);
  }
});

// GET /api/services/:id - Get single service details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.json(service);
  } catch (error: any) {
    next(error);
  }
});

export default router;
