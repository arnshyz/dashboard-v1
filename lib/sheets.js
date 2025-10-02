
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error('Missing Google service account env vars');
  }
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

export const HEADERS = [
  'date',
  'channel',
  'marketplace',
  'qty',
  'penjualan',
  'modal',
  'biayaIklan',
  'potonganMarketplace',
  'biayaOperasional',
  'gajiKaryawan',
  'pajak',
  'diskon',
  'codFee',
  'biayaPengiriman',
  'biayaLainnya'
];

export function valuesToObjects(values) {
  if (!values || values.length === 0) return [];
  const header = values[0].map(h => (h || '').trim());
  const rows = values.slice(1);
  return rows.map(cols => {
    const o = {};
    header.forEach((h, i) => { o[h] = cols[i] ?? ''; });
    return o;
  });
}

export function objectsToValues(objs) {
  const rows = [HEADERS];
  objs.forEach(o => {
    rows.push(HEADERS.map(h => (o[h] ?? '')));
  });
  return rows;
}
