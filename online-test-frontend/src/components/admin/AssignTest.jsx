import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AssignTest = () => {
  const { t, i18n } = useTranslation();
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [newGroup, setNewGroup] = useState("");
  const [groupCreateMsg, setGroupCreateMsg] = useState("");
  const [selectedGroupForUsers, setSelectedGroupForUsers] = useState('');
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([]);
  const [addUsersMsg, setAddUsersMsg] = useState('');
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [renameGroupName, setRenameGroupName] = useState("");
  const [renameMsg, setRenameMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [editUsersGroupId, setEditUsersGroupId] = useState(null);
  const [editUsersSelected, setEditUsersSelected] = useState([]);
  const [editUsersMsg, setEditUsersMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testRes, userRes, groupRes] = await Promise.all([
          axios.get('/tests'),
          axios.get('/users'),
          axios.get('/groups'),
        ]);
        setTests(testRes.data);
        setUsers(userRes.data.users || userRes.data);
        setGroups(groupRes.data.groups || groupRes.data);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    setError(null);
    setSuccess(null);
    if (!selectedTest || (selectedUsers.length === 0 && selectedGroups.length === 0)) {
      setError('Select a test and at least one user or group.');
      return;
    }
    try {
      await axios.post('/assignments', {
        testId: selectedTest,
        userIds: selectedUsers,
        groupIds: selectedGroups,
        availableFrom: availableFrom || undefined,
        availableTo: availableTo || undefined,
      });
      setSuccess('Test assigned successfully!');
      setSelectedTest('');
      setSelectedUsers([]);
      setSelectedGroups([]);
      setAvailableFrom('');
      setAvailableTo('');
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    }
  };

  const handleCreateGroup = async () => {
    setGroupCreateMsg("");
    if (!newGroup.trim()) return setGroupCreateMsg("Group name required");
    try {
      await axios.post('/groups', { name: newGroup });
      setGroupCreateMsg('Group created!');
      setNewGroup('');
      // Refresh group list
      const groupRes = await axios.get('/groups');
      setGroups(groupRes.data.groups || groupRes.data);
    } catch (err) {
      setGroupCreateMsg(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleAddUsersToGroup = async () => {
    setAddUsersMsg('');
    if (!selectedGroupForUsers || selectedUsersForGroup.length === 0) {
      setAddUsersMsg('Select a group and at least one user.');
      return;
    }
    try {
      await axios.put(`/groups/${selectedGroupForUsers}/users`, { userIds: selectedUsersForGroup });
      setAddUsersMsg('Users added to group!');
      setSelectedUsersForGroup([]);
    } catch (err) {
      setAddUsersMsg(err.response?.data?.message || 'Failed to add users');
    }
  };

  // Rename group
  const handleRenameGroup = async (groupId) => {
    setRenameMsg("");
    if (!renameGroupName.trim()) return setRenameMsg("Group name required");
    try {
      await axios.put(`/groups/${groupId}`, { name: renameGroupName });
      setRenameMsg("Group renamed!");
      setEditingGroupId(null);
      setRenameGroupName("");
      // Refresh group list
      const groupRes = await axios.get('/groups');
      setGroups(groupRes.data.groups || groupRes.data);
    } catch (err) {
      setRenameMsg(err.response?.data?.message || 'Failed to rename group');
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId) => {
    setDeleteMsg("");
    try {
      await axios.delete(`/groups/${groupId}`);
      setDeleteMsg("Group deleted!");
      // Refresh group list
      const groupRes = await axios.get('/groups');
      setGroups(groupRes.data.groups || groupRes.data);
    } catch (err) {
      setDeleteMsg(err.response?.data?.message || 'Failed to delete group');
    }
  };

  // Start editing users in group
  const startEditUsers = (group) => {
    setEditUsersGroupId(group._id);
    // group.userIds may be array of user objects or IDs
    const ids = Array.isArray(group.userIds)
      ? group.userIds.map(u => (typeof u === 'object' ? u._id : u))
      : [];
    setEditUsersSelected(ids);
    setEditUsersMsg("");
  };

  // Save edited users in group
  const handleSaveEditUsers = async () => {
    setEditUsersMsg("");
    try {
      await axios.put(`/groups/${editUsersGroupId}/users`, { userIds: editUsersSelected });
      setEditUsersMsg("Group users updated!");
      setEditUsersGroupId(null);
      // Refresh group list
      const groupRes = await axios.get('/groups');
      setGroups(groupRes.data.groups || groupRes.data);
    } catch (err) {
      setEditUsersMsg(err.response?.data?.message || 'Failed to update users');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl p-8">
        {/* --- Test Assignment Section --- */}
        <h1 className="text-4xl font-extrabold mb-8 text-center text-[#482307] dark:text-green-400">{t('Assign Test')}</h1>
        <div className="mb-10 pb-10 border-b border-yellow-300 dark:border-gray-700">
          <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Select Test')}:</label>
          <select
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 mb-6"
            value={selectedTest}
            onChange={e => setSelectedTest(e.target.value)}
          >
            <option value="">{t('-- Select Test --')}</option>
            {tests.map(test => (
              <option key={test._id} value={test._id}>
                {test.title?.en || test.title}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Assign to Users')}:</label>
          <select
            multiple
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 mb-6 h-32"
            value={selectedUsers}
            onChange={e => setSelectedUsers(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Assign to Groups')}:</label>
          <select
            multiple
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 mb-6 h-24"
            value={selectedGroups}
            onChange={e => setSelectedGroups(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Available From')}:</label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={availableFrom}
                onChange={e => setAvailableFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Available To')}:</label>
              <input
                type="datetime-local"
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={availableTo}
                onChange={e => setAvailableTo(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <button
            onClick={handleAssign}
            className="w-full py-3 rounded bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-colors duration-300 text-white font-bold shadow-md"
          >
            {t('Assign')}
          </button>
        </div>

        {/* --- Group Management Section --- */}
        <h2 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-300 text-center">{t('Group Management')}</h2>
        {/* Create Group */}
        <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold">{t('Create New Group')}:</label>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGroup}
            onChange={e => setNewGroup(e.target.value)}
            placeholder={t('Group name')}
            className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            type="button"
            onClick={handleCreateGroup}
            className="px-4 py-2 rounded bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow-md"
          >
            {t('Create')}
          </button>
        </div>
        {groupCreateMsg && (
          <div className={`mb-4 ${groupCreateMsg.includes('created') ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'} p-3 rounded`}>
            {groupCreateMsg}
          </div>
        )}

        {/* Add Users to Group */}
        <label className="block mb-2 text-[#482307] dark:text-gray-200 font-semibold mt-8">{t('Add Users to Group')}:</label>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={selectedGroupForUsers}
            onChange={e => setSelectedGroupForUsers(e.target.value)}
          >
            <option value="">{t('-- Select Group --')}</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>
          <select
            multiple
            className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 h-24"
            value={selectedUsersForGroup}
            onChange={e => setSelectedUsersForGroup(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddUsersToGroup}
            className="px-4 py-2 rounded bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold shadow-md"
          >
            {t('Add Users')}
          </button>
        </div>
        {addUsersMsg && (
          <div className={`mb-4 ${addUsersMsg.includes('added') ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200'} p-3 rounded`}>
            {addUsersMsg}
          </div>
        )}

        {/* Group List and Edit Section */}
        <h2 className="text-2xl font-bold mt-10 mb-2 text-[#482307] dark:text-green-300">{t('Groups')}</h2>
        {deleteMsg && (
          <div className="mb-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 p-2 rounded">{deleteMsg}</div>
        )}
        {renameMsg && (
          <div className="mb-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 p-2 rounded">{renameMsg}</div>
        )}
        <ul className="mb-6">
          {groups.map(group => (
            <li key={group._id} className="flex items-center gap-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded p-2">
              {editingGroupId === group._id ? (
                <>
                  <input
                    type="text"
                    value={renameGroupName}
                    onChange={e => setRenameGroupName(e.target.value)}
                    className="p-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  />
                  <button onClick={() => handleRenameGroup(group._id)} className="px-2 py-1 bg-blue-500 text-white rounded">{t('Save')}</button>
                  <button onClick={() => {setEditingGroupId(null); setRenameGroupName("");}} className="px-2 py-1 bg-gray-400 text-white rounded">{t('Cancel')}</button>
                </>
              ) : (
                <>
                  <span className="flex-1">{group.name}</span>
                  <button onClick={() => {setEditingGroupId(group._id); setRenameGroupName(group.name);}} className="px-2 py-1 bg-yellow-500 text-white rounded">{t('Rename')}</button>
                  <button onClick={() => handleDeleteGroup(group._id)} className="px-2 py-1 bg-red-500 text-white rounded">{t('Delete')}</button>
                  <button onClick={() => startEditUsers(group)} className="px-2 py-1 bg-green-500 text-white rounded">{t('Edit Users')}</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {/* Edit Users in Group Modal/Inline */}
        {editUsersGroupId && (
          <div className="mb-6 p-4 bg-gray-200 dark:bg-gray-800 rounded">
            <h3 className="font-bold mb-2 text-[#482307] dark:text-green-200">{t('Edit Users in Group')}</h3>
            <div className="mb-1 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{t('Tip')}:</span> {t('Hold Ctrl (Windows) or Cmd (Mac) to select/deselect multiple users. Users already in the group are pre-selected.')}
            </div>
            <select
              multiple
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 mb-2 h-32"
              value={editUsersSelected}
              onChange={e => setEditUsersSelected(Array.from(e.target.selectedOptions, o => o.value))}
            >
              {users.map(user => (
                <option key={user._id} value={user._id} style={{ fontWeight: editUsersSelected.includes(user._id) ? 'bold' : 'normal' }}>
                  {editUsersSelected.includes(user._id) ? '✔ ' : ''}{user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleSaveEditUsers} className="px-3 py-1 bg-green-600 text-white rounded">{t('Save')}</button>
              <button onClick={() => setEditUsersGroupId(null)} className="px-3 py-1 bg-gray-500 text-white rounded">{t('Cancel')}</button>
            </div>
            {editUsersMsg && (
              <div className="mt-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 p-2 rounded">{editUsersMsg}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignTest;
