import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const SecurityForm = () => {
  const { t } = useTranslation();
  const token = useSelector(state => state.auth.token);
  const [settings, setSettings] = useState({
    singleDeviceLogin: false,
    disableCopyPaste: false,
    disableScreenshot: false,
    allowedIPs: [],
    allowedTimeWindows: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('/security', { headers: { Authorization: `Bearer ${token}` } });
        setSettings(res.data);
      } catch (err) {
        setError(t('Failed to load security settings'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token, t]);

  const handleChange = e => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await axios.put('/security', settings, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(t('Settings saved successfully!'));
    } catch (err) {
      setError(t('Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white dark:bg-[#181b20] rounded-xl shadow-xl p-8 w-full max-w-lg border border-[#a1724e] dark:border-green-900 flex flex-col gap-6 text-[#a1724e] dark:text-green-300">
      <h2 className="text-2xl font-bold mb-2 text-[#482307] dark:text-green-300">{t('Security Settings')}</h2>
      {loading ? (
        <div className="text-center text-[#a1724e] dark:text-green-200">{t('Loading...')}</div>
      ) : (
        <>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="singleDeviceLogin" checked={settings.singleDeviceLogin} onChange={handleChange} />
            <span>{t('Single-device login (logout on other devices)')}</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="disableCopyPaste" checked={settings.disableCopyPaste} onChange={handleChange} />
            <span>{t('Disable copy/paste during tests')}</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="disableScreenshot" checked={settings.disableScreenshot} onChange={handleChange} />
            <span>{t('Disable screenshots (if supported)')}</span>
          </label>
          {/* Add more fields for allowedIPs/time windows if needed */}
          <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition-colors" disabled={saving}>
            {saving ? t('Saving...') : t('Save Settings')}
          </button>
          {error && <div className="text-red-600 dark:text-red-400 mt-2">{error}</div>}
          {success && <div className="text-green-700 dark:text-green-300 mt-2">{success}</div>}
        </>
      )}
    </form>
  );
};

export default SecurityForm;
