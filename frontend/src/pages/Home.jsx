import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, Award, Shield, FileSpreadsheet, Timer, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-cyan-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping"></span>
              <span>Elevate Your Dev Knowledge</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Assess Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Technical Expertise
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto lg:mx-0">
              Take real-time, customizable quizzes across various engineering frameworks, review color-coded statistics, and track your growth on an advanced user dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {user ? (
                <>
                  <Link
                    to="/quiz/setup"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span>Start New Quiz</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/results"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-3.5 px-8 rounded-xl transition-all duration-200"
                  >
                    <span>View Performance</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span>Create Free Account</span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold py-3.5 px-8 rounded-xl transition-all duration-200"
                  >
                    <span>Log In</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 border-t border-slate-900">
              <div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-500 mt-1">Real-time Timers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">Instant</div>
                <div className="text-xs text-slate-500 mt-1">Score Calculation</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">CSV</div>
                <div className="text-xs text-slate-500 mt-1">Bulk Question Uploads</div>
              </div>
            </div>
          </div>

          {/* Right Cards Column */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            
            {/* Feature Card 1: Quiz System */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-1">
                <Timer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Quiz Environment</h3>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Test your skills under pressure. Quizzes feature real-time per-question timers, beautiful selected option overlays, and unattempted question warnings.
                </p>
              </div>
            </div>

            {/* Feature Card 2: Admin Dashboard */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CSV Question Upload</h3>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Admins can quickly initialize quizzes in bulk. Features drag-and-drop CSV upload, validation parsing, and error feedback reports.
                </p>
              </div>
            </div>

            {/* Feature Card 3: Color-coded Results */}
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl flex items-start space-x-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Detailed Result Reviews</h3>
                <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
                  Track your progress via color-coded statistics: green for correct, red for incorrect, and yellow for unattempted answers with full question transcripts.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Application Information Section */}
        <div className="mt-20 border-t border-slate-900 pt-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How the BrainWave Sandbox Works</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              BrainWave Quiz is designed to simulate authentic technical grading assessments. Here is an overview of the core mechanics and configuration parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">1. Sandbox Fullscreen</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                When you launch an assessment, the browser requests secure fullscreen mode. Navigating away, exiting fullscreen, or minimizing the window is recorded as a compliance deviation to ensure testing integrity.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">2. Negative Marking</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Scoring follows strict point weights. Correct answers earn positive points while incorrect answers deduct points based on the quiz's negative marking config (e.g., -0.25). Unattempted questions carry zero penalty.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">3. Global Countdown</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Quizzes utilize a global countdown timer instead of per-question clocks. If the clock runs out, your active quiz is automatically securely submitted to the server for final grading.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">4. Admin Controls</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Authorized administrators can seed and edit quiz box metadata, drag-and-drop csv spreadsheets to create quizzes in bulk, inspect question repositories, and manage candidate accounts.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
