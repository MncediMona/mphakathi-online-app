// app/components/QuoteModal.js
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
              Provider&apos;s message: &quot;{quoteData.message}&quot;
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
  