import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Timer, ArrowRight, ShieldAlert, Award, RefreshCw, CheckCircle2, 
  XCircle, AlertCircle, Maximize2, ShieldCheck, HelpCircle 
} from 'lucide-react';

const QuizActive = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [quizInfo, setQuizInfo] = useState(null); // stores quiz config
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(300); // Global countdown timer in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submission / Scoring states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [maxScorePossible, setMaxScorePossible] = useState(0);

  const timerRef = useRef(null);

  // Auto request full screen on start
  useEffect(() => {
    const requestFullScreen = async () => {
      try {
        const docEl = document.documentElement;
        if (!document.fullscreenElement) {
          if (docEl.requestFullscreen) {
            await docEl.requestFullscreen();
          }
        }
      } catch (err) {
        console.warn('Fullscreen request failed:', err.message);
      }
    };
    requestFullScreen();
    
    // Cleanup: Exit fullscreen when quiz finishes or exits
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  // Fetch quiz details and questions
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/quiz/questions?quizId=${quizId}`);
        if (res.data.success) {
          setQuestions(res.data.questions);
          setQuizInfo(res.data.quiz);
          setTimeLeft(res.data.quiz.timeLimit || 300);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Could not load the quiz questions.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizDetails();
    } else {
      setError('Quiz identifier is missing.');
      setLoading(false);
    }
  }, [quizId]);

  // Global Countdown Timer Hook
  useEffect(() => {
    if (loading || isFinished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOutSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, isFinished, questions]);

  const handleTimeOutSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSelectOption = (option) => {
    const currentQuestion = questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    clearInterval(timerRef.current);
    setIsSubmitting(true);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] || null,
      }));

      const res = await axios.post('http://localhost:5000/api/quiz/submit', {
        quizId: quizId,
        answers: answersPayload,
      });

      if (res.data.success) {
        setQuizResult(res.data.result);
        setPointsEarned(res.data.rawScore);
        setMaxScorePossible(res.data.maxScorePossible);
        setIsFinished(true);
        
        // Exit fullscreen on success
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(err => console.log(err));
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while submitting your answers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format remaining seconds into MM:SS format
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-slate-400 text-sm">Locking sandbox and loading questions...</p>
        </div>
      </div>
    );
  }

  if (error && !isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="w-full max-w-md glass-panel p-6 rounded-2xl text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-cyan-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Quiz Sandbox Error</h3>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={() => navigate('/quiz/setup')}
            className="w-full bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-white py-2 rounded-xl text-sm transition-all"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  // FINISHED VIEW (SCORING BREAKDOWN WITH NEGATIVE MARKING DETAILS)
  if (isFinished && quizResult && quizInfo) {
    const totalWrong = quizResult.wrongAnswers;
    const wrongDeduction = (totalWrong * quizInfo.negativePoints).toFixed(2);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Ribbon Card */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                <Award className="h-3.5 w-3.5 animate-bounce" />
                <span>Quiz Graded Report</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white capitalize">{quizInfo.title}</h2>
              <p className="text-slate-450 text-sm">
                Difficulty: <span className="text-cyan-400 font-bold">{quizInfo.difficulty}</span> • Grading complete
              </p>
            </div>

            <div className="text-center bg-slate-900/60 border border-slate-850 p-5 rounded-2xl min-w-[170px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Score Obtained</div>
              <div className="text-4xl font-black text-cyan-400">
                {pointsEarned} <span className="text-xs text-slate-450 font-normal">/ {maxScorePossible} pts</span>
              </div>
              <div className="text-[10px] text-slate-450 mt-1 font-semibold">({quizResult.score}% Accuracy)</div>
            </div>
          </div>

          {/* Correct / Wrong / Unattempted cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Correct Answers */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-l-emerald-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 shrink-0" />
              <div>
                <div className="text-2xl font-black text-white">{quizResult.correctAnswers}</div>
                <div className="text-[10px] text-slate-450 uppercase tracking-wider font-bold mt-0.5">
                  Correct (+{quizInfo.points} pts each)
                </div>
              </div>
            </div>

            {/* Wrong Answers (Negative Marking sum shown) */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-l-red-500">
              <XCircle className="h-10 w-10 text-red-500 shrink-0" />
              <div>
                <div className="text-2xl font-black text-white">{quizResult.wrongAnswers}</div>
                <div className="text-[10px] text-slate-455 uppercase tracking-wider font-bold mt-0.5">
                  Wrong (-{wrongDeduction} pts total)
                </div>
              </div>
            </div>

            {/* Unattempted */}
            <div className="glass-panel p-5 rounded-2xl flex items-center space-x-4 border-l-4 border-l-amber-500">
              <AlertCircle className="h-10 w-10 text-amber-500 shrink-0" />
              <div>
                <div className="text-2xl font-black text-white">{quizResult.unattemptedAnswers}</div>
                <div className="text-[10px] text-slate-450 uppercase tracking-wider font-bold mt-0.5">
                  Unattempted (0 pts)
                </div>
              </div>
            </div>

          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Question-by-Question Review</span>
            </h3>

            <div className="space-y-4">
              {quizResult.answers.map((ans, idx) => (
                <div 
                  key={ans.questionId} 
                  className={`glass-panel p-6 rounded-2xl space-y-4 border ${
                    ans.isCorrect 
                      ? 'border-emerald-500/20 bg-emerald-950/5' 
                      : ans.selectedOption === null 
                        ? 'border-amber-500/20 bg-amber-950/5'
                        : 'border-red-500/20 bg-red-950/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <span className="flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg h-6 w-6 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <h4 className="text-slate-100 font-semibold leading-relaxed">{ans.questionText}</h4>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                      ans.isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : ans.selectedOption === null 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {ans.isCorrect ? 'Correct' : ans.selectedOption === null ? 'Timeout' : 'Wrong'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Your Selection</div>
                      <span className={ans.selectedOption ? 'text-slate-200 font-medium' : 'text-amber-400/80 font-bold italic'}>
                        {ans.selectedOption || 'No Answer (Timer Expired)'}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-1">Correct Solution</div>
                      <span className="text-emerald-400 font-bold">{ans.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/quiz/setup"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Back to Quiz Room</span>
            </Link>
            <Link
              to="/results"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 font-bold py-3 px-8 rounded-xl transition-all"
            >
              <span>View Performance Ledger</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE INTERACTIVE GAMEPLAY (FULLSCREEN RUNNER)
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentSelection = selectedAnswers[currentQuestion?._id] || '';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-3xl glass-panel rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-cyan-500/20">
        
        {/* Fullscreen indicator banner */}
        <div className="bg-cyan-500/10 border-b border-cyan-500/10 py-1.5 px-4 flex items-center justify-between text-[11px] text-cyan-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
            <span>Secure Testing Environment Locked</span>
          </span>
          <span className="flex items-center gap-1 font-bold">
            <Maximize2 className="h-3 w-3" />
            <span>Full Screen Mode Active</span>
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Top Info Ribbon */}
          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-4">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base">
                Question {currentIndex + 1}
              </span>
              <span className="text-slate-500">
                of {totalQuestions}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-slate-900/60 border border-slate-850 px-2.5 py-1 rounded-full text-slate-350 text-xs font-semibold uppercase">
                {quizInfo?.title || 'Sandbox'}
              </div>

              {/* Global Quiz Countdown Timer */}
              <div className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-black border tracking-wider text-sm ${
                timeLeft <= 60 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                  : 'bg-slate-950 border-slate-850 text-slate-300'
              }`}>
                <Timer className={`h-4.5 w-4.5 ${timeLeft <= 60 ? 'animate-bounce' : ''}`} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="min-h-[90px] flex items-center">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion?.text}
            </h3>
          </div>

          {/* Options List */}
          <div className="grid grid-cols-1 gap-3.5">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = currentSelection === option;
              const optionLetter = ['A', 'B', 'C', 'D'][idx];

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center space-x-3.5 transition-all duration-205 group ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border-cyan-500 text-white shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:bg-slate-900/80 hover:border-slate-800'
                  }`}
                >
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-extrabold border shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-850 group-hover:border-slate-700'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className="text-sm font-medium">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-900">
            {/* Prev Question */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 hover:text-white py-2 px-5 rounded-xl font-bold transition-all text-xs disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <span className="text-[10px] text-slate-500 italic hidden sm:inline">
              * Quiz auto-submits when the global timer expires.
            </span>

            {/* Next / Submit Question */}
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-2.5 px-6 rounded-xl font-bold transition-all shadow-md flex items-center space-x-1.5 text-xs hover:-translate-y-0.5 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{currentIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuizActive;
