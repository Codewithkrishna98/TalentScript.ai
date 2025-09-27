'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';



// --- TypeScript Interfaces ---
interface InterviewQuestion {
  question: string;
  answer: string;
}

interface GeneratedContent {
  companyOverview: string;
  jobSummary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  interviewQuestions: InterviewQuestion[];
  jobType: string;
  datePosted: string;
}

export default function CreatePage() {
  // --- State for Form Inputs ---
  const [jobTitle, setJobTitle] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [level, setLevel] = useState<string>('Intermediate');
  const [companyDomain, setCompanyDomain] = useState<string>('');
  const [jobType, setJobType] = useState<string>('Full-time');

  // --- State for UI and Data ---
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'questions'>('description');
  const [copyStatus, setCopyStatus] = useState<'Copy' | 'Copied!'>('Copy');

  // --- Form Submission Handler ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const response = await axios.post<GeneratedContent>('/api/generate', {
        jobTitle,
        level,
        companyDomain,
        companyName,
        jobType,
      });
      setGeneratedContent(response.data);
      setActiveTab('description');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Copy and PDF Generation ---
  const handleCopyDescription = () => {
    if (!generatedContent) return;
    const { jobType, datePosted, companyOverview, jobSummary, keyResponsibilities, requiredSkills, niceToHaveSkills } = generatedContent;

    const textToCopy = `${jobTitle}\n\nJob Type: ${jobType}\nDate Posted: ${datePosted}\n\nCompany Overview\n----------------\n${companyOverview}\n\nJob Summary\n-----------\n${jobSummary}\n\nKey Responsibilities\n--------------------\n${keyResponsibilities.map(item => `• ${item}`).join('\n')}\n\nRequired Skills\n---------------\n${requiredSkills.map(item => `• ${item}`).join('\n')}\n\nNice-to-Have Skills\n-------------------\n${niceToHaveSkills.map(item => `• ${item}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
    });
  };

  const handleDownloadDescriptionPDF = () => {
    if (!generatedContent) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const { jobType, datePosted, companyOverview, jobSummary, keyResponsibilities, requiredSkills, niceToHaveSkills } = generatedContent;
    
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50; // Increased margin for better layout
    const usableWidth = pageWidth - (margin * 2);
    let y = margin + 20;

    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    // --- PDF Header ---
    doc.setFontSize(26);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor('#000000');
    doc.text(jobTitle, pageWidth / 2, y, { align: 'center' });
    y += 25;
    
    doc.setFontSize(13);
    doc.setFont('Roboto', 'semi-bold');
    doc.setTextColor('#000000');
    doc.text(`Type: ${jobType}  |  Posted: ${datePosted}`, pageWidth / 2, y, { align: 'center' });
    y += 40;

    // --- PDF Section Utility ---
    const addSection = (title: string, content: string | string[]) => {
      checkPageBreak(40);
      doc.setFontSize(13);
      doc.setFont('Roboto', 'bold');
      doc.setTextColor('#000000');
      doc.text(title, margin, y);
      y += 22;

      doc.setFontSize(13);
      doc.setFont('Roboto', 'semi-bold');
      doc.setTextColor('#000000'); // Solid dark color for body
      
      if (Array.isArray(content)) {
        content.forEach(item => {
          const splitItem = doc.splitTextToSize(`•  ${item}`, usableWidth - 15);
          const itemHeight = splitItem.length * 13;
          checkPageBreak(itemHeight);
          doc.text(splitItem, margin + 15, y);
          y += itemHeight + 6;
        });
      } else {
        const splitContent = doc.splitTextToSize(content, usableWidth);
        const contentHeight = splitContent.length * 13;
        checkPageBreak(contentHeight);
        doc.text(splitContent, margin, y);
        y += contentHeight;
      }
      y += 30; // Increased space between sections
    };

    addSection('Company Overview', companyOverview);
    addSection('Job Summary', jobSummary);
    addSection('Key Responsibilities', keyResponsibilities);
    addSection('Required Skills', requiredSkills);
    addSection('Nice-to-Have Skills', niceToHaveSkills);

    doc.save(`${companyName}-${jobTitle}-Description.pdf`);
  };
  


  
  const handleDownloadQuestionsPDF = () => {
    if (!generatedContent) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const { interviewQuestions } = generatedContent;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50;
    const usableWidth = pageWidth - (margin * 2);
    let y = margin + 20;

     const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    };
    
    doc.setFontSize(22);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor('#000000');
    doc.text(`Interview Questions: ${jobTitle}`, pageWidth / 2, y, { align: 'center'});
    y += 20;
    doc.setFontSize(11);
    doc.setFont('Roboto', 'medium');
    doc.setTextColor('#000000');
    doc.text(`For a ${level} level role.`, pageWidth / 2, y, { align: 'center'});
    y+= 35;
    
    interviewQuestions.forEach((item, index) => {
        doc.setFontSize(12);
        doc.setFont('Roboto', 'medium');
        doc.setTextColor('#000000');
        const splitQuestion = doc.splitTextToSize(`${index + 1}. ${item.question}`, usableWidth);
        const questionHeight = splitQuestion.length * 14;
        checkPageBreak(questionHeight + 30);
        doc.text(splitQuestion, margin, y);
        y += questionHeight + 8;

        doc.setFontSize(10);
        doc.setFont('Roboto', 'medium');
        doc.setTextColor('#000000');
        const splitAnswer = doc.splitTextToSize(`Ideal Answer: ${item.answer}`, usableWidth - 20);
        const answerHeight = splitAnswer.length * 12;
        checkPageBreak(answerHeight);
        doc.text(splitAnswer, margin + 20, y);
        y += answerHeight + 30;
    });

    doc.save(`${jobTitle}-Interview-Questions.pdf`);
  };


  return (
    <div className="min-h-screen  bg-slate-800 text-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
        
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold  leading-tight bg-gradient-to-r from-white via-gray-100  to-orange-500 text-transparent bg-clip-text font-heading">
            Create a Job Posting
          </h1>
          <h1 className="mt-4 text-lg  text-slate-300 font-bold max-w-2xl mx-auto  ">
            Fill in the details below to generate a professional job description and tailored interview questions.
          </h1>
        </header>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-2xl shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="jobTitle" className="mb-2 font-semibold text-gray-700 font-sans">Job Title</label>
              <input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Senior React Developer" className="p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="companyName" className="mb-2 font-semibold text-gray-700 font-sans">Company Name</label>
              <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g., Acme Corporation" className="p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans" required />
            </div>
            <div className="flex flex-col">
              <label htmlFor="jobType" className="mb-2 font-semibold text-gray-700 font-sans">Job Type</label>
              <select id="jobType" value={jobType} onChange={e => setJobType(e.target.value)} className="p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="level" className="mb-2 font-semibold text-gray-700 font-sans">Experience Level</label>
              <select id="level" value={level} onChange={e => setLevel(e.target.value)} className="p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans">
                <option>Fresher</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex flex-col">
              <label htmlFor="companyDomain" className="mb-2 font-semibold text-gray-700 font-sans">Company Domain</label>
              <input type="text" id="companyDomain" value={companyDomain} onChange={e => setCompanyDomain(e.target.value)} placeholder="e.g., Fintech, Healthcare AI, E-commerce" className="p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans" required />
            </div>

            <div className="sm:col-span-2 text-center mt-4">
              
              <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-3 bg-indigo-600 text-white rounded-md font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all duration-300  transform hover:scale-105 font-sans">
                {loading ? 'Generating...' : '✨ Generate Content'}
              </button>
            </div>
          </form>
        </div>
        
        {error && <div className="mt-8 max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"><p><strong>Error:</strong> {error}</p></div>}

        {generatedContent && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('description')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg font-sans ${activeTab === 'description' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Description
                </button>
                <button onClick={() => setActiveTab('questions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg font-sans ${activeTab === 'questions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Questions
                </button>
              </nav>
            </div>

            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              {activeTab === 'description' && (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Job Description</h2>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleCopyDescription} 
                            className={`px-5 py-2 rounded-md font-semibold transition-colors font-sans ${copyStatus === 'Copied!' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {copyStatus}
                        </button>
                        <button onClick={handleDownloadDescriptionPDF} className="px-5 py-2 bg-sky-500 text-white rounded-md font-semibold hover:bg-sky-600 transition-colors font-sans">Download PDF</button>
                    </div>
                  </div>
                  
                  <div className="space-y-8 text-gray-800">
                    <section className="text-center">
                        <h2 className="text-4xl font-bold text-gray-900">{jobTitle}</h2>
                    </section>
                    
                    <div className="pb-4 border-b border-gray-200">
                      <div className="flex justify-center items-center space-x-6 text-sm font-sans">
                          <span className="font-medium text-gray-800">Job Type: <span className="font-medium text-gray-800">{generatedContent.jobType}</span></span>
                          <span className="font-medium text-gray-800">Date Posted: <span className="font-medium text-gray-800">{generatedContent.datePosted}</span></span>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Company Overview</h3>
                      <p className="font-sans font-medium text-gray-900">{generatedContent.companyOverview}</p>
                    </section>
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Job Summary</h3>
                      <p className="font-sans font-medium text-gray-900">{generatedContent.jobSummary}</p>
                    </section>
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Key Responsibilities</h3>
                      <ul className="list-disc list-inside space-y-2 pl-2 font-sans font-medium text-gray-900">{generatedContent.keyResponsibilities.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </section>
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Required Skills</h3>
                       <ul className="list-disc list-inside space-y-2 pl-2 font-sans font-medium text-gray-900">{generatedContent.requiredSkills.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </section>
                     <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2">Nice-to-Have Skills</h3>
                       <ul className="list-disc list-inside space-y-2 pl-2  font-sans font-medium text-gray-900">{generatedContent.niceToHaveSkills.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === 'questions' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Interview Questions</h2>
                        <button onClick={handleDownloadQuestionsPDF} className="px-5 py-2 bg-sky-500 text-white rounded-md font-semibold hover:bg-sky-600 transition-colors font-sans">Download PDF</button>
                    </div>
                    <ol className="list-decimal list-outside ml-5 space-y-8">
                    {generatedContent.interviewQuestions.map((item, index) => (
                      <li key={index} className="text-gray-900  text-xl font-medium">
                        <p className="font-bold  text-blue-900">{item.question}</p>
                        <p className="mt-2 pl-4 border-l-2 border-gray-300 text-sm font-sans font-medium text-gray-900"><strong>Ideal Answer:</strong> {item.answer}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

