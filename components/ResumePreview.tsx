import React from 'react';
import { ResumeData } from '../types';
import { MapPin, Mail, Phone, Linkedin, Globe } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1 }) => {
  // A4 aspect ratio helper
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date + '-01'); // append day to parse YYYY-MM
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div 
      className="print-container bg-white shadow-lg mx-auto overflow-hidden text-slate-800"
      style={{
        width: '210mm',
        minHeight: '297mm',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease',
      }}
    >
      <div className="p-10 h-full flex flex-col gap-6">
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6">
          <h1 className="text-4xl font-bold tracking-tight uppercase text-slate-900 mb-2">
            {data.contact.firstName} <span className="text-teal-600">{data.contact.lastName}</span>
          </h1>
          <p className="text-xl font-medium text-slate-600 mb-4">{data.contact.targetRole}</p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {data.contact.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-teal-600" />
                <span>{data.contact.location}</span>
              </div>
            )}
            {data.contact.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-teal-600" />
                <span>{data.contact.email}</span>
              </div>
            )}
            {data.contact.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-teal-600" />
                <span>{data.contact.phone}</span>
              </div>
            )}
            {data.contact.linkedin && (
              <div className="flex items-center gap-1.5">
                <Linkedin size={14} className="text-teal-600" />
                <span>{data.contact.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {data.contact.portfolio && (
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-teal-600" />
                <span>{data.contact.portfolio.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        {data.summary.visible && data.summary.content && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              {data.summary.content}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience.some(e => e.visible) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Work Experience
            </h2>
            <div className="flex flex-col gap-5">
              {data.experience.filter(e => e.visible).map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{exp.position}</h3>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-teal-700">{exp.company}</span>
                    <span className="text-xs text-slate-500">{exp.location}</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.some(p => p.visible) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Projects
            </h2>
            <div className="flex flex-col gap-4">
              {data.projects.filter(p => p.visible).map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{proj.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {formatDate(proj.startDate)} – {proj.endDate ? formatDate(proj.endDate) : 'Present'}
                    </span>
                  </div>
                  {proj.link && (
                     <div className="mb-1">
                         <a href={`https://${proj.link.replace(/^https?:\/\//, '')}`} className="text-xs text-teal-600 hover:underline">{proj.link}</a>
                     </div>
                  )}
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.some(e => e.visible) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Education
            </h2>
            <div className="flex flex-col gap-4">
              {data.education.filter(e => e.visible).map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{edu.school}</h3>
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {formatDate(edu.startDate)} – {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-teal-700">{edu.degree}</span>
                    <span className="text-xs text-slate-500">{edu.location}</span>
                  </div>
                  {edu.description && (
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.some(s => s.visible) && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.filter(s => s.visible).map((skill) => (
                <span key={skill.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {skill.name}
                  {/* Optional: Show level if desired, e.g., • {skill.level} */}
                </span>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ResumePreview;
