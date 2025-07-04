import axios from 'axios';
import dotenv from 'dotenv';
import { appendToSheet } from './services/google.service';

dotenv.config();

const AMO_DOMAIN = process.env.AMO_DOMAIN!;
const AMO_TOKEN = process.env.AMO_TOKEN!;

export async function webhookPayload(payload: any) {
    const lead = payload.leads?.add?.[0] || payload.leads?.status?.[0];
    if (!lead) return;

    const leadId = lead.id;

    const leadDetails = await axios.get(`${AMO_DOMAIN}/api/v4/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${AMO_TOKEN}` },
    });

    const createdAt = new Date(leadDetails.data.created_at * 1000).toISOString().split('T')[0];
    const responsibleUserId = leadDetails.data.responsible_user_id;

    const linksRes = await axios.get(`${AMO_DOMAIN}/api/v4/leads/${leadId}/links`, {
        headers: { Authorization: `Bearer ${AMO_TOKEN}` },
    });

    const contactLink = linksRes.data._embedded.links.find((l: any) => l.to_entity_type === 'contacts');

    let contactName = '';
    let contactPhone = '';

    if (contactLink) {
        const contactId = contactLink.to_entity_id;
        const contact = await axios.get(`${AMO_DOMAIN}/api/v4/contacts/${contactId}`, {
            headers: { Authorization: `Bearer ${AMO_TOKEN}` },
        });

        contactName = contact.data.name;

        const phoneField = contact.data.custom_fields_values?.find(
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
