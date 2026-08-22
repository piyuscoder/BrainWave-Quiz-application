import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { 
  Shield, FileSpreadsheet, Plus, Trash2, Upload, AlertCircle, 
  CheckCircle2, ChevronLeft, ChevronRight, Info, X, HelpCircle,
  Atom, Globe, Layers, Terminal, Coffee, Cpu, Database, Calculator, BookOpen, Clock, Award,
  Edit3, Users, UserMinus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' or 'users'

  // User Management States
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserForResults, setSelectedUserForResults] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [loadingUserResults, setLoadingUserResults] = useState(false);

  // Quizzes Explorer States
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizForExplorer, setSelectedQuizForExplorer] = useState(null); // quiz object when exploring questions
  const [explorerQuestions, setExplorerQuestions] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [explorerLoading, setExplorerLoading] = useState(false);

  // Pagination for question explorer modal
  const [explorerPage, setExplorerPage] = useState(1);
  const [explorerTotalPages, setExplorerTotalPages] = useState(1);

  // Manual Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [targetQuizId, setTargetQuizId] = useState('');

  // CSV Drag and Drop Form States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvTitle, setCsvTitle] = useState('');
  const [csvDescription, setCsvDescription] = useState('');
  const [csvDifficulty, setCsvDifficulty] = useState('Medium');
  const [csvTimeLimit, setCsvTimeLimit] = useState(300);
  const [csvPoints, setCsvPoints] = useState(1);
  const [csvNegativePoints, setCsvNegativePoints] = useState(0.5);
  
  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [csvErrorsList, setCsvErrorsList] = useState([]); // holds parse errors
  const [csvSuccess, setCsvSuccess] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);

  // Quiz Editor States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuizId, setEditQuizId] = useState('');
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizDescription, setEditQuizDescription] = useState('');
  const [editQuizDifficulty, setEditQuizDifficulty] = useState('Medium');
  const [editQuizTimeLimit, setEditQuizTimeLimit] = useState(300);
  const [editQuizPoints, setEditQuizPoints] = useState(1);
  const [editQuizNegativePoints, setEditQuizNegativePoints] = useState(0.5);
  const [editQuizTechnology, setEditQuizTechnology] = useState('');

  // General Toast Notification
  const [operationMsg, setOperationMsg] = useState({ type: '', text: '' });

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await axios.get(`${API_URL}/api/questions/quizzes`);
      if (res.data.success) {
        setQuizzes(res.data.quizzes);
        if (res.data.quizzes.length > 0 && !targetQuizId) {
          setTargetQuizId(res.data.quizzes[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve quizzes.');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const showToast = (type, text) => {
    setOperationMsg({ type, text });
    setTimeout(() => setOperationMsg({ type: '', text: '' }), 5005);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/users`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve users list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleViewUserResults = async (user) => {
    setSelectedUserForResults(user);
    setLoadingUserResults(true);
    try {
      const res = await axios.get(`${API_URL}/api/quiz/user-results/${user._id}`);
      if (res.data.success) {
        setUserResults(res.data.results);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to fetch candidate performance logs.');
    } finally {
      setLoadingUserResults(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/auth/users/${userId}`);
      if (res.data.success) {
        showToast('success', 'User account successfully deleted.');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleOpenEditModal = (e, quiz) => {
    e.stopPropagation(); // prevent opening explorer
    setEditQuizId(quiz._id);
    setEditQuizTitle(quiz.title);
    setEditQuizDescription(quiz.description || '');
    setEditQuizDifficulty(quiz.difficulty || 'Medium');
    setEditQuizTimeLimit(quiz.timeLimit || 300);
    setEditQuizPoints(quiz.points || 1);
    setEditQuizNegativePoints(quiz.negativePoints || 0.5);
    setEditQuizTechnology(quiz.technology || quiz.title);
    setShowEditModal(true);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/questions/quizzes/${editQuizId}`, {
        title: editQuizTitle,
        description: editQuizDescription,
        difficulty: editQuizDifficulty,
        timeLimit: editQuizTimeLimit,
        points: editQuizPoints,
        negativePoints: editQuizNegativePoints,
        technology: editQuizTechnology,
      });

      if (res.data.success) {
        showToast('success', 'Quiz configuration updated successfully.');
        setShowEditModal(false);
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to update quiz box.');
    }
  };

  // Open modal/drawer to inspect questions for a specific quiz
  const handleExploreQuiz = async (quiz, page = 1) => {
    setSelectedQuizForExplorer(quiz);
    setExplorerPage(page);
    setExplorerLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/questions`, {
        params: {
          page: page,
          limit: 5,
          technology: quiz.technology || quiz.title,
          difficulty: quiz.difficulty,
        },
      });
      if (res.data.success) {
        setExplorerQuestions(res.data.questions);
        setExplorerTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to retrieve quiz questions.');
    } finally {
      setExplorerLoading(false);
    }
  };

  const handleDeleteQuiz = async (e, id) => {
    e.stopPropagation(); // prevent opening explorer
    if (!window.confirm('WARNING: Deleting this quiz will also delete all associated questions in the database. Proceed?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/questions/quizzes/${id}`);
      if (res.data.success) {
        showToast('success', 'Quiz box and all questions deleted.');
        fetchQuizzes();
        if (selectedQuizForExplorer?._id === id) {
          setSelectedQuizForExplorer(null);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete quiz package.');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const res = await axios.delete(`${API_URL}/api/questions/${qId}`);
      if (res.data.success) {
        showToast('success', 'Question deleted.');
        handleExploreQuiz(selectedQuizForExplorer, explorerPage);
        fetchQuizzes(); // refresh count
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to delete question.');
    }
  };

  const handleAddQuestionManual = async (e) => {
    e.preventDefault();
    if (!qText || !opt1 || !opt2 || !opt3 || !opt4 || !correctAnswer || !targetQuizId) {
      showToast('error', 'Please fill in all manual fields.');
      return;
    }

    const optionsArray = [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()];
    if (!optionsArray.includes(correctAnswer.trim())) {
      showToast('error', 'Correct answer must match one of the four options exactly.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/questions`, {
        text: qText,
        options: optionsArray,
        correctAnswer: correctAnswer.trim(),
        quizId: targetQuizId,
      });

      if (res.data.success) {
        showToast('success', 'Question created and linked successfully.');
        setShowAddForm(false);
        setQText('');
        setOpt1('');
        setOpt2('');
        setOpt3('');
        setOpt4('');
        setCorrectAnswer('');
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'Failed to insert question.');
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setCsvError('');
    setCsvErrorsList([]);
    setCsvSuccess('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvFile(file);
      } else {
        setCsvError('Only CSV files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    setCsvError('');
    setCsvErrorsList([]);
    setCsvSuccess('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setCsvFile(file);
      } else {
        setCsvError('Only CSV files are supported.');
      }
    }
  };

  const handleUploadCsv = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setCsvError('Please select or drop a CSV file first.');
      return;
    }
    if (!csvTitle) {
      setCsvError('Please enter a Quiz Title.');
      return;
    }

    setCsvUploading(true);
    setCsvError('');
    setCsvErrorsList([]);
    setCsvSuccess('');

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('title', csvTitle);
    formData.append('description', csvDescription);
    formData.append('difficulty', csvDifficulty);
    formData.append('timeLimit', csvTimeLimit);
    formData.append('points', csvPoints);
    formData.append('negativePoints', csvNegativePoints);
    formData.append('technology', csvTitle); 

    try {
      const res = await axios.post(`${API_URL}/api/questions/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('success', res.data.message);
        setShowUploadModal(false);
        setCsvFile(null);
        setCsvTitle('');
        setCsvDescription('');
        setCsvDifficulty('Medium');
        setCsvTimeLimit(300);
        setCsvPoints(1);
        setCsvNegativePoints(0.5);
        fetchQuizzes();
      }
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data && data.errors) {
        setCsvErrorsList(data.errors);
        setCsvError('Upload validation failed. Verify line errors below.');
      } else {
        setCsvError(data?.message || 'Failed to upload CSV file.');
      }
    } finally {
      setCsvUploading(false);
    }
  };

  const getTechIcon = (techName) => {
    const name = techName.toLowerCase();
    if (name.includes('react')) return <Atom className="h-6 w-6 text-cyan-400" />;
    if (name.includes('html')) return <Globe className="h-6 w-6 text-orange-400" />;
    if (name.includes('css')) return <Layers className="h-6 w-6 text-blue-400" />;
    if (name.includes('js') || name.includes('javascript')) return <Terminal className="h-6 w-6 text-yellow-400" />;
    if (name.includes('java')) return <Coffee className="h-6 w-6 text-red-400" />;
    if (name.includes('python')) return <Cpu className="h-6 w-6 text-yellow-500" />;
    if (name.includes('mongo') || name.includes('db')) return <Database className="h-6 w-6 text-emerald-400" />;
    if (name.includes('math') || name.includes('calc')) return <Calculator className="h-6 w-6 text-purple-400" />;
    return <BookOpen className="h-6 w-6 text-cyan-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Header panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7 text-cyan-400" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage database questions repositories and build/upload quiz sheets</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-cyan-400" />
            <span>Upload Spreadsheet</span>
          </button>
          
          {quizzes.length > 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md transition-all flex items-center space-x-1.5 hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Single Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {operationMsg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2.5 text-sm max-w-md border ${
          operationMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {operationMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{operationMsg.text}</span>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-slate-905 gap-6">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'quizzes'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Quizzes Repository</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-450 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </button>
      </div>

      {/* Tab 1: Quizzes Explorer */}
      {activeTab === 'quizzes' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Questions Repository (Boxes)</h3>

          {loadingQuizzes ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm space-y-4">
              <p>No quiz boxes configured yet. Use the uploader on the top right to start!</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 py-2 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Configure & Upload Spreadsheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  onClick={() => handleExploreQuiz(quiz, 1)}
                  className="p-5 bg-slate-950/40 border border-slate-850 hover:border-cyan-500/30 rounded-2xl space-y-4 cursor-pointer relative group transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:shadow-cyan-500/5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                        {getTechIcon(quiz.technology)}
                      </div>
                      <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => handleOpenEditModal(e, quiz)}
                          className="text-slate-500 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-cyan-500/10 cursor-pointer"
                          title="Edit Quiz Box Config"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteQuiz(e, quiz._id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                          title="Delete Quiz Box"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-white capitalize truncate">{quiz.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                        {quiz.difficulty} Difficulty • {quiz.questions?.length || 0} Questions
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed h-8">
                      {quiz.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata summary stats */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 border-t border-slate-905/60 pt-3 mt-2">
                    <div><span className="font-semibold block text-slate-400">{quiz.timeLimit}s</span> Duration limit</div>
                    <div><span className="font-semibold block text-slate-400">+{quiz.points} / -{quiz.negativePoints}</span> Score weight</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Registered Candidates</h3>

          {loadingUsers ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No registered user accounts found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Date Joined</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {users.map((u) => {
                    const isSelf = currentAdmin?._id === u._id;
                    return (
                      <tr 
                        key={u._id} 
                        onClick={() => handleViewUserResults(u)}
                        className="hover:bg-slate-900/30 transition-colors cursor-pointer"
                        title="Click to view candidate quiz records"
                      >
                        <td className="py-4 px-4 font-semibold text-slate-200 capitalize flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-955 border border-slate-850 flex items-center justify-center font-bold text-[10px] text-cyan-400 uppercase">
                            {u.username.charAt(0)}
                          </div>
                          <span>{u.username}</span>
                        </td>
                        <td className="py-4 px-4 text-slate-400">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] border ${
                            u.role === 'admin' 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                              : 'bg-slate-950 text-slate-450 border-slate-850'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isSelf 
                                ? 'border-transparent text-slate-700 opacity-40 cursor-not-allowed'
                                : 'border-slate-850 hover:border-red-500/20 text-slate-450 hover:text-red-400 hover:bg-red-500/10'
                            }`}
                            title={isSelf ? 'Cannot delete your active admin account' : 'Delete Candidate Account'}
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CENTERED DIALOG MODAL 1: SPREADSHEET CREATOR FORM */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/5 rounded-full blur-[45px] pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Spreadsheet Creator</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadCsv} className="space-y-4">
              {/* Quiz Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Title / Technology</label>
                <input
                  type="text"
                  placeholder="e.g. React Basics, CSS Grid"
                  value={csvTitle}
                  onChange={(e) => setCsvTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Description</label>
                <textarea
                  placeholder="Summarize concepts assessed in this quiz..."
                  value={csvDescription}
                  onChange={(e) => setCsvDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white p-3 rounded-xl outline-none text-xs min-h-[60px]"
                />
              </div>

              {/* Difficulty & Time Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
                  <select
                    value={csvDifficulty}
                    onChange={(e) => setCsvDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  >
                    <option value="Easy">Easy (Low)</option>
                    <option value="Medium">Medium (Medium)</option>
                    <option value="Hard">Hard (High)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timer Limit (secs)</label>
                  <input
                    type="number"
                    value={csvTimeLimit}
                    onChange={(e) => setCsvTimeLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
              </div>

              {/* Points Weight & Negative Marking */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct Point Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    value={csvPoints}
                    onChange={(e) => setCsvPoints(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Negative Points Weight</label>
                  <input
                    type="number"
                    step="0.05"
                    value={csvNegativePoints}
                    onChange={(e) => setCsvNegativePoints(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
              </div>

              {/* Drag & Drop Input Zone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">File Attachment (CSV)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-cyan-500 bg-cyan-500/5' 
                      : csvFile 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                  }`}
                >
                  <input
                    id="csv-file-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                    <div className="p-2 bg-slate-900 border border-slate-855 rounded-lg w-fit mx-auto text-slate-450">
                      <Upload className="h-5 w-5" />
                    </div>
                    {csvFile ? (
                      <div>
                        <p className="text-emerald-400 text-xs font-bold truncate max-w-[200px] mx-auto">{csvFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-350">Drag & Drop Quiz CSV</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">or select files</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Errors/success logs inside modal */}
              {csvError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-[11px] flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{csvError}</span>
                </div>
              )}

              {csvErrorsList.length > 0 && (
                <div className="bg-slate-950 border border-red-500/15 rounded-xl p-3 space-y-1.5 text-[10px] max-h-[120px] overflow-y-auto">
                  <div className="font-bold text-red-450 uppercase tracking-wider mb-1">CSV Template Line Errors:</div>
                  {csvErrorsList.map((err, idx) => (
                    <div key={idx} className="text-slate-450 border-l border-red-500/30 pl-2">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={csvUploading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {csvUploading ? (
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Quiz & Load CSV</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CENTERED DIALOG MODAL 2: INSPECT QUESTIONS */}
      {selectedQuizForExplorer && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {getTechIcon(selectedQuizForExplorer.technology)}
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{selectedQuizForExplorer.title} Questions</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Explore question listings for this quiz box</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedQuizForExplorer(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {explorerLoading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
              </div>
            ) : explorerQuestions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No questions found in this quiz. You can create a question manually to populate it.
              </div>
            ) : (
              <div className="space-y-4">
                {explorerQuestions.map((q, idx) => (
                  <div key={q._id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 relative group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-slate-450 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded mr-2">
                          Q{(explorerPage - 1) * 5 + idx + 1}
                        </span>
                        <p className="text-slate-200 text-xs font-semibold mt-1 leading-relaxed">{q.text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2 text-[10px] text-slate-500 pl-1 mt-1">
                      <div>Correct Choice: <span className="text-emerald-400 font-bold">{q.correctAnswer}</span></div>
                      <div>Options Count: {q.options.length} Choices</div>
                    </div>
                  </div>
                ))}

                {/* Paginate Explorer */}
                {explorerTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                    <span className="text-xs text-slate-550">
                      Page {explorerPage} of {explorerTotalPages}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        disabled={explorerPage === 1}
                        onClick={() => handleExploreQuiz(selectedQuizForExplorer, explorerPage - 1)}
                        className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        disabled={explorerPage === explorerTotalPages}
                        onClick={() => handleExploreQuiz(selectedQuizForExplorer, explorerPage + 1)}
                        className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CENTERED DIALOG MODAL 3: MANUAL SINGLE QUESTION ADD */}
      {showAddForm && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Insert Single Question</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionManual} className="space-y-4">
              {/* Target Quiz select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Quiz Box</label>
                <select
                  value={targetQuizId}
                  onChange={(e) => setTargetQuizId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                >
                  {quizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id} className="bg-slate-955 text-slate-200">
                      {quiz.title} ({quiz.technology})
                    </option>
                  ))}
                </select>
              </div>

              {/* Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Question Content</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Type the question text..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white p-3 rounded-xl outline-none text-xs min-h-[60px]"
                  required
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Option 1</label>
                  <input
                    type="text"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    placeholder="Choice A"
                    className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Option 2</label>
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    placeholder="Choice B"
                    className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Option 3</label>
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    placeholder="Choice C"
                    className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Option 4</label>
                  <input
                    type="text"
                    value={opt4}
                    onChange={(e) => setOpt4(e.target.value)}
                    placeholder="Choice D"
                    className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
              </div>

              {/* Correct answer match */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct Option String</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Must match target option exactly"
                  className="w-full bg-slate-955 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 py-3 rounded-xl font-bold transition-all text-xs mt-4 shadow-lg shadow-cyan-500/10 cursor-pointer"
              >
                Link Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CENTERED DIALOG MODAL 4: EDIT QUIZ METADATA */}
      {showEditModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/5 rounded-full blur-[45px] pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Edit Quiz Box</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateQuiz} className="space-y-4">
              {/* Quiz Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Title</label>
                <input
                  type="text"
                  placeholder="e.g. React Basics"
                  value={editQuizTitle}
                  onChange={(e) => setEditQuizTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  required
                />
              </div>

              {/* Technology Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technology Category</label>
                <input
                  type="text"
                  placeholder="e.g. React"
                  value={editQuizTechnology}
                  onChange={(e) => setEditQuizTechnology(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Description</label>
                <textarea
                  placeholder="Summarize concepts assessed in this quiz..."
                  value={editQuizDescription}
                  onChange={(e) => setEditQuizDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 text-white p-3 rounded-xl outline-none text-xs min-h-[60px]"
                />
              </div>

              {/* Difficulty & Time Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Difficulty</label>
                  <select
                    value={editQuizDifficulty}
                    onChange={(e) => setEditQuizDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                  >
                    <option value="Easy">Easy (Low)</option>
                    <option value="Medium">Medium (Medium)</option>
                    <option value="Hard">Hard (High)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timer Limit (secs)</label>
                  <input
                    type="number"
                    value={editQuizTimeLimit}
                    onChange={(e) => setEditQuizTimeLimit(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
              </div>

              {/* Points Weight & Negative Marking */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct Point Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editQuizPoints}
                    onChange={(e) => setEditQuizPoints(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-850 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Negative Points Weight</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editQuizNegativePoints}
                    onChange={(e) => setEditQuizNegativePoints(e.target.value)}
                    className="w-full bg-slate-955 border border-slate-855 focus:border-cyan-500 text-white px-3 py-2.5 rounded-xl outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 py-3.5 rounded-xl font-bold transition-all text-sm mt-4 shadow-lg shadow-cyan-500/10 cursor-pointer"
              >
                Save Quiz Box
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CENTERED DIALOG MODAL 5: USER PERFORMANCE HISTORY */}
      {selectedUserForResults && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/5 rounded-full blur-[45px] pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-xs text-cyan-400 uppercase">
                  {selectedUserForResults.username.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white capitalize">{selectedUserForResults.username}'s History</h3>
                  <p className="text-[10px] text-slate-500">{selectedUserForResults.email}</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedUserForResults(null); setUserResults([]); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingUserResults ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500 mx-auto"></div>
              </div>
            ) : userResults.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                This candidate has not attempted any quizzes yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {userResults.map((result) => (
                  <div key={result._id} className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white capitalize">{result.technology}</h4>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">{result.difficulty} Level</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-cyan-400">{result.score}%</span>
                        <span className="text-[9px] text-slate-550 block">Accuracy</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-455 border-t border-slate-900 pt-2.5">
                      <div>Correct: <span className="text-emerald-400 font-bold">{result.correctAnswers}</span></div>
                      <div>Wrong: <span className="text-red-400 font-bold">{result.wrongAnswers}</span></div>
                      <div>Skipped: <span className="text-slate-400 font-bold">{result.unattemptedAnswers}</span></div>
                    </div>

                    <div className="text-[9px] text-slate-500 text-right font-medium">
                      Date: {new Date(result.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
