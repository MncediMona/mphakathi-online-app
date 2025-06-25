import React, { useState, useEffect, createContext, useCallback } from 'react';
import {
  HomeIcon, UserIcon, FileTextIcon, PackageIcon,
  LogOutIcon, MenuIcon, ShieldCheckIcon, SettingsIcon, BriefcaseIcon,
  PlusCircleIcon, EditIcon, CheckCircleIcon, XCircleIcon, DollarSignIcon,
  CheckCircle2Icon, PaintbrushIcon, XIcon // Lucide icons for navigation and actions
} from 'lucide-react';
// IMPORT STACK AUTH SDK
// We'll use useUser for getting the user info and isAuthenticated status,
// and StackAuthProvider to wrap the application for context.
// login and logout functions are typically accessed directly from the useStackAuth hook
// as useStackApp only provides the client app instance.
import { StackAuthProvider, useUser, useStackApp } from '@stackframe/stack';
import config from './config'; // Make sure config.js exists and is correctly configured

// Create a React Context to share application-wide data (e.g., user info, fetched data)
export const AppContext = createContext(null);

// Base URL for API calls, derived from config.js
const API_BASE_URL = config.apiBaseUrl;

/**
 * ConfirmationModal Component:
 * A reusable modal for user confirmations.
 */
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm rounded-md">
        <p className="text-lg text-gray-800 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// NEW COMPONENTS (Extracted from provided app.js and adapted)
// =========================================================================

const PostProblemModal = ({ isOpen, onClose, onPost, isPaidMember }) => {
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
    onPost(newProblem); // Call the parent's save handler
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Post a New Problem</h3>
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

const QuoteModal = ({ isOpen, onClose, problem, onSubmitQuote }) => {
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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit Quote for: "{problem.title}"</h3>
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

const ProblemDetailPage = ({ problemId, onClose, onShowQuoteModal }) => {
  const [problem, setProblem] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const { isAuthenticated, user: stackAuthUser } = useUser(); // Using useUser for auth state
  const { userProfile, fetchMyRequests, fetchPublicProblems, fetchMyQuotes } = React.useContext(AppContext);

  // Functions for quote actions, now using fetch
  const handleAcceptQuote = useCallback(async (quoteId) => {
    // Ensure authentication and authorization
    if (!isAuthenticated || !stackAuthUser || !userProfile || problem?.user_id !== userProfile.id) {
      alert("You are not authorized to accept this quote.");
      return;
    }
    // You might want to add a check for paid membership here, as per your business logic
    // if (!userProfile?.is_paid_member) { alert("You must be a paid member to accept quotes."); return; }

    try {
      // Your Netlify function should verify the token sent with the request
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/update-quote-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, status: 'accepted', problemId: problem.id, userId: userProfile.id }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json(); // Consume response
      alert("Quote accepted! Problem status updated.");
      // Re-fetch details to update UI - these functions need to be passed down or accessed via context
      // Assuming AppContext provides these if needed in ProblemDetailPage
      fetchProblemDetails(); // This function is defined locally below, so it's fine.
      if (fetchMyRequests) fetchMyRequests(); // Re-fetch user's requests if it was their problem
      if (fetchPublicProblems) fetchPublicProblems(); // Update public problem list
    } catch (error) {
      console.error("Failed to accept quote:", error);
      alert("Failed to accept quote: " + error.message);
    }
  }, [isAuthenticated, stackAuthUser, userProfile, problem, fetchMyRequests, fetchPublicProblems]); // Added fetchMyRequests, fetchPublicProblems to dependencies

  // fetchProblemDetails is local to ProblemDetailPage
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
  }, [fetchProblemDetails]); // Dependency is correct as fetchProblemDetails is memoized

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
                    <p className="text-gray-700 text-sm mb-2">{quote.description}</p>
                    <p className="text-gray-600 text-xs">By Provider ID: {quote.provider_id || 'N/A'} | Status: {quote.status}</p>
                    {quote.status === 'pending' && (
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 flex items-center"
                        >
                          <CheckCircleIcon size={16} className="mr-1" /> Accept
                        </button>
                        {/* Add Withdraw button here if needed by owner */}
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
            onClick={() => onShowQuoteModal(problem)}
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
    </div>
  );
};


// Main App Component
const App = () => {
  // Use Stack Auth hooks to get authentication state and user
  const { isAuthenticated, user: stackAuthUser, isLoading: isStackAuthLoading } = useUser();
  const stackApp = useStackApp(); // Get the Stack App client instance for login/logout

  const [branding, setBranding] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [publicProblems, setPublicProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appDataLoading, setAppDataLoading] = useState(true);

  // New states for managing UI and data from the more comprehensive app.js
  const [currentPage, setCurrentPage] = useState('dashboard'); // Controls which main view is shown
  const [showPostProblemModal, setShowPostProblemModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProblemForQuote, setSelectedProblemForQuote] = useState(null);
  const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [myRequests, setMyRequests] = useState([]); // Problems posted by current user
  const [myQuotes, setMyQuotes] = useState([]);      // Quotes submitted by current provider


  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationAction, setConfirmationAction] = useState(() => () => {});
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);


  // =========================================================================
  // DATA FETCHING FUNCTIONS
  // =========================================================================

  const fetchBranding = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-branding`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setBranding(data);
    } catch (error) { console.error("Failed to fetch branding:", error); }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-pricing-plans`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setPricingPlans(data);
    } catch (error) { console.error("Failed to fetch pricing plans:", error); }
  }, []);

  const fetchPublicProblems = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-problems`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setPublicProblems(data);
    } catch (error) { console.error("Error fetching public problems:", error); }
  }, []);

  const fetchOrCreateUserProfile = useCallback(async () => {
    if (!isAuthenticated || !stackAuthUser) {
      setUserProfile(null);
      return;
    }
    try {
      // Send Stack Auth user ID, email, name to your backend to get/create user profile
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-or-create-user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0Id: stackAuthUser.id, // Assuming Stack Auth user object has a unique 'id'
          email: stackAuthUser.email,
          name: stackAuthUser.displayName || stackAuthUser.email, // Use displayName if available, else email
        }),
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setUserProfile(data);
      setEmailNotifications(data.email_notifications || false);
      setSmsNotifications(data.sms_notifications || false);
    } catch (error) { console.error("Error fetching or creating user profile:", error); }
  }, [isAuthenticated, stackAuthUser]); // Dependencies for this useCallback

  const fetchMyRequests = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.id) {
      setMyRequests([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-problems-by-user?userId=${userProfile.id}`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setMyRequests(data);
    } catch (error) {
      console.error("Failed to fetch my requests:", error);
    }
  }, [isAuthenticated, userProfile?.id]);

  const fetchMyQuotes = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.id || userProfile?.role !== 'provider') {
      setMyQuotes([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-quotes-by-provider?providerId=${userProfile.id}`);
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setMyQuotes(data);
    } catch (error) {
      console.error("Failed to fetch my quotes:", error);
    }
  }, [isAuthenticated, userProfile?.id, userProfile?.role]);


  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Effect for initial public data load
  useEffect(() => {
    const loadAllPublicData = async () => {
      setAppDataLoading(true);
      await Promise.all([fetchBranding(), fetchPlans(), fetchPublicProblems()]);
      setAppDataLoading(false);
    };
    loadAllPublicData();
  }, [fetchBranding, fetchPlans, fetchPublicProblems]);

  // Effect for user-specific data (profile, requests, quotes)
  useEffect(() => {
    if (isAuthenticated) { // Trigger when Stack Auth confirms authentication
      fetchOrCreateUserProfile();
    } else {
      // Clear user-specific state if not authenticated
      setUserProfile(null);
      setEmailNotifications(false);
      setSmsNotifications(false);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile]);

  useEffect(() => {
    if (userProfile?.id && isAuthenticated) { // Ensure userProfile is loaded and authenticated
      fetchMyRequests();
      fetchMyQuotes(); // Only runs if userProfile.role is provider
    }
  }, [userProfile?.id, isAuthenticated, fetchMyRequests, fetchMyQuotes]);


  // =========================================================================
  // HANDLERS FOR NEW FUNCTIONALITY
  // =========================================================================

  const handlePostProblem = useCallback(async (problemData) => {
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
      // Add problem to public list if it's approved by default (or manage separately)
      if(newProblem.is_approved) { // Assuming backend sends is_approved
        setPublicProblems(prev => [newProblem, ...prev]);
      }
      fetchMyRequests(); // Refresh user's own problems
      setShowPostProblemModal(false);
      alert("Problem posted successfully! Awaiting admin approval if applicable.");
    } catch (error) {
      console.error("Failed to post problem:", error);
      alert("Failed to post problem: " + error.message);
    }
  }, [isAuthenticated, userProfile?.id, fetchMyRequests]);

  const handleSubmitQuote = useCallback(async (problemId, quoteData) => { // quoteData is an object now
    if (!isAuthenticated || userProfile?.role !== 'provider' || !userProfile?.id) {
      alert("You must be logged in as an approved provider to submit a quote.");
      return;
    }
    // You might add is_provider_approved check here if not done in backend function

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
      await response.json(); // Consume response
      setSelectedProblemForQuote(null);
      setShowQuoteModal(false);
      fetchMyQuotes(); // Refresh provider's own quotes
      alert("Quote submitted successfully!");
    } catch (error) {
      console.error("Failed to submit quote:", error);
      alert("Failed to submit quote: " + error.message);
    }
  }, [isAuthenticated, userProfile, fetchMyQuotes]);


  const handleExportData = () => {
    setConfirmationMessage("Are you sure you want to export your data? This action cannot be undone.");
    setConfirmationAction(() => () => {
      console.log("Exporting data...");
      // Placeholder for actual data export logic
      setShowConfirmation(false);
    });
    setShowConfirmation(true);
  };

  const handleLogin = () => {
    // Calling login from useStackApp instance
    stackApp.login();
  };

  const handleLogout = () => {
    // Calling logout from useStackApp instance
    stackApp.logout();
  };


  // =========================================================================
  // LOADING / UI RENDERING
  // =========================================================================

  // Combine loading states for initial app data and Stack Auth SDK
  if (isStackAuthLoading || appDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading application...</div>
      </div>
    );
  }

  // Helper component for different dashboard views based on role
  const DashboardContent = () => {
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
    // Wrap with Stack Auth Provider component
    // Pass projectId and publishableClientKey from environment variables
    <StackAuthProvider
      projectId={process.env.REACT_APP_STACK_PROJECT_ID || process.env.VITE_STACK_PROJECT_ID}
      publishableClientKey={process.env.REACT_APP_STACK_PUBLISHABLE_CLIENT_KEY || process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY}
    >
      <AppContext.Provider value={{
        branding,
        pricingPlans,
        publicProblems,
        userProfile,
        myRequests,
        myQuotes,
        // Expose fetch functions that might be needed by child components (e.g., ProblemDetailPage)
        fetchMyRequests,
        fetchPublicProblems,
        fetchMyQuotes,
        // Provide Stack Auth state and methods via context as needed
        isAuthenticated,
        user: stackAuthUser,
        login: handleLogin, // Expose login from here
        logout: handleLogout, // Expose logout from here
      }}>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          {/* Navigation */}
          <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center">
              {/* Branding will come from fetched data */}
              <h1 className="text-2xl font-bold text-gray-800">{branding?.appName || 'Mphakathi Online'}</h1>
              {branding?.appLogo && <img src={branding.appLogo} alt="Logo" className="h-8 ml-2" />}
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentPage('dashboard')} className="text-gray-700 hover:text-blue-600 flex items-center">
                <HomeIcon size={20} className="mr-1" /> Dashboard
              </button>
              {isAuthenticated && userProfile?.role === 'member' && (
                <button onClick={() => setCurrentPage('my-requests')} className="text-gray-700 hover:text-blue-600 flex items-center">
                  <FileTextIcon size={20} className="mr-1" /> My Requests
                </button>
              )}
              {isAuthenticated && userProfile?.role === 'provider' && (
                <button onClick={() => setCurrentPage('my-quotes')} className="text-gray-700 hover:text-blue-600 flex items-center">
                  <DollarSignIcon size={20} className="mr-1" /> My Quotes
                </button>
              )}
              {isAuthenticated && userProfile?.role === 'admin' && ( // Admin Panel Link
                  <button onClick={() => setCurrentPage('admin')} className="text-gray-700 hover:text-blue-600 flex items-center">
                      <ShieldCheckIcon size={20} className="mr-1" /> Admin
                  </button>
              )}
              {isAuthenticated && (
                <button onClick={() => setCurrentPage('settings')} className="text-gray-700 hover:text-blue-600 flex items-center">
                  <SettingsIcon size={20} className="mr-1" /> Settings
                </button>
              )}
              {isAuthenticated ? (
                <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center">
                  <LogOutIcon size={20} className="mr-1" /> Logout
                </button>
              ) : (
                <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <UserIcon size={20} className="mr-1" /> Login
                </button>
              )}
            </div>
            <div className="md:hidden">
              <button onClick={() => { /* Toggle mobile menu */ }} className="text-gray-700 hover:text-blue-600">
                <MenuIcon size={24} />
              </button>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-grow p-4 md:p-8">
            {currentPage === 'dashboard' && <DashboardContent />}
            {currentPage === 'my-requests' && isAuthenticated && userProfile?.role === 'member' && (
              <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Posted Problems ({myRequests.length})</h2>
                {/* Content for My Requests */}
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
              </section>
            )}
            {currentPage === 'my-quotes' && isAuthenticated && userProfile?.role === 'provider' && (
              <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Submitted Quotes ({myQuotes.length})</h2>
                {/* Content for My Quotes */}
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
            )}
            {currentPage === 'admin' && isAuthenticated && userProfile?.role === 'admin' && (
              <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
                {/* Admin content will go here */}
                <p className="text-gray-700">This section is for admin-specific tasks.</p>
              </section>
            )}
            {currentPage === 'settings' && isAuthenticated && (
              <section className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Profile Information</h3>
                          <p className="text-gray-600">Update your personal details.</p>
                          <div className="mt-3">
                              <p className="text-gray-700">Name: {userProfile?.name || stackAuthUser?.name || 'N/A'}</p>
                              <p className="text-gray-700">Email: {userProfile?.email || stackAuthUser?.email || 'N/A'}</p>
                              <p className="text-gray-700">Role: {userProfile?.role || 'N/A'}</p>
                          </div>
                          <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                              Edit Profile
                          </button>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Notification Preferences</h3>
                          <p className="text-gray-600">Configure how you receive alerts for new activity.</p>
                          <div className="mt-3 flex items-center">
                              <input type="checkbox" id="email-notifications" className="mr-2" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                              <label htmlFor="email-notifications" className="text-gray-700">Email notifications</label>
                          </div>
                          <div className="mt-2 flex items-center">
                              <input type="checkbox" id="sms-notifications" className="mr-2" checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} />
                              <label htmlFor="sms-notifications" className="text-gray-700">SMS notifications (coming soon)</label>
                          </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md">
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Data Management</h3>
                          <p className="text-gray-600">Review and manage your data.</p>
                          <button onClick={handleExportData} className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200">
                              Export My Data
                          </button>
                      </div>
                  </div>
              </section>
            )}
          </main>

          {/* Modals */}
          <PostProblemModal
            isOpen={showPostProblemModal}
            onClose={() => setShowPostProblemModal(false)}
            onPost={handlePostProblem}
            isPaidMember={userProfile?.is_paid_member} // Example, assuming userProfile has this
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
        </div>
      </AppContext.Provider>
    </StackAuthProvider>
  );
};

export default App;
