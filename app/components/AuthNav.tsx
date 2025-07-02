// app/components/AuthNav.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon, UserIcon, FileTextIcon,
    LogOutIcon, MenuIcon, ShieldCheckIcon, SettingsIcon, DollarSignIcon
} from 'lucide-react';
import { AppContext } from '../../lib/appContext';
import { useStackAuthReady } from './StackAuthIsolation'; // Correct path: './StackAuthIsolation'

export default function AuthNav() {
    const { isAuthenticated, userProfile, login, logout, isLoading: appLoading } = React.useContext(AppContext);
    const { isStackReady, stackError } = useStackAuthReady();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (appLoading || !isStackReady) {
        return (
            <>
                <div className="hidden md:flex items-center space-x-6">
                    <div className="text-gray-500">Loading navigation...</div>
                </div>
                <div className="md:hidden">
                    <MenuIcon size={24} className="text-gray-400 animate-pulse" />
                </div>
            </>
        );
    }

    if (stackError) {
        return (
            <div className="hidden md:flex items-center space-x-6 text-red-600">
                Authentication Error: {stackError}
            </div>
        );
    }

    return (
        <>
            {/* Desktop Navigation */}
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
                    <button onClick={login} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center">
                        <LogOutIcon size={20} className="mr-1" /> Logout
                    </button>
                ) : (
                    <button onClick={login} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                        <UserIcon size={20} className="mr-1" /> Login
                    </button>
                )}
            </div>

            {/* Mobile Menu Button (now inside client component) */}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-blue-600">
                    <MenuIcon size={24} />
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 md:hidden z-30">
                    <Link href="/" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                    {isAuthenticated && userProfile?.role === 'member' && (
                        <Link href="/my-requests" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>My Requests</Link>
                    )}
                    {isAuthenticated && userProfile?.role === 'provider' && (
                        <Link href="/my-quotes" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>My Quotes</Link>
                    )}
                    {isAuthenticated && userProfile?.role === 'admin' && (
                        <Link href="/admin" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                    )}
                    {isAuthenticated && (
                        <Link href="/settings" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
                    )}
                    {isAuthenticated ? (
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mt-2">Logout</button>
                    ) : (
                        <button onClick={() => { login(); setIsMobileMenuOpen(false); }} className="w-full text-left py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-2">Login</button>
                    )}
                </div>
            )}
        </>
    );
}
