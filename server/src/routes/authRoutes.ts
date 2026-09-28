import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fixora_super_secret_jwt_token_key_change_in_production_2026';

// Register User
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, role, bio, categoryIds, experienceYears, hourlyRate, address, latitude, longitude } = req.body;

    if (!email || !password || !fullName || !phone) {
      return res.status(400).json({ error: 'Please provide all required registration fields.' });
    }

    if (role === 'ADMIN') {
      return res.status(403).json({ error: 'Administrator accounts cannot be created via public registration.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'PROFESSIONAL' ? Role.PROFESSIONAL : Role.CUSTOMER;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: assignedRole,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      },
    });

    if (assignedRole === Role.PROFESSIONAL) {
      await prisma.professionalProfile.create({
        data: {
          userId: user.id,
          bio: bio || 'Professional technician ready to assist.',
          categoryIds: categoryIds || [],
          experienceYears: Number(experienceYears) || 1,
          hourlyRate: Number(hourlyRate) || 50.0,
          address: address || 'City Center',
          latitude: Number(latitude) || 40.7128,
          longitude: Number(longitude) || -74.006,
          isVerified: 'PENDING',
        },
      });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { professionalProfile: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: fullUser!.id,
        email: fullUser!.email,
        fullName: fullUser!.fullName,
        phone: fullUser!.phone,
        role: fullUser!.role,
        avatarUrl: fullUser!.avatarUrl,
        createdAt: fullUser!.createdAt,
        professionalProfile: fullUser!.professionalProfile,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Login User
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { professionalProfile: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        professionalProfile: user.professionalProfile,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

// Get Current User Profile (/me)
router.get('/me', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { professionalProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        professionalProfile: user.professionalProfile,
      },
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
