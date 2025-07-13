import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useTranslation } from 'react-i18next';

const AdminResults = () => {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [filters, setFilters] = useState({ user: '', test: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [userRes, testRes] = await Promise.all([
          axios.get('/users'),
          axios.get('/tests'),
        ]);
        setUsers(userRes.data.users || userRes.data);
        setTests(testRes.data);
      } catch (err) {
        setError('Failed to load users/tests');
      }
    };
    fetchMeta();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.user) params.userId = filters.user;
      if (filters.test) params.testId = filters.test;
      if (filters.date) params.date = filters.date;
      const res = await axios.get('/api/results', { params });
      setResults(res.data.results || res.data);
    } catch (err) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [filters]);

  const handleDownload = async () => {
    try {
      const params = {};
      if (filters.user) params.userId = filters.user;
      if (filters.test) params.testId = filters.test;
      if (filters.date) params.date = filters.date;
      const res = await axios.get('/api/results/download', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download results');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400 text-center">{t('Results')}</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <select value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))} className="p-2 rounded border">
          <option value="">All Users</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
        </select>
        <select value={filters.test} onChange={e => setFilters(f => ({ ...f, test: e.target.value }))} className="p-2 rounded border">
          <option value="">All Tests</option>
          {tests.map(t => <option key={t._id} value={t._id}>{t.title?.en || t.title}</option>)}
        </select>
        <input type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} className="p-2 rounded border" />
        <button onClick={handleDownload} className="bg-blue-500 text-white px-4 py-2 rounded">Download</button>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Test</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Score</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8">No results found.</td></tr>
            ) : results.map(r => (
              <tr key={r._id}>
                <td className="border px-4 py-2">{r.user?.name || r.userName || '-'}</td>
                <td className="border px-4 py-2">{r.test?.title?.en || r.test?.title || r.testTitle || '-'}</td>
                <td className="border px-4 py-2">{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                <td className="border px-4 py-2">{r.score ?? '-'}</td>
                <td className="border px-4 py-2">{r.status || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminResults;
