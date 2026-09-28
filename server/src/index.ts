import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import professionalRoutes from './routes/professionalRoutes';
import bookingRoutes from './routes/bookingRoutes';
import serviceRoutes from './routes/serviceRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { setupSocketHandlers } from './services/socketService';

import { prisma } from './config/prisma';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

setupSocketHandlers(io);

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Server and Database Health Check Endpoints
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    // Quick probe to test PostgreSQL connectivity
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'OK',
      message: 'FIXORA API Server is running smoothly',
      database: {
        connected: true,
        engine: 'PostgreSQL',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (dbError: any) {
    return res.status(503).json({
      status: 'DEGRADED',
      message: 'FIXORA API Server is active, but PostgreSQL database is unreachable.',
      database: {
        connected: false,
        engine: 'PostgreSQL',
        error: 'Cannot reach PostgreSQL server at localhost:5432. Please ensure PostgreSQL is running.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Dedicated Database Health Endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      connected: true,
      engine: 'PostgreSQL',
      message: 'PostgreSQL connection healthy.',
    });
  } catch (error: any) {
    return res.status(503).json({
      connected: false,
      engine: 'PostgreSQL',
      error: 'Cannot connect to PostgreSQL at localhost:5432. Please ensure PostgreSQL service is active.',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`🚀 FIXORA Server active on http://localhost:${PORT}`);
});
