import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from '../../utils/axios';
import { useTranslation } from 'react-i18next';

const BulkUpload = () => {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch all tests for dropdown
    const fetchTests = async () => {
      try {
        const res = await axios.get('/tests');
        setTests(res.data);
      } catch (err) {
        setError('Failed to load tests');
      }
    };
    fetchTests();
  }, []);

  const handleFileChange = (e) => {
    setError(null);
    setQuestions([]);
    setPreview(false);
    setSuccess(null);
    const f = e.target.files[0];
    setFile(f);
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.data.length) {
            setError('CSV is empty or invalid.');
            return;
          }
          setQuestions(results.data);
          setPreview(true);
        },
        error: () => setError('Failed to parse CSV.')
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          if (!Array.isArray(data) || !data.length) throw new Error();
          setQuestions(data);
          setPreview(true);
        } catch {
          setError('Invalid JSON file.');
        }
      };
      reader.readAsText(f);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const workbook = XLSX.read(evt.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          if (!Array.isArray(data) || !data.length) throw new Error();
          setQuestions(data);
          setPreview(true);
        } catch {
          setError('Invalid Excel file.');
        }
      };
      reader.readAsBinaryString(f);
    } else {
      setError('Only CSV, JSON, or Excel files are supported.');
    }
  };

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    if (!selectedTest) {
      setError('Please select a test.');
      return;
    }
    if (!file) {
      setError('Please select a file.');
      return;
    }
    // Remove CSV-only restriction, allow JSON and Excel import
    const ext = file.name.split('.').pop().toLowerCase();
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/tests/${selectedTest}/questions/bulk`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Questions imported successfully!');
      setPreview(false);
      setQuestions([]);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9ea] dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#482307] dark:text-green-400 text-center">{t('Bulk Upload Questions')}</h1>
      <div className="bg-white dark:bg-[#232e41] rounded-xl shadow-xl p-6 w-full max-w-2xl mx-auto">
        <label className="block mb-2 font-semibold">{t('Select Test')}:</label>
        <select
          className="w-full p-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={selectedTest}
          onChange={e => setSelectedTest(e.target.value)}
        >
          <option value="" className="bg-white text-[#482307] dark:bg-gray-700 dark:text-gray-100">-- {t('Select Test')} --</option>
          {tests.map(test => (
            <option key={test._id} value={test._id} className="bg-white text-[#482307] dark:bg-gray-700 dark:text-gray-100">{test.title?.en || test.title}</option>
          ))}
        </select>
        <label className="block mb-2 font-semibold">{t('Upload File')} (CSV, JSON, Excel):</label>
        <input type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileChange} className="mb-4 w-full p-2 rounded border border-[#a1724e] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400 file:bg-[#f5e6d6] file:dark:bg-gray-800 file:text-[#482307] file:dark:text-gray-100 file:rounded file:border-none file:mr-2" />
        <div className="text-xs mb-2 text-[#a1724e] dark:text-gray-300">
          <b>{t('CSV/Excel columns required')}:</b> questionText_en, questionText_mr, option1_en, option1_mr, option2_en, option2_mr, option3_en, option3_mr, option4_en, option4_mr, correctAnswer (0-3), marks (optional)<br/>
          <b>{t('JSON')}:</b> Array of question objects with the same fields.<br/>
          <b>{t('Note')}:</b> Only CSV import is supported by backend. Use Excel/JSON for preview/validation only.
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {preview && questions.length > 0 && (
          <React.Fragment>
            <div className="mb-2 font-semibold">{t('Preview')} ({questions.length} {t('questions')}):</div>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border border-[#a1724e] dark:border-[#263040]">
                <thead>
                  <tr>
                    {Object.keys(questions[0]).map((key) => (
                      <th key={key} className="py-1 px-2 border-b border-[#a1724e] dark:border-[#263040]">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.slice(0, 10).map((q, i) => (
                    <tr key={i} className="border-b border-[#a1724e] dark:border-[#263040]">
                      {Object.values(q).map((val, j) => (
                        <td key={j} className="py-1 px-2">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {questions.length > 10 && <div className="text-xs mt-1">{t('Showing first 10 of')} {questions.length} {t('questions')}.</div>}
            </div>
            <button onClick={handleImport} disabled={importing} className="px-4 py-2 rounded bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold">
              {importing ? t('Importing...') : t('Import')}
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
