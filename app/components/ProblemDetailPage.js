// app/components/ProblemDetailPage.js
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, CheckCircle2Icon, DollarSignIcon, XIcon } from 'lucide-react';
import { AppContext } from '../../lib/appContext'; // Import AppContext
import { QuoteModal } from './QuoteModal'; // Import QuoteModal

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const ProblemDetailPage = ({ problemId, onClose, onShowQuoteModal }) => {
  const [problem, setProblem] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const { isAuthenticated, user: stackAuthUser, userProfile, fetchMyRequests, fetchPublicProblems, fetchMyQuotes } = React.useContext(AppContext);

  const fetchProblemDetails = useCallback(async () => {
    try {
      const problemResponse = await fetch(`${API_BASE_URL}/.netlify/functions/get-problem-details?problemId=${problemId}`);
      if (!problemResponse.ok) throw new Error(`HTTP error! status: ${problemResponse.status}`);
      const problemData = await problemResponse.json();
      setProblem(problemData);

      const quotesResponse = await fetch(`${API_BASE_URL}/.netlify/functions/get-quotes-for-problem?problemId=${problemId}`);
      if (!quotesResponse.ok) throw new Error(`HTTP error! status: ${quotesResponse.status}`);
      const quotesData = await quotesResponse.json();
      setQuotes(quotesData);

    } catch (error) {
      console.error("Failed to fetch problem details or quotes:", error);
      alert("Failed to load problem details: " + error.message);
    }
  }, [problemId]);

  useEffect(() => {
    fetchProblemDetails();
  }, [fetchProblemDetails]);

  const handleAcceptQuote = useCallback(async (quoteId) => {
    if (!isAuthenticated || !stackAuthUser || !userProfile || problem?.user_id !== userProfile.id) {
      alert("You are not authorized to accept this quote.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/update-quote-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, status: 'accepted', problemId: problem.id, userId: userProfile.id }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      alert("Quote accepted! Problem status updated.");
      fetchProblemDetails(); // Re-fetch to update quote status in UI
      if (fetchMyRequests) fetchMyRequests();
      if (fetchPublicProblems) fetchPublicProblems();
    } catch (error) {
      console.error("Failed to accept quote:", error);
      alert("Failed to accept quote: " + error.message);
    }
  }, [isAuthenticated, stackAuthUser, userProfile, problem, fetchProblemDetails, fetchMyRequests, fetchPublicProblems]);

  // This is a simplified onSubmitQuote for the modal within ProblemDetailPage
  // In a real app, this might come from a global context or be handled differently.
  const handleSubmitQuoteInternal = useCallback(async (problemId, quoteData) => {
    if (!isAuthenticated || userProfile?.role !== 'provider' || !userProfile?.id) {
      alert("You must be logged in as an approved provider to submit a quote.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/submit-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          providerId: userProfile.id,
          amount: quoteData.proposedBudget,
          details: quoteData.motivation,
          proposedStartDate: quoteData.proposedStartDate,
          proposedEndDate: quoteData.proposedEndDate,
        }),
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      await response.json();
      alert("Quote submitted successfully!");
      fetchProblemDetails(); // Re-fetch to update quotes list after submission
      if(fetchMyQuotes) fetchMyQuotes(); // Also update the global list of quotes
    } catch (error) {
      console.error("Failed to submit quote:", error);
      alert("Failed to submit quote: " + error.message);
    }
  }, [isAuthenticated, userProfile, fetchProblemDetails, fetchMyQuotes]);


  const [showInternalQuoteModal, setShowInternalQuoteModal] = useState(false);

  if (!problem) return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl rounded-md relative">
        <div className="text-center">Loading problem details...</div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon size={24} />
        </button>
      </div>
    </div>
  );

  const isOwner = isAuthenticated && userProfile && problem.user_id === userProfile.id;
  const isProvider = isAuthenticated && userProfile?.role === 'provider';


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl rounded-md relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{problem.title}</h2>
        <p className="text-gray-700 mb-6">{problem.description}</p>
        <p className="text-gray-500 text-sm mb-4">Location: {problem.location} | Status: {problem.status} | Budget: R{problem.estimated_budget?.toFixed(2) || 'N/A'}</p>

        {isOwner && problem.status === 'open' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">Quotes for Your Problem</h3>
            {quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.map(quote => (
                  <div key={quote.id} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                    <p className="font-semibold text-lg text-blue-700">Amount: R{quote.amount?.toFixed(2)}</p>
                    <p className="text-gray-700 text-sm mb-2">{quote.details}</p> {/* Changed from description to details as per new quote structure */}
                    <p className="text-gray-600 text-xs">
                      By Provider ID: {quote.provider_id || 'N/A'} | Status: {quote.status}
                      {quote.proposedStartDate && ` | Start: ${new Date(quote.proposedStartDate).toLocaleDateString()}`}
                      {quote.proposedEndDate && ` | End: ${new Date(quote.proposedEndDate).toLocaleDateString()}`}
                    </p>
                    {quote.status === 'pending' && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 flex items-center"
                        >
                          <CheckCircleIcon size={16} className="mr-1" /> Accept
                        </button>
                      </div>
                    )}
                      {quote.status === 'accepted' && (
                      <p className="text-green-600 font-semibold mt-2 flex items-center">
                        <CheckCircle2Icon size={16} className="mr-1" /> Accepted!
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No quotes submitted yet for this problem.</p>
            )}
          </div>
        )}

        {isProvider && problem.status === 'open' && !quotes.some(q => q.provider_id === userProfile.id && q.status === 'pending') && (
          <button
            onClick={() => setShowInternalQuoteModal(true)} // Use internal state for this modal
            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center shadow-md"
          >
            <DollarSignIcon size={20} className="mr-2" /> Submit a Quote
          </button>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            Close
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon size={24} />
        </button>
      </div>

      {showInternalQuoteModal && (
        <QuoteModal
          isOpen={showInternalQuoteModal}
          onClose={() => setShowInternalQuoteModal(false)}
          problem={problem}
          onSubmitQuote={handleSubmitQuoteInternal}
        />
      )}
    </div>
  );
};
