// app/layout.js
"use client"; // This component needs to be a Client Component

import React, { useState } from 'react';
import { Inter } from 'next/font/google'; // Recommended font for Next.js
import {
  HomeIcon, UserIcon, FileTextIcon,
  LogOutIcon, MenuIcon, ShieldCheckIcon, SettingsIcon, DollarSignIcon
} from 'lucide-react';
import { StackProvider, useUser, useStackApp } from '@stackframe/stack';
import { AppProvider, AppContext } from '../lib/appContext'; // Import your AppProvider and AppContext
import { stackClientApp } from '../lib/stack'; // Import your Stack Auth client app instance
import Link from 'next/link'; // Next.js Link component
import { usePathname } from 'next/navigation'; // For active link styling

import "../src/index.css"; // Ensure your global CSS is imported here (e.g., Tailwind CSS)

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard'); // State to manage current page for navigation
  const { isAuthenticated, user: stackAuthUser, logout, login } = React.useContext(AppContext); // Get global state

  // Use usePathname to highlight active links
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mphakathi Online</title>
      </head>
      <body className={inter.className}>
        {/* StackProvider wraps the entire application */}
        <StackProvider app={stackClientApp}>
          {/* AppProvider wraps children to provide app-wide context */}
          <AppProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col">
              {/* Navigation */}
              <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                  {/* You can add branding.appLogo here dynamically if it's available in context */}
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/" onClick={() => setCurrentPage('dashboard')} className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>
                    <HomeIcon size={20} className="mr-1" /> Dashboard
                  </Link>
                  {isAuthenticated && stackAuthUser?.userProfile?.role === 'member' && (
                    <Link href="/my-requests" onClick={() => setCurrentPage('my-requests')} className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/my-requests' ? 'text-blue-600 font-semibold' : ''}`}>
                      <FileTextIcon size={20} className="mr-1" /> My Requests
                    </Link>
                  )}
                  {isAuthenticated && stackAuthUser?.userProfile?.role === 'provider' && (
                    <Link href="/my-quotes" onClick={() => setCurrentPage('my-quotes')} className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/my-quotes' ? 'text-blue-600 font-semibold' : ''}`}>
                      <DollarSignIcon size={20} className="mr-1" /> My Quotes
                    </Link>
                  )}
                  {isAuthenticated && stackAuthUser?.userProfile?.role === 'admin' && (
                      <Link href="/admin" onClick={() => setCurrentPage('admin')} className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/admin' ? 'text-blue-600 font-semibold' : ''}`}>
                          <ShieldCheckIcon size={20} className="mr-1" /> Admin
                      </Link>
                  )}
                  {isAuthenticated && (
                    <Link href="/settings" onClick={() => setCurrentPage('settings')} className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/settings' ? 'text-blue-600 font-semibold' : ''}`}>
                      <SettingsIcon size={20} className="mr-1" /> Settings
                    </Link>
                  )}
                  {isAuthenticated ? (
                    <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center">
                      <LogOutIcon size={20} className="mr-1" /> Logout
                    </button>
                  ) : (
                    <button onClick={login} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                      <UserIcon size={20} className="mr-1" /> Login
                    </button>
                  )}
                </div>
                <div className="md:hidden">
                  <button onClick={() => { /* Toggle mobile menu */ }} className="text-gray-700 hover:text-blue-600">
                    <MenuIcon size={24} />
                  </button>
                </div>
              </nav>

              {/* Main content area will be rendered by the individual page.js files */}
              <main className="flex-grow p-4 md:p-8">
                {children}
              </main>
            </div>
          </AppProvider>
        </StackProvider>
      </body>
    </html>
  );
}
