import { requireAuth } from '../../../lib/auth';
import { addUser, getEnvUser, getSecureSettings, updateGeneralSettings } from '../../../lib/settings';

export default async function handler(req, res) {
  const session = requireAuth(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    const settings = await getSecureSettings();
    return res.status(200).json({ ...settings, envUser: getEnvUser() });
  }

  if (req.method === 'PUT') {
    const { pageTitle, description } = req.body || {};
    try {
      const saved = await updateGeneralSettings({ pageTitle, description });
      return res.status(200).json({ ...saved, envUser: getEnvUser() });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { username, password } = req.body || {};
    try {
      const saved = await addUser({ username, password });
      return res.status(201).json({ ...saved, envUser: getEnvUser() });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
