
import { getSheetsClient, valuesToObjects, HEADERS } from '../../lib/sheets';
function parseNumber(v){ if(v===null||v===undefined||v==='')return 0; const x=String(v).replace(/[^0-9.-]/g,''); const n=parseFloat(x); return Number.isNaN(n)?0:n; }
function inRange(dateStr,from,to){ if(!from&&!to)return true; const t=new Date(dateStr); if(from&&t<new Date(from))return false; if(to){ const e=new Date(to); e.setHours(23,59,59,999); if(t>e)return false;} return true; }
export default async function handler(req,res){
  const sheetId=process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const tab=process.env.GOOGLE_SHEETS_TAB_NAME||'Sales';
  if(!sheetId) return res.status(500).json({error:'Missing GOOGLE_SHEETS_SPREADSHEET_ID'});
  const adminKey=process.env.ADMIN_API_KEY||'';
  const isAdmin=!!adminKey && req.headers['x-api-key']===adminKey;
  if(req.method==='GET'){ try{
    const sheets=getSheetsClient();
    const {data}=await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `${tab}!A1:Z100000` });
    let rows=valuesToObjects(data.values).map(r=>({
      date:r.date||'', channel:r.channel||'Website', marketplace:r.marketplace||'Website',
      qty:parseNumber(r.qty), penjualan:parseNumber(r.penjualan), modal:parseNumber(r.modal),
      biayaIklan:parseNumber(r.biayaIklan), potonganMarketplace:parseNumber(r.potonganMarketplace),
      biayaOperasional:parseNumber(r.biayaOperasional), gajiKaryawan:parseNumber(r.gajiKaryawan),
      pajak:parseNumber(r.pajak), diskon:parseNumber(r.diskon), codFee:parseNumber(r.codFee),
      biayaPengiriman:parseNumber(r.biayaPengiriman), biayaLainnya:parseNumber(r.biayaLainnya)
    }));
    const {from,to,channel,marketplace}=req.query;
    rows=rows.filter(r=>inRange(r.date,from,to));
    if(channel){ const s=new Set(String(channel).split(',')); rows=rows.filter(r=>s.has(r.channel)); }
    if(marketplace){ const s=new Set(String(marketplace).split(',')); rows=rows.filter(r=>s.has(r.marketplace)); }
    return res.status(200).json({rows,isAdmin});
  } catch(e){ console.error(e); return res.status(500).json({error:e.message}); } }
  if(req.method==='POST'){ if(!isAdmin) return res.status(401).json({error:'Unauthorized: admin key required'});
    try{
      const {rows}=req.body||{}; if(!Array.isArray(rows)||!rows.length) return res.status(400).json({error:'Body must include { rows: [...] }'});
      const sheets=getSheetsClient(); const range=`${tab}!A2`; const values=rows.map(r=>HEADERS.map(h=>r[h]??''));
      await sheets.spreadsheets.values.append({ spreadsheetId: sheetId, range, valueInputOption:'USER_ENTERED', requestBody:{ values } });
      return res.status(200).json({ok:true, inserted: rows.length});
    } catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
  }
  res.setHeader('Allow',['GET','POST']); return res.status(405).json({error:'Method Not Allowed'});
}
