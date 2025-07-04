import express from 'express';
import { webhookPayload } from '../src/webhook.handler';

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    await webhookPayload(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Оборачиваем Express для Vercel Serverless
export default function handler(req: any, res: any) {
  return app(req, res);
}
