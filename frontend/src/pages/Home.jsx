import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Timer, ArrowRight, ChevronRight, GraduationCap, TrainFront, Landmark, BookOpenCheck, Scale, Target, BarChart3 } from 'lucide-react';

const examTracks = [
  { name: 'SSC', label: 'Staff Selection Commission', icon: GraduationCap, color: 'text-cyan-400', surface: 'bg-cyan-500/10 border-cyan-500/20' },
  { name: 'Railway', label: 'Railway Recruitment Board', icon: TrainFront, color: 'text-amber-400', surface: 'bg-amber-500/10 border-amber-500/20' },
  { name: 'IBPS', label: 'Banking & Clerk Exams', icon: Landmark, color: 'text-emerald-400', surface: 'bg-emerald-500/10 border-emerald-500/20' },
  { name: 'STET', label: 'State Teacher Eligibility Test', icon: BookOpenCheck, color: 'text-blue-400', surface: 'bg-blue-500/10 border-blue-500/20' },
  { name: 'BPSC', label: 'Bihar Public Service Commission', icon: Scale, color: 'text-rose-400', surface: 'bg-rose-500/10 border-rose-500/20' },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[620px] h-[420px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-blue-500/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10 text-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-cyan-500/20 px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Your exam preparation space</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] max-w-3xl mx-auto">
            Turn practice into <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">exam-day confidence</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Take focused mock tests, sharpen your speed, and track your progress across India's most popular competitive exams.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              {user ? (
                <>
                  <Link
                    to="/quiz/setup"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <span>Choose a Test</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/results"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-3.5 px-8 rounded-xl transition-all duration-200"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>My Progress</span>
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
          </div>
          <div className="mt-16">
            <div className="flex items-center justify-between gap-3 mb-5 text-left">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Choose your track</div>
                <h2 className="text-2xl font-extrabold text-white mt-1">What are you preparing for?</h2>
              </div>
              <Link to="/quiz/setup" className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
              {examTracks.map(({ name, label, icon: Icon, color, surface }) => (
                <Link key={name} to="/quiz/setup" className="glass-panel glass-panel-hover p-4 rounded-2xl group">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${surface}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white">{name}</h3>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{label}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 text-left">
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
              <Timer className="h-5 w-5 text-cyan-400 shrink-0" />
              <div><div className="text-sm font-bold text-white">Timed practice</div><div className="text-xs text-slate-500 mt-1">Build exam speed</div></div>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
              <Target className="h-5 w-5 text-amber-400 shrink-0" />
              <div><div className="text-sm font-bold text-white">Instant results</div><div className="text-xs text-slate-500 mt-1">Know where to improve</div></div>
            </div>
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
              <Award className="h-5 w-5 text-emerald-400 shrink-0" />
              <div><div className="text-sm font-bold text-white">Track progress</div><div className="text-xs text-slate-500 mt-1">Keep getting better</div></div>
            </div>
          </div>

      </div>
    </div>
  );
};

export default Home;
