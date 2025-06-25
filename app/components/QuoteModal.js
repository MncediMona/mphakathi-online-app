// app/components/QuoteModal.js
"use client";

import React, { useState } from 'react';
import { XIcon } from 'lucide-react'; // Import XIcon

export const QuoteModal = ({ isOpen, onClose, problem, onSubmitQuote }) => {
  const [proposedBudget, setProposedBudget] = useState('');
  const [motivation, setMotivation] = useState('');
  const [proposedStartDate, setProposedStartDate] = useState('');
  const [proposedEndDate, setProposedEndDate] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!proposedBudget || !motivation || !proposedStartDate || !proposedEndDate) {
      setFormError('All fields are required.');
      return;
    }
    if (parseFloat(proposedBudget) <= 0) {
      setFormError('Proposed Budget must be a positive number.');
      return;
    }
    if (new Date(proposedStartDate) > new Date(proposedEndDate)) {
      setFormError('Proposed Start Date cannot be after Proposed End Date.');
      return;
    }

    onSubmitQuote(problem.id, {
      proposedBudget: parseFloat(proposedBudget),
      motivation,
      proposedStartDate,
      proposedEndDate
    });
  };

  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md relative">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit Quote for: "{problem.title}"</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon size={24} />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedBudget">Proposed Budget (R)</label>
            <input type="number" id="proposedBudget" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedBudget} onChange={(e) => setProposedBudget(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motivation">Motivation / Details</label>
            <textarea id="motivation" rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={motivation} onChange={(e) => setMotivation(e.target.value)} required></textarea>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedStartDate">Proposed Start Date</label>
            <input type="date" id="proposedStartDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedStartDate} onChange={(e) => setProposedStartDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedEndDate">Proposed End Date</label>
            <input type="date" id="proposedEndDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedEndDate} onChange={(e) => setProposedEndDate(e.target.value)} required />
          </div>

          {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">Submit Quote</button>
          </div>
        </form>
      </div>
    </div>
  );
};
