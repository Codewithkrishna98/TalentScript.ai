'use client';

import { Spotlight } from '@/components/ui/spotlight-new';
import Link from 'next/link';

// Simple Icon for the logo
const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function HomePage() {
  return (
    <div className="">
      <Spotlight/>
 
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-4 sm:p-6">
        <div className="container mx-auto flex items-center">
            <div className="flex items-center gap-2">
                <LogoIcon />
                <span className="font-bold text-xl text-gray-200">TalentScript</span>
            </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-gray-100 via-green-300 to-red-500 text-transparent bg-clip-text">
              Craft the Perfect Job Posting, <br />
                <span className="text-cyan-400">Instantly.</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto font-medium text-lg sm:text-xl text-gray-200">
                Stop spending hours writing job descriptions. Our AI-powered platform generates comprehensive, professional job postings and interview questions in seconds.
            </p>
            <div className="mt-8">
                <Link 
                    href="/create" 
                    className="inline-block bg-violet-400 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:bg-red-400 transition-transform transform hover:scale-105 duration-300 ease-in-out"
                >
                     Create now
                </Link>
            </div>
        </div>
      </main>
    </div>
  );
}

