import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { 
  Atom, Globe, Layers, Terminal, Coffee, Cpu, Database, Calculator, 
  BookOpen, Play, ShieldAlert, Award, HelpCircle, X, ChevronRight, Settings
} from 'lucide-react';

const QuizSetup = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/questions/quizzes`);
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Could not connect to database server.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const getTechIcon = (techName) => {
    const name = techName.toLowerCase();
    if (name.includes('react')) return <Atom className="h-8 w-8 text-cyan-400" />;
    if (name.includes('html')) return <Globe className="h-8 w-8 text-orange-400" />;
    if (name.includes('css')) return <Layers className="h-8 w-8 text-blue-400" />;
    if (name.includes('js') || name.includes('javascript')) return <Terminal className="h-8 w-8 text-yellow-400" />;
    if (name.includes('java')) return <Coffee className="h-8 w-8 text-red-400" />;
    if (name.includes('python')) return <Cpu className="h-8 w-8 text-yellow-500" />;
    if (name.includes('mongo') || name.includes('db')) return <Database className="h-8 w-8 text-emerald-400" />;
    if (name.includes('math') || name.includes('calc')) return <Calculator className="h-8 w-8 text-purple-400" />;
    return <BookOpen className="h-8 w-8 text-cyan-400" />;
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedDifficulty(quiz.difficulty || 'Medium');
    setShowConfigModal(true);
    setShowRulesModal(false);
  };

  const checkDifficultyAvailability = (quiz, diff) => {
    if (!quiz || !quiz.questions || !diff) return false;
    const target = diff.toLowerCase();
    const normalizedTarget = 
      target === 'low' || target === 'easy' ? 'easy' :
      target === 'high' || target === 'hard' ? 'hard' :
      'medium';

    return quiz.questions.some(q => {
      const qDiff = (q.difficulty || '').toLowerCase();
      const normalizedQDiff = 
        qDiff === 'low' || qDiff === 'easy' ? 'easy' :
        qDiff === 'high' || qDiff === 'hard' ? 'hard' :
        'medium';
      return normalizedQDiff === normalizedTarget;
    });
  };

  const getDifficultyName = (diff) => {
    if (!diff) return '';
    const d = diff.toLowerCase();
    if (d === 'high' || d === 'hard') return 'hard';
    if (d === 'low' || d === 'easy') return 'easy';
    return 'medium';
  };

  const isDifficultyAvailable = selectedQuiz && checkDifficultyAvailability(selectedQuiz, selectedDifficulty);

  const handleOpenRules = () => {
    setShowConfigModal(false);
    setShowRulesModal(true);
  };

  const triggerStartQuiz = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch((err) => {
        console.warn('Error enabling full-screen mode:', err.message);
      });
    }
    navigate(`/quiz/active?quizId=${selectedQuiz._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative min-h-[calc(100vh-4rem)]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="space-y-8">
        {/* Banner Title */}
        <div className="border-b border-slate-900 pb-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-cyan-400" />
            <span>Quiz Configuration</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Select a quiz box below to configure parameters and launch testing</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-center gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/40 border border-slate-850 rounded-2xl max-w-xl mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-cyan-400 mx-auto" />
            <h3 className="text-lg font-bold text-white font-sans">No Quiz Packages Available</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We couldn't find any quiz boxes in the database. Please visit the **Admin Panel** to upload a CSV file or build a manual quiz box.
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold py-2 px-6 rounded-xl hover:bg-cyan-500/20 transition-all text-sm"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          /* Full-width Grid of Quizzes */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                onClick={() => handleSelectQuiz(quiz)}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer border border-slate-850 hover:border-cyan-500/30 bg-slate-900/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="space-y-4 flex flex-col items-center">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 shadow-md">
                    {getTechIcon(quiz.technology || quiz.title)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white leading-tight capitalize truncate max-w-[200px]">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                      {quiz.questions?.length || 0} Questions
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed px-2">
                    {quiz.description || 'Take a timed test to evaluate your conceptual knowledge.'}
                  </p>
                </div>

                <button
                  className="mt-5 py-2.5 px-6 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:border-slate-700 transition-all w-full cursor-pointer"
                >
                  Configure & Start
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CENTERED DIALOG MODAL 1: CONFIGURATION */}
      {showConfigModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/5 rounded-full blur-[45px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">Quiz Setup</h3>
              </div>
              <button
                onClick={() => { setShowConfigModal(false); setSelectedQuiz(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quiz Info */}
            <div className="space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-850">
              <div className="flex items-center space-x-2.5">
                {getTechIcon(selectedQuiz.technology || selectedQuiz.title)}
                <div>
                  <h4 className="text-sm font-bold text-white capitalize leading-snug">{selectedQuiz.title}</h4>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">Category: {selectedQuiz.technology}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-normal">{selectedQuiz.description || 'No description provided.'}</p>
            </div>

            {/* Difficulty select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2.5">
                {['Low', 'Medium', 'High'].map((diff) => {
                  const isDiffSelected = selectedDifficulty.toLowerCase() === diff.toLowerCase();
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                        isDiffSelected
                          ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5'
                          : 'bg-slate-950 border-slate-850 text-slate-450 hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Availability Warning */}
            {!isDifficultyAvailable && selectedDifficulty && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold leading-relaxed animate-pulse text-center">
                there is no {getDifficultyName(selectedDifficulty)} level of Quiz in this section
              </div>
            )}

            {/* Proceed */}
            <button
              onClick={handleOpenRules}
              disabled={!isDifficultyAvailable}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-cyan-500/10 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Configure Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* CENTERED DIALOG MODAL 2: RULES */}
      {showRulesModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/5 rounded-full blur-[40px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>Quiz Sandbox Rules</span>
              </h3>
              <button
                onClick={() => { setShowRulesModal(false); setSelectedQuiz(null); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Rules & Instructions</h4>
              
              <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-xl space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5 text-[9px]">Correct Option</span>
                    <span className="text-emerald-400 font-extrabold text-xs">+{selectedQuiz.points || 1} Point</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5 text-[9px]">Incorrect Option</span>
                    <span className="text-red-400 font-extrabold text-xs">-{selectedQuiz.negativePoints || 0.25} Deduct</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-xl text-xs">
                  <span className="text-slate-500 block uppercase font-bold tracking-wider mb-0.5 text-[9px]">Timer Limit Rule</span>
                  <span className="text-cyan-400 font-extrabold text-xs">
                    {Math.round((selectedQuiz.timeLimit || 300) / 60)} Minutes Total Duration
                  </span>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl text-[10px] text-cyan-400 leading-normal">
                **Security Policy**: Launching the quiz requests fullscreen mode automatically. Exiting fullscreen or navigating away may invalidate your session.
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={triggerStartQuiz}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-extrabold transition-all shadow-lg shadow-cyan-500/15 flex items-center justify-center space-x-2 text-sm cursor-pointer hover:-translate-y-0.5"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              <span>Launch Quiz in Full Screen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSetup;
