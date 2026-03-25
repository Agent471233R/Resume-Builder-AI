import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, FileSearch, Target } from 'lucide-react';
import { ATSAnalysis } from '../types';

interface ATSModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ATSAnalysis | null;
  isAnalyzing: boolean;
}

const ATSModal: React.FC<ATSModalProps> = ({ isOpen, onClose, analysis, isAnalyzing }) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSearch className="text-blue-600 dark:text-blue-400" size={20} />
              ATS Compatibility Check
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              See how Applicant Tracking Systems view your resume.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Scanning your resume against ATS algorithms...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              {/* Score Section */}
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={`${getScoreColor(analysis.score).split(' ')[0]}`}
                      strokeWidth="8"
                      strokeDasharray={365}
                      strokeDashoffset={365 - (365 * analysis.score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className={`text-3xl font-bold ${getScoreColor(analysis.score).split(' ')[0]}`}>
                      {analysis.score}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">SCORE</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Analysis Summary</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Keywords */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
                   <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4">
                       <Target className="text-red-500" size={18} />
                       Missing Keywords
                   </h4>
                   {analysis.missingKeywords.length > 0 ? (
                       <div className="flex flex-wrap gap-2">
                           {analysis.missingKeywords.map((keyword, i) => (
                               <span key={i} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded border border-red-100 dark:border-red-900/30 font-medium">
                                   {keyword}
                               </span>
                           ))}
                       </div>
                   ) : (
                       <p className="text-sm text-green-600 flex items-center gap-2">
                           <CheckCircle size={14} /> No major keywords missing!
                       </p>
                   )}
                </div>

                {/* Critical Issues */}
                 <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
                   <h4 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-4">
                       <AlertTriangle className="text-yellow-500" size={18} />
                       Critical Issues
                   </h4>
                   {analysis.criticalIssues.length > 0 ? (
                       <ul className="space-y-2">
                           {analysis.criticalIssues.map((issue, i) => (
                               <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                   <XCircle className="text-red-500 mt-0.5 shrink-0" size={14} />
                                   {issue}
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <p className="text-sm text-green-600 flex items-center gap-2">
                           <CheckCircle size={14} /> No critical issues found!
                       </p>
                   )}
                </div>
              </div>

              {/* Formatting Issues */}
              {analysis.formattingIssues.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-5">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm uppercase tracking-wide">Formatting Suggestions</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {analysis.formattingIssues.map((issue, i) => (
                               <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                   {issue}
                               </li>
                           ))}
                      </ul>
                  </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <AlertTriangle className="mb-2 opacity-50" size={32} />
              <p>Could not load analysis.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ATSModal;
