// app/components/PostProblemModal.js
"use client"; // This is a client component

import React, { useState } from 'react';
import { XIcon } from 'lucide-react'; // Import XIcon

export const PostProblemModal = ({ isOpen, onClose, onPost, isPaidMember }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!title || !description || !category || !location || !estimatedBudget) {
      setFormError('All fields are required.');
      return;
    }
    if (parseFloat(estimatedBudget) <= 0) {
      setFormError('Budget must be a positive number.');
      return;
    }

    const newProblem = {
      title, description, category, location,
      estimated_budget: parseFloat(estimatedBudget),
      status: 'open',
      is_approved: false, // Will require admin approval
    };
    onPost(newProblem);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md relative">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Post a New Problem</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <XIcon size={24} />
        </button>
        {!isPaidMember && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md" role="alert">
            <p className="font-bold">Free member limit:</p>
            <p className="text-sm">As a free member, your problem will be public but features like accepting quotes are locked. Upgrade to a paid plan to unlock all features.</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input type="text" id="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea id="description" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
            <input type="text" id="category" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={category} onChange={(e) => setCategory(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Location</label>
            <input type="text" id="location" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedBudget">Estimated Budget (R)</label>
            <input type="number" id="estimatedBudget" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={estimatedBudget} onChange={(e) => setEstimatedBudget(e.target.value)} required />
          </div>

          {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Post Problem</button>
          </div>
        </form>
      </div>
    </div>
  );
};
