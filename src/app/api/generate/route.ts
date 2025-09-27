import { NextResponse } from 'next/server';
import axios from 'axios';

// --- TypeScript Interfaces for Request and API Response ---

interface RequestBody {
  jobTitle: string;
  level: string;
  companyDomain: string;
  companyName: string;
  jobType: string; // Added jobType to the request
}

interface InterviewQuestion {
  question: string;
  answer: string;
}

// This is the shape of the JSON the AI should return
interface AiGeneratedContent {
  companyOverview: string;
  jobSummary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  interviewQuestions: InterviewQuestion[];
}

// This is the final shape of the data sent to the frontend
interface FinalResponse extends AiGeneratedContent {
    jobType: string;
    datePosted: string;
}


export async function POST(req: Request) {
  try {
    const { jobTitle, level, companyDomain, companyName, jobType } = (await req.json()) as RequestBody;

    // --- 1. Validation ---
    if (!jobTitle || !level || !companyDomain || !companyName || !jobType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key for Gemini is not configured.' }, { status: 500 });
    }

    // --- 2. Prompt Engineering ---
    const prompt = `
      As an expert HR copywriter and technical recruiter for a company named "${companyName}", create the content for a job posting.

      Job Details:
      - Job Title: "${jobTitle}"
      - Experience Level: "${level}"
      - Company Domain: "${companyDomain}"

      Generate the following in a valid JSON format, with no markdown. The tone should be professional and engaging.

      1.  "companyOverview": A brief, 2-4 sentence paragraph about the company's mission and culture.
      2.  "jobSummary": A 3-5 sentence overview of the role's core purpose and impact.
      3.  "keyResponsibilities": An array of 5-7 strings, each starting with an action verb, describing the main duties.
      4.  "requiredSkills": An array of 5 essential "must-have" skills and qualifications.
      5.  "niceToHaveSkills": An array of 3-4 "nice-to-have" skills that would make a candidate stand out.
      6.  "interviewQuestions": An array of exactly 10 interview questions. For each question, provide a "question" and a concise "answer". The "answer" must be the technically correct information or key points a recruiter should listen for to verify the candidate's knowledge, not a guide on how a candidate should phrase their response.

      The final output must be a single, raw JSON object.
    `;

    // --- 3. Call Gemini API ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    
    const response = await axios.post(apiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
    });


    // --- 4. Parse, Enrich, and Return Response ---
    const result = response.data;
    const candidate = result.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: "Failed to get a valid response from the AI model." }, { status: 500 });
    }
    
    try {
      const parsedJson: AiGeneratedContent = JSON.parse(rawText);
      
      // Enrich the AI's response with the jobType and current date
      const finalResponse: FinalResponse = {
        ...parsedJson,
        jobType: jobType,
        datePosted: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
      };

      return NextResponse.json(finalResponse);
    } catch (e) {
      console.error("JSON Parsing Error:", e);
      console.error("Raw text from Gemini:", rawText);
      return NextResponse.json({ error: 'Failed to parse the AI model response as JSON.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in generate API:', error);
    if (axios.isAxiosError(error) && error.response) {
        console.error("Gemini API Error Body:", error.response.data);
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

