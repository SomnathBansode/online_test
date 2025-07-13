import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useTranslation } from 'react-i18next';

const roles = ['student', 'admin'];
const statuses = ['active', 'inactive'];

const initialEditUser = {
  _id: '',
  name: '',
  email: '',
  role: 'student',
  status: 'active',
};

const ManageUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(initialEditUser);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/users');
      setUsers(res.data.users); // FIX: use res.data.users instead of res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setShowEditModal(true);
    setEditError(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await axios.put(`/users/${editUser._id}`, editUser);
      setUsers(users.map(u => u._id === editUser._id ? res.data : u));
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleActivate = async (user) => {
    try {
      const res = await axios.patch(`/users/${user._id}/activate`, { status: user.status === 'active' ? 'inactive' : 'active' });
      setUsers(users.map(u => u._id === user._id ? { ...u, status: res.data.status } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/users/${deleteId}`);
      setUsers(users.filter(u => u._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered and paginated users
  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400 text-center">{t('Manage Users')}</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder={t('Search users...')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
        />
      </div>
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#232e41] rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => setShowEditModal(false)}
              aria-label="Close"
            >×</button>
            <h2 className="text-xl font-bold mb-4 text-[#482307] dark:text-green-400">{t('Edit User')}</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <input type="text" name="name" placeholder={t('Name')} value={editUser.name} onChange={handleEditChange} className="py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base" required />
              <input type="email" name="email" placeholder={t('Email')} value={editUser.email} onChange={handleEditChange} className="py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base" required />
              <select name="role" value={editUser.role} onChange={handleEditChange} className="py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base">
                {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
              <select name="status" value={editUser.status} onChange={handleEditChange} className="py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-base">
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              {editError && <div className="text-red-600 dark:text-red-400 text-sm">{editError}</div>}
              <button type="submit" disabled={editLoading} className="w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold shadow-md transition text-base flex justify-center items-center">
                {editLoading ? t('Saving...') : t('Save')}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#232e41] rounded-xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-[#482307] dark:text-green-400">{t('Delete User?')}</h3>
            <p className="mb-6 text-[#a1724e] dark:text-gray-200 text-center">{t('Are you sure you want to delete this user? This action cannot be undone.')}</p>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold" onClick={() => setDeleteId(null)} disabled={deleteLoading}>{t('Cancel')}</button>
              <button className="px-4 py-2 rounded bg-gradient-to-r from-[#ff5e62] to-[#ff9966] hover:from-[#dc2626] hover:to-[#f59e42] dark:from-[#f87171] dark:to-[#fbbf24] text-white font-semibold shadow-md" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? t('Deleting...') : t('Delete')}</button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center text-lg text-[#a1724e] dark:text-green-400">{t('Loading users...')}</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full bg-white dark:bg-[#181f2a] rounded-xl shadow-xl border border-[#a1724e] dark:border-[#263040] text-[#482307] dark:text-gray-100">
            <thead>
              <tr className="bg-[#f5e6d6] dark:bg-[#232e41]">
                <th className="py-3 px-4 text-left">{t('Name')}</th>
                <th className="py-3 px-4 text-left">{t('Email')}</th>
                <th className="py-3 px-4 text-left">{t('Role')}</th>
                <th className="py-3 px-4 text-left">{t('Status')}</th>
                <th className="py-3 px-4 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-[#a1724e] dark:text-green-400">{t('No users found.')}</td></tr>
              ) : paginatedUsers.map((user) => (
                <tr key={user._id} className="border-t border-[#a1724e] dark:border-[#263040] hover:bg-[#f5e6d6]/60 dark:hover:bg-[#232e41]/60 transition-colors">
                  <td className="py-2 px-4 align-middle">{user.name}</td>
                  <td className="py-2 px-4 align-middle">{user.email}</td>
                  <td className="py-2 px-4 align-middle">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}</td>
                  <td className="py-2 px-4 align-middle">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-700'}`}>{user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : '—'}</span>
                  </td>
                  <td className="py-2 px-4 align-middle text-right">
                    <div className="inline-flex gap-2">
                      <button className="min-w-[80px] px-3 py-1 rounded-lg bg-gradient-to-r from-[#4f8cff] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1e3a8a] dark:from-[#60a5fa] dark:to-[#1e293b] text-white font-semibold transition shadow-md text-sm" onClick={() => handleEdit(user)}>{t('Edit')}</button>
                      <button className={`min-w-[80px] px-3 py-1 rounded-lg font-semibold shadow-md text-sm ${user.status === 'active' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white' : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white'}`} onClick={() => handleActivate(user)}>{user.status === 'active' ? t('Deactivate') : t('Activate')}</button>
                      <button className="min-w-[80px] px-3 py-1 rounded-lg bg-gradient-to-r from-[#ff5e62] to-[#ff9966] hover:from-[#dc2626] hover:to-[#f59e42] dark:from-[#f87171] dark:to-[#fbbf24] text-white font-semibold transition shadow-md text-sm" onClick={() => setDeleteId(user._id)}>{t('Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold disabled:opacity-50" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{t('Prev')}</button>
            <span className="text-[#482307] dark:text-green-400 font-medium">{t('Page')} {currentPage} {t('of')} {totalPages}</span>
            <button className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold disabled:opacity-50" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{t('Next')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
