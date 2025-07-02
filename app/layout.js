// app/layout.js
"use client";

import React from 'react';
// import { Inter } from 'next/font/google'; // Commented out
// const inter = Inter({ subsets: ['latin'] }); // Commented out

import { AppProvider } from '../lib/appContext';
import StackAuthProviderWrapper from './components/StackAuthProviderWrapper';
import AuthNav from './components/AuthNav';

import "../src/index.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mphakathi Online</title>
      </head>
      <body>
        <StackAuthProviderWrapper>
          <AppProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col">
              {/* Navigation */}
              <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                </div>
                {/* Render the client-only AuthNav component */}
                <AuthNav />
              </nav>

              <main className="flex-grow p-4 md:p-8">
                {children}
              </main>
            </div>
          </AppProvider>
        </StackAuthProviderWrapper>
      </body>
    </html>
  );
}
