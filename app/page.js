// app/page.js (Dashboard / Home Page)
"use client"; // This is a client component

import React, { useState } from 'react';
import { AppContext } from '../lib/appContext'; // Import AppContext
import { PlusCircleIcon, DollarSignIcon, CheckCircleIcon, CheckCircle2Icon, XIcon } from 'lucide-react'; // Icons

// Component imports (assuming you'll create these in app/components)
import { PostProblemModal } from './components/PostProblemModal';
import { QuoteModal } from './components/QuoteModal';
import { ProblemDetailPage } from './components/ProblemDetailPage';
import { ConfirmationModal } from './components/ConfirmationModal'; // If you made it reusable

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export default function HomePage() {
  const {
    isAuthenticated,
    user: stackAuthUser, // Stack Auth user object
    userProfile,     // Your backend user profile
    publicProblems,
    pricingPlans,
    myRequests,
    myQuotes,
    fetchMyRequests,
    fetchPublicProblems,
    fetchMyQuotes,
    isLoading // Combined loading state from AppContext
  } = React.useContext(AppContext);

  const [showPostProblemModal, setShowPostProblemModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProblemForQuote, setSelectedProblemForQuote] = useState(null);
  const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(() => () => {});


  // Handlers for data actions (moved from original App.js)
  const handlePostProblem = React.useCallback(async (problemData) => {
    if (!isAuthenticated || !userProfile?.id) {
      alert("You must be logged in to post a problem.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/post-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...problemData, userId: userProfile.id }),
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const newProblem = await response.json();
      if(newProblem.is_approved) {
        fetchPublicProblems(); // Refresh public problems if new problem is approved
      }
      fetchMyRequests(); // Refresh user's own problems
      setShowPostProblemModal(false);
      alert("Problem posted successfully! Awaiting admin approval if applicable.");
    } catch (error) {
      console.error("Failed to post problem:", error);
      alert("Failed to post problem: " + error.message);
    }
  }, [isAuthenticated, userProfile, fetchPublicProblems, fetchMyRequests]);

  const handleSubmitQuote = React.useCallback(async (problemId, quoteData) => {
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
      setSelectedProblemForQuote(null);
      setShowQuoteModal(false);
      fetchMyQuotes(); // Refresh provider's own quotes
      alert("Quote submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quote:", error);
      alert("Failed to submit quote: " + error.message);
    }
  }, [isAuthenticated, userProfile, fetchMyQuotes]);


  const DashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-xl font-semibold text-gray-700">Loading dashboard data...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Mphakathi Online!</h2>
          <p className="text-gray-700">Please log in to access all features.</p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Public Problems ({publicProblems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicProblems.length > 0 ? (
                publicProblems.map(problem => (
                  <div key={problem.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-800 mb-1">{problem.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{problem.description}</p>
                    <p className="text-gray-500 text-xs">Location: {problem.location}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No public problems available. Check back soon!</p>
              )}
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Our Pricing Plans ({pricingPlans.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pricingPlans.length > 0 ? (
                  pricingPlans.map(plan => (
                    <div key={plan.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-md flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-blue-700 mb-2">{plan.name}</h4>
                        <p className="text-gray-700 text-sm mb-3">{plan.description}</p>
                        <p className="text-2xl font-extrabold text-gray-900 mb-4">{plan.price_display}</p>
                        <ul className="mt-2 text-gray-600 text-sm list-disc list-inside space-y-1">
                          {plan.features?.map((feature, idx) => (<li key={idx}>{feature}</li>))}
                        </ul>
                      </div>
                      <button className="mt-6 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm">
                        {plan.price_display === 'Contact Us' ? 'Contact Sales' : 'Choose Plan'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No pricing plans available at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (userProfile?.role === 'member') {
      return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Member Dashboard</h2>
          <p className="text-gray-700 mb-4">Hello, {userProfile?.name || userProfile?.email || stackAuthUser?.email || 'User'}! Your role is Member.</p>
          <button
            onClick={() => setShowPostProblemModal(true)}
            className="mb-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
          >
            <PlusCircleIcon size={20} className="mr-2" /> Post a New Problem
          </button>

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">My Posted Problems ({myRequests.length})</h3>
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
          </div>
        </section>
      );
    }

    if (userProfile?.role === 'provider') {
      return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Provider Dashboard</h2>
          <p className="text-gray-700 mb-4">Hello, {userProfile?.name || userProfile?.email || stackAuthUser?.email || 'User'}! Your role is Provider.</p>

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Problems to Quote On ({publicProblems.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicProblems.length > 0 ? (
                publicProblems.filter(p => p.status === 'open').map(problem => (
                  <div key={problem.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 shadow-md">
                    <h4 className="text-lg font-medium text-gray-800 mb-1">{problem.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{problem.description}</p>
                    <p className="text-gray-500 text-xs">Location: {problem.location} | Budget: R{problem.estimated_budget?.toFixed(2)}</p>
                    <button
                      onClick={() => { setSelectedProblemId(problem.id); setShowProblemDetailModal(true); }}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      View Details
                    </button>
                    {/* Check if provider has already quoted on this problem */}
                    {myQuotes.some(q => q.problem_id === problem.id && q.provider_id === userProfile.id) ? (
                        <span className="text-sm text-gray-500 ml-2"> (Quoted)</span>
                    ) : (
                        <button
                          onClick={() => { setSelectedProblemForQuote(problem); setShowQuoteModal(true); }}
                          className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                        >
                          Submit Quote
                        </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No open problems available to quote on.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">My Submitted Quotes ({myQuotes.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myQuotes.length > 0 ? (
                myQuotes.map(quote => (
                  <div key={quote.id} className="p-4 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-800 mb-1">Quote for: {quote.problem_title}</h4>
                    <p className="text-gray-600 text-sm mb-2">Amount: R{quote.amount?.toFixed(2)}</p>
                    <p className="text-gray-500 text-xs">Status: {quote.status}</p>
                    {/* Add buttons for withdraw/view details if needed */}
                  </div>
                ))
              ) : (
                <p className="text-gray-600">You haven't submitted any quotes yet.</p>
              )}
            </div>
          </div>
        </section>
      );
    }

    return null; // Should not happen if roles are handled
  };

  return (
    <>
      <DashboardContent />

      {/* Modals - rendered at the root of the page component, but accessible globally via context/props */}
      <PostProblemModal
        isOpen={showPostProblemModal}
        onClose={() => setShowPostProblemModal(false)}
        onPost={handlePostProblem}
        isPaidMember={userProfile?.is_paid_member}
      />
      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        problem={selectedProblemForQuote}
        onSubmitQuote={handleSubmitQuote}
      />
      {showProblemDetailModal && (
        <ProblemDetailPage
          problemId={selectedProblemId}
          onClose={() => setShowProblemDetailModal(false)}
          onShowQuoteModal={(problem) => { setSelectedProblemForQuote(problem); setShowQuoteModal(true); }}
        />
      )}
      {showConfirmation && (
        <ConfirmationModal
          message={confirmationMessage}
          onConfirm={confirmationAction}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}
