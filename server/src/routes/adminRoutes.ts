import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { Role, VerificationStatus } from '@prisma/client';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireRole(Role.ADMIN));

// Get admin dashboard stats overview
router.get('/stats', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPros = await prisma.professionalProfile.count();
    const pendingPros = await prisma.professionalProfile.count({
      where: { isVerified: VerificationStatus.PENDING },
    });
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.count({
      where: { status: 'COMPLETED' },
    });

    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    });

    const pendingVerifications = await prisma.professionalProfile.findMany({
      where: { isVerified: VerificationStatus.PENDING },
      include: {
        user: { select: { fullName: true, email: true, phone: true, avatarUrl: true } },
      },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        service: true,
      },
    });

    return res.json({
      totalUsers,
      totalPros,
      pendingPros,
      totalBookings,
      completedBookings,
      totalRevenue: revenueResult._sum.amount || 0,
      pendingVerifications,
      recentBookings,
    });
  } catch (error: any) {
    next(error);
  }
});

// Verify or reject professional application
router.patch('/verify-pro/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // VERIFIED or REJECTED

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    const updated = await prisma.professionalProfile.update({
      where: { id },
      data: { isVerified: status as VerificationStatus },
      include: { user: { select: { fullName: true, email: true } } },
    });

    return res.json(updated);
  } catch (error: any) {
    next(error);
  }
});

export default router;
