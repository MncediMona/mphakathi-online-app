// app/components/QuoteModal.js
// Assuming existing content, adding fixes for unescaped entities
// Please replace the relevant lines or the entire file if it's small.

// Example of fixing unescaped entities (apply to your actual content):
// Change: `This is a user's quote.` to `This is a user&apos;s quote.`
// Change: `He said "Hello".` to `He said &quot;Hello&quot;.`

// Example structure (adjust based on your actual QuoteModal content):
import React from 'react';

const QuoteModal = ({ isOpen, onClose, quoteData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Quote Details</h2>
        {quoteData ? (
          <div>
            <p><strong>Provider:</strong> {quoteData.providerName}</p>
            <p><strong>Amount:</strong> R{quoteData.amount}</p>
            <p><strong>Status:</strong> {quoteData.status}</p>
            <p className="mt-4">
              Provider&apos;s message: &quot;{quoteData.message}&quot; {/* Fixed here */}
            </p>
          </div>
        ) : (
          <p>No quote data available.</p>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QuoteModal;
