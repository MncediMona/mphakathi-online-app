// app/my-quotes/page.js
"use client"; // Ensure this is a client component

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../lib/appContext'; // Correct path

const MyQuotesPage = () => {
  const { myQuotes, isLoading, error, userProfile, fetchMyQuotes } = useAppContext();
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile?.role === 'provider' && !isLoading && !error) {
      fetchMyQuotes();
    }
  }, [userProfile, isLoading, error, fetchMyQuotes]);

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading quotes...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!userProfile || userProfile.role !== 'provider') {
    return <div className="text-center py-8 text-gray-600">You don&apos;t have access to view quotes as a provider.</div>; // Fixed here
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Quotes</h1>
      {myQuotes.length === 0 ? (
        <p className="text-gray-600">You haven&apos;t provided any quotes yet.</p> // Fixed here
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myQuotes.map((quote) => (
            <div key={quote.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Quote for Problem ID: {quote.problemId}</h2>
              <p className="text-gray-600">Amount: R{quote.amount}</p>
              <p className="text-gray-600">Status: <span className={`font-medium ${
                quote.status === 'pending' ? 'text-yellow-600' :
                quote.status === 'accepted' ? 'text-green-600' :
                'text-red-600'
              }`}>{quote.status}</span></p>
              <button
                onClick={() => handleViewQuote(quote)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Assuming QuoteModal is imported and defined */}
      {/* <QuoteModal isOpen={isModalOpen} onClose={handleCloseModal} quoteData={selectedQuote} /> */}
    </div>
  );
};

export default MyQuotesPage;
