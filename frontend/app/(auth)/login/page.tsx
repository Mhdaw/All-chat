'use client';

import AuthModal from "@/components/authmodal";
import { Globe2 } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-dvh w-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 px-4">
        {/* Left side - Branding and Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:w-1/2">
          <div className="flex items-center gap-2">
            <Globe2 className="h-10 w-10 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              LinguaMate
            </h1>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Your Personal Language Learning & Understanding Journey Starts Here
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg">
              Master & Understand new languages through interactive lessons, real-time conversations, 
              and personalized learning paths. Join thousands of learners worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">30+</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Languages</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">1M+</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">Active Users</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Interactive Lessons
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Native Speakers
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              AI-Powered Practice
            </div>
          </div>
        </div>

        {/* Right side - Auth Modal */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <AuthModal />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        © 2024 LinguaMate. All rights reserved.
      </div>
    </div>
  );
}