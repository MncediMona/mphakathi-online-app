// app/settings/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../lib/appContext'; // Correct: import useAppContext hook

const SettingsPage = () => {
  const { userProfile, isLoading, error, isAuthenticated } = useAppContext(); // Use the hook

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-8 text-gray-600">Please login to view your settings.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Settings</h1>
      {userProfile ? (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-lg mb-2"><strong>Name:</strong> {userProfile.name}</p>
          <p className="text-lg mb-2"><strong>Email:</strong> {userProfile.email}</p>
          <p className="text-lg"><strong>Role:</strong> <span className="capitalize">{userProfile.role}</span></p>
          {/* Add more settings options here */}
          <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Profile
          </button>
        </div>
      ) : (
        <p className="text-gray-600">No user profile found.</p>
      )}
    </div>
  );
};

export default SettingsPage;
