import React, { useState, useEffect } from 'react';
import { ResumeData, SectionType, ATSAnalysis } from './types';
import { INITIAL_RESUME } from './constants';
import ResumePreview from './components/ResumePreview';
import Editor from './components/Editor';
import ImportModal from './components/ImportModal';
import ATSModal from './components/ATSModal';
import * as GeminiService from './services/geminiService';
import { 
    User, 
    FileText, 
    Briefcase, 
    GraduationCap, 
    FolderGit2, 
    Wrench, 
    Download, 
    Menu,
    Sparkles,
    Upload,
    Moon,
    Sun,
    Wand2,
    FileSearch
} from 'lucide-react';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME);
  const [activeSection, setActiveSection] = useState<SectionType>('contact');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isATSModalOpen, setIsATSModalOpen] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [scale, setScale] = useState(0.8);

  // Initial Theme Check
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setScale(0.5);
      else if (w < 1200) setScale(0.65);
      else setScale(0.85);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleImport = async (text: string) => {
    try {
      const parsedData = await GeminiService.parseResumeWithAI(text);
      const newResume: ResumeData = {
        contact: { ...INITIAL_RESUME.contact, ...parsedData.contact },
        summary: { 
            visible: true, 
            content: parsedData.summary?.content || '' 
        },
        experience: (parsedData.experience || []).map((exp, i) => ({
            ...exp,
            id: `exp-${Date.now()}-${i}`,
            visible: true,
            company: exp.company || '',
            position: exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            location: exp.location || '',
            description: exp.description || '',
            current: exp.current || false,
        })),
        education: (parsedData.education || []).map((edu, i) => ({
            ...edu,
            id: `edu-${Date.now()}-${i}`,
            visible: true,
            school: edu.school || '',
            degree: edu.degree || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            location: edu.location || '',
            description: edu.description || '',
            current: false,
        })),
        projects: (parsedData.projects || []).map((proj, i) => ({
            ...proj,
            id: `proj-${Date.now()}-${i}`,
            visible: true,
            name: proj.name || '',
            link: proj.link || '',
            startDate: proj.startDate || '',
            endDate: proj.endDate || '',
            description: proj.description || '',
        })),
        skills: (parsedData.skills || []).map((skill, i) => ({
            id: `skill-${Date.now()}-${i}`,
            visible: true,
            name: skill.name || '',
            level: skill.level || 'Intermediate'
        }))
      };

      setResumeData(newResume);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAutoFix = async () => {
    if (confirm("This will use AI to automatically improve grammar, spelling, and professional tone across your entire resume. Continue?")) {
      setIsAutoFixing(true);
      try {
        const fixedData = await GeminiService.autoFixResume(resumeData);
        setResumeData(fixedData);
      } catch (e) {
        console.error(e);
        alert("Failed to auto-fix resume. Please ensure your resume content is valid and try again.");
      } finally {
        setIsAutoFixing(false);
      }
    }
  };

  const handleATSCheck = async () => {
    setIsATSModalOpen(true);
    setIsAnalyzingATS(true);
    try {
      const result = await GeminiService.analyzeATS(resumeData);
      setAtsAnalysis(result);
    } catch (e) {
      console.error(e);
      // ATS Modal handles empty/error state
    } finally {
      setIsAnalyzingATS(false);
    }
  };

  const navItems = [
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'analysis', label: 'AI Analysis', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors">
      {/* Top Bar */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 no-print transition-colors">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            T
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">TealRes</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
           <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={handleAutoFix}
            disabled={isAutoFixing}
            className="flex items-center gap-2 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 px-3 py-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium disabled:opacity-50"
            title="Auto Fix Grammar & Tone"
          >
            {isAutoFixing ? (
                 <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
                <Wand2 size={16} />
            )}
            <span className="hidden lg:inline">Auto Fix</span>
          </button>

          <button 
            onClick={handleATSCheck}
            className="flex items-center gap-2 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
            title="Check ATS Compatibility"
          >
            <FileSearch size={16} />
            <span className="hidden sm:inline">ATS Check</span>
          </button>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 dark:bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-slate-700 dark:hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <nav className={`
          absolute md:static z-10 top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          no-print
        `}>
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as SectionType);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${activeSection === item.id 
                    ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 bg-purple-50 dark:bg-slate-700/50 p-4 rounded-lg border border-purple-100 dark:border-slate-600">
             <div className="flex items-start gap-2">
                 <Sparkles className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" size={16} />
                 <div>
                     <p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">AI Powered</p>
                     <p className="text-[10px] text-purple-700 dark:text-slate-400 leading-tight">Use Gemini AI to enhance your content and fix grammar.</p>
                 </div>
             </div>
          </div>
        </nav>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-0 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Editor Column */}
          <div className="w-full md:w-1/2 lg:w-5/12 h-full overflow-hidden no-print">
            <Editor 
              data={resumeData} 
              onChange={setResumeData} 
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </div>

          {/* Preview Column */}
          <div className="hidden md:flex flex-1 bg-slate-100 dark:bg-slate-900 justify-center overflow-auto p-8 relative custom-scrollbar transition-colors">
            <div className="relative">
                 <div className="no-print absolute -top-8 left-0 right-0 flex justify-center text-xs text-slate-400 font-medium">
                    Live Preview (A4)
                 </div>
                 {/* Preview stays white to represent paper */}
                 <ResumePreview data={resumeData} scale={scale} />
            </div>
          </div>
        </main>
      </div>
      
      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* ATS Modal */}
      <ATSModal
        isOpen={isATSModalOpen}
        onClose={() => setIsATSModalOpen(false)}
        analysis={atsAnalysis}
        isAnalyzing={isAnalyzingATS}
      />

      {/* Print Only View */}
      <div className="hidden print:block absolute inset-0 bg-white z-50">
          <ResumePreview data={resumeData} scale={1} />
      </div>
    </div>
  );
};

export default App;