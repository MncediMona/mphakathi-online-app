// app/layout.js
"use client";

import React, { useState } from 'react';
// import { Inter } from 'next/font/google'; // <--- COMMENT OUT THIS LINE
import {
  HomeIcon, UserIcon, FileTextIcon,
  LogOutIcon, MenuIcon, ShieldCheckIcon, SettingsIcon, DollarSignIcon
} from 'lucide-react';
import { AppProvider, AppContext } from '../lib/appContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StackAuthProviderWrapper from './components/StackAuthProviderWrapper';

import "../src/index.css";

// const inter = Inter({ subsets: ['latin'] }); // <--- COMMENT OUT THIS LINE

export default function RootLayout({ children }) {
  const { isAuthenticated, user: stackAuthUser, userProfile, login, logout, isLoading: appLoading } = React.useContext(AppContext);

  const pathname = usePathname();

  if (appLoading) {
    return (
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Mphakathi Online</title>
        </head>
        {/* <body className={inter.className}> */} {/* <--- COMMENT OUT THIS PART */}
        <body>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-xl text-gray-700">Loading application...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mphakathi Online</title>
      </head>
      {/* <body className={inter.className}> */} {/* <--- COMMENT OUT THIS PART */}
      <body>
        {/* Wrap the entire app content with StackAuthProviderWrapper */}
        <StackAuthProviderWrapper>
          {/* AppProvider wraps children to provide app-wide context */}
          <AppProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col">
              {/* Navigation */}
              <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/" className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>
                    <HomeIcon size={20} className="mr-1" /> Dashboard
                  </Link>
                  {isAuthenticated && userProfile?.role === 'member' && (
                    <Link href="/my-requests" className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/my-requests' ? 'text-blue-600 font-semibold' : ''}`}>
                      <FileTextIcon size={20} className="mr-1" /> My Requests
                    </Link>
                  )}
                  {isAuthenticated && userProfile?.role === 'provider' && (
                    <Link href="/my-quotes" className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/my-quotes' ? 'text-blue-600 font-semibold' : ''}`}>
                      <DollarSignIcon size={20} className="mr-1" /> My Quotes
                    </Link>
                  )}
                  {isAuthenticated && userProfile?.role === 'admin' && (
                      <Link href="/admin" className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/admin' ? 'text-blue-600 font-semibold' : ''}`}>
                          <ShieldCheckIcon size={20} className="mr-1" /> Admin
                      </Link>
                  )}
                  {isAuthenticated && (
                    <Link href="/settings" className={`text-gray-700 hover:text-blue-600 flex items-center ${pathname === '/settings' ? 'text-blue-600 font-semibold' : ''}`}>
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
