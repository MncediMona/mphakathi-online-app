// app/my-requests/page.js
"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../lib/appContext'; // Correct path
import QuoteModal from '../components/QuoteModal'; // Import QuoteModal

const MyRequestsPage = () => {
  const { myRequests, isLoading, error, userProfile, fetchMyRequests } = useAppContext();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'member' && !isLoading && !error) {
      fetchMyRequests();
    }
  }, [userProfile, isLoading, error, fetchMyRequests]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!userProfile || userProfile.role !== 'member') {
    return <div className="text-center py-8 text-gray-600">You don&apos;t have access to view requests as a member.</div>; // Fixed here
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Requests</h1>
      {myRequests.length === 0 ? (
        <p className="text-gray-600">You haven&apos;t made any requests yet.</p> // Fixed here
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRequests.map((request) => (
            <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Request: {request.title}</h2>
              <p className="text-gray-600">Status: <span className={`font-medium ${
                request.status === 'pending' ? 'text-yellow-600' :
                request.status === 'completed' ? 'text-green-600' :
                'text-red-600'
              }`}>{request.status}</span></p>
              <button
                onClick={() => handleViewRequest(request)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
        <QuoteModal isOpen={isModalOpen} onClose={handleCloseModal} quoteData={selectedRequest} />
      )}
    </div>
  );
};

export default MyRequestsPage;
