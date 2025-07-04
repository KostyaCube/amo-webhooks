import express from 'express';
import { Request, ParamsDictionary, Response } from 'express-serve-static-core';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { ParsedQs } from 'qs';
import { webhookPayload } from '../src/webhook.handler';

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
        await webhookPayload(req.body);
        res.status(200).send('OK');
    } catch (e) {
        console.error(e);
        res.status(500).send('Webhook error');
    }
});

// Vercel Serverless handler
export default async function handler(req: IncomingMessage | Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number> | ServerResponse<IncomingMessage>) {
    app(req, res); // Прокси Express → Serverless
}



