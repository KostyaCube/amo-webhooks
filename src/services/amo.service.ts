import axios from 'axios';
import { config } from 'dotenv';
import { appendToSheet } from './google.service';

config();

const AMO_TOKEN = process.env.AMO_TOKEN!;
const AMO_DOMAIN = process.env.AMO_DOMAIN!;

export async function syncLeadsToGoogleSheets() {
    const res = await axios.get(`${AMO_DOMAIN}/api/v4/leads`, {
        headers: {
            Authorization: `Bearer ${AMO_TOKEN}`,
        },
    });

    const leads = res.data._embedded.leads;

    for (const lead of leads) {
        const leadId = lead.id;
        const createdAt = new Date(lead.created_at * 1000).toISOString().split('T')[0];
        const responsibleUserId = lead.responsible_user_id;

        const contactRes = await axios.get(`${AMO_DOMAIN}/api/v4/leads/${leadId}/links`, {
            headers: { Authorization: `Bearer ${AMO_TOKEN}` },
        });

        const contactLink = contactRes.data._embedded.links.find((link: any) => link.to_entity_type === 'contacts');

        let contactName = '';
        let contactPhone = '';

        if (contactLink) {
            const contactId = contactLink.to_entity_id;
            const contactData = await axios.get(`${AMO_DOMAIN}/api/v4/contacts/${contactId}`, {
                headers: { Authorization: `Bearer ${AMO_TOKEN}` },
            });

            contactName = contactData.data.name;

            const phoneField = contactData.data.custom_fields_values?.find(
                (f: any) => f.field_code === 'PHONE'
            );
            contactPhone = phoneField?.values?.[0]?.value || '';
        }

        const userRes = await axios.get(`${AMO_DOMAIN}/api/v4/users/${responsibleUserId}`, {
            headers: { Authorization: `Bearer ${AMO_TOKEN}` },
        });

        const userName = userRes.data.name;

        await appendToSheet([
            leadId.toString(),
            createdAt,
            contactPhone,
            contactName,
            userName,
            responsibleUserId.toString(),
            ''
        ]);
    }

    console.log('Successfully synced leads to Google Sheets');
}
