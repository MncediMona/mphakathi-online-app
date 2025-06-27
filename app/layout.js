// app/layout.js
"use client"; // This component needs to be a Client Component

import React from 'react';
// Removed Inter font and MenuIcon import from here
// import { Inter } from 'next/font/google';
// import { MenuIcon } from 'lucide-react'; // <-- REMOVE THIS LINE

import { AppProvider } from '../lib/appContext';
import StackAuthProviderWrapper from './components/StackAuthProviderWrapper';
import AuthNav from './components/AuthNav'; // Import the new AuthNav component

import "../src/index.css"; // Ensure your global CSS is imported here

// const inter = Inter({ subsets: ['latin'] });

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
                {/* The mobile menu button (which uses MenuIcon) will now be handled inside AuthNav or a new client-only component */}
                {/* <div className="md:hidden">
                  <button onClick={() => { /* Toggle mobile menu */ }} className="text-gray-700 hover:text-blue-600">
                    <MenuIcon size={24} />
                  </button>
                </div> */}
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
