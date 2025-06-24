import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  HomeIcon, UserIcon, FileTextIcon, PackageIcon,
  ShieldCheckIcon, SettingsIcon, LogOutIcon, BriefcaseIcon, PlusCircleIcon,
  EditIcon, CheckCircleIcon, XCircleIcon, DollarSignIcon, CheckCircle2Icon,
  PaintbrushIcon, MenuIcon, XIcon
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

// AppContext definition
export const AppContext = createContext(null);

// =========================================================================
// GLOBAL CONSTANTS AND HELPER FUNCTIONS GO HERE:
// =========================================================================

// Define API Base URL dynamically based on environment
const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8888' // For `netlify dev` in Codespaces or local machine
    : ''; // For Netlify deployment, use relative path

// Custom Confirmation Modal - Reusable UI for confirmations
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm rounded-md">
                <p className="text-lg text-gray-800 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// YOUR MAIN REACT COMPONENT DEFINITION STARTS HERE
// =========================================================================
const App = () => {
    // Auth0 hooks for authentication state and token retrieval
    const { user, isAuthenticated, getAccessTokenSilently, loginWithRedirect, logout } = useAuth0();

    // --- State Management for Application Data and UI ---
    const [userProfile, setUserProfile] = useState(null); // Will store DB profile, not mock
    const [userRole, setUserRole] = useState('loggedOut'); // Derived from userProfile
    const [isPaidMember, setIsPaidMember] = useState(false); // Derived from userProfile
    const [currentPage, setCurrentPage] = useState('problems'); // Default page
    const [loading, setLoading] = useState(false); // Global loading indicator
    const [showPostProblemModal, setShowPostProblemModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // For pricing plan selection
    const [message, setMessage] = useState(null); // Global message/notification system
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [editingProblem, setEditingProblem] = useState(null);
    const [submittingQuoteForProblem, setSubmittingQuoteForProblem] = useState(null);
    const [editingQuote, setEditingQuote] = useState(null);
    const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);
    const [currentEditingPlan, setCurrentEditingPlan] = useState(null); // For admin pricing plan edit

    // Global App Branding State - Will be fetched from backend
    const [appName, setAppName] = useState(process.env.REACT_APP_APP_NAME || 'Mphakathi Online');
    const [appLogo, setAppLogo] = useState(process.env.REACT_APP_APP_LOGO || 'https://placehold.co/100x40/964b00/ffffff?text=Logo');

    // State for mobile sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Environment variable to control dev features (from Netlify ENV)
    const enableDevFeatures = process.env.REACT_APP_ENABLE_DEV_FEATURES === 'true';

    // --- Data States (No longer mock, will be populated by API calls) ---
    const [problems, setProblems] = useState([]); // List of problems from DB
    const [allUsers, setAllUsers] = useState([]); // All user profiles (for admin)
    const [pricingPlans, setPricingPlans] = useState([]); // Pricing plans from DB

    // --- Utility Function for API Calls (DRY principle) ---
    // Wrapped in useCallback to make it stable for useEffect dependencies
    const makeAuthenticatedRequest = useCallback(async (path, method, body = null) => {
        setLoading(true);
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                    audience: process.env.REACT_APP_AUTH0_API_AUDIENCE,
                },
            });

            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            // Construct the full URL using API_BASE_URL
            const url = `${API_BASE_URL}/.netlify/functions${path}`;
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || `HTTP error! Status: ${response.status}`);
            }
            return responseData;
        } catch (error) {
            console.error(`API Call Error (${method} ${path}):`, error);
            setMessage({ type: 'error', text: `Operation failed: ${error.message}` });
            throw error; // Re-throw to allow specific error handling in calling functions
        } finally {
            setLoading(false);
        }
    }, [getAccessTokenSilently, setMessage]); // Depend on getAccessTokenSilently and setMessage

    // --- Effects for Initial Data Loading and User Profile Sync ---

    // Effect to fetch or create user profile in your DB after Auth0 login
    useEffect(() => {
        const fetchOrCreateUserProfile = async () => {
            if (!isAuthenticated || !user) {
                // If not authenticated or user object is not available, reset profile and role
                setUserProfile(null);
                setUserRole('loggedOut'); // Reset role for guest/loggedOut
                setIsPaidMember(false);
                return;
            }

            setLoading(true); // Set global loading for profile fetch
            try {
                // Call your Netlify Function to get or create the user's database profile
                // The `makeAuthenticatedRequest` handles token retrieval and error logging
                const profileData = await makeAuthenticatedRequest(
                    '/get-or-create-user-profile', // Path only, base URL added inside makeAuthenticatedRequest
                    'POST',
                    { auth0Id: user.sub, email: user.email, name: user.name }
                );

                setUserProfile(profileData);
                setUserRole(profileData.role || 'member'); // Set role from DB profile
                setIsPaidMember(profileData.is_paid_member || false); // Set paid status from DB
                setMessage({ type: 'success', text: `Welcome, ${profileData.name || 'User'}!` });
            } catch (error) {
                console.error('Error fetching or creating user profile:', error);
                setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
            } finally {
                setLoading(false); // Clear global loading
            }
        };

        fetchOrCreateUserProfile();
    }, [isAuthenticated, user, makeAuthenticatedRequest, setMessage]); // Added makeAuthenticatedRequest and setMessage to dependencies

    // Effect to fetch branding on initial load
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Prepend API_BASE_URL to the function path
                const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-branding`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAppName(data.app_name || 'Mphakathi Online');
                setAppLogo(data.app_logo_url || 'https://placehold.co/100x40/964b00/ffffff?text=Logo');
            } catch (error) {
                console.error('Failed to fetch branding:', error);
                setMessage({ type: 'error', text: `Failed to load branding: ${error.message}` });
            }
        };
        fetchBranding();
    }, [setMessage]); // Depend on setMessage

    // Effect to fetch pricing plans on initial load
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Prepend API_BASE_URL to the function path
                const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-pricing-plans`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPricingPlans(data);
            } catch (error) {
                console.error('Failed to fetch pricing plans:', error);
                setMessage({ type: 'error', text: `Failed to load pricing plans: ${error.message}` });
            }
        };
        fetchPlans();
    }, [setMessage]); // Depend on setMessage

    // --- Handlers for Problem Management ---
    const fetchPublicProblems = useCallback(async () => {
        setLoading(true);
        try {
            // Prepend API_BASE_URL to the function path
            const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-problems`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProblems(data);
        } catch (error) {
            console.error('Error fetching public problems:', error);
            setMessage({ type: 'error', text: `Failed to load problems: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }, [setMessage]); // Depend on setMessage

    const fetchMyProblems = useCallback(async () => {
        if (!userProfile) return;
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('/get-my-problems', 'GET');
            setProblems(data); // Re-use problems state for my problems
        } catch (error) {
            console.error('Error fetching my problems:', error);
        } finally {
            setLoading(false);
        }
    }, [userProfile, makeAuthenticatedRequest]); // Depend on userProfile and makeAuthenticatedRequest

    const handlePostProblem = async (problemData) => {
        if (!userProfile) {
            setMessage({ type: 'error', text: 'Please log in to post a problem.' });
            return;
        }
        try {
            await makeAuthenticatedRequest('/post-problem', 'POST', problemData);
            setMessage({ type: 'success', text: 'Problem posted successfully! It will be visible after admin approval.' });
            setShowPostProblemModal(false);
            fetchPublicProblems(); // Refresh public problems list
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleDeleteProblem = async (problemId) => {
        triggerConfirmation('Are you sure you want to delete this problem and all associated quotes? This action cannot be undone.', async () => {
            try {
                await makeAuthenticatedRequest('/delete-problem', 'DELETE', { problemId });
                setMessage({ type: 'success', text: 'Problem deleted successfully.' });
                fetchPublicProblems(); // Refresh public problems list
                fetchMyProblems(); // Refresh my problems list
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    const handleEditProblem = async (problemId, updatedData) => {
        try {
            await makeAuthenticatedRequest('/update-problem', 'PUT', { problemId, ...updatedData });
            setMessage({ type: 'success', text: 'Problem updated successfully!' });
            setEditingProblem(null); // Close modal if it was open
            fetchPublicProblems(); // Refresh
            fetchMyProblems(); // Refresh
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleApproveProblem = async (problemId) => {
        try {
            await makeAuthenticatedRequest('/update-problem', 'PUT', { problemId, is_approved: true, status: 'open' });
            setMessage({ type: 'success', text: 'Problem approved and made public.' });
            fetchPublicProblems(); // Refresh
            fetchMyProblems(); // Refresh (in case it's in their list)
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleMarkProblemResolved = async (problemId) => {
        triggerConfirmation("Are you sure you want to mark this problem as resolved?", async () => {
            try {
                await makeAuthenticatedRequest('/update-problem', 'PUT', { problemId, status: 'resolved' });
                setMessage({ type: 'success', text: 'Problem marked as resolved.' });
                fetchPublicProblems();
                fetchMyProblems();
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    // --- Handlers for Quote Management ---
    const fetchMyQuotes = useCallback(async () => {
        if (!userProfile || userRole !== 'provider') return;
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('/get-my-quotes', 'GET');
            // This assumes get-my-quotes returns the necessary problemTitle/Status
            setProblems(prev => { // Update quotes within the problems array to reflect changes
                return prev.map(p => {
                    const updatedQuotesForThisProblem = data.filter(q => q.problem_id === p.id);
                    return { ...p, quotes: updatedQuotesForThisProblem };
                });
            });
            // You might want a dedicated `myQuotes` state if the data structure is complex
        } catch (error) {
            console.error('Error fetching my quotes:', error);
        } finally {
            setLoading(false);
        }
    }, [userProfile, userRole, makeAuthenticatedRequest]); // Depend on userProfile, userRole, makeAuthenticatedRequest

    const handleSubmitQuote = async (problemId, quoteData) => {
        if (!userProfile || userRole !== 'provider' || !userProfile.is_provider_approved) {
            setMessage({ type: 'error', text: 'Only approved providers can submit quotes.' });
            return;
        }
        try {
            await makeAuthenticatedRequest('/submit-quote', 'POST', {
                problemId,
                amount: quoteData.proposedBudget,
                details: quoteData.motivation,
                proposedStartDate: quoteData.proposedStartDate,
                proposedEndDate: quoteData.proposedEndDate,
            });
            setMessage({ type: 'success', text: 'Quote submitted successfully!' });
            setSubmittingQuoteForProblem(null);
            fetchPublicProblems(); // Refresh problems to see new quote count
            fetchMyQuotes(); // Refresh my quotes
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleAcceptQuote = async (problemId, quoteId) => {
        triggerConfirmation("By accepting this quote, your contact information (name, email, phone) will be shared with the selected provider. Do you wish to proceed?", async () => {
            if (!userProfile || userProfile.id !== problems.find(p => p.id === problemId)?.requester_id) {
                setMessage({ type: 'error', text: 'You are not authorized to accept this quote.' });
                return;
            }
            if (!isPaidMember) {
                setMessage({ type: 'error', text: 'You must be a paid member to accept quotes.' });
                return;
            }
            try {
                await makeAuthenticatedRequest('/accept-quote', 'PUT', { problemId, quoteId });
                setMessage({ type: 'success', text: 'Quote accepted! Problem marked as closed.' });
                fetchPublicProblems(); // Refresh problem status
                fetchMyProblems(); // Refresh my requests
                fetchMyQuotes(); // Refresh provider's quotes if they are also provider
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    const handleWithdrawQuote = async (problemId, quoteId) => {
        triggerConfirmation('Are you sure you want to withdraw this quote?', async () => {
            try {
                await makeAuthenticatedRequest('/withdraw-quote', 'DELETE', { quoteId });
                setMessage({ type: 'success', text: 'Quote withdrawn successfully.' });
                fetchMyQuotes(); // Refresh my quotes list
                fetchPublicProblems(); // Update problem's quotes list
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    const handleEditQuote = async (problemId, quoteId, updatedQuoteData) => {
        try {
            await makeAuthenticatedRequest('/update-quote', 'PUT', { quoteId, problemId, ...updatedQuoteData });
            setMessage({ type: 'success', text: 'Quote updated successfully!' });
            setEditingQuote(null);
            fetchMyQuotes(); // Refresh my quotes
            fetchPublicProblems(); // Refresh public problems
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };


    // --- General Authentication/Registration Handlers ---

    // Registration now handled by Auth0 setup, then get-or-create-user-profile
    // The previous handleRegister mock function will be largely replaced.
    // Frontend's 'Register / Sign Up' button will typically initiate Auth0 login/signup flow.
    const handleRegisterOrLogin = () => {
        loginWithRedirect(); // Initiates Auth0 universal login/signup page
    };

    // The 'handleLoginAs' (mock login) will be removed as Auth0 handles real logins.
    // The logout will use Auth0's logout function.
    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } });
        setMessage({ type: 'info', text: 'You have been logged out.' });
        // Clean up local states after logout
        setUserProfile(null);
        setUserRole('loggedOut');
        setIsPaidMember(false);
        setProblems([]); // Clear problems data as user-specific data might be mixed
        setAllUsers([]);
        setPricingPlans([]); // Will re-fetch public ones later
        setCurrentPage('problems'); // Redirect to a public page
    };


    // handleBecomePaidMember will trigger Paystack payment then webhook will update DB
    const handleBecomePaidMember = async (planDetails) => {
        if (!userProfile) {
            setMessage({ type: 'error', text: 'Please log in to become a paid member.' });
            return;
        }

        // Simulate opening Paystack payment link
        if (planDetails.plan_code) { // Use snake_case for plan_code
            const paystackPaymentLink = `https://paystack.com/pay/${planDetails.plan_code}`;
            window.open(paystackPaymentLink, '_blank');
            setMessage({type: 'info', text: 'Redirecting to Paystack for payment. Your membership will be updated upon successful payment confirmation!'});
            setSelectedPlan(null); // Close the payment modal/dialog
        } else {
            setMessage({ type: 'error', text: 'This plan does not have a direct payment link. Please contact support.' });
        }
    };

    // --- Branding Management (manage:branding) ---
    const handleUpdateBranding = async (newName, newLogo) => {
        try {
            await makeAuthenticatedRequest('/save-branding', 'PUT', { app_name: newName, app_logo_url: newLogo });
            setAppName(newName);
            setAppLogo(newLogo);
            setMessage({ type: 'success', text: 'Branding updated successfully!' });
        }
        catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    // --- Pricing Plan Management (manage:pricing_plans) ---
    const handleSavePricingPlan = async (planData) => {
        try {
            const method = planData.id ? 'PUT' : 'POST'; // If planData has an ID, it's an update
            const endpoint = '/save-pricing-plan';
            await makeAuthenticatedRequest(endpoint, method, planData);
            setMessage({ type: 'success', text: planData.id ? `Plan "${planData.name}" updated successfully!` : `New plan "${planData.name}" added successfully!` });
            setCurrentEditingPlan(null); // Close edit modal
            // Re-fetch pricing plans after saving/updating
            const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-pricing-plans`);
            if (response.ok) {
                const data = await response.json();
                setPricingPlans(data);
            }
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleDeletePricingPlan = (planId, planName) => {
        triggerConfirmation(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`, async () => {
            try {
                await makeAuthenticatedRequest('/delete-pricing-plan', 'DELETE', { id: planId });
                setMessage({ type: 'success', text: `Plan "${planName}" deleted.` });
                // Re-fetch pricing plans after deletion
                const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-pricing-plans`);
                if (response.ok) {
                    const data = await response.json();
                    setPricingPlans(data);
                }
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    // --- Admin Approvals ---
    const fetchAllUsers = useCallback(async () => {
        if (userRole !== 'admin') return;
        setLoading(true);
        try {
            const data = await makeAuthenticatedRequest('/get-all-users', 'GET');
            setAllUsers(data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        } finally {
            setLoading(false);
        }
    }, [userRole, makeAuthenticatedRequest]); // Depend on userRole and makeAuthenticatedRequest

    const handleApproveProvider = async (providerId, isApproved) => {
        try {
            await makeAuthenticatedRequest('/approve-provider', 'PUT', { providerId, isApproved });
            setMessage({ type: 'success', text: `Provider status updated for ${allUsers.find(u => u.id === providerId)?.name || 'user'}.` });
            fetchAllUsers(); // Refresh user list
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    const handleDeleteUser = (userIdToDelete) => { // Renamed from handleDeleteProvider to be more general
        triggerConfirmation("Are you sure you want to delete this user? This will remove their profile and cannot be undone.", async () => {
            try {
                await makeAuthenticatedRequest('/delete-user', 'DELETE', { userIdToDelete }); // Call the new delete-user function
                setMessage({ type: 'success', text: `User ${allUsers.find(u => u.id === userIdToDelete)?.name || 'user'} deleted.` });
                fetchAllUsers(); // Refresh list
                setShowConfirmationModal(false);
            } catch (error) {
                // Error handled by makeAuthenticatedRequest
            }
        });
    };

    const triggerConfirmation = (message, action) => {
        setConfirmationMessage(message);
        setConfirmationAction(() => action);
        setShowConfirmationModal(true);
    };

    // Determine the header title and status based on role
    const headerTitle = userProfile?.name || 'Guest';
    let statusText = '';
    let statusColorClass = '';

    if (userRole === 'loggedOut') {
        statusText = 'Logged Out';
        statusColorClass = 'bg-gray-100 text-gray-800';
    } else if (userRole === 'admin') {
        statusText = 'Administrator';
        statusColorClass = 'bg-purple-100 text-purple-800';
    } else if (userRole === 'provider') {
        statusText = userProfile?.is_provider_approved ? 'Approved Provider' : 'Pending Approval';
        statusColorClass = userProfile?.is_provider_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else { // member
        statusText = isPaidMember ? 'Paid Member' : 'Free Member';
        statusColorClass = isPaidMember ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    }

    // Provide context values for sub-components
    const appContextValue = {
        userId: userProfile?.id, // Use actual DB ID
        userProfile,
        userRole,
        isPaidMember,
        currentPage,
        loading,
        message,
        appName,
        appLogo,
        problems, // Now real data
        allUsers, // Now real data
        pricingPlans, // Now real data
        selectedPlan,
        setCurrentPage, setLoading, setMessage,
        setAppName, setAppLogo, setSelectedPlan,
        // API action functions
        fetchPublicProblems,
        fetchMyProblems,
        fetchMyQuotes,
        fetchAllUsers,
        handlePostProblem,
        handleLogout, // Auth0 logout
        handleRegisterOrLogin, // Auth0 login/signup redirect
        handleBecomePaidMember,
        setShowPostProblemModal, showPostProblemModal,
        handleDeleteProblem, handleEditProblem, handleApproveProblem, handleMarkProblemResolved,
        handleSubmitQuote, handleAcceptQuote, handleWithdrawQuote, handleEditQuote,
        handleUpdateBranding, handleSavePricingPlan, handleDeletePricingPlan,
        setShowBecomeProviderModal, handleDeleteUser, // Replaced handleDeleteProvider with handleDeleteUser
        handleApproveProvider,
        // Admin specific states/functions
        setSubmittingQuoteForProblem, submittingQuoteForProblem,
        setEditingQuote, editingQuote,
        setCurrentEditingPlan, currentEditingPlan, setShowConfirmationModal
    };

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="flex h-screen bg-gray-100 font-sans">
                {/* Mobile Menu Toggle Button */}
                <div className="md:hidden fixed top-4 left-4 z-50">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-white bg-[#964b00] rounded-md shadow-lg"
                    >
                        {isSidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>

                {/* --- Sidebar --- */}
                <aside className={`fixed inset-y-0 left-0 w-64 bg-[#964b00] text-white flex-shrink-0 rounded-tr-lg rounded-br-lg shadow-lg z-40 transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="p-4 md:p-6 text-center border-b border-[#b3641a]">
                        <img src={appLogo} alt="App Logo" className="mx-auto mb-4 w-24 h-auto rounded-md" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/964b00/ffffff?text=Logo"; }}/>
                        <h2 className="text-2xl font-bold">{appName}</h2>
                        <p className="text-sm text-gray-200 mt-1">ID: {userProfile?.id || 'N/A'}</p>
                        {/* Conditional rendering for the "Switch User" dropdown based on enableDevFeatures */}
                        {enableDevFeatures && userRole !== 'loggedOut' && (
                            <div className="mt-4 flex flex-col space-y-2">
                                <label className="text-sm text-gray-200">User Role (Dev Only):</label>
                                <span className="p-2 rounded-md bg-[#7a3d00] text-white text-sm capitalize">{userRole}</span>
                            </div>
                        )}
                    </div>
                    <nav className="mt-5" onClick={() => setIsSidebarOpen(false)}> {/* Close sidebar on navigation */}
                        <ul>
                            <li className={`mb-2 ${currentPage === 'dashboard' ? 'bg-[#b3641a]' : ''}`}>
                                <button
                                    onClick={() => setCurrentPage('dashboard')}
                                    className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                >
                                    <HomeIcon size={20} className="mr-3" /> Dashboard
                                </button>
                            </li>
                            {userRole === 'admin' && (
                                <>
                                    <li className={`mb-2 ${currentPage === 'admin-approvals' ? 'bg-[#b3641a]' : ''}`}>
                                        <button
                                            onClick={() => setCurrentPage('admin-approvals')}
                                            className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                        >
                                            <ShieldCheckIcon size={20} className="mr-3" /> Approvals
                                        </button>
                                    </li>
                                    <li className={`mb-2 ${currentPage === 'admin-pricing' ? 'bg-[#b3641a]' : ''}`}>
                                        <button
                                            onClick={() => setCurrentPage('admin-pricing')}
                                            className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                        >
                                            <DollarSignIcon size={20} className="mr-3" /> Pricing Plans
                                        </button>
                                    </li>
                                    <li className={`mb-2 ${currentPage === 'admin-branding' ? 'bg-[#b3641a]' : ''}`}>
                                        <button
                                            onClick={() => setCurrentPage('admin-branding')}
                                            className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                        >
                                            <PaintbrushIcon size={20} className="mr-3" /> Branding
                                        </button>
                                    </li>
                                </>
                            )}
                            {userRole !== 'admin' && (
                                <>
                                    <li className={`mb-2 ${currentPage === 'problems' ? 'bg-[#b3641a]' : ''}`}>
                                        <button
                                            onClick={() => setCurrentPage('problems')}
                                            className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                        >
                                            <FileTextIcon size={20} className="mr-3" /> Problems
                                        </button>
                                    </li>
                                    {userRole === 'member' && (
                                        <li className={`mb-2 ${currentPage === 'my-requests' ? 'bg-[#b3641a]' : ''}`}>
                                            <button
                                                onClick={() => setCurrentPage('my-requests')}
                                                className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                            >
                                                <PackageIcon size={20} className="mr-3" /> My Requests
                                            </button>
                                        </li>
                                    )}
                                    {userRole === 'provider' && (
                                        <li className={`mb-2 ${currentPage === 'my-quotes' ? 'bg-[#b3641a]' : ''}`}>
                                            <button
                                                onClick={() => setCurrentPage('my-quotes')}
                                                className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                        >
                                            <BriefcaseIcon size={20} className="mr-3" /> My Quotes
                                        </button>
                                    </li>
                                )}
                                <li className={`mb-2 ${currentPage === 'profile' ? 'bg-[#b3641a]' : ''}`}>
                                    <button
                                        onClick={() => setCurrentPage('profile')}
                                        className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                    >
                                        <UserIcon size={20} className="mr-3" /> Profile
                                    </button>
                                </li>
                                <li className={`mb-2 ${currentPage === 'settings' ? 'bg-[#b3641a]' : ''}`}>
                                    <button
                                        onClick={() => setCurrentPage('settings')}
                                        className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                    >
                                        <SettingsIcon size={20} className="mr-3" /> Settings
                                    </button>
                                </li>
                            </>
                        )}
                        {userRole === 'loggedOut' && (
                            <li className={`mb-2 ${currentPage === 'pricing' ? 'bg-[#b3641a]' : ''}`}>
                                <button
                                    onClick={() => setCurrentPage('pricing')}
                                    className="flex items-center px-4 py-3 text-lg text-gray-200 hover:bg-[#7a3d00] w-full text-left rounded-md transition-colors duration-200"
                                >
                                    <DollarSignIcon size={20} className="mr-3" /> Pricing
                                </button>
                            </li>
                        )}
                    </ul>
                    {/* Explicitly close nav here */}
                    </nav>
                    {/* This div contains the login/logout buttons and is outside of nav but inside aside */}
                    <div className="p-4 md:p-6 border-t border-[#b3641a]">
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-3 text-lg text-red-300 rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                                <LogOutIcon size={20} className="mr-3" /> Log Out
                            </button>
                        ) : (
                            <div className="flex justify-center space-x-2">
                                <button
                                    onClick={handleRegisterOrLogin} // This now triggers Auth0 login/signup
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Login / Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

                {/* --- Main Content Area --- */}
                <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-64'}`}> {/* Added ml-64 for desktop to shift content */}
                    {/* Header */}
                    <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm md:pl-0"> {/* Adjusted padding for mobile */}
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">{currentPage.replace('-', ' ')}</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Hello, {headerTitle}!</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}>
                                    {statusText}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Global Message Display */}
                    {message && message.text && (
                        <div className={`p-3 text-white text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Page Content based on currentPage state */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-xl text-gray-600">Loading data...</p>
                            </div>
                        ) : (
                            (() => {
                                switch (currentPage) {
                                    case 'dashboard':
                                        return userRole === 'provider' ?
                                            <ProviderDashboardPage /> :
                                            <MemberDashboardPage />;
                                    case 'profile':
                                        return <ProfilePage />;
                                    case 'problems':
                                        return <ProblemListPage setShowPostProblemModal={setShowPostProblemModal} />;
                                    case 'my-quotes':
                                        return userRole === 'provider' ? <MyQuotesPage /> : null;
                                    case 'my-requests':
                                        return userRole === 'member' ? <MyRequestsPage /> : null;
                                    case 'admin-approvals':
                                        return userRole === 'admin' ? <AdminToolsPage /> : null;
                                    case 'admin-pricing':
                                        return userRole === 'admin' ? <AdminPricingPage /> : null;
                                    case 'admin-branding':
                                        return userRole === 'admin' ? <AdminBrandingPage /> : null;
                                    case 'settings':
                                        return userRole !== 'loggedOut' ? <SettingsPage /> : null;
                                    case 'pricing':
                                        return <PricingPage />;
                                    case 'problem-detail':
                                        // This will need to fetch problem details by ID directly or from state
                                        const problemId = window.location.hash.split('/').pop();
                                        const problemDetail = problems.find(p => p.id === problemId);
                                        return problemDetail ? <ProblemDetailPage problem={problemDetail} /> : <p className="text-red-500">Problem not found.</p>;
                                    default:
                                        return <ProblemListPage setShowPostProblemModal={setShowPostProblemModal} />;
                                }
                            })()
                        )}
                    </div>
                </main>

                {/* --- Modals --- */}
                {showPostProblemModal && (
                    <PostProblemModal
                        onClose={() => setShowPostProblemModal(false)}
                        onSave={handlePostProblem}
                        // activeProblemsCount will need to be fetched dynamically for real limits
                        // For now, it will be handled by the backend function
                        isPaidMember={isPaidMember}
                    />
                )}

                {editingProblem && (
                    <ProblemDetailPage // Re-using ProblemDetailPage as a modal for detail/edit
                        problem={editingProblem}
                        onClose={() => setEditingProblem(null)}
                        onSave={handleEditProblem}
                        onAcceptQuote={handleAcceptQuote}
                        onDeleteProblem={handleDeleteProblem}
                        onMarkResolved={handleMarkProblemResolved}
                        onApproveProblem={handleApproveProblem} // Make sure this is passed down
                        // No mockUserProfiles needed here, use backend
                    />
                )}

                {submittingQuoteForProblem && (
                    <QuoteModal
                        onClose={() => setSubmittingQuoteForProblem(null)}
                        onSubmit={handleSubmitQuote}
                        problemTitle={submittingQuoteForProblem.title}
                        problemId={submittingQuoteForProblem.id}
                    />
                )}

                {editingQuote && (
                    <EditQuoteModal
                        quote={editingQuote}
                        onClose={() => setEditingQuote(null)}
                        onSave={handleEditQuote}
                        problemTitle={problems.find(p => p.id === editingQuote.problem_id)?.title}
                    />
                )}

                {selectedPlan && (
                    <SignUpFormModal
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                        onCompleteSignUp={handleBecomePaidMember}
                    />
                )}

                {showBecomeProviderModal && (
                    <BecomeProviderModal
                        onClose={() => setShowBecomeProviderModal(false)}
                        // This will trigger an update to the user's role on the backend
                        onRegister={async (formData) => {
                             try {
                                const updatedProfile = await makeAuthenticatedRequest('/update-user-profile', 'PUT', {
                                    ...userProfile, // Keep existing profile data
                                    role: 'provider',
                                    is_provider_approved: false, // Set to false initially
                                    company_name: formData.companyName, // Backend expects snake_case
                                    specialties: formData.specialties,
                                    bio: formData.bio
                                });
                                setUserProfile(updatedProfile); // Update local state with new role/provider status
                                setUserRole('provider');
                                setMessage({ type: 'success', text: `You are now registered as a Provider! Awaiting admin approval.` });
                                setShowBecomeProviderModal(false);
                            } catch (error) {
                                console.error('Error registering as provider:', error);
                                setMessage({ type: 'error', text: `Failed to register as provider: ${error.message}` });
                            }
                        }}
                    />
                )}

                {showConfirmationModal && (
                    <ConfirmationModal
                        message={confirmationMessage}
                        onConfirm={confirmationAction}
                        onCancel={() => setShowConfirmationModal(false)}
                    />
                )}
            </div>
        </AppContext.Provider>
    );
};

export default App;

// =========================================================================
// SUB-COMPONENTS DEFINED BELOW MAIN APP COMPONENT
// They now consume context and use backend data/handlers
// =========================================================================


// --- Dashboard Components ---

const ProviderDashboardPage = () => {
    const { userId, problems, fetchMyQuotes, userProfile, setCurrentPage } = useContext(AppContext);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const [pendingQuotes, setPendingQuotes] = useState(0);
    const [myProviderQuotes, setMyProviderQuotes] = useState([]);


    useEffect(() => {
        // Fetch quotes when component mounts or dependencies change
        fetchMyQuotes();
    }, [fetchMyQuotes]); // Dependency on fetchMyQuotes from context

    useEffect(() => {
        // Filter and count quotes from the global 'problems' state
        let providerQuotes = [];
        problems.forEach(problem => {
            problem.quotes?.forEach(quote => { // Use optional chaining for quotes array
                if (quote.provider_id === userId) { // Use snake_case for DB fields
                    providerQuotes.push({ ...quote, problemTitle: problem.title, problemStatus: problem.status });
                }
            });
        });
        setMyProviderQuotes(providerQuotes);
        setTotalQuotes(providerQuotes.length);
        setPendingQuotes(providerQuotes.filter(quote => quote.status === 'pending').length);
    }, [problems, userId]); // Re-run when problems data changes

    const sortedMyQuotes = [...myProviderQuotes].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Provider Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Provider Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <BriefcaseIcon className="text-[#964b00]" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Provider Status</h3>
                        <p className={`text-xl font-bold ${userProfile?.is_provider_approved ? 'text-green-600' : 'text-red-600'}`}>
                            {userProfile?.is_provider_approved ? 'Approved' : 'Pending Approval'}
                        </p>
                        {!userProfile?.is_provider_approved && (
                            <p className="text-sm text-gray-500 mt-1">Your application is under review.</p>
                        )}
                    </div>
                </div>

                {/* Total Quotes Submitted */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <PackageIcon className="text-[#964b00]" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Quotes Submitted</h3>
                        <p className="text-xl font-bold text-[#964b00]">
                            {totalQuotes}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{pendingQuotes} pending review</p>
                        <button
                            onClick={() => setCurrentPage('my-quotes')}
                            className="text-sm text-blue-500 hover:underline mt-1"
                        >
                            View My Quotes
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => setCurrentPage('problems')}
                            className="flex items-center w-full px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 shadow-md"
                        >
                            <FileTextIcon size={20} className="mr-2" />
                            View Problem List
                        </button>
                        <button
                            onClick={() => setCurrentPage('profile')}
                            className="flex items-center w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 shadow-md"
                        >
                            <UserIcon size={20} className="mr-2" />
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Recently Submitted Quotes (can be expanded) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <PackageIcon size={24} className="mr-2 text-[#964b00]" /> My Recent Quotes
                </h3>
                {totalQuotes === 0 ? (
                    <p className="text-gray-600">No recent quotes found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                                    <th className="py-2 px-4 text-left">Problem</th>
                                    <th className="py-2 px-4 text-left">Amount</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {sortedMyQuotes.slice(0, 3).map(quote => (
                                    <tr key={quote.id} className="border-b border-gray-100">
                                        <td className="py-2 px-4">{quote.problemTitle}</td>
                                        <td className="py-2 px-4">R{quote.amount?.toFixed(2)}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">{new Date(quote.created_at)?.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button
                    onClick={() => setCurrentPage('my-quotes')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Go to My Quotes
                </button>
            </div>
        </div>
    );
};

const MemberDashboardPage = () => {
    const { userProfile, isPaidMember, problems, setShowPostProblemModal, setShowBecomeProviderModal, setCurrentPage, fetchMyProblems } = useContext(AppContext);
    const [myProblemsCount, setMyProblemsCount] = useState(0);
    const [recentQuotes, setRecentQuotes] = useState([]);

    useEffect(() => {
        fetchMyProblems();
    }, [fetchMyProblems]);

    useEffect(() => {
        const memberProblems = problems.filter(p => p.requester_id === userProfile?.id);
        setMyProblemsCount(memberProblems.length);

        let collectedRecentQuotes = [];
        memberProblems.forEach(problem => {
            problem.quotes?.forEach(quote => {
                collectedRecentQuotes.push({
                    ...quote,
                    problemTitle: problem.title,
                    problemStatus: problem.status,
                    problemId: problem.id
                });
            });
        });
        setRecentQuotes(collectedRecentQuotes.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }, [problems, userProfile]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Member Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Membership Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <UserIcon className="text-[#964b00]" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Membership Status</h3>
                        <p className={`text-xl font-bold ${isPaidMember ? 'text-blue-600' : 'text-yellow-600'}`}>
                            {isPaidMember ? 'Paid Member' : 'Free Member'}
                        </p>
                        {!isPaidMember && (
                            <p className="text-sm text-gray-500 mt-1">Unlock full features by upgrading.</p>
                        )}
                    </div>
                </div>

                {/* My Problems Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <FileTextIcon className="text-[#964b00]" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">My Posted Problems</h3>
                        <p className="text-xl font-bold text-[#964b00]">
                            {myProblemsCount}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{recentQuotes.length} quotes received</p>
                        <button
                            onClick={() => setCurrentPage('my-requests')}
                            className="text-sm text-blue-500 hover:underline mt-1"
                        >
                            View My Requests
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => setCurrentPage('problems')}
                            className="flex items-center w-full px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 shadow-md"
                        >
                            <FileTextIcon size={20} className="mr-2" />
                            View Public Problems
                        </button>
                        {userProfile?.role === 'member' && (
                            <button
                                onClick={() => setShowPostProblemModal(true)}
                                className="flex items-center w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md"
                            >
                                <PlusCircleIcon size={20} className="mr-2" />
                                Post New Problem
                            </button>
                        )}
                        {!isPaidMember && userProfile?.role === 'member' && (
                             <button
                                onClick={() => setCurrentPage('pricing')}
                                className="flex items-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md"
                            >
                                <DollarSignIcon size={20} className="mr-2" />
                                Become a Paid Member
                            </button>
                        )}
                        {userProfile?.role === 'member' && !userProfile?.is_provider_approved && (
                             <button
                                onClick={() => setShowBecomeProviderModal(true)}
                                className="flex items-center w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 shadow-md"
                            >
                                <BriefcaseIcon size={20} className="mr-2" />
                                Register as a Provider
                            </button>
                        )}
                        <button
                            onClick={() => setCurrentPage('profile')}
                            className="flex items-center w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 shadow-md"
                        >
                            <UserIcon size={20} className="mr-2" />
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Quotes Received (can be expanded) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <PackageIcon size={24} className="mr-2 text-[#964b00]" /> Recent Quotes on My Problems
                </h3>
                {recentQuotes.length === 0 || userProfile?.role === 'loggedOut' ? (
                    <p className="text-gray-600">No recent quotes received for your problems.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                                    <th className="py-2 px-4 text-left">Problem</th>
                                    <th className="py-2 px-4 text-left">Provider</th>
                                    <th className="py-2 px-4 text-left">Amount</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm font-light">
                                {recentQuotes.slice(0, 3).map(quote => (
                                    <tr key={quote.id} className="border-b border-gray-100">
                                        <td className="py-2 px-4">{quote.problemTitle}</td>
                                        <td className="py-2 px-4">R{quote.amount?.toFixed(2)}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">{new Date(quote.created_at)?.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button
                    onClick={() => setCurrentPage('my-requests')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Go to My Requests
                </button>
            </div>
        </div>
    );
};

// --- General Pages ---

const BecomeProviderModal = ({ onClose, onRegister }) => {
    const { userProfile, setMessage } = useContext(AppContext);
    const [companyName, setCompanyName] = useState(userProfile?.company_name || '');
    const [specialties, setSpecialties] = useState(userProfile?.specialties || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (userProfile) {
            setCompanyName(userProfile.company_name || '');
            setSpecialties(userProfile.specialties || '');
            setBio(userProfile.bio || '');
        }
    }, [userProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null);

        if (!companyName || !specialties) {
            setFormError('Company Name and Specialties are required.');
            return;
        }

        await onRegister({ companyName, specialties, bio });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Register as a Provider</h3>
                <p className="text-gray-700 mb-4">Your current member details will be used. Please provide additional provider-specific information.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">Company Name</label>
                        <input type="text" id="companyName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialties">Specialties (e.g., Plumbing, Electrical)</label>
                        <input type="text" id="specialties" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={specialties} onChange={(e) => setSpecialties(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="providerBio">Provider Bio (Optional)</label>
                        <textarea id="providerBio" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200">Submit for Approval</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PricingPage = () => {
    const { setSelectedPlan, setMessage, pricingPlans } = useContext(AppContext);

    const handleSelectPlan = (plan) => {
        if (plan.interval === 'custom') {
            setMessage({type: 'info', text: `For the ${plan.name} plan, please contact us for custom pricing.`});
        } else {
            setSelectedPlan(plan);
            setMessage({type: 'info', text: `You've selected the ${plan.name} plan. Please complete the sign-up.`});
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Membership Plans</h2>
            <p className="text-center text-gray-600 mb-8">Choose the plan that best suits your needs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingPlans.length === 0 ? (
                    <p className="text-gray-600 col-span-full text-center">No pricing plans available. Please check back later.</p>
                ) : (
                    pricingPlans.map(plan => (
                        <div key={plan.id} className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-[#964b00] mb-2">{plan.name}</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mb-4">{plan.price_display}</p>
                            <ul className="text-gray-700 space-y-2 mb-6 text-left w-full">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircle2Icon size={18} className="mr-2 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                className={`mt-auto px-6 py-2 font-semibold rounded-md transition-colors duration-200 shadow-lg ${
                                    plan.interval === 'custom' ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : 'bg-[#964b00] text-white hover:bg-[#b3641a]'
                                }`}
                                disabled={plan.interval === 'custom'}
                            >
                                {plan.interval === 'custom' ? 'Contact for Price' : 'Select Plan'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const SignUpFormModal = ({ plan, onClose, onCompleteSignUp }) => {
    const { userProfile, setMessage } = useContext(AppContext);
    const [name, setName] = useState(userProfile?.name || '');
    const [email, setEmail] = useState(userProfile?.email || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [address, setAddress] = useState(userProfile?.address || '');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setEmail(userProfile.email || '');
            setPhone(userProfile.phone || '');
            setAddress(userProfile.address || '');
        }
    }, [userProfile]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null);

        if (!name || !email) {
            setFormError('Name and Email are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }

        try {
            await onCompleteSignUp(plan);
            onClose();
        } catch (error) {
            setFormError(`Failed to initiate payment: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Sign Up for {plan.name} Plan</h3>
                <p className="text-gray-700 mb-4">Confirm your details to proceed to payment.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupName">Full Name</label>
                        <input type="text" id="signupName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupEmail">Email</label>
                        <input type="email" id="signupEmail" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                     <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupPhone">Phone (Optional)</label>
                        <input type="tel" id="signupPhone" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupAddress">Address (Optional)</label>
                        <textarea id="signupAddress" rows="2" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex flex-col space-y-3 mt-6">
                        <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                            Proceed to Payment ({plan.price_display})
                        </button>
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const { userProfile, setUserProfile, setMessage, makeAuthenticatedRequest } = useContext(AppContext);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', bio: '', address: '', company_name: '', specialties: '',
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '', email: userProfile.email || '', phone: userProfile.phone || '',
                bio: userProfile.bio || '', address: userProfile.address || '',
                company_name: userProfile.company_name || '', specialties: userProfile.specialties || '',
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const updatedProfile = await makeAuthenticatedRequest('/update-user-profile', 'PUT', formData);
            setUserProfile(updatedProfile);
            setEditMode(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            // Error handled by makeAuthenticatedRequest
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                My Profile
                {!editMode && (
                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center">
                        <EditIcon size={18} className="mr-2" /> Edit Profile
                    </button>
                )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        {editMode ? ( <input type="text" name="name" value={formData.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.name || 'N/A'}</p> )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        {editMode ? ( <input type="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.email || 'N/A'}</p> )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                        {editMode ? ( <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.phone || 'N/A'}</p> )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                        {editMode ? ( <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea> ) : ( <p className="text-gray-900 text-lg whitespace-pre-wrap">{userProfile?.address || 'N/A'}</p> )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Bio:</label>
                        {editMode ? ( <textarea name="bio" value={formData.bio} onChange={handleChange} rows="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea> ) : ( <p className="text-gray-900 text-lg whitespace-pre-wrap">{userProfile?.bio || 'N/A'}</p> )}
                    </div>
                    {userProfile?.role === 'provider' && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                                {editMode ? ( <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.company_name || 'N/A'}</p> )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Specialties:</label>
                                {editMode ? ( <input type="text" name="specialties" value={formData.specialties} onChange={handleChange} placeholder="e.g., Plumbing, Electrical, Landscaping" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.specialties || 'N/A'}</p> )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {editMode && (
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={() => { setEditMode(false); setMessage(null); }} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                    <button type="submit" onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Save Changes</button>
                </div>
            )}
        </div>
    );
};

// Added setShowPostProblemModal to ProblemListPage props
const ProblemListPage = ({ setShowPostProblemModal }) => {
    const { userRole, problems, fetchPublicProblems, setCurrentPage } = useContext(AppContext);

    const [filterCategory, setFilterCategory] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPublicProblems();
    }, [fetchPublicProblems]);

    const uniqueCategories = ['All', ...new Set(problems.map(p => p.category).filter(Boolean))];
    const uniqueLocations = ['All', ...new Set(problems.map(p => p.location).filter(Boolean))];

    const filteredProblems = problems.filter(problem => {
        // Only show approved problems to non-admin users
        if (userRole !== 'admin' && !problem.is_approved) {
            return false;
        }
        if (filterCategory !== 'All' && problem.category !== filterCategory) {
            return false;
        }
        if (filterLocation !== 'All' && problem.location !== filterLocation) {
            return false;
        }
        const budget = problem.estimated_budget;
        if (minBudget && budget < parseFloat(minBudget)) {
            return false;
        }
        if (maxBudget && budget > parseFloat(maxBudget)) {
            return false;
        }
        if (searchTerm && !problem.title.toLowerCase().includes(searchTerm.toLowerCase()) && !problem.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        return true;
    }).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Public Problem List
                {userRole === 'member' && (
                    <button onClick={() => setShowPostProblemModal(true)} className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center bg-green-600 text-white hover:bg-green-700`} title="Post a new problem">
                        <PlusCircleIcon size={18} className="mr-2" /> Post New Problem
                    </button>
                )}
            </h2>

            {/* Filters Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="searchTerm" className="block text-gray-700 text-sm font-bold mb-2">Search</label>
                    <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Search by title or description"/>
                </div>
                <div>
                    <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                    <select id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filterLocation" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                    <select id="filterLocation" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="minBudget" className="block text-gray-700 text-sm font-bold mb-2">Min Budget (R)</label>
                        <input type="number" id="minBudget" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="e.g., 100"/>
                    </div>
                    <div>
                        <label htmlFor="maxBudget" className="block text-gray-700 text-sm font-bold mb-2">Max Budget (R)</label>
                        <input type="number" id="maxBudget" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="e.g., 1000"/>
                    </div>
                </div>
            </div>

            {filteredProblems.length === 0 ? (
                <p className="text-gray-600">No problems found matching your criteria.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProblems.map(problem => (
                        <ProblemCard
                            key={problem.id}
                            problem={problem}
                            userRole={userRole}
                            onNavigate={setCurrentPage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProblemCard = ({ problem, userRole, onNavigate }) => {
    const handleViewDetails = () => {
        window.location.hash = `problem-detail/${problem.id}`;
        onNavigate('problem-detail');
    };

    // Safely access estimated_budget and apply toFixed
    const displayBudget = problem.estimated_budget != null && typeof problem.estimated_budget === 'number'
        ? `R${problem.estimated_budget.toFixed(2)}`
        : 'N/A';

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 rounded-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{problem.title}</h3>
            <p className="text-gray-700 mb-2 text-sm truncate">{problem.description}</p>
            <p className="text-gray-600 font-medium text-xs">Category: {problem.category || 'General'}</p>
            <p className="text-gray-600 font-medium text-xs">Location: {problem.location || 'N/A'}</p>
            <p className="text-gray-600 font-medium text-xs">Budget: {displayBudget}</p>
            <p className="text-gray-600 font-medium text-xs">Status: <span className="capitalize">{problem.status}</span></p>
            <p className="text-gray-500 text-xs mt-1">Posted: {new Date(problem.created_at)?.toLocaleDateString()}</p>
            {!problem.is_approved && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full mt-2 inline-block">Awaiting Admin Approval</span>
            )}

            <div className="mt-4 flex flex-col space-y-2">
                <button onClick={handleViewDetails} className="px-3 py-1 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 text-sm flex items-center justify-center">
                    <FileTextIcon size={16} className="mr-1" /> View Details
                </button>
            </div>
        </div>
    );
};

// ProblemDetailPage handles displaying details and also acts as an edit modal if needed
const ProblemDetailPage = ({ problem, onClose, onSave, onAcceptQuote, onDeleteProblem, onMarkResolved, onApproveProblem }) => {
    const { userRole, userProfile, isPaidMember, setSubmittingQuoteForProblem, setEditingQuote } = useContext(AppContext);
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null);
    const [showConfirmModalLocal, setShowConfirmModalLocal] = useState(false);


    const [formData, setFormData] = useState({
        title: problem.title, description: problem.description, category: problem.category,
        location: problem.location, estimated_budget: problem.estimated_budget,
    });

    useEffect(() => {
        setFormData({
            title: problem.title, description: problem.description, category: problem.category,
            location: problem.location, estimated_budget: problem.estimated_budget,
        });
    }, [problem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLocal = (e) => {
        e.preventDefault();
        onSave(problem.id, formData);
    };

    const handleEditQuoteClick = (quote) => {
        setEditingQuote(quote);
    };


    const isRequester = userProfile?.id === problem.requester_id;
    const isProblemOpen = problem.status === 'open';

    

    // Determine if this component is rendered as a modal or a page based on 'onClose' prop
    const isModal = typeof onClose === 'function';

    // Safely access estimated_budget for display in ProblemDetailPage
    const displayBudget = problem.estimated_budget != null && typeof problem.estimated_budget === 'number'
        ? problem.estimated_budget.toFixed(2)
        : 'N/A';

    return (
        <div className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-md ${isModal ? 'fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50' : ''}`}>
            <div className={isModal ? 'bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-md' : ''}>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{problem.title}</h2>
                <form onSubmit={handleSaveLocal}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="edit-problem-title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="edit-problem-title" name="title" value={formData.title} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requester_id !== userProfile?.id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-problem-category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" id="edit-problem-category" name="category" value={formData.category} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requester_id !== userProfile?.id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-problem-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="edit-problem-description" name="description" value={formData.description} onChange={handleChange} rows="3" readOnly={userRole !== 'admin' && problem.requester_id !== userProfile?.id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="edit-problem-location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="edit-problem-location" name="location" value={formData.location} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requester_id !== userProfile?.id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-problem-budget" className="block text-sm font-medium text-gray-700">Estimated Budget (R)</label>
                            {/* Safely display the budget here as well */}
                            <input type="number" id="edit-problem-budget" name="estimated_budget" value={formData.estimated_budget} step="0.01" onChange={handleChange} readOnly={userRole !== 'admin' && problem.requester_id !== userProfile?.id} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                            {/* Display for non-editable */}
                            {!isModal && (userRole === 'admin' || problem.requester_id === userProfile?.id) ? null : <p className="text-gray-900 text-lg">R{displayBudget}</p>}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-lg font-bold text-gray-900 capitalize">{problem.status}</p>
                    </div>

                    <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Quotes for this Problem</h3>
                    {problem.quotes?.length === 0 ? (
                        <p className="text-gray-600">No quotes submitted yet for this problem.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {problem.quotes?.map(quote => (
                                        <tr key={quote.id}>
                                            {/* Provider name and details are confidential unless paid member or accepted */}
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{isPaidMember || quote.status === 'accepted' || userRole === 'admin' ? quote.provider_name : 'Confidential'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">R{isPaidMember || quote.status === 'accepted' || userRole === 'admin' ? quote.amount?.toFixed(2) : '---'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis"><div className="text-sm text-gray-900">{isPaidMember || quote.status === 'accepted' || userRole === 'admin' ? quote.details : '---'}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {isRequester && isProblemOpen && quote.status === 'pending' && isPaidMember && (
                                                    <button onClick={() => onAcceptQuote(problem.id, quote.id)} className="text-green-600 hover:text-green-900 mr-4">Accept Quote</button>
                                                )}
                                                {userRole === 'provider' && userProfile?.id === quote.provider_id && quote.status === 'pending' && (
                                                    <button onClick={() => handleEditQuoteClick(quote)} className="text-blue-600 hover:text-blue-900 mr-4">Edit Quote</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {userRole === 'provider' && problem.status === 'open' && userProfile?.is_provider_approved && (
                        <button onClick={() => setSubmittingQuoteForProblem(problem)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                            Submit Quote
                        </button>
                    )}
                    {(userRole === 'admin' || isRequester) && problem.status === 'open' && (
                        <button onClick={() => onMarkResolved(problem.id)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200">
                            Mark as Resolved
                        </button>
                    )}
                    {(userRole === 'admin' || isRequester) && (
                        <button onClick={() => onDeleteProblem(problem.id)} className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200">
                            Delete Problem
                        </button>
                    )}
                    {userRole === 'admin' && !problem.is_approved && (
                        <button onClick={() => onApproveProblem(problem.id)} className="mt-4 ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                            Approve Problem
                        </button>
                    )}

                    {isModal && (
                        <div className="mt-6 flex justify-end">
                            {((userRole === 'admin' && problem.requester_id !== userProfile?.id) || (userRole === 'member' && problem.requester_id === userProfile?.id)) && (
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Save Changes</button>
                            )}
                            <button onClick={onClose} className="ml-4 px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Close</button>
                        </div>
                    )}
                </form>

                {showConfirmModalLocal && (
                    <ConfirmationModal
                        message={confirmModalMessage}
                        onConfirm={confirmModalAction}
                        onCancel={() => setShowConfirmModalLocal(false)}
                    />
                )}
            </div>
        </div>
    );
};

// --- Modals for specific actions ---
const PostProblemModal = ({ onClose, onSave, isPaidMember }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [formError, setFormError] = useState('');
    const { userProfile, setMessage } = useContext(AppContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null); // Clear global message

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
            requester_id: userProfile.id,
            status: 'open',
            is_approved: false, // Will require admin approval
        };
        onSave(newProblem); // Call the parent's save handler
    };

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

const QuoteModal = ({ onClose, onSubmit, problemTitle, problemId }) => {
    const [proposedBudget, setProposedBudget] = useState('');
    const [motivation, setMotivation] = useState('');
    const [proposedStartDate, setProposedStartDate] = useState('');
    const [proposedEndDate, setProposedEndDate] = useState('');
    const [formError, setFormError] = useState('');
    const { setMessage } = useContext(AppContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null);

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

        onSubmit(problemId, {
            proposedBudget: parseFloat(proposedBudget),
            motivation,
            proposedStartDate,
            proposedEndDate
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit Quote for: "{problemTitle}"</h3>
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

const EditQuoteModal = ({ onClose, onSave, quote, problemTitle }) => {
    const [amount, setAmount] = useState(quote.amount || '');
    const [details, setDetails] = useState(quote.details || '');
    const [proposedStartDate, setProposedStartDate] = useState(quote.proposed_start_date ? new Date(quote.proposed_start_date).toISOString().split('T')[0] : '');
    const [proposedEndDate, setProposedEndDate] = useState(quote.proposed_end_date ? new Date(quote.proposed_end_date).toISOString().split('T')[0] : '');
    const [formError, setFormError] = useState('');
    const { setMessage } = useContext(AppContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null);

        if (!amount || !details || !proposedStartDate || !proposedEndDate) {
            setFormError('All fields are required.');
            return;
        }
        if (parseFloat(amount) <= 0) {
            setFormError('Amount must be a positive number.');
            return;
        }
        if (new Date(proposedStartDate) > new Date(proposedEndDate)) {
            setFormError('Proposed Start Date cannot be after Proposed End Date.');
            return;
        }

        onSave(quote.problem_id, quote.id, {
            amount: parseFloat(amount),
            details,
            proposedStartDate,
            proposedEndDate,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Quote for: "{problemTitle}"</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteAmount">Proposed Amount (R)</label>
                        <input type="number" id="editQuoteAmount" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteDetails">Details</label>
                        <textarea id="editQuoteDetails" rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={details} onChange={(e) => setDetails(e.target.value)} required></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteStartDate">Proposed Start Date</label>
                        <input type="date" id="editQuoteStartDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedStartDate} onChange={(e) => setProposedStartDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteEndDate">Proposed End Date</label>
                        <input type="date" id="editQuoteEndDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedEndDate} onChange={(e) => setProposedEndDate(e.target.value)} required />
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- User-specific Problem/Quote Views ---

const MyRequestsPage = () => {
    const { userProfile, problems, fetchMyProblems, setCurrentPage, handleAcceptQuote, handleDeleteProblem, handleEditProblem, handleMarkProblemResolved } = useContext(AppContext);

    useEffect(() => {
        fetchMyProblems();
    }, [fetchMyProblems]);

    const myProblems = problems.filter(p => p.requester_id === userProfile?.id)
                               .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Posted Problems</h2>
            {myProblems.length === 0 ? (
                <p className="text-gray-600">You haven't posted any problems yet.</p>
            ) : (
                <div className="space-y-6">
                    {myProblems.map(problem => (
                        <div key={problem.id} className="border border-gray-200 rounded-lg p-4 shadow-sm rounded-md">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-800">{problem.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                    problem.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                    problem.status === 'closed' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {problem.status}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-2">{problem.description}</p>
                            <p className="text-gray-600 text-sm">Category: {problem.category}</p>
                            <p className="text-gray-600 text-sm">Location: {problem.location}</p>
                            {/* Safely display budget */}
                            <p className="text-gray-600 text-sm">Budget: {problem.estimated_budget != null && typeof problem.estimated_budget === 'number' ? `R${problem.estimated_budget.toFixed(2)}` : 'N/A'}</p>
                            <p className="text-gray-500 text-xs mt-1">Posted: {new Date(problem.created_at)?.toLocaleDateString()}</p>

                            <div className="mt-4 flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage('problem-detail') || (window.location.hash = `problem-detail/${problem.id}`)}
                                    className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center text-sm"
                                >
                                    <FileTextIcon size={16} className="mr-1" /> View Details
                                </button>
                                <button
                                    onClick={() => handleEditProblem(problem.id, { title: problem.title, description: problem.description, category: problem.category, location: problem.location, estimated_budget: problem.estimated_budget })}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center text-sm"
                                >
                                    <EditIcon size={16} className="mr-1" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProblem(problem.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center text-sm"
                                >
                                    <XCircleIcon size={16} className="mr-1" /> Delete
                                </button>
                                {problem.status !== 'resolved' && problem.accepted_quote_id && (
                                    <button
                                        onClick={() => handleMarkProblemResolved(problem.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center text-sm"
                                    >
                                        <CheckCircleIcon size={16} className="mr-1" /> Mark Resolved
                                    </button>
                                )}
                            </div>

                            {/* Quotes section */}
                            <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-3">Quotes Received ({problem.quotes?.length || 0})</h4>
                            {problem.quotes?.length === 0 ? (
                                <p className="text-gray-600 text-sm">No quotes received for this problem yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {problem.quotes?.map(quote => (
                                                <tr key={quote.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.provider_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R{quote.amount?.toFixed(2)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {quote.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {problem.status === 'open' && quote.status === 'pending' && (
                                                            <button
                                                                onClick={() => handleAcceptQuote(problem.id, quote.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Accept
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MyQuotesPage = () => {
    const { userProfile, problems, fetchMyQuotes, setEditingQuote, handleWithdrawQuote } = useContext(AppContext);
    const [myQuotesDetailed, setMyQuotesDetailed] = useState([]);

    useEffect(() => {
        if (userProfile?.role === 'provider') {
            fetchMyQuotes();
        }
    }, [userProfile, fetchMyQuotes]);

    useEffect(() => {
        if (userProfile?.role === 'provider' && problems.length > 0) {
            const providerQuotes = [];
            problems.forEach(problem => {
                problem.quotes?.forEach(quote => {
                    if (quote.provider_id === userProfile.id) {
                        providerQuotes.push({
                            ...quote,
                            problemTitle: problem.title,
                            problemDescription: problem.description,
                            problemStatus: problem.status,
                            problemCategory: problem.category,
                            problemLocation: problem.location,
                            problemRequesterId: problem.requester_id,
                        });
                    }
                });
            });
            setMyQuotesDetailed(providerQuotes.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        }
    }, [problems, userProfile]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Submitted Quotes</h2>
            {myQuotesDetailed.length === 0 ? (
                <p className="text-gray-600">You haven't submitted any quotes yet.</p>
            ) : (
                <div className="space-y-6">
                    {myQuotesDetailed.map(quote => (
                        <div key={quote.id} className="border border-gray-200 rounded-lg p-4 shadow-sm rounded-md">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-800">Quote for: "{quote.problemTitle}"</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                    quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {quote.status}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-2">Amount: R{quote.amount?.toFixed(2)}</p>
                            <p className="text-gray-600 text-sm">Details: {quote.details}</p>
                            <p className="text-gray-600 text-sm">Proposed Start: {new Date(quote.proposed_start_date)?.toLocaleDateString()}</p>
                            <p className="text-600 text-sm">Proposed End: {new Date(quote.proposed_end_date)?.toLocaleDateString()}</p>
                            <p className="text-gray-500 text-xs mt-1">Submitted: {new Date(quote.created_at)?.toLocaleDateString()}</p>
                            <p className="text-gray-500 text-xs mt-1">Problem Status: <span className="capitalize">{quote.problemStatus}</span></p>

                            <div className="mt-4 flex space-x-2">
                                {quote.status === 'pending' && quote.problemStatus === 'open' && (
                                    <>
                                        <button
                                            onClick={() => setEditingQuote(quote)}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center text-sm"
                                        >
                                            <EditIcon size={16} className="mr-1" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleWithdrawQuote(quote.problemId, quote.id)}
                                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center text-sm"
                                        >
                                            <XCircleIcon size={16} className="mr-1" /> Withdraw
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Admin Pages ---

const AdminToolsPage = () => {
    const { allUsers, fetchAllUsers, handleApproveProvider, handleDeleteUser } = useContext(AppContext);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const usersRequiringApproval = allUsers.filter(u => u.role === 'provider' && !u.is_provider_approved);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Tools: User Approvals & Management</h2>

            {/* Providers Awaiting Approval */}
            <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Providers Awaiting Approval ({usersRequiringApproval.length})</h3>
                {usersRequiringApproval.length === 0 ? (
                    <p className="text-gray-600">No providers currently awaiting approval.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usersRequiringApproval.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.company_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.specialties}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleApproveProvider(user.id, true)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All Users (Providers & Members) */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">All Users ({allUsers.length})</h3>
                {allUsers.length === 0 ? (
                    <p className="text-gray-600">No users found in the system.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role === 'provider' ? (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_provider_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.is_provider_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_paid_member ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {user.is_paid_member ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.role === 'provider' && user.is_provider_approved && (
                                                <button onClick={() => handleApproveProvider(user.id, false)} className="text-yellow-600 hover:text-yellow-900 mr-4">Unapprove</button>
                                            )}
                                            {user.role === 'provider' && !user.is_provider_approved && (
                                                <button onClick={() => handleApproveProvider(user.id, true)} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                                            )}
                                            {user.role !== 'admin' && ( // Prevent admin from deleting themselves
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


const AdminPricingPage = () => {
    const { pricingPlans, handleSavePricingPlan, handleDeletePricingPlan, setCurrentEditingPlan, currentEditingPlan } = useContext(AppContext);

    const [formState, setFormState] = useState({
        id: null,
        name: '',
        price_display: '',
        raw_price: '',
        interval: 'monthly',
        plan_code: '',
        features: [],
        newFeature: '',
    });

    useEffect(() => {
        if (currentEditingPlan) {
            setFormState({
                id: currentEditingPlan.id,
                name: currentEditingPlan.name || '',
                price_display: currentEditingPlan.price_display || '',
                raw_price: currentEditingPlan.raw_price || '',
                interval: currentEditingPlan.interval || 'monthly',
                plan_code: currentEditingPlan.plan_code || '',
                features: currentEditingPlan.features || [],
                newFeature: '',
            });
        } else {
            setFormState({
                id: null, name: '', price_display: '', raw_price: '', interval: 'monthly', plan_code: '', features: [], newFeature: '',
            });
        }
    }, [currentEditingPlan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureAdd = () => {
        if (formState.newFeature.trim() !== '') {
            setFormState(prev => ({
                ...prev,
                features: [...prev.features, prev.newFeature.trim()],
                newFeature: '',
            }));
        }
    };

    const handleFeatureRemove = (index) => {
        setFormState(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSavePricingPlan({
            id: formState.id,
            name: formState.name,
            price_display: formState.price_display,
            raw_price: parseFloat(formState.raw_price),
            interval: formState.interval,
            plan_code: formState.plan_code,
            features: formState.features,
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Tools: Manage Pricing Plans</h2>

            {/* Add/Edit Plan Form */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{currentEditingPlan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planName">Plan Name</label>
                        <input type="text" id="planName" name="name" value={formState.name} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priceDisplay">Price Display (e.g., R199/month)</label>
                        <input type="text" id="priceDisplay" name="price_display" value={formState.price_display} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rawPrice">Raw Price (numeric, for sorting/calculations)</label>
                        <input type="number" id="rawPrice" name="raw_price" step="0.01" value={formState.raw_price} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interval">Interval</label>
                        <select id="interval" name="interval" value={formState.interval} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planCode">Paystack Plan Code (if applicable)</label>
                        <input type="text" id="planCode" name="plan_code" value={formState.plan_code} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Features</label>
                        <div className="flex mb-2">
                            <input type="text" value={formState.newFeature} onChange={(e) => setFormState(prev => ({ ...prev, newFeature: e.target.value }))} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Add a new feature"/>
                            <button type="button" onClick={handleFeatureAdd} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add</button>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            {formState.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-700 text-sm">
                                    {feature}
                                    <button type="button" onClick={() => handleFeatureRemove(index)} className="ml-2 text-red-500 hover:text-red-700">
                                        <XIcon size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-end space-x-4">
                        {currentEditingPlan && (
                            <button type="button" onClick={() => setCurrentEditingPlan(null)} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel Edit</button>
                        )}
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                            {currentEditingPlan ? 'Save Changes' : 'Add Plan'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Existing Plans List */}
            <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Existing Pricing Plans</h3>
                {pricingPlans.length === 0 ? (
                    <p className="text-gray-600">No pricing plans created yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Display</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pricingPlans.map(plan => (
                                    <tr key={plan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.price_display}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R{plan.raw_price?.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{plan.interval}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.plan_code || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setCurrentEditingPlan(plan)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                            <button onClick={() => handleDeletePricingPlan(plan.id, plan.name)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminBrandingPage = () => {
    const { appName, appLogo, handleUpdateBranding, setMessage } = useContext(AppContext);
    const [newAppName, setNewAppName] = useState(appName);
    const [newAppLogo, setNewAppLogo] = useState(appLogo);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        setNewAppName(appName);
        setNewAppLogo(appLogo);
    }, [appName, appLogo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setMessage(null);

        if (!newAppName && !newAppLogo) {
            setFormError('Please provide either a new app name or a new logo URL.');
            return;
        }

        handleUpdateBranding(newAppName, newAppLogo);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Tools: Manage Branding</h2>

            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Current Branding</h3>
                <div className="mb-4">
                    <p className="text-gray-700 text-sm font-bold">App Name:</p>
                    <p className="text-gray-900 text-lg">{appName}</p>
                </div>
                <div className="mb-4">
                    <p className="block text-gray-700 text-sm font-bold mb-2">App Logo:</p>
                    <img src={appLogo} alt="Current App Logo" className="w-32 h-auto border border-gray-300 rounded-md p-2" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/964b00/ffffff?text=Logo"; }}/>
                </div>

                <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Update Branding</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newAppName">New App Name</label>
                        <input type="text" id="newAppName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} placeholder="e.g., Mphakathi Connect" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newAppLogo">New App Logo URL</label>
                        <input type="url" id="newAppLogo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={newAppLogo} onChange={(e) => setNewAppLogo(e.target.value)} placeholder="e.g., https://example.com/new_logo.png" />
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end mt-6">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Save Branding</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Settings Page ---

const SettingsPage = () => {
    const { userProfile, setMessage } = useContext(AppContext);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);

    useEffect(() => {
        // Assume userProfile contains notification preferences
        // For now, these are just local states, would need DB fields to persist
        // setEmailNotifications(userProfile?.email_notifications || false);
        // setSmsNotifications(userProfile?.sms_notifications || false);
    }, [userProfile]);

    const handleExportData = async () => {
        // This is a placeholder for a backend export function
        setMessage({ type: 'info', text: 'Initiating data export... (Feature coming soon)' });
        try {
            // await makeAuthenticatedRequest('/export-user-data', 'GET');
            // setMessage({ type: 'success', text: 'Your data has been prepared for export and download will begin shortly.' });
        } catch (error) {
            // setMessage({ type: 'error', text: `Failed to export data: ${error.message}` });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
    );
};
