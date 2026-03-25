export interface ResumeItem {
  id: string;
  visible: boolean;
}

export interface WorkExperience extends ResumeItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string; // HTML or rich text compatible string
}

export interface Education extends ResumeItem {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

export interface Project extends ResumeItem {
  name: string;
  link: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill extends ResumeItem {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Expert';
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  targetRole: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: {
    content: string;
    visible: boolean;
  };
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
}

export type SectionType = 'contact' | 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'analysis';

export interface AIResponse {
  text: string;
}

export interface ATSAnalysis {
  score: number;
  summary: string;
  missingKeywords: string[];
  formattingIssues: string[];
  criticalIssues: string[];
}
