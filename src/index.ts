import express from 'express';
import bodyParser from 'body-parser';
import { webhookPayload } from './webhook.handler';
import { syncBudgetsFromSheet } from './services/budget.service';

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get('/test', async (req, res) => {
    try {
        res.status(200).send('OK');
    } catch (err) {
        res.status(500).send('Test Server Error');
    }
});

app.post('/webhook', async (req, res) => {
    try {
        await webhookPayload(req.body);
        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});

setInterval(async () => {
    try {
        console.log('Syncing budgets from sheet...');
        await syncBudgetsFromSheet();
    } catch (err) {
        console.error('Error syncing budgets:', err);
    }
}, 60 * 1000);

// async function main() {
// await appendToSheet([
//     '123456',
//     '2025-07-04',
//     '+996123456789',
//     'Иван Иваныч',
//     'Менеджер 1',
//     '123456',
//     ''
// ]);

//  syncLeadsToGoogleSheets().catch(console.error);
//  syncBudgetsFromSheet().catch(console.error);
// }

// main().catch(console.error);
