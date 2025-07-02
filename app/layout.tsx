// app/layout.tsx
"use client"; // This component needs to be a Client Component

import React from 'react';
// Removed Inter font and MenuIcon import from here
// import { Inter } from 'next/font/google';

import { AppProvider } from '../lib/appContext'; // Will become appContext.tsx
import AuthNav from './components/AuthNav'; // Will become AuthNav.tsx

// Import the new Stack Auth isolation components
import { StackAuthIsolation, SafeStackProvider } from './components/StackAuthIsolation';

import "../src/index.css"; // Ensure your global CSS is imported here

// const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mphakathi Online</title>
      </head>
      <body>
        {/* Wrap the entire app content with StackAuthIsolation */}
        <StackAuthIsolation>
          {/* SafeStackProvider ensures StackProvider is only rendered when environment is ready */}
          <SafeStackProvider>
            {/* AppProvider wraps children to provide app-wide context */}
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
          </SafeStackProvider>
        </StackAuthIsolation>
      </body>
    </html>
  );
}
