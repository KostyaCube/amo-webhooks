import { google } from 'googleapis';
import dotenv from 'dotenv';
import axios from 'axios';
import { getGoogleAuth } from './google.service';

dotenv.config();

const AMO_TOKEN = process.env.AMO_TOKEN!;
const AMO_DOMAIN = process.env.AMO_DOMAIN!;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
const SHEET_NAME = 'Лист1';

export async function syncBudgetsFromSheet() {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:G`,
    });

    const rows = response.data.values || [];

    for (const row of rows) {
        const [dealId, , , , , , budget] = row;

        if (!budget || !dealId) continue;

        try {


            await axios.patch(`${AMO_DOMAIN}/api/v4/leads/${dealId}`, {
                price: Number(budget)
            }, {
                headers: {
                    Authorization: `Bearer ${AMO_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log(`Budget updated for deal ${dealId} → ${budget}`);
        } catch (error) {
            console.error(`Error updating budget for deal ${dealId}:`, error);
        }
    }
}
