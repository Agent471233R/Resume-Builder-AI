import { GoogleGenAI } from "@google/genai";
import { ResumeData, ATSAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';

// Helper to clean JSON string from Markdown code blocks and extract valid JSON
const cleanJSON = (text: string): string => {
  if (!text) return '{}';
  
  // First, remove markdown code blocks
  let cleaned = text.replace(/```json\n?|```/g, '').trim();
  
  // Find the first opening brace/bracket
  const firstOpen = cleaned.search(/[{[]/);
  
  // If we found a start char
  if (firstOpen !== -1) {
    // Find the last closing brace/bracket
    // We look for both and take the one that is furthest, 
    // assuming the JSON structure wraps the entire relevant content.
    const lastCurly = cleaned.lastIndexOf('}');
    const lastSquare = cleaned.lastIndexOf(']');
    const lastClose = Math.max(lastCurly, lastSquare);
    
    if (lastClose !== -1 && lastClose > firstOpen) {
      cleaned = cleaned.substring(firstOpen, lastClose + 1);
    }
  }
  
  return cleaned;
};

const getAI = () => new GoogleGenAI({ apiKey });

export const generateSummary = async (role: string, experienceYears: string, keySkills: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();
  
  const prompt = `Write a professional, concise resume summary (max 3-4 sentences) for a ${role} with ${experienceYears} years of experience. Key skills include: ${keySkills}. Focus on achievements and value add. Do not use first person pronouns heavily, keep it professional.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const improveBulletPoints = async (text: string, role: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `Rewrite the following resume bullet points for a ${role} position to be more impactful, using strong action verbs and professional tone. Keep the same meaning but improve clarity and punchiness. Return only the bullet points, no intro text.\n\nCurrent text:\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const suggestSkills = async (role: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `List 10 relevant hard and soft skills for a ${role} resume. Return them as a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const text = response.text || '[]';
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const analyzeResumeContent = async (resumeText: string, targetRole: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `Analyze this resume content for the role of "${targetRole}". Provide 3 specific, actionable tips to improve it. Keep it brief. \n\nResume Content Summary:\n${resumeText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || '';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const parseResumeWithAI = async (text: string): Promise<Partial<ResumeData>> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `
    You are an expert resume parser. Extract the information from the following resume text and format it into a JSON object that matches the structure below.
    
    Rules:
    - Extract contact info, summary, work experience, education, projects, and skills.
    - If a field is missing, leave it as an empty string or empty array.
    - For lists (experience, education, projects, skills), create at least one entry if data exists.
    - Do NOT invent information.
    
    Target JSON Structure:
    {
      "contact": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "linkedin": "string",
        "portfolio": "string",
        "location": "string",
        "targetRole": "string (infer from experience if not explicit)"
      },
      "summary": {
        "content": "string"
      },
      "experience": [
        {
          "company": "string",
          "position": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM (or empty if current)",
          "current": boolean,
          "location": "string",
          "description": "string (bullet points)"
        }
      ],
      "education": [
        {
          "school": "string",
          "degree": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM",
          "location": "string",
          "description": "string"
        }
      ],
      "projects": [
        {
          "name": "string",
          "link": "string",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM",
          "description": "string"
        }
      ],
      "skills": [
        { "name": "string", "level": "Intermediate" }
      ]
    }

    Resume Text:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResult = response.text || '{}';
    return JSON.parse(cleanJSON(textResult));
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse resume text.");
  }
};

export const autoFixResume = async (data: ResumeData): Promise<ResumeData> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `
    You are a professional resume editor. Please proofread and polish the following resume data. 
    
    Rules:
    1. Fix all grammar and spelling errors.
    2. Improve the professional tone of descriptions (make them action-oriented and impactful).
    3. Do NOT invent new facts or change dates/companies/titles.
    4. Maintain the EXACT JSON structure and IDs.
    5. Return ONLY the JSON object.
    
    Resume Data to Fix:
    ${JSON.stringify(data)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResult = response.text || 'null';
    const result = JSON.parse(cleanJSON(textResult));
    
    if (!result) throw new Error("Failed to generate fixed resume");
    return result;
  } catch (error) {
    console.error("Gemini Auto-Fix Error:", error);
    throw new Error("Failed to auto-fix resume.");
  }
};

export const analyzeATS = async (data: ResumeData): Promise<ATSAnalysis> => {
  if (!apiKey) throw new Error("API Key is missing");
  const ai = getAI();

  const prompt = `
    Act as a strict Application Tracking System (ATS). Analyze the following resume JSON and provide a score and feedback.
    Target Role: ${data.contact.targetRole}

    Resume Data:
    ${JSON.stringify(data)}

    Return the response in the following JSON format:
    {
      "score": number (0-100),
      "summary": "string (brief overview of passability)",
      "missingKeywords": ["string", "string"],
      "formattingIssues": ["string"],
      "criticalIssues": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const textResult = response.text || '{}';
    return JSON.parse(cleanJSON(textResult));
  } catch (error) {
    console.error("Gemini ATS Analysis Error:", error);
    throw new Error("Failed to analyze resume for ATS.");
  }
};
