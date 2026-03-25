import React, { useState } from 'react';
import { ResumeData, SectionType, WorkExperience, Education, Project, Skill } from '../types';
import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff, Sparkles, AlertCircle, GripVertical } from 'lucide-react';
import * as GeminiService from '../services/geminiService';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, activeSection, setActiveSection }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const updateContact = (field: keyof typeof data.contact, value: string) => {
    onChange({
      ...data,
      contact: { ...data.contact, [field]: value }
    });
  };

  const updateSummary = (value: string) => {
    onChange({
      ...data,
      summary: { ...data.summary, content: value }
    });
  };

  const toggleSummaryVisibility = () => {
    onChange({
        ...data,
        summary: { ...data.summary, visible: !data.summary.visible }
    });
  };

  // Generic list helpers
  const addItem = <T extends { id: string, visible: boolean }>(listKey: keyof ResumeData, newItem: T) => {
    onChange({
      ...data,
      [listKey]: [...(data[listKey] as unknown as T[]), newItem]
    });
  };

  const updateItem = (listKey: keyof ResumeData, id: string, field: string, value: any) => {
    const list = data[listKey] as any[];
    const newList = list.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange({ ...data, [listKey]: newList });
  };

  const deleteItem = (listKey: keyof ResumeData, id: string) => {
    const list = data[listKey] as any[];
    onChange({ ...data, [listKey]: list.filter(item => item.id !== id) });
  };
  
  const toggleItemVisibility = (listKey: keyof ResumeData, id: string) => {
    const list = data[listKey] as any[];
    onChange({ ...data, [listKey]: list.map(item => item.id === id ? {...item, visible: !item.visible} : item) });
  };

  // AI Actions
  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const skills = data.skills.map(s => s.name).join(', ');
      // Calculate years roughly
      const years = '5+'; // Simplified for this demo
      const result = await GeminiService.generateSummary(data.contact.targetRole, years, skills);
      updateSummary(result);
    } catch (e) {
      alert("Failed to generate summary. Please check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveDescription = async (id: string, text: string) => {
    setIsGenerating(true);
    try {
      const result = await GeminiService.improveBulletPoints(text, data.contact.targetRole);
      updateItem('experience', id, 'description', result);
    } catch (e) {
      alert("Failed to improve description.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestSkills = async () => {
     setIsGenerating(true);
     try {
       const suggestions = await GeminiService.suggestSkills(data.contact.targetRole);
       const newSkills: Skill[] = suggestions.map((name, i) => ({
         id: `suggested-${Date.now()}-${i}`,
         name,
         visible: true,
         level: 'Intermediate'
       }));
       
       // filter duplicates
       const existingNames = new Set(data.skills.map(s => s.name.toLowerCase()));
       const uniqueNewSkills = newSkills.filter(s => !existingNames.has(s.name.toLowerCase()));
       
       onChange({
         ...data,
         skills: [...data.skills, ...uniqueNewSkills]
       });
     } catch (e) {
       alert("Failed to suggest skills.");
     } finally {
       setIsGenerating(false);
     }
  };
  
  const handleAnalyze = async () => {
      setIsGenerating(true);
      try {
          const content = JSON.stringify(data);
          const feedback = await GeminiService.analyzeResumeContent(content, data.contact.targetRole);
          setAnalysis(feedback);
          setActiveSection('analysis');
      } catch (e) {
          alert('Analysis failed');
      } finally {
          setIsGenerating(false);
      }
  };

  const inputClass = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1";
  const cardClass = "border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800 relative group transition-colors";

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* Contact Section */}
        <section id="contact" className={activeSection === 'contact' ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Contact Information</h2>
             <button onClick={handleAnalyze} disabled={isGenerating} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                <Sparkles size={14} /> AI Analysis
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className={labelClass}>Target Role</label>
                <input 
                  type="text" 
                  value={data.contact.targetRole}
                  onChange={(e) => updateContact('targetRole', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Senior Product Designer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Used for AI optimizations</p>
            </div>
            <div>
              <label className={labelClass}>First Name</label>
              <input type="text" value={data.contact.firstName} onChange={(e) => updateContact('firstName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" value={data.contact.lastName} onChange={(e) => updateContact('lastName', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={data.contact.email} onChange={(e) => updateContact('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={data.contact.phone} onChange={(e) => updateContact('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" value={data.contact.location} onChange={(e) => updateContact('location', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>LinkedIn (Optional)</label>
              <input type="text" value={data.contact.linkedin} onChange={(e) => updateContact('linkedin', e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Portfolio / Website (Optional)</label>
              <input type="text" value={data.contact.portfolio} onChange={(e) => updateContact('portfolio', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section id="summary" className={activeSection === 'summary' ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Professional Summary</h2>
             <div className="flex gap-2">
                <button onClick={toggleSummaryVisibility} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    {data.summary.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
             </div>
          </div>
          <div className="space-y-3">
             <textarea 
               value={data.summary.content} 
               onChange={(e) => updateSummary(e.target.value)}
               className={`${inputClass} h-32 leading-relaxed`}
               placeholder="Briefly describe your professional background..."
             />
             <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 px-4 py-2 rounded-md transition-colors w-full justify-center"
             >
                <Sparkles size={16} />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
             </button>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className={activeSection === 'experience' ? 'block' : 'hidden'}>
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Work Experience</h2>
             <button 
               onClick={() => addItem('experience', { 
                   id: Date.now().toString(), 
                   visible: true, 
                   company: '', 
                   position: '', 
                   startDate: '', 
                   endDate: '', 
                   current: false, 
                   location: '', 
                   description: '' 
               } as WorkExperience)}
               className="flex items-center gap-1 text-sm bg-slate-900 dark:bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-slate-700 dark:hover:bg-teal-700 transition-colors"
             >
               <Plus size={14} /> Add Role
             </button>
          </div>

          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className={cardClass}>
                <div className="absolute right-4 top-4 flex gap-2">
                     <button onClick={() => toggleItemVisibility('experience', exp.id)} className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400">
                        {exp.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                     <button onClick={() => deleteItem('experience', exp.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                     </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Job Title</label>
                    <input type="text" value={exp.position} onChange={(e) => updateItem('experience', exp.id, 'position', e.target.value)} className={inputClass} placeholder="e.g. Senior Product Designer" />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Company</label>
                    <input type="text" value={exp.company} onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="month" value={exp.startDate} onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="month" value={exp.endDate} disabled={exp.current} onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)} className={`${inputClass} ${exp.current ? 'bg-slate-100 dark:bg-slate-900 opacity-60' : ''}`} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" id={`current-${exp.id}`} checked={exp.current} onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)} className="rounded text-teal-600 focus:ring-teal-500" />
                      <label htmlFor={`current-${exp.id}`} className="text-sm text-slate-700 dark:text-slate-300">I currently work here</label>
                  </div>
                   <div className="col-span-2">
                    <label className={labelClass}>Location</label>
                    <input type="text" value={exp.location} onChange={(e) => updateItem('experience', exp.id, 'location', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className={labelClass}>Description</label>
                   <textarea 
                     value={exp.description} 
                     onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                     className={`${inputClass} h-32 leading-relaxed`}
                     placeholder="• Led a team of..."
                   />
                   <button 
                     onClick={() => handleImproveDescription(exp.id, exp.description)}
                     disabled={isGenerating || !exp.description}
                     className="text-xs flex items-center gap-1.5 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium disabled:opacity-50"
                   >
                     <Sparkles size={14} /> Improve with AI
                   </button>
                </div>
              </div>
            ))}
            
            {data.experience.length === 0 && (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                    No experience added yet.
                </div>
            )}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className={activeSection === 'education' ? 'block' : 'hidden'}>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Education</h2>
             <button 
               onClick={() => addItem('education', { 
                   id: Date.now().toString(), 
                   visible: true, 
                   school: '', 
                   degree: '', 
                   startDate: '', 
                   endDate: '', 
                   current: false, 
                   location: '', 
                   description: '' 
               } as Education)}
               className="flex items-center gap-1 text-sm bg-slate-900 dark:bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-slate-700 dark:hover:bg-teal-700 transition-colors"
             >
               <Plus size={14} /> Add Education
             </button>
          </div>
          
           <div className="space-y-6">
            {data.education.map((edu) => (
              <div key={edu.id} className={cardClass}>
                <div className="absolute right-4 top-4 flex gap-2">
                     <button onClick={() => toggleItemVisibility('education', edu.id)} className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400">
                        {edu.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                     <button onClick={() => deleteItem('education', edu.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                     </button>
                </div>
                
                 <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className={labelClass}>School / University</label>
                    <input type="text" value={edu.school} onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Degree</label>
                    <input type="text" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} className={inputClass} />
                  </div>
                   <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="month" value={edu.startDate} onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="month" value={edu.endDate} onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                   <div className="col-span-2">
                    <label className={labelClass}>Location</label>
                    <input type="text" value={edu.location} onChange={(e) => updateItem('education', edu.id, 'location', e.target.value)} className={inputClass} />
                  </div>
                 </div>
              </div>
            ))}
           </div>
        </section>

         {/* Projects Section */}
        <section id="projects" className={activeSection === 'projects' ? 'block' : 'hidden'}>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Projects</h2>
             <button 
               onClick={() => addItem('projects', { 
                   id: Date.now().toString(), 
                   visible: true, 
                   name: '', 
                   link: '', 
                   startDate: '', 
                   endDate: '', 
                   description: '' 
               } as Project)}
               className="flex items-center gap-1 text-sm bg-slate-900 dark:bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-slate-700 dark:hover:bg-teal-700 transition-colors"
             >
               <Plus size={14} /> Add Project
             </button>
          </div>
          
           <div className="space-y-6">
            {data.projects.map((proj) => (
              <div key={proj.id} className={cardClass}>
                 <div className="absolute right-4 top-4 flex gap-2">
                     <button onClick={() => toggleItemVisibility('projects', proj.id)} className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400">
                        {proj.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                     </button>
                     <button onClick={() => deleteItem('projects', proj.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                     </button>
                </div>

                 <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Project Name</label>
                    <input type="text" value={proj.name} onChange={(e) => updateItem('projects', proj.id, 'name', e.target.value)} className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Link (Optional)</label>
                    <input type="text" value={proj.link} onChange={(e) => updateItem('projects', proj.id, 'link', e.target.value)} className={inputClass} />
                  </div>
                   <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="month" value={proj.startDate} onChange={(e) => updateItem('projects', proj.id, 'startDate', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="month" value={proj.endDate} onChange={(e) => updateItem('projects', proj.id, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                 </div>
                 
                  <div className="space-y-2">
                   <label className={labelClass}>Description</label>
                   <textarea 
                     value={proj.description} 
                     onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)}
                     className={`${inputClass} h-24 leading-relaxed`}
                     placeholder="Brief description of what you built..."
                   />
                </div>
              </div>
            ))}
           </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className={activeSection === 'skills' ? 'block' : 'hidden'}>
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Skills</h2>
              <div className="flex gap-2">
                <button 
                    onClick={handleSuggestSkills}
                    disabled={isGenerating}
                    className="flex items-center gap-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                    <Sparkles size={14} /> AI Suggest
                </button>
                 <button 
                onClick={() => addItem('skills', { 
                    id: Date.now().toString(), 
                    visible: true, 
                    name: '', 
                    level: 'Intermediate' 
                } as Skill)}
                className="flex items-center gap-1 text-sm bg-slate-900 dark:bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-slate-700 dark:hover:bg-teal-700 transition-colors"
                >
                <Plus size={14} /> Add Skill
                </button>
             </div>
          </div>
          
           <div className="flex flex-wrap gap-3">
            {data.skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-2">
                  <input 
                    type="text" 
                    value={skill.name} 
                    onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 w-32"
                    placeholder="Skill name"
                  />
                  <button onClick={() => deleteItem('skills', skill.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
              </div>
            ))}
           </div>
        </section>

         {/* Analysis Section (Virtual) */}
         <section id="analysis" className={activeSection === 'analysis' ? 'block' : 'hidden'}>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">AI Resume Analysis</h2>
             {analysis ? (
                 <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                     <div className="flex items-start gap-4">
                         <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full">
                             <Sparkles className="text-purple-600 dark:text-purple-300" size={24} />
                         </div>
                         <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                             {analysis}
                         </div>
                     </div>
                 </div>
             ) : (
                 <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                     <AlertCircle className="mx-auto mb-3 opacity-50" size={32} />
                     <p>Click "AI Analysis" in the Contact section to generate feedback.</p>
                 </div>
             )}
         </section>

      </div>
    </div>
  );
};

export default Editor;