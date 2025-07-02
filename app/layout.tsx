// app/layout.tsx
"use client";

import React from 'react';
import { AppProvider } from '../lib/appContext'; // Relative to app/
import AuthNav from './components/AuthNav'; // Correct relative path: './components/AuthNav'

// Correct import for the new Stack Auth isolation components
import { StackAuthIsolation, SafeStackProvider } from './components/StackAuthIsolation'; // Correct relative path: './components/StackAuthIsolation'

import "../src/index.css"; // This remains relative as it's outside the root for @/

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
        <StackAuthIsolation>
          <SafeStackProvider>
            <AppProvider>
              <div className="min-h-screen bg-gray-100 flex flex-col">
                <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                  </div>
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
