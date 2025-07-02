// app/admin/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../lib/appContext'; // Correct: import useAppContext hook

const AdminPage = () => {
  const { userProfile, isLoading, error, isAuthenticated } = useAppContext(); // Use the hook

  if (isLoading) {
    return <div className="text-center py-8">Loading admin data...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!isAuthenticated || userProfile?.role !== 'admin') {
    return <div className="text-center py-8 text-gray-600">Access Denied: You must be an admin to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-700">Welcome, Admin {userProfile.name || userProfile.email}!</p>
      {/* Add admin-specific content here */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Manage Users</li>
          <li>Review Service Requests</li>
          <li>Approve Quotes</li>
          <li>View System Analytics</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;
