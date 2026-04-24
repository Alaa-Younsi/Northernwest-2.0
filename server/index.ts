import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
