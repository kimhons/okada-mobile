import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

const serviceEndpoints = {
  '/api/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  '/api/users': process.env.USER_SERVICE_URL || 'http://localhost:3002',
  '/api/products': process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  '/api/orders': process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  '/api/payments': process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006'
};

Object.entries(serviceEndpoints).forEach(([path, target]) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^${path}`]: '' },
    onError: (err, _req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(502).json({ error: 'Service temporarily unavailable' });
    }
  }));
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock auth endpoint for testing
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Mock successful login for testing
  if (email === 'merchant@okada.cm' && password === 'password123') {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'merchant@okada.cm',
          name: 'Test Merchant',
          role: 'merchant'
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});