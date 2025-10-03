import { getSheetsClient, valuesToObjects } from "../../lib/sheets";

const DEFAULT_RANGES = {
  quickStats: "WarehouseQuickStats!A1:D100",
  stockAlerts: "WarehouseStockAlerts!A1:F1000",
  inboundOutbound: "WarehouseMovements!A1:F1000",
  locationMap: "WarehouseLocations!A1:D500",
  notifications: "WarehouseNotifications!A1:C500",
  users: "WarehouseUsers!A1:D500",
  reports: "WarehouseReports!A1:C500",
  opnamePlans: "WarehouseOpname!A1:D500",
};

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/[^0-9.,-]/g, "").replace(/,(\d{2})$/, ".$1");
  const numeric = parseFloat(cleaned);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function envKeyFromSection(section) {
  return `GOOGLE_SHEETS_WAREHOUSE_${section
    .replace(/([A-Z])/g, "_$1")
    .toUpperCase()}_RANGE`;
}

function getRangeForSection(section) {
  const envKey = envKeyFromSection(section);
  return process.env[envKey] || DEFAULT_RANGES[section];
}

function normaliseTone(value, fallback) {
  const tone = (value || "").toString().trim().toLowerCase();
  if (!tone) return fallback;
  return tone;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const spreadsheetId =
      process.env.GOOGLE_SHEETS_WAREHOUSE_SPREADSHEET_ID ||
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: "Missing Google Sheets spreadsheet id" });
    }

    const sections = Object.keys(DEFAULT_RANGES);
    const ranges = sections.map((section) => getRangeForSection(section));

    const sheets = getSheetsClient();
    const { data } = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = data.valueRanges || [];
    const result = {};

    sections.forEach((section, index) => {
      const values = valueRanges[index]?.values || [];
      result[section] = valuesToObjects(values);
    });

    const quickStats = (result.quickStats || [])
      .filter((item) => item.title || item.value)
      .map((item) => ({
        title: item.title || "",
        value: item.value || "",
        trend: item.trend || "",
        tone: normaliseTone(item.tone, "neutral"),
      }));

    const stockAlerts = (result.stockAlerts || [])
      .filter((item) => item.sku || item.name)
      .map((item) => {
        const stockRaw = item.stock;
        const hasStock =
          stockRaw !== undefined && stockRaw !== null && String(stockRaw).trim() !== "";

        return {
          sku: item.sku || "",
          name: item.name || "",
          stock: hasStock ? parseNumber(stockRaw) : null,
          status: item.status || "",
          location: item.location || "",
          priority: normaliseTone(item.priority, "medium"),
        };
      });

    const inboundOutbound = (result.inboundOutbound || [])
      .filter((item) => item.reference || item.type)
      .map((item) => {
        const qtyRaw = item.qty;
        const hasQty = qtyRaw !== undefined && qtyRaw !== null && String(qtyRaw).trim() !== "";

        return {
          type: (item.type || "").trim() || "Inbound",
          reference: item.reference || "",
          time: item.time || "",
          by: item.by || "",
          notes: item.notes || "",
          qty: hasQty ? parseNumber(qtyRaw) : null,
        };
      });

    const locationMap = (result.locationMap || [])
      .filter((item) => item.zone || item.racks)
      .map((item) => {
        const filledRaw = item.filled;
        const capacityRaw = item.capacity;
        const hasFilled =
          filledRaw !== undefined && filledRaw !== null && String(filledRaw).trim() !== "";
        const hasCapacity =
          capacityRaw !== undefined && capacityRaw !== null && String(capacityRaw).trim() !== "";

        return {
          zone: item.zone || "",
          racks: item.racks || "",
          filled: hasFilled ? parseNumber(filledRaw) : null,
          capacity: hasCapacity ? parseNumber(capacityRaw) : null,
        };
      });

    const notifications = (result.notifications || [])
      .filter((item) => item.message || item.time)
      .map((item) => ({
        time: item.time || "",
        message: item.message || "",
        tone: normaliseTone(item.tone, "info"),
      }));

    const users = (result.users || [])
      .filter((item) => item.name || item.role)
      .map((item) => ({
        name: item.name || "",
        role: item.role || "",
        status: item.status || "",
        shift: item.shift || "",
      }));

    const reports = (result.reports || [])
      .filter((item) => item.title || item.period)
      .map((item) => ({
        title: item.title || "",
        period: item.period || "",
        status: item.status || "",
      }));

    const opnamePlans = (result.opnamePlans || [])
      .filter((item) => item.area || item.schedule)
      .map((item) => ({
        area: item.area || "",
        schedule: item.schedule || "",
        supervisor: item.supervisor || "",
        status: item.status || "",
      }));

    return res.status(200).json({
      quickStats,
      stockAlerts,
      inboundOutbound,
      locationMap,
      notifications,
      users,
      reports,
      opnamePlans,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
