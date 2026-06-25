import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
import { Award, BookOpen, Clock, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle, Calendar, PlusCircle, LayoutDashboard, BrainCircuit } from 'lucide-react';

const ResultsHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCard, setExpandedCard] = useState(null); // stores resultId of expanded accordion

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quiz/my-results`);
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch result logs from the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 50) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Calculate stats summaries
  const totalQuizzes = results.length;
  const avgScore = totalQuizzes > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes) : 0;
  
  // Find favorite technology
  const getFavoriteTech = () => {
    if (totalQuizzes === 0) return 'None';
    const counts = {};
    results.forEach((r) => {
      counts[r.technology] = (counts[r.technology] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 relative">
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-cyan-400" />
            <span>My Performance Analytics</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Review historical progress and session breakdowns</p>
        </div>
        <Link
          to="/quiz/setup"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-cyan-500/10 flex items-center space-x-1.5 hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Quiz</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {totalQuizzes === 0 ? (
        <div className="text-center p-12 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4">
          <Award className="h-12 w-12 text-slate-650 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Results Recorded</h3>
          <p className="text-slate-450 text-sm max-w-sm mx-auto leading-relaxed">
            You haven't completed any quizzes yet. Test your knowledge across React, JavaScript, or other technologies to see your statistics!
          </p>
          <Link
            to="/quiz/setup"
            className="inline-flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold py-2 px-6 rounded-xl hover:bg-cyan-500/20 transition-all text-sm"
          >
            <span>Take Your First Quiz</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Aggregate Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Attempts */}
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{totalQuizzes}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">Quizzes Taken</div>
              </div>
            </div>

            {/* Average Score */}
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{avgScore}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">Average Score</div>
              </div>
            </div>

            {/* Favorite Domain */}
            <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white truncate max-w-[180px]">{getFavoriteTech()}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">Primary Domain</div>
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Quiz Attempt Log</h3>

            <div className="space-y-4">
              {results.map((result) => {
                const isExpanded = expandedCard === result._id;

                return (
                  <div key={result._id} className="glass-panel rounded-2xl overflow-hidden transition-all duration-300">
                    
                    {/* Collapsed Header Summary */}
                    <div
                      onClick={() => toggleExpand(result._id)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/35 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-white">{result.technology}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {result.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500 space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(result.createdAt)}</span>
                        </div>
                      </div>

                      {/* Middle Breakdown Indicators (Color-coded stats) */}
                      <div className="flex items-center space-x-3 shrink-0">
                        {/* Correct (Green) */}
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{result.correctAnswers}</span>
                        </div>
                        {/* Incorrect (Red) */}
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-bold">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>{result.wrongAnswers}</span>
                        </div>
                        {/* Unattempted (Yellow) */}
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs font-bold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{result.unattemptedAnswers}</span>
                        </div>
                      </div>

                      {/* Right side Score & Chevron */}
                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                        <div className={`border px-3.5 py-1.5 rounded-xl text-base font-black ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Review Section */}
                    {isExpanded && (
                      <div className="border-t border-slate-900 bg-slate-950/40 p-5 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-450">Session Question Review</h4>
                        <div className="space-y-3.5">
                          {result.answers && result.answers.map((ans, idx) => (
                            <div
                              key={ans._id || idx}
                              className={`p-4 rounded-xl border text-sm space-y-3 ${
                                ans.isCorrect
                                  ? 'border-emerald-500/10 bg-emerald-950/5'
                                  : ans.selectedOption === null
                                    ? 'border-amber-500/10 bg-amber-950/5'
                                    : 'border-red-500/10 bg-red-950/5'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex gap-2">
                                  <span className="text-xs font-bold text-slate-450 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                    Q{idx + 1}
                                  </span>
                                  <span className="text-slate-200 font-medium leading-relaxed">{ans.questionText}</span>
                                </div>
                                <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                                  ans.isCorrect
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : ans.selectedOption === null
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {ans.isCorrect ? 'Correct' : ans.selectedOption === null ? 'Unattempted' : 'Incorrect'}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="p-2 bg-slate-900/80 border border-slate-850 rounded-lg">
                                  <span className="text-slate-500 font-semibold block mb-0.5">Your Response:</span>
                                  <span className={ans.selectedOption ? 'text-slate-200 font-medium' : 'text-amber-400/80 font-bold italic'}>
                                    {ans.selectedOption || 'Unattempted / Timeout'}
                                  </span>
                                </div>
                                <div className="p-2 bg-slate-900/80 border border-slate-850 rounded-lg">
                                  <span className="text-slate-500 font-semibold block mb-0.5">Correct Answer:</span>
                                  <span className="text-emerald-400 font-bold">{ans.correctAnswer}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsHistory;
