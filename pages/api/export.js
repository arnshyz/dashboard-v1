
import { getSheetsClient, valuesToObjects } from '../../lib/sheets';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
function parseNumber(v){ if(v===null||v===undefined||v==='')return 0; const x=String(v).replace(/[^0-9.-]/g,''); const n=parseFloat(x); return Number.isNaN(n)?0:n; }
function inRange(dateStr,from,to){ if(!from&&!to)return true; const t=new Date(dateStr); if(from&&t<new Date(from))return false; if(to){ const e=new Date(to); e.setHours(23,59,59,999); if(t>e)return false;} return true; }
export default async function handler(req,res){
  const sheetId=process.env.GOOGLE_SHEETS_SPREADSHEET_ID; const tab=process.env.GOOGLE_SHEETS_TAB_NAME||'Sales';
  if(!sheetId) return res.status(500).json({error:'Missing GOOGLE_SHEETS_SPREADSHEET_ID'});
  try{
    const format=String(req.query.format||'csv').toLowerCase();
    const {from,to,channel,marketplace}=req.query;
    const sheets=getSheetsClient(); const {data}=await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range:`${tab}!A1:Z100000` });
    let rows=valuesToObjects(data.values).map(r=>({
      date:r.date||'', channel:r.channel||'Website', marketplace:r.marketplace||'Website',
      qty:parseNumber(r.qty), penjualan:parseNumber(r.penjualan), modal:parseNumber(r.modal),
      biayaIklan:parseNumber(r.biayaIklan), potonganMarketplace:parseNumber(r.potonganMarketplace),
      biayaOperasional:parseNumber(r.biayaOperasional), gajiKaryawan:parseNumber(r.gajiKaryawan),
      pajak:parseNumber(r.pajak), diskon:parseNumber(r.diskon), codFee:parseNumber(r.codFee),
      biayaPengiriman:parseNumber(r.biayaPengiriman), biayaLainnya:parseNumber(r.biayaLainnya)
    }));
    rows=rows.filter(r=>inRange(r.date,from,to));
    if(channel){ const s=new Set(String(channel).split(',')); rows=rows.filter(r=>s.has(r.channel)); }
    if(marketplace){ const s=new Set(String(marketplace).split(',')); rows=rows.filter(r=>s.has(r.marketplace)); }
    if(!rows.length){ return res.status(200).send(''); }
    if(format==='csv'){ const headers=Object.keys(rows[0]); const csv=[headers.join(',')].concat(rows.map(r=>headers.map(h=>r[h]??'').join(','))).join('\n');
      res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="sales.csv"'); return res.status(200).send(csv); }
    if(format==='xlsx'){ const wb=XLSX.utils.book_new(); const ws=XLSX.utils.json_to_sheet(rows); XLSX.utils.book_append_sheet(wb,ws,'Sales');
      const buf=XLSX.write(wb,{type:'buffer',bookType:'xlsx'}); res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition','attachment; filename="sales.xlsx"');
      return res.status(200).send(buf); }
    if(format==='pdf'){ const doc=new PDFDocument({size:'A4', margin:36}); res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition','attachment; filename="sales.pdf"'); doc.pipe(res);
      doc.fontSize(16).text('Laporan Sales',{align:'center'}).moveDown(0.5);
      const headers=Object.keys(rows[0]); doc.fontSize(9); const colW=Math.max(40, Math.floor((595-72)/headers.length)); let x0=36,y=90;
      headers.forEach((h,i)=>doc.text(h,x0+i*colW,y,{width:colW})); y+=14; rows.slice(0,500).forEach(r=>{ headers.forEach((h,i)=>doc.text(String(r[h]??''),x0+i*colW,y,{width:colW})); y+=12; if(y>800){ doc.addPage(); y=60; } }); doc.end(); return; }
    return res.status(400).json({error:'Unsupported format'});
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}
