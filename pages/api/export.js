
import { getSheetsClient, valuesToObjects } from '../../lib/sheets';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

function parseNumber(v) {
  if (v === null || v === undefined || v === '') return 0;
  const x = String(v).replace(/[^0-9.-]/g, '');
  const n = parseFloat(x);
  return Number.isNaN(n) ? 0 : n;
}

function inRange(dateStr, from, to) {
  if (!from && !to) return true;
  const t = new Date(dateStr);
  if (from && t < new Date(from)) return false;
  if (to) {
    const end = new Date(to); end.setHours(23,59,59,999);
    if (t > end) return false;
  }
  return true;
}

export default async function handler(req, res) {
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tab = process.env.GOOGLE_SHEETS_TAB_NAME || 'Sales';
  if (!sheetId) return res.status(500).json({ error: 'Missing GOOGLE_SHEETS_SPREADSHEET_ID' });

  const adminKey = process.env.ADMIN_API_KEY || '';
  const isAdmin = adminKey && req.headers['x-api-key'] === adminKey;
  // Allow both roles to export; tighten if desired:
  // if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const { from, to, channel, marketplace } = req.query;

    const sheets = getSheetsClient();
    const range = `${tab}!A1:Z10000`;
    const { data } = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    let rows = valuesToObjects(data.values).map(r => ({
      date: r.date || '',
      channel: r.channel || 'Website',
      marketplace: r.marketplace || 'Website',
      qty: parseNumber(r.qty),
      penjualan: parseNumber(r.penjualan),
      modal: parseNumber(r.modal),
      biayaIklan: parseNumber(r.biayaIklan),
      potonganMarketplace: parseNumber(r.potonganMarketplace),
      biayaOperasional: parseNumber(r.biayaOperasional),
      gajiKaryawan: parseNumber(r.gajiKaryawan),
      pajak: parseNumber(r.pajak),
      diskon: parseNumber(r.diskon),
      codFee: parseNumber(r.codFee),
      biayaPengiriman: parseNumber(r.biayaPengiriman),
      biayaLainnya: parseNumber(r.biayaLainnya)
    }));

    rows = rows.filter(r => inRange(r.date, from, to));
    if (channel) {
      const set = new Set(channel.split(','));
      rows = rows.filter(r => set.has(r.channel));
    }
    if (marketplace) {
      const set = new Set(marketplace.split(','));
      rows = rows.filter(r => set.has(r.marketplace));
    }

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || { date:'', channel:'', marketplace:'' });
      const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => r[h] ?? '').join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sales.csv"');
      return res.status(200).send(csv);
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="sales.xlsx"');
      return res.status(200).send(buf);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sales.pdf"');
      doc.pipe(res);
      doc.fontSize(16).text('Laporan Sales', { align: 'center' });
      doc.moveDown(0.5);
      const headers = ['date','channel','marketplace','qty','penjualan','modal','biayaIklan','potonganMarketplace','biayaOperasional','gajiKaryawan','pajak','diskon','codFee','biayaPengiriman','biayaLainnya'];
      doc.fontSize(9);
      const colWidths = [64,60,70,28,70,50,50,50,50,50,40,40,40,50,50];
      const startX = 36; let x = startX; let y = 100;
      headers.forEach((h,i)=>{ doc.text(h, x, y, { width: colWidths[i], continued:false }); x += colWidths[i]; });
      y += 14;
      rows.slice(0, 200).forEach(r => {
        x = startX;
        headers.forEach((h,i)=>{
          const v = r[h] ?? '';
          doc.text(String(v), x, y, { width: colWidths[i] });
          x += colWidths[i];
        });
        y += 12;
        if (y > 760) { doc.addPage(); y=60; }
      });
      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Unsupported format' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
