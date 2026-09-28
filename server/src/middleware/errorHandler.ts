import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Log full error details securely on the server side
  console.error('💥 Server Error:', {
    path: req.originalUrl,
    method: req.method,
    message: err?.message || err,
    code: err?.code,
    name: err?.name,
  });

  // 1. Detect PostgreSQL / Prisma connection & offline issues
  if (
    err?.code === 'P1001' ||
    err?.code === 'P1000' ||
    err?.name === 'PrismaClientInitializationError' ||
    err?.name === 'PrismaClientRustPanicError' ||
    err?.name === 'PrismaClientUnknownRequestError' ||
    (typeof err?.message === 'string' &&
      (err.message.includes("Can't reach database server") ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('connect ECONNREFUSED')))
  ) {
    return res.status(503).json({
      error: 'Database unavailable: PostgreSQL server is offline or unreachable at localhost:5432. Please ensure PostgreSQL is installed, running, and DATABASE_URL is accessible.',
      code: 'DATABASE_UNREACHABLE',
    });
  }

  // 2. Malformed JSON syntax in request body
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON payload received in request body.',
      code: 'INVALID_JSON',
    });
  }

  // 3. Prisma unique constraint violation (P2002)
  if (err?.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this information already exists.',
      code: 'DUPLICATE_ENTRY',
    });
  }

  // 4. Prisma record not found (P2025)
  if (err?.code === 'P2025') {
    return res.status(404).json({
      error: 'The requested record was not found.',
      code: 'NOT_FOUND',
    });
  }

  // 5. Default generic error: NEVER expose passwords, secrets, paths, or stack traces
  const statusCode = typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
    ? err.statusCode
    : 500;

  const safeMessage =
    statusCode < 500
      ? (err?.message || 'Request error')
      : 'An unexpected internal server error occurred. Please try again later.';

  return res.status(statusCode).json({
    error: safeMessage,
  });
};
