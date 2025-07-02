// app/page.js
"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../lib/appContext'; // Correct path

const HomePage = () => {
  const { publicProblems, isLoading, error, isAuthenticated, userProfile, login } = useAppContext();
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleViewProblem = (problem) => {
    setSelectedProblem(problem);
    setIsProblemModalOpen(true);
  };

  const handleCloseProblemModal = () => {
    setIsProblemModalOpen(false);
    setSelectedProblem(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Loading application data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Mphakathi Online</h1>

      {!isAuthenticated && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Join Us!</p>
          <p>Login to request services or provide quotes. It&apos;s quick and easy!</p> {/* Fixed here */}
          <button onClick={login} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Login
          </button>
        </div>
      )}

      {isAuthenticated && userProfile && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Welcome back, {userProfile.name || userProfile.email}!</p>
          <p>Your role: <span className="font-semibold capitalize">{userProfile.role}</span></p>
          {userProfile.role === 'member' && (
            <p className="mt-2">Ready to request a service? Click the &quot;New Request&quot; button!</p> // Fixed here
          )}
          {userProfile.role === 'provider' && (
            <p className="mt-2">Check out the latest service requests to provide your quotes!</p>
          )}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Public Service Requests</h2>
      {publicProblems.length === 0 ? (
        <p className="text-gray-600">No public service requests available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicProblems.map((problem) => (
            <div key={problem.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-2 text-gray-700">{problem.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{problem.description.substring(0, 100)}...</p>
              <p className="text-gray-600">Category: <span className="font-medium">{problem.category}</span></p>
              <p className="text-gray-600">Status: <span className={`font-medium ${
                problem.status === 'open' ? 'text-green-600' :
                problem.status === 'pending_quotes' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{problem.status}</span></p>
              <button
                onClick={() => handleViewProblem(problem)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* You would typically have a ProblemModal component here */}
      {/* {isProblemModalOpen && (
        <ProblemModal isOpen={isProblemModalOpen} onClose={handleCloseProblemModal} problemData={selectedProblem} />
      )} */}
    </div>
  );
};

export default HomePage;
