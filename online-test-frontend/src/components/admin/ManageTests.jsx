import React, { useEffect, useState, lazy, Suspense } from 'react';
import axios from '../../utils/axios';
import { useTranslation } from 'react-i18next';

// Lazy load heavy admin components
const BulkUpload = lazy(() => import('./BulkUpload'));
const AssignTest = lazy(() => import('./AssignTest'));
const Analytics = lazy(() => import('./Analytics'));
const AdminResults = lazy(() => import('./AdminResults'));
const ManageUsers = lazy(() => import('./ManageUsers'));
const Security = lazy(() => import('./Security'));
const TestSettings = lazy(() => import('./TestSettings'));

const initialQuestion = {
  questionText: { en: '', mr: '' },
  options: [
    { en: '', mr: '' },
    { en: '', mr: '' },
    { en: '', mr: '' },
    { en: '', mr: '' },
  ],
  correctAnswer: null,
  marks: 1,
};

const initialForm = {
  title: { en: '', mr: '' },
  description: { en: '', mr: '' },
  totalMarks: '',
  duration: '',
  questions: [JSON.parse(JSON.stringify(initialQuestion))],
};

const ManageTests = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 10;
  const [editMode, setEditMode] = useState(false);
  const [editTestId, setEditTestId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/tests');
        setTests(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, dataset } = e.target;
    if (dataset.lang) {
      setForm({ ...form, [name]: { ...form[name], [dataset.lang]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleQuestionChange = (idx, field, value, lang) => {
    const updatedQuestions = [...form.questions];
    if (field === 'questionText') {
      updatedQuestions[idx].questionText[lang] = value;
    } else if (field === 'option') {
      updatedQuestions[idx].options[lang.optionIdx][lang.lang] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[idx].correctAnswer = Number(value);
    } else if (field === 'marks') {
      updatedQuestions[idx].marks = Number(value);
    }
    setForm({ ...form, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, JSON.parse(JSON.stringify(initialQuestion))] });
  };

  const removeQuestion = (idx) => {
    if (form.questions.length === 1) return;
    const updatedQuestions = form.questions.filter((_, i) => i !== idx);
    setForm({ ...form, questions: updatedQuestions });
  };

  // Open modal for editing
  const handleEdit = async (test) => {
    setEditMode(true);
    setEditTestId(test._id);
    setLoading(true);
    try {
      // Fetch full test with questions from backend
      const res = await axios.get(`/tests/${test._id}`);
      // Normalize questions and options to expected structure
      const normalizeQuestion = (q) => ({
        questionText: q.questionText || { en: '', mr: '' },
        options: Array.isArray(q.options)
          ? q.options.map(opt => ({
              en: (opt && typeof opt === 'object' && 'en' in opt) ? opt.en : (typeof opt === 'string' ? opt : ''),
              mr: (opt && typeof opt === 'object' && 'mr' in opt) ? opt.mr : (typeof opt === 'string' ? opt : ''),
            }))
          : [ { en: '', mr: '' }, { en: '', mr: '' }, { en: '', mr: '' }, { en: '', mr: '' } ],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : null,
        marks: typeof q.marks === 'number' ? q.marks : 1,
      });
      const fullTest = {
        title: res.data.title || { en: '', mr: '' },
        description: res.data.description || { en: '', mr: '' },
        totalMarks: res.data.totalMarks || '',
        duration: res.data.duration || '',
        questions: Array.isArray(res.data.questions) && res.data.questions.length > 0
          ? res.data.questions.map(normalizeQuestion)
          : [JSON.parse(JSON.stringify(initialQuestion))],
      };
      setForm(fullTest);
      setJsonInput(JSON.stringify(fullTest, null, 2));
      setShowModal(true);
      setJsonMode(false);
      setFormError(null);
      setJsonError(null);
    } catch (err) {
      setError('Failed to fetch test details.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between form and JSON mode in modal
  const handleToggleMode = (toJson) => {
    if (toJson) {
      // Going to JSON mode: fill textarea with current form as JSON (including all questions)
      setJsonInput(JSON.stringify(form, null, 2));
      setJsonMode(true);
      setFormError(null);
    } else {
      // Going to form mode: try to parse JSON and update form (including all questions)
      try {
        const parsed = JSON.parse(jsonInput);
        // Normalize questions and options
        const normalizeQuestion = (q) => ({
          questionText: q.questionText || { en: '', mr: '' },
          options: Array.isArray(q.options)
            ? q.options.map(opt => ({
                en: (opt && typeof opt === 'object' && 'en' in opt) ? opt.en : (typeof opt === 'string' ? opt : ''),
                mr: (opt && typeof opt === 'object' && 'mr' in opt) ? opt.mr : (typeof opt === 'string' ? opt : ''),
              }))
            : [ { en: '', mr: '' }, { en: '', mr: '' }, { en: '', mr: '' }, { en: '', mr: '' } ],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : null,
          marks: typeof q.marks === 'number' ? q.marks : 1,
        });
        setForm({
          title: parsed.title || { en: '', mr: '' },
          description: parsed.description || { en: '', mr: '' },
          totalMarks: parsed.totalMarks || '',
          duration: parsed.duration || '',
          questions: Array.isArray(parsed.questions) && parsed.questions.length > 0
            ? parsed.questions.map(normalizeQuestion)
            : [JSON.parse(JSON.stringify(initialQuestion))],
        });
        setJsonMode(false);
        setJsonError(null);
      } catch (err) {
        setJsonError('Invalid JSON. Cannot switch to form mode.');
      }
    }
  };

  // Handle create or update
  const handleCreateTest = async (e) => {
    e.preventDefault();
    setFormError(null);
    setJsonError(null);
    if (jsonMode) {
      // JSON mode: parse and validate JSON
      let parsed;
      try {
        parsed = JSON.parse(jsonInput);
      } catch (err) {
        setJsonError('Invalid JSON format.');
        return;
      }
      if (!parsed.title || !parsed.description || !parsed.questions) {
        setJsonError('JSON must include title, description, and questions.');
        return;
      }
      if (editMode && editTestId) {
        setCreating(true);
        try {
          const res = await axios.put(`/tests/${editTestId}`, parsed);
          setTests(tests.map(t => t._id === editTestId ? res.data : t));
          setShowModal(false);
          setJsonInput('');
          setEditMode(false);
          setEditTestId(null);
        } catch (err) {
          setJsonError(err.response?.data?.message || 'Failed to update test');
        } finally {
          setCreating(false);
        }
        return;
      }
      setCreating(true);
      try {
        const res = await axios.post('/tests', parsed);
        setTests([res.data, ...tests]);
        setShowModal(false);
        setJsonInput('');
      } catch (err) {
        setJsonError(err.response?.data?.message || 'Failed to create test');
      } finally {
        setCreating(false);
      }
      return;
    }
    if (!form.title.en || !form.title.mr || !form.description.en || !form.description.mr || !form.totalMarks || !form.duration) {
      setFormError('All fields are required in both languages.');
      return;
    }
    // Validate questions
    for (const q of form.questions) {
      if (!q.questionText.en || !q.questionText.mr) {
        setFormError('Each question must have English and Marathi text.');
        return;
      }
      for (const opt of q.options) {
        if (!opt.en || !opt.mr) {
          setFormError('Each option must have English and Marathi text.');
          return;
        }
      }
      if (q.correctAnswer === null || q.correctAnswer === undefined) {
        setFormError('Please select the correct answer for every question.');
        return;
      }
    }
    setCreating(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        totalMarks: Number(form.totalMarks),
        duration: Number(form.duration),
        questions: form.questions,
      };
      if (editMode && editTestId) {
        const res = await axios.put(`/tests/${editTestId}`, payload);
        setTests(tests.map(t => t._id === editTestId ? res.data : t));
        setShowModal(false);
        setForm(initialForm);
        setEditMode(false);
        setEditTestId(null);
      } else {
        const res = await axios.post('/tests', payload);
        setTests([res.data, ...tests]);
        setShowModal(false);
        setForm(initialForm);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || (editMode ? 'Failed to update test' : 'Failed to create test'));
    } finally {
      setCreating(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/tests/${deleteId}`);
      setTests(tests.filter(t => t._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete test');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Defensive: always use array for tests
  const safeTests = Array.isArray(tests) ? tests : [];

  // Filtered and paginated tests
  const filteredTests = safeTests.filter(test => {
    const title = typeof test.title === 'object' ? Object.values(test.title).join(' ').toLowerCase() : String(test.title).toLowerCase();
    const desc = typeof test.description === 'object' ? Object.values(test.description).join(' ').toLowerCase() : String(test.description).toLowerCase();
    return title.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(filteredTests.length / testsPerPage) || 1;
  const paginatedTests = filteredTests.slice((currentPage - 1) * testsPerPage, currentPage * testsPerPage);

  // Reset to page 1 on search
  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400 text-center">{t('Manage Tests')}</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <input
          type="text"
          placeholder={t('Search tests...')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
        />
        <button
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold shadow-md transition text-base"
          onClick={() => setShowModal(true)}
        >
          + {t('Create Test')}
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#232e41] rounded-xl p-4 sm:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold"
              onClick={() => { setShowModal(false); setEditMode(false); setEditTestId(null); setForm(initialForm); setJsonInput(''); }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#482307] dark:text-green-400">{editMode ? t('Edit Test') : t('Create New Test')}</h2>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                className={`px-4 py-1 rounded-lg font-semibold transition ${!jsonMode ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100'}`}
                onClick={() => handleToggleMode(false)}
              >
                {t('Form')}
              </button>
              <button
                type="button"
                className={`px-4 py-1 rounded-lg font-semibold transition ${jsonMode ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100'}`}
                onClick={() => handleToggleMode(true)}
              >
                {t('JSON')}
              </button>
            </div>
            {jsonMode ? (
              <form onSubmit={handleCreateTest} className="flex flex-col gap-4 flex-1 overflow-y-auto">
                <textarea
                  className="w-full min-h-[300px] py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-[#482307] placeholder:text-[#a1724e] text-base font-mono"
                  placeholder={t('Paste test JSON here...')}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  required
                />
                {jsonError && <div className="text-red-600 dark:text-red-400 text-sm">{jsonError}</div>}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold shadow-md transition text-base flex justify-center items-center"
                >
                  {creating ? (editMode ? t('Saving...') : t('Creating...')) : (editMode ? t('Edit') : t('Create Test'))}
                </button>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('Example')}: {`{"title":{"en":"Test Name","mr":"टेस्ट नाव"},"description":{"en":"Desc","mr":"वर्णन"},"totalMarks":100,"duration":60,"questions":[{"questionText":{"en":"Q1?","mr":"Q1?"},"options":[{"en":"A","mr":"अ"},{"en":"B","mr":"ब"},{"en":"C","mr":"क"},{"en":"D","mr":"ड"}],"correctAnswer":0,"marks":1}]} `}
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateTest} className="space-y-4 flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    name="title"
                    data-lang="en"
                    placeholder={t('Test Name (English)')}
                    value={form.title.en}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                  />
                  <input
                    type="text"
                    name="title"
                    data-lang="mr"
                    placeholder={t('Test Name (Marathi)')}
                    value={form.title.mr}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    name="description"
                    data-lang="en"
                    placeholder={t('Description (English)')}
                    value={form.description.en}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                  />
                  <textarea
                    name="description"
                    data-lang="mr"
                    placeholder={t('Description (Marathi)')}
                    value={form.description.mr}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="number"
                    name="totalMarks"
                    placeholder={t('Total Marks')}
                    value={form.totalMarks}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    name="duration"
                    placeholder={t('Duration (min)')}
                    value={form.duration}
                    onChange={handleInputChange}
                    className="w-full py-2 px-3 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 outline-none text-[#482307] placeholder:text-[#a1724e] dark:placeholder:text-gray-400 text-base font-medium focus:ring-2 focus:ring-[#a1724e] dark:focus:ring-green-400"
                    required
                    min="1"
                  />
                </div>
                <div className="border-t border-[#a1724e] dark:border-gray-600 pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-[#482307] dark:text-green-400">{t('Questions')}</h3>
                  {(Array.isArray(form.questions) ? form.questions : []).map((q, idx) => (
                    <div key={idx} className="mb-6 p-4 rounded-lg border border-[#a1724e] dark:border-gray-600 bg-[#fff9ea] dark:bg-gray-800 relative flex flex-col gap-2">
                      {form.questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(idx)} className="absolute top-2 right-2 text-red-500 text-lg font-bold z-10" title={t('Remove this question')}>×</button>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder={t('Question (English)')} value={q.questionText.en} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value, 'en')} className="w-full py-1 px-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-[#482307] placeholder:text-[#a1724e] text-sm" required />
                        <input type="text" placeholder={t('Question (Marathi)')} value={q.questionText.mr} onChange={e => handleQuestionChange(idx, 'questionText', e.target.value, 'mr')} className="w-full py-1 px-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-[#482307] placeholder:text-[#a1724e] text-sm" required />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-[#a1724e] dark:text-green-400 mb-1">{t('Options & Correct Answer')}</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex flex-col gap-1 p-2 rounded bg-white dark:bg-gray-700 border border-[#a1724e] dark:border-gray-600">
                              <div className="flex items-center gap-2 mb-1">
                                <input type="radio" name={`correct-${idx}`} checked={q.correctAnswer === oIdx} onChange={() => handleQuestionChange(idx, 'correctAnswer', oIdx)} className="accent-green-600" />
                                <span className="text-xs text-[#a1724e] dark:text-green-400">{t('Correct')}</span>
                              </div>
                              <input type="text" placeholder={`${t('Option')} ${oIdx + 1} (${t('English')})`} value={opt.en} onChange={e => handleQuestionChange(idx, 'option', e.target.value, { optionIdx: oIdx, lang: 'en' })} className="w-full py-1 px-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-[#482307] placeholder:text-[#a1724e] text-sm" required />
                              <input type="text" placeholder={`${t('Option')} ${oIdx + 1} (${t('Marathi')})`} value={opt.mr} onChange={e => handleQuestionChange(idx, 'option', e.target.value, { optionIdx: oIdx, lang: 'mr' })} className="w-full py-1 px-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-[#482307] placeholder:text-[#a1724e] text-sm" required />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mt-2">
                        <label className="text-sm text-[#a1724e] dark:text-green-400">{t('Marks')}:</label>
                        <input type="number" min="1" value={q.marks} onChange={e => handleQuestionChange(idx, 'marks', e.target.value)} className="w-20 py-1 px-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-[#482307] text-sm" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addQuestion} className="px-4 py-1 rounded bg-green-500 hover:bg-green-600 text-white font-semibold text-sm mt-2">+ {t('Add Question')}</button>
                </div>
                {formError && <div className="text-red-600 dark:text-red-400 text-sm">{formError}</div>}
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold shadow-md transition text-base flex justify-center items-center"
                >
                  {creating ? (editMode ? t('Saving...') : t('Creating...')) : (editMode ? t('Edit') : t('Create Test'))}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#232e41] rounded-xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4 text-[#482307] dark:text-green-400">{t('Delete Test?')}</h3>
            <p className="mb-6 text-[#a1724e] dark:text-gray-200 text-center">{t('Are you sure you want to delete this test? This action cannot be undone.')}</p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >{t('Cancel')}</button>
              <button
                className="px-4 py-2 rounded bg-gradient-to-r from-[#ff5e62] to-[#ff9966] hover:from-[#dc2626] hover:to-[#f59e42] dark:from-[#f87171] dark:to-[#fbbf24] text-white font-semibold shadow-md"
                onClick={handleDelete}
                disabled={deleteLoading}
              >{deleteLoading ? t('Deleting...') : t('Delete')}</button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center text-lg text-[#a1724e] dark:text-green-400">{t('Loading tests...')}</div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full bg-white dark:bg-[#181f2a] rounded-xl shadow-xl border border-[#a1724e] dark:border-[#263040] text-[#482307] dark:text-gray-100">
            <thead>
              <tr className="bg-[#f5e6d6] dark:bg-[#232e41]">
                <th className="py-3 px-4 text-left">{t('Title')}</th>
                <th className="py-3 px-4 text-left">{t('Description')}</th>
                <th className="py-3 px-4 text-left">{t('Marks')}</th>
                <th className="py-3 px-4 text-left">{t('Duration')}</th>
                <th className="py-3 px-4 text-right">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTests.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-[#a1724e] dark:text-green-400">{t('No tests found.')}</td></tr>
              ) : paginatedTests.map((test) => (
                <tr
                  key={test._id}
                  className="border-t border-[#a1724e] dark:border-[#263040] hover:bg-[#f5e6d6]/60 dark:hover:bg-[#232e41]/60 transition-colors"
                >
                  <td className="py-2 px-4 align-middle">
                    {typeof test.title === 'object' && test.title !== null
                      ? test.title[currentLang] || test.title.en || Object.values(test.title).join(' / ')
                      : test.title}
                  </td>
                  <td className="py-2 px-4 align-middle">
                    {typeof test.description === 'object' && test.description !== null
                      ? test.description[currentLang] || test.description.en || Object.values(test.description).join(' / ')
                      : test.description}
                  </td>
                  <td className="py-2 px-4 align-middle">{test.totalMarks}</td>
                  <td className="py-2 px-4 align-middle">{test.duration} min</td>
                  <td className="py-2 px-4 align-middle text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="min-w-[90px] px-4 py-2 rounded-lg bg-gradient-to-r from-[#4f8cff] to-[#1e40af] hover:from-[#2563eb] hover:to-[#1e3a8a] dark:from-[#60a5fa] dark:to-[#1e293b] text-white font-semibold transition shadow-md text-sm"
                        onClick={() => handleEdit(test)}
                      >{t('Edit')}</button>
                      <button
                        className="min-w-[90px] px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff5e62] to-[#ff9966] hover:from-[#dc2626] hover:to-[#f59e42] dark:from-[#f87171] dark:to-[#fbbf24] text-white font-semibold transition shadow-md text-sm"
                        onClick={() => setDeleteId(test._id)}
                      >{t('Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >{t('Prev')}</button>
            <span className="text-[#482307] dark:text-green-400 font-medium">{t('Page')} {currentPage} {t('of')} {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-[#482307] dark:text-gray-100 font-semibold disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >{t('Next')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTests;

/*
  Example usage for lazy loading:
  <Suspense fallback={<div>Loading...</div>}>
    <BulkUpload />
  </Suspense>
*/
