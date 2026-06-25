import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, LogOut, Menu, X, Award, Shield, BookOpen, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setShowProfileDropdown(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-cyan-400 bg-slate-900/50 border-cyan-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-900/30';
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 text-white font-bold text-xl group">
              <img 
                src="/favicon.svg" 
                alt="BrainWave Logo" 
                className="h-9 w-9 rounded-xl border border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-200"
              />
              <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent font-extrabold tracking-tight">
                BrainWave
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent ${isActive('/')}`}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/quiz/setup"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent ${isActive('/quiz/setup')}`}
                >
                  Take Quiz
                </Link>
                <Link
                  to="/results"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent ${isActive('/results')}`}
                >
                  My Results
                </Link>
              </>
            )}

            {user && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border border-transparent flex items-center gap-1.5 ${isActive('/admin')}`}
              >
                <Shield className="h-4 w-4 text-cyan-400" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold border border-cyan-400/30 shadow-md shadow-cyan-500/15 hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  {user.username.charAt(0).toUpperCase()}
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3.5 w-60 glass-panel rounded-2xl shadow-xl py-4 px-4 space-y-3.5 border border-slate-850 z-50">
                    <div className="border-b border-slate-900 pb-3">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Signed In As</p>
                      <p className="text-sm font-bold text-slate-100 mt-1 truncate">{user.username}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Access Tier</p>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {isAdmin ? 'Administrator' : 'Candidate'}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-550/20 text-slate-350 hover:text-red-400 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white text-sm font-semibold py-2 px-3 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/50 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-800/80 px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${location.pathname === '/' ? 'text-cyan-400 bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/30'}`}
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/quiz/setup"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${location.pathname === '/quiz/setup' ? 'text-cyan-400 bg-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Take Quiz
              </Link>
              <Link
                to="/results"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${location.pathname === '/results' ? 'text-cyan-400 bg-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                My Results
              </Link>
            </>
          )}

          {user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all ${location.pathname === '/admin' ? 'text-cyan-400 bg-slate-900' : 'text-slate-300 hover:text-white'}`}
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-4 pb-2 border-t border-slate-800/60 px-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-slate-300">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-semibold border border-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-slate-300 hover:text-white text-sm font-semibold py-2 rounded-lg hover:bg-slate-900/30 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold py-2 rounded-lg shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
