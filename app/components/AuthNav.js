// app/components/AuthNav.js
"use client"; // This component MUST be a client component

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, UserIcon, FileTextIcon,
    LogOutIcon, MenuIcon, ShieldCheckIcon, SettingsIcon, DollarSignIcon
} from 'lucide-react';
import { AppContext } from '../../lib/appContext'; // Access your global app context

export default function AuthNav() {
    // These hooks will only run after hydration when AppContext is available
    const { isAuthenticated, userProfile, login, logout, isLoading: appLoading } = React.useContext(AppContext);
    const pathname = usePathname();

    // If app data is still loading, show a minimal nav or loading indicator
    if (appLoading) {
        return (
            <div className="flex items-center justify-between p-4">
                <h1 className="text-2xl font-bold text-gray-800">Mphakathi Online</h1>
                <div className="text-gray-500">Loading navigation...</div>
            </div>
        );
    }

    return (
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
    );
}

