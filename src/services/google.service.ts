import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { config } from 'dotenv';

config();

const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
const SHEET_NAME = 'Лист1';

export async function appendToSheet(row: string[]) {
    try {
        const res = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row],
            },
        });

        console.log('Successfully appended', res.data.updates?.updatedRows, 'rows:', res.data.updates?.updatedCells, 'cells');

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export function getGoogleAuth() {
    return auth;
}
