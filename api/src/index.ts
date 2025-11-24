import { Hono } from 'hono';
import { getDBClient } from './db/client';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  return c.json({ message: 'KuruPiro API' });
});

app.get('/health', async (c) => {
  const db = getDBClient(c.env.DB);
  
  try {
    const result = await db.query.stops.findFirst();
    return c.json({ status: 'ok', dbConnected: true });
  } catch (error) {
    return c.json({ status: 'error', dbConnected: false, error: String(error) }, 500);
  }
});

export default app;
