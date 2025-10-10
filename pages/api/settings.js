import { getPublicSettings } from '../../lib/settings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const settings = await getPublicSettings();
  return res.status(200).json(settings);
}
