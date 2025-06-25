// app/my-quotes/page.js
"use client";

import React, { useEffect } from 'react';
import { AppContext } from '../../lib/appContext'; // Adjust path as needed
import { FileTextIcon } from 'lucide-react'; // Example icon

export default function MyQuotesPage() {
  const { isAuthenticated, userProfile, myQuotes, fetchMyQuotes, isLoading } = React.useContext(AppContext);

  // Re-fetch on mount if not loading
  useEffect(() => {
    if (isAuthenticated && userProfile?.id && userProfile?.role === 'provider' && !isLoading) {
      fetchMyQuotes();
    }
  }, [isAuthenticated, userProfile?.id, userProfile?.role, fetchMyQuotes, isLoading]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-xl font-semibold text-gray-700">Loading your quotes...</div>
      </div>
    );
  }

  if (!isAuthenticated || userProfile?.role !== 'provider') {
    return (
      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
        <p className="text-gray-700">You must be logged in as a provider to view your quotes.</p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Submitted Quotes ({myQuotes.length})</h2>
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
    </section>
  );
}
