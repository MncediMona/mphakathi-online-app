// app/admin/page.js
"use client";

import React from 'react';
import { AppContext } from '../../lib/appContext'; // Adjust path as needed

export default function AdminPage() {
  const { isAuthenticated, userProfile, isLoading } = React.useContext(AppContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-xl font-semibold text-gray-700">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAuthenticated || userProfile?.role !== 'admin') {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-700">You must be logged in as an administrator to access this page.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <p className="text-gray-700">This section is for admin-specific tasks.</p>
      {/* Add your admin specific components and functionality here */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="font-semibold text-blue-800">Admin actions will be implemented here.</p>
        <ul>
          <li>Manage Users</li>
          <li>Approve Problems</li>
          <li>Configure Pricing Plans</li>
        </ul>
      </div>
    </section>
  );
}
