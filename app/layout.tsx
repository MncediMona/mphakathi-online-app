// app/layout.tsx
"use client"; // This component needs to be a Client Component

import React from 'react';
// import { Inter } from 'next/font/google'; // Keeping commented out for now
// const inter = Inter({ subsets: ["latin"] }); // Keeping commented out for now

import { AppProvider } from '../lib/appContext'; // Correct path to AppContext.tsx
import AuthNav from './components/AuthNav'; // Correct path to AuthNav.tsx

// Correct imports for the Stack Auth isolation components
import { StackAuthIsolation } from './components/StackAuthIsolation';
import { SafeStackProvider } from './components/SafeStackProvider'; // Correct import from its own file

import "../src/index.css"; // Ensure your global CSS is imported here

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
        {/* Removed className={inter.className} as Inter is commented out */}
        <StackAuthIsolation>
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
