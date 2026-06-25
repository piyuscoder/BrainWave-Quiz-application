import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="glass-panel border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-lg group w-fit">
              <img 
                src="/favicon.svg" 
                alt="BrainWave Logo" 
                className="h-7 w-7 rounded-lg border border-slate-850 shadow-sm"
              />
              <span className="bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent font-extrabold tracking-tight">
                BrainWave
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empowering developers and candidates globally to assess conceptual frameworks, master software architectures, and evaluate testing metrics in real time.
            </p>
          </div>

          {/* Quick links block */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigate Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">Portal Home</Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link to="/quiz/setup" className="text-slate-400 hover:text-cyan-400 transition-colors">Start Assessment</Link>
                  </li>
                  <li>
                    <Link to="/results" className="text-slate-400 hover:text-cyan-400 transition-colors">Performance Ledger</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Us block */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-500 shrink-0" />
                <a href="piyush2039sinha@gmail.com" className="hover:text-cyan-400 transition-colors">
                  support@brainwave.com
                </a>
              </li>
              
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Bihar Aurangabad<br />
                  India, 824101
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright ribbon */}
        <div className="border-t border-slate-900/60 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} BrainWave Technologies. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-350 cursor-pointer">Security Sandbox Rules</span>
            <span>&bull;</span>
            <span className="hover:text-slate-350 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
