// app/my-requests/page.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppContext } from '../../lib/appContext'; // Adjust path as needed
import { ProblemDetailPage } from '../components/ProblemDetailPage'; // Re-use existing modal
import { DollarSignIcon } from 'lucide-react'; // Example icon

export default function MyRequestsPage() {
  const { isAuthenticated, userProfile, myRequests, fetchMyRequests, isLoading } = React.useContext(AppContext);
  const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false); // For if a provider is viewing their quotes on a problem they posted
  const [selectedProblemForQuote, setSelectedProblemForQuote] = useState(null); // For if a provider is viewing their quotes on a problem they posted

  // Re-fetch on mount if not loading
  useEffect(() => {
    if (isAuthenticated && userProfile?.id && !isLoading) {
      fetchMyRequests();
    }
  }, [isAuthenticated, userProfile?.id, fetchMyRequests, isLoading]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-xl font-semibold text-gray-700">Loading your requests...</div>
      </div>
    );
  }

  if (!isAuthenticated || userProfile?.role !== 'member') {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-700">You must be logged in as a member to view your requests.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Posted Problems ({myRequests.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myRequests.length > 0 ? (
          myRequests.map(problem => (
            <div key={problem.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
              <h4 className="text-lg font-medium text-gray-800 mb-1">{problem.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{problem.description}</p>
              <p className="text-gray-500 text-xs">Status: {problem.status}</p>
              <button
                onClick={() => { setSelectedProblemId(problem.id); setShowProblemDetailModal(true); }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600">You haven't posted any problems yet.</p>
        )}
      </div>

      {showProblemDetailModal && (
        <ProblemDetailPage
          problemId={selectedProblemId}
          onClose={() => setShowProblemDetailModal(false)}
          onShowQuoteModal={(problem) => { setSelectedProblemForQuote(problem); setShowQuoteModal(true); }} // This will be handled by the ProblemDetailPage's internal logic for quotes
        />
      )}
      {/* If QuoteModal is needed here (e.g., if a provider submits a quote from *this* page) */}
      {showQuoteModal && (
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          problem={selectedProblemForQuote}
          onSubmitQuote={() => { /* This function will likely be passed from a parent context/page */ }}
        />
      )}
    </section>
  );
}
