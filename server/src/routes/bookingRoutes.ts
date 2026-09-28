import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { Role, BookingStatus, PaymentStatus, VerificationStatus } from '@prisma/client';

const router = Router();

// POST /api/bookings - Create new customer booking with validation & collision prevention
router.post('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only CUSTOMER and ADMIN roles can create customer bookings
    if (req.user!.role !== Role.CUSTOMER && req.user!.role !== Role.ADMIN) {
      return res.status(403).json({
        error: 'Only customer accounts can create service bookings. Please log in as a customer.',
      });
    }

    const {
      professionalId,
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      latitude,
      longitude,
      notes,
      isEmergency,
      paymentMethod,
    } = req.body;

    // Field presence checks
    if (!professionalId || typeof professionalId !== 'string') {
      return res.status(400).json({ error: 'Professional ID is required.' });
    }
    if (!serviceId || typeof serviceId !== 'string') {
      return res.status(400).json({ error: 'Service ID is required.' });
    }
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return res.status(400).json({ error: 'A valid service address (at least 5 characters) is required.' });
    }
    if (!scheduledDate || typeof scheduledDate !== 'string') {
      return res.status(400).json({ error: 'Scheduled date is required (YYYY-MM-DD).' });
    }
    if (!scheduledTime || typeof scheduledTime !== 'string') {
      return res.status(400).json({ error: 'Scheduled time slot is required.' });
    }

    // Date validation
    const parsedDate = new Date(scheduledDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date format. Use YYYY-MM-DD.' });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { category: true },
    });
    if (!service) {
      return res.status(404).json({ error: 'Selected service was not found in catalog.' });
    }

    // Verify professional exists and is verified
    const pro = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: { user: true },
    });
    if (!pro) {
      return res.status(404).json({ error: 'Selected professional was not found.' });
    }

    if (pro.isVerified !== VerificationStatus.VERIFIED) {
      return res.status(400).json({ error: 'This professional is pending verification and cannot accept bookings yet.' });
    }

    if (!pro.isAvailable) {
      return res.status(400).json({ error: 'This professional is currently marked as unavailable/offline.' });
    }

    // Verify professional provides this service category
    if (!pro.categoryIds.includes(service.categoryId)) {
      return res.status(400).json({
        error: `This professional does not offer services in the '${service.category.name}' category.`,
      });
    }

    // Duplicate booking check: prevent customer from repeatedly submitting identical active bookings
    const activeDuplicate = await prisma.booking.findFirst({
      where: {
        customerId: req.user!.id,
        professionalId,
        serviceId,
        scheduledDate,
        scheduledTime,
        status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS] },
      },
    });

    if (activeDuplicate) {
      return res.status(409).json({
        error: 'You already have an active booking with this professional for the same service and time slot.',
      });
    }

    // Professional collision check: prevent double-booking the pro on accepted/in-progress slots
    const proCollision = await prisma.booking.findFirst({
      where: {
        professionalId,
        scheduledDate,
        scheduledTime,
        status: { in: [BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS] },
      },
    });

    if (proCollision && !isEmergency) {
      return res.status(409).json({
        error: 'This professional already has a confirmed appointment at this date and time. Please choose another time slot or enable emergency mode.',
      });
    }

    // Calculate server-side pricing
    const basePrice = service.price;
    const isEmerg = Boolean(isEmergency);
    const emergencySurcharge = isEmerg ? Math.round(basePrice * 0.25 * 100) / 100 : 0;
    const totalPrice = Math.round((basePrice + emergencySurcharge) * 100) / 100;

    // Use professional coordinates as fallback if client coordinates not provided
    const bookingLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : pro.latitude;
    const bookingLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : pro.longitude;

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user!.id,
        professionalId,
        serviceId,
        scheduledDate,
        scheduledTime,
        address: address.trim(),
        latitude: bookingLat,
        longitude: bookingLng,
        notes: notes ? String(notes).trim() : null,
        isEmergency: isEmerg,
        totalPrice,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: paymentMethod || 'MOCK_CARD_4242',
      },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true } },
        professional: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          },
        },
        service: {
          include: {
            category: true,
          },
        },
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalPrice,
        currency: 'USD',
        status: PaymentStatus.PAID,
        provider: 'MOCK_STRIPE',
        transactionId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      },
    });

    // Create notification for professional
    await prisma.notification.create({
      data: {
        userId: pro.userId,
        title: isEmerg ? '🚨 URGENT Emergency Service Booking' : 'New Service Booking Received',
        message: `${req.user!.email} booked ${service.name} for ${scheduledDate} at ${scheduledTime}.`,
        type: isEmerg ? 'EMERGENCY' : 'BOOKING',
        link: '/pro/dashboard',
      },
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    next(error);
  }
});

// GET /api/bookings - Get user bookings (Customer or Professional)
router.get('/', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let whereCondition: any = {};
    if (userRole === Role.CUSTOMER) {
      whereCondition.customerId = userId;
    } else if (userRole === Role.PROFESSIONAL) {
      const proProfile = await prisma.professionalProfile.findUnique({ where: { userId } });
      if (!proProfile) {
        return res.json([]);
      }
      whereCondition.professionalId = proProfile.id;
    } else if (userRole === Role.ADMIN) {
      whereCondition = {}; // Admin sees all
    }

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true } },
        professional: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          },
        },
        service: {
          include: {
            category: true,
          },
        },
        review: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(bookings);
  } catch (error: any) {
    next(error);
  }
});

// GET /api/bookings/:id - Single booking details
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true } },
        professional: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } },
          },
        },
        service: {
          include: {
            category: true,
          },
        },
        review: true,
        complaint: true,
        payment: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    // Role check: customer must own the booking, pro must be assigned, or admin
    if (
      req.user!.role !== Role.ADMIN &&
      booking.customerId !== req.user!.id &&
      booking.professional.userId !== req.user!.id
    ) {
      return res.status(403).json({ error: 'Access forbidden: You cannot view this booking.' });
    }

    return res.json(booking);
  } catch (error: any) {
    next(error);
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status provided.' });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        professional: true,
      },
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    // Authorization: customer can cancel, pro can accept/progress, admin can do all
    if (req.user!.role === Role.CUSTOMER) {
      if (existingBooking.customerId !== req.user!.id) {
        return res.status(403).json({ error: 'You are not authorized to update this booking.' });
      }
      if (status !== BookingStatus.CANCELLED) {
        return res.status(403).json({ error: 'Customers can only cancel bookings.' });
      }
    } else if (req.user!.role === Role.PROFESSIONAL) {
      if (existingBooking.professional.userId !== req.user!.id) {
        return res.status(403).json({ error: 'You are not assigned to this booking.' });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        customer: { select: { fullName: true, email: true } },
        service: true,
      },
    });

    return res.json(updatedBooking);
  } catch (error: any) {
    next(error);
  }
});

export default router;
