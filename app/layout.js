      // app/layout.js
      "use client"; // This component needs to be a Client Component

      import React from 'react';
      import { Inter } from 'next/font/google'; // Bring back font after checking for Tailwind
      // If you uncomment Inter, ensure the className={inter.className} is restored on <body>
      // const inter = Inter({ subsets: ['latin'] });

      import { AppProvider } from '../lib/appContext';
      import StackAuthProviderWrapper from './components/StackAuthProviderWrapper';
      import AuthNav from './components/AuthNav'; // Import the new AuthNav component

      import "../src/index.css"; // Ensure your global CSS is imported here

      export default function RootLayout({ children }) {
        // RootLayout itself should be as minimal as possible for SSR safety.
        // All logic dependent on client-side contexts (like auth) goes into client components.

        return (
          <html lang="en">
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Mphakathi Online</title>
            </head>
            <body> {/* Removed className={inter.className} for now */}
              {/* StackAuthProviderWrapper ensures StackAuth is initialized client-side */}
              <StackAuthProviderWrapper>
                {/* AppProvider wraps children to provide app-wide context */}
                <AppProvider>
                  <div className="min-h-screen bg-gray-100 flex flex-col">
                    {/* Navigation - now handled by AuthNav client component */}
                    <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                      <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                      </div>
                      {/* Render the client-only AuthNav component */}
                      <AuthNav />
                      <div className="md:hidden">
                        <button onClick={() => { /* Toggle mobile menu */ }} className="text-gray-700 hover:text-blue-600">
                          <MenuIcon size={24} />
                        </button>
                      </div>
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
