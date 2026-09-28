import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Get all service categories (including services)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        services: true,
        _count: {
          select: { services: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((cat: any) => ({
      ...cat,
      servicesCount: cat._count.services,
    }));

    return res.json(formatted);
  } catch (error: any) {
    next(error);
  }
});

// Get single category by ID or Slug with services
router.get('/:idOrSlug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const category = await prisma.serviceCategory.findFirst({
      where: isUUID ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        services: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json(category);
  } catch (error: any) {
    next(error);
  }
});

// Admin: Create new service category
router.post('/', requireAuth, requireRole(Role.ADMIN), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, description, icon, imageUrl, isEmergencySupported } = req.body;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon: icon || 'Wrench',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600',
        isEmergencySupported: isEmergencySupported !== undefined ? isEmergencySupported : true,
      },
    });

    return res.status(201).json(category);
  } catch (error: any) {
    next(error);
  }
});

export default router;
