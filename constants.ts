import { ResumeData } from './types';

export const INITIAL_RESUME: ResumeData = {
  contact: {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '(555) 123-4567',
    linkedin: 'linkedin.com/in/alexmorgan',
    portfolio: 'alexmorgan.dev',
    location: 'San Francisco, CA',
    targetRole: 'Senior Product Designer'
  },
  summary: {
    content: 'Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining design processes. Adept at collaborating with cross-functional teams to deliver high-quality solutions.',
    visible: true,
  },
  experience: [
    {
      id: '1',
      visible: true,
      company: 'TechFlow Solutions',
      position: 'Senior Product Designer',
      startDate: '2021-03',
      endDate: '',
      current: true,
      location: 'San Francisco, CA',
      description: '• Led the redesign of the core mobile application, resulting in a 25% increase in daily active users.\n• Mentored junior designers and established a comprehensive design system used across 4 product lines.\n• Collaborated closely with engineering and product management to define product roadmap and feature requirements.'
    },
    {
      id: '2',
      visible: true,
      company: 'Creative Pulse Agency',
      position: 'UX/UI Designer',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      location: 'Austin, TX',
      description: '• Designed responsive websites and mobile apps for diverse clients in fintech and healthcare sectors.\n• Conducted user research and usability testing to validate design concepts and improve user flows.\n• Reduced design handoff time by 30% through the implementation of efficient prototyping workflows.'
    }
  ],
  education: [
    {
      id: '1',
      visible: true,
      school: 'University of Texas at Austin',
      degree: 'Bachelor of Fine Arts in Design',
      startDate: '2014-09',
      endDate: '2018-05',
      current: false,
      location: 'Austin, TX',
      description: 'Graduated Cum Laude. Member of the Design Student Association.'
    }
  ],
  projects: [
    {
      id: '1',
      visible: true,
      name: 'EcoTrack App',
      link: 'github.com/alex/ecotrack',
      startDate: '2023-01',
      endDate: '2023-04',
      description: 'A personal carbon footprint tracking application built with React Native. Featured on Product Hunt.'
    }
  ],
  skills: [
    { id: '1', visible: true, name: 'Figma', level: 'Expert' },
    { id: '2', visible: true, name: 'Adobe Creative Suite', level: 'Expert' },
    { id: '3', visible: true, name: 'Prototyping', level: 'Expert' },
    { id: '4', visible: true, name: 'HTML/CSS', level: 'Intermediate' },
    { id: '5', visible: true, name: 'User Research', level: 'Intermediate' },
    { id: '6', visible: true, name: 'Agile/Scrum', level: 'Intermediate' },
  ]
};
