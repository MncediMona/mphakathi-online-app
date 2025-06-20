import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react'; // Import the Auth0 hook

// Lucide React icons (re-defined for completeness)
const HomeIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UserIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const BriefcaseIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 12h0"/></svg>;
const CalendarIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>;
const SettingsIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.25a2 2 0 0 0 .73 2.73l.04.04a2 2 0 0 1 0 2.83l-.04.04a2 2 0 0 0-.73 2.73l.78 1.25a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.25a2 2 0 0 0-.73-2.73l-.04-.04a2 2 0 0 1 0-2.83l.04-.04a2 2 0 0 0 .73-2.73l-.78-1.25a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const LogOutIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const PlusCircleIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>;
const EditIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
const CheckCircleIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const XCircleIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
const FileTextIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const PackageIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="m21 8.62-9-5.15-9 5.15 9 5.15Z"/><path d="M3.5 12.28V19l8.5 4 8.5-4v-6.72"/><path d="M12 22.99V12.28"/></svg>;
const ShieldCheckIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const DollarSignIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const KeyIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 2l-2 2m-7.61 7.61a3 3 0 1 1-4.24-4.24L1.9 14.14a5 5 0 1 0 7.07 7.07L19 12z"/></svg>;
const CheckCircle2Icon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
const PaintbrushIcon = ({ size = 24, className = "" }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18.37 2.63c-1.3-1.3-3.9-1.3-5.2 0l-7.2 7.2c-1.3 1.3-1.3 3.9 0 5.2l2.4 2.4c1.3 1.3 3.9 1.3 5.2 0l7.2-7.2c1.3-1.3 1.3-3.9 0-5.2zm-2.4 2.4l-.8.8m-2.4 2.4l-.8.8m-2.4 2.4l-.8.8m-2.4 2.4l-.8.8"/><path d="M12 22h10"/></svg>;


// --- Constants for API Endpoints ---
// Use environment variables for the base URL in a real app.
// For local development, explicitly use the Netlify deployed URL for functions.
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? '/.netlify/functions'
    : 'https://mphakathi-online-app.netlify.app/.netlify/functions';

// --- Custom Confirmation Modal ---
const ConfirmationModal = ({ message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
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

// --- Application Context ---
const AppContext = createContext(null);

// --- Custom Hook for Permissions ---
const usePermissions = () => {
    const { userRole, isAuthenticated } = useContext(AppContext);

    /**
     * Checks if the current user has any of the required roles.
     * @param {string|string[]} requiredRoles - A single role string or an array of role strings.
     * @returns {boolean} True if the user has at least one of the required roles, false otherwise.
     */
    const canAccess = (requiredRoles) => {
        if (!isAuthenticated) {
            return false;
        }
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        return rolesArray.includes(userRole);
    };

    return { canAccess };
};


const App = () => {
    // Auth0 Hooks
    const { user, isAuthenticated, isLoading: auth0Loading, loginWithRedirect, logout } = useAuth0();

    // Derive authentication states from Auth0
    const userId = isAuthenticated ? user?.sub : null; // Auth0's unique user ID (sub)
    // IMPORTANT: User roles need to be set up as custom claims in Auth0 and added to the ID token.
    // Example: user['http://localhost:3000/roles'] assuming 'http://localhost:3000/' is your namespace
    const userRole = isAuthenticated
        ? (user && user['https://your-app-domain.com/roles'] && user['https://your-app-domain.com/roles'][0]) || 'member' // <-- REMEMBER TO UPDATE YOUR_AUTH0_NAMESPACE
        : 'loggedOut';
    // For paid member status, you might store this in your Netlify DB and fetch it with the user profile,
    // or as another custom claim from Auth0. For now, we'll keep it driven by the fetched userProfile.

    const [userProfile, setUserProfileState] = useState(null); // Local state for current user's profile from your DB
    const [isPaidMember, setIsPaidMember] = useState(false); // This will be set based on userProfile from DB
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loading, setLoading] = useState(true); // Overall app loading, combines Auth0 loading and data loading
    const [showPostProblemModal, setShowPostProblemModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data from DB (replaced Firestore state)
    const [problems, setProblems] = useState([]);
    const [userProfiles, setUserProfiles] = useState({}); // Stores all user profiles for reference
    const [pricingPlans, setPricingPlans] = useState([]);
    const [appName, setAppName] = useState('Mphakathi Online'); // Default app name
    const [appLogo, setAppLogo] = useState('https://placehold.co/100x40/964b00/ffffff?text=Logo'); // Default logo URL

    // --- Data Fetching from Netlify Functions ---

    // Generic fetch wrapper
    const fetchData = async (url, method = 'GET', body = null) => {
        // We'll manage overall loading state later by combining this with auth0Loading
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Include Authorization header if your Netlify Functions are secured
                    ...(isAuthenticated && user?.__raw && {
                        Authorization: `Bearer ${user.__raw}`, // Pass the ID token or access token
                    }),
                },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE_URL}${url}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
            setMessage({ type: 'error', text: `Data operation failed: ${error.message}` });
            throw error; // Re-throw to be caught by specific handlers
        }
    };


    // Fetch All User Profiles
    const fetchUserProfiles = async () => {
        try {
            const data = await fetchData('/get-user-profiles');
            const profilesMap = {};
            if (Array.isArray(data)) {
                data.forEach(profile => {
                    profilesMap[profile.uid] = {
                        ...profile,
                        isProviderApproved: profile.is_provider_approved,
                        isPaidMember: profile.is_paid_member,
                        companyName: profile.company_name,
                        createdAt: new Date(profile.created_at),
                        updatedAt: profile.updated_at ? new Date(profile.updated_at) : null,
                    };
                });
            }
            setUserProfiles(profilesMap);
            console.log("User profiles fetched from Netlify DB.");
        } catch (error) {
            console.error('Error fetching user profiles:', error);
        }
    };

    // Fetch Problems
    const fetchProblems = async () => {
        try {
            const data = await fetchData('/get-problems');
            const formattedProblems = data.map(problem => ({
                ...problem,
                estimatedBudget: parseFloat(problem.estimated_budget),
                requesterId: problem.requester_id,
                isApproved: problem.is_approved,
                acceptedQuoteId: problem.accepted_quote_id,
                createdAt: new Date(problem.created_at),
                quotes: problem.quotes && typeof problem.quotes === 'string' ? JSON.parse(problem.quotes) : (Array.isArray(problem.quotes) ? problem.quotes : []),
            }));
            setProblems(formattedProblems);
            console.log("Problems fetched from Netlify DB.");
        } catch (error) {
            console.error('Error fetching problems:', error);
        }
    };

    // Fetch Pricing Plans
    const fetchPricingPlans = async () => {
        try {
            const data = await fetchData('/get-pricing-plans');
            const formattedPlans = data.map(plan => ({
                ...plan,
                rawPrice: parseFloat(plan.raw_price),
                features: Array.isArray(plan.features) ? plan.features : (plan.features ? JSON.parse(plan.features) : []),
                createdAt: new Date(plan.created_at),
            }));
            setPricingPlans(formattedPlans);
            console.log("Pricing plans fetched from Netlify DB.");
        } catch (error) {
            console.error('Error fetching pricing plans:', error);
        }
    };

    // Fetch Branding
    const fetchBranding = async () => {
        try {
            const data = await fetchData('/get-branding');
            setAppName(data.app_name || 'Mphakathi Online');
            setAppLogo(data.app_logo_url || 'https://placehold.co/100x40/964b00/ffffff?text=Logo');
            console.log("Branding config fetched from Netlify DB.");
        } catch (error) {
            console.error('Error fetching branding:', error);
        }
    };

    // Main data loading effect
    useEffect(() => {
        const loadAppData = async () => {
            setLoading(true); // Start overall loading indicator

            // Fetch core application data
            await fetchUserProfiles();
            await fetchProblems();
            await fetchPricingPlans();
            await fetchBranding();

            setLoading(false); // End overall loading indicator
        };

        // Only load app data once Auth0 has determined authentication state
        if (!auth0Loading) {
            loadAppData();
        }
    }, [auth0Loading]); // Re-run when Auth0 loading state changes (i.e., after initial load)


    // Effect to set user profile and role based on Auth0 user object and fetched profiles
    useEffect(() => {
        if (isAuthenticated && user && Object.keys(userProfiles).length > 0) {
            const currentUserProfile = userProfiles[user.sub];
            if (currentUserProfile) {
                setUserProfileState(currentUserProfile);
                setIsPaidMember(currentUserProfile.isPaidMember);
                // The userRole is primarily driven by Auth0 claims if available,
                // otherwise fall back to fetched profile or a default.
                // Ensure your Auth0 setup sends roles in the ID token.
                const auth0Role = (user['https://your-app-domain.com/roles'] && user['https://your-app-domain.com/roles'][0]) || currentUserProfile.role; // <-- REMEMBER TO UPDATE YOUR_AUTH0_NAMESPACE
                setCurrentPage('dashboard'); // Redirect to dashboard after login
            } else {
                // User logged in via Auth0 but no profile in your DB.
                // This might indicate a new user registration flow is needed.
                // For this demo, let's set a minimal profile or prompt registration.
                setMessage({type: 'warning', text: 'Auth0 user found, but no profile in DB. Please register.'});
                setCurrentPage('register'); // Or show a registration modal
                setUserProfileState({
                    uid: user.sub,
                    name: user.name || user.email,
                    email: user.email,
                    role: 'member', // Default new users to member
                    isPaidMember: false,
                });
                setShowRegisterModal(true); // Show registration modal for new Auth0 users
            }
        } else if (!isAuthenticated && !auth0Loading) {
            // User is logged out and Auth0 is done loading
            // setUserId(null); // This was previously set by Auth0 in a different way, now userId is derived.
            setUserProfileState(null); // Clear user profile
            setIsPaidMember(false);
            setCurrentPage('dashboard'); // Go to dashboard for logged out users
            setMessage({ type: 'info', text: 'You are currently logged out.' });
        }
    }, [isAuthenticated, user, auth0Loading, userProfiles]); // Dependencies for this effect


    // --- Data Manipulation Functions (now interacting with Netlify Functions) ---

    // Update User Profile (used by ProfilePage and registration flows)
    const updateUserProfile = async (uid, updates) => {
        try {
            const dbUpdates = {
                uid: uid,
                name: updates.name,
                email: updates.email,
                phone: updates.phone,
                bio: updates.bio,
                address: updates.address,
                role: updates.role,
                is_provider_approved: updates.isProviderApproved,
                is_paid_member: updates.isPaidMember,
                company_name: updates.companyName,
                specialties: updates.specialties,
            };

            const data = await fetchData('/save-user-profile', 'POST', dbUpdates);
            const updatedLocalProfile = {
                ...data,
                isProviderApproved: data.is_provider_approved,
                isPaidMember: data.is_paid_member,
                companyName: data.company_name,
                createdAt: new Date(data.created_at),
                updatedAt: data.updated_at ? new Date(data.updated_at) : null,
            };
            setUserProfileState(updatedLocalProfile);
            setUserProfiles(prev => ({ ...prev, [uid]: updatedLocalProfile }));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error("Error updating user profile:", error);
            setMessage({ type: 'error', text: `Failed to update profile: ${error.message}` });
        }
    };

    // Generic registration handler (now uses Netlify Functions)
    // This will be called for new Auth0 users to create their profile in your DB
    const handleRegister = async (newUserData, roleType, isPaid = false) => {
        try {
            // newUserData.uid should come from Auth0 user.sub now
            if (!newUserData.uid) {
                throw new Error("User ID (UID) is required for registration from Auth0.");
            }

            const newUserProfileData = {
                uid: newUserData.uid, // Use Auth0's user.sub
                name: newUserData.name,
                email: newUserData.email,
                phone: newUserData.phone,
                address: newUserData.address,
                bio: newUserData.bio,
                role: roleType,
                isProviderApproved: roleType === 'provider' ? false : undefined,
                isPaidMember: isPaid,
                companyName: role === 'provider' ? newUserData.companyName : undefined,
                specialties: role === 'provider' ? newUserData.specialties : undefined,
            };

            await updateUserProfile(newUserData.uid, newUserProfileData);
            setMessage({ type: 'success', text: `Welcome, ${newUserData.name}! You are now registered as a ${roleType}.` });
            setCurrentPage('dashboard');
            setShowRegisterModal(false);
        } catch (error) {
            console.error("Error during registration:", error);
            setMessage({ type: 'error', text: `Registration failed: ${error.message}` });
        }
    };

    // Handle posting new problem
    const handlePostProblem = async (problemData) => {
        try {
            if (!userId) { // Ensure user is logged in to post problem
                setMessage({type: 'error', text: 'You must be logged in to post a problem.'});
                return;
            }
            await fetchData('/post-problem', 'POST', {
                title: problemData.title,
                description: problemData.description,
                category: problemData.category,
                location: problemData.location,
                estimatedBudget: parseFloat(problemData.estimatedBudget),
                requesterId: userId,
                quotes: []
            });
            await fetchProblems();
            setShowPostProblemModal(false);
            setMessage({ type: 'success', text: 'Problem posted successfully! Awaiting admin approval.' });
        } catch (error) {
            console.error("Error posting problem:", error);
            setMessage({ type: 'error', text: `Failed to post problem: ${error.message}` });
        }
    };

    // Handle updating a problem (e.g., status, quotes)
    const updateProblemInApp = async (problemId, updates) => {
        try {
            const dbUpdates = {};
            for (const key in updates) {
                let dbKey = key;
                if (key === 'isApproved') dbKey = 'is_approved';
                else if (key === 'acceptedQuoteId') dbKey = 'accepted_quote_id';
                else if (key === 'requesterId') dbKey = 'requester_id';
                else if (key === 'estimatedBudget') dbKey = 'estimated_budget';
                else if (key === 'createdAt') dbKey = 'created_at';
                else if (key === 'quotes') dbKey = 'quotes';

                if (key === 'quotes') {
                    dbUpdates[dbKey] = JSON.stringify(updates[key]);
                } else if (dbKey.includes('Id') || dbKey.includes('Budget')) {
                    dbUpdates[dbKey] = updates[key];
                } else {
                    dbUpdates[dbKey] = updates[key];
                }
            }

            await fetchData('/update-problem', 'PUT', { id: problemId, updates: dbUpdates });
            await fetchProblems();
            setMessage({ type: 'success', text: 'Problem updated successfully!' });
        } catch (error) {
            console.error("Error updating problem:", error);
            setMessage({ type: 'error', text: `Failed to update problem: ${error.message}` });
        }
    };

    // Handle deleting a problem
    const deleteProblemInApp = async (problemId) => {
        try {
            await fetchData('/delete-problem', 'DELETE', { id: problemId });
            await fetchProblems();
            setMessage({ type: 'success', text: 'Problem deleted successfully!' });
        } catch (error) {
            console.error("Error deleting problem:", error);
            setMessage({ type: 'error', text: `Failed to delete problem: ${error.message}` });
        }
    };

    // Handle adding/updating a pricing plan
    const savePricingPlanInApp = async (planData) => {
        try {
            const dbPlanData = {
                id: planData.id,
                name: planData.name,
                price: planData.price,
                raw_price: planData.rawPrice,
                interval: planData.interval,
                plan_code: planData.planCode,
                features: planData.features,
            };
            await fetchData('/save-pricing-plan', 'POST', dbPlanData);
            await fetchPricingPlans();
            setMessage({ type: 'success', text: planData.id ? `Plan "${planData.name}" updated successfully!` : `New plan "${planData.name}" added successfully!` });
        } catch (error) {
            console.error("Error saving pricing plan:", error);
            setMessage({ type: 'error', text: `Failed to save pricing plan: ${error.message}` });
        }
    };

    // Handle deleting a pricing plan
    const deletePricingPlanInApp = async (planId, planName) => {
        try {
            await fetchData('/delete-pricing-plan', 'DELETE', { id: planId });
            await fetchPricingPlans();
            setMessage({ type: 'success', text: `Plan "${planName}" deleted successfully!` });
        } catch (error) {
            console.error("Error deleting pricing plan:", error);
            setMessage({ type: 'error', text: `Failed to delete pricing plan: ${error.message}` });
        }
    };

    // Handle updating branding (app name and logo)
    const updateBrandingInApp = async (newAppName, newAppLogo) => {
        try {
            await fetchData('/save-branding', 'POST', { appName: newAppName, appLogo: newAppLogo });
            setAppName(newAppName);
            setAppLogo(newAppLogo);
            setMessage({ type: 'success', text: 'Branding updated successfully!' });
        } catch (error) {
            console.error("Error updating branding:", error);
            setMessage({ type: 'error', text: `Failed to update branding: ${error.message}` });
        }
    };

    // --- Authentication Actions (Auth0 Integrated) ---
    // The handleLoginAs function is now completely replaced by Auth0's loginWithRedirect and logout.
    const handleLogin = () => {
        loginWithRedirect(); // Redirects to Auth0 login page
    };

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } }); // Redirects to Auth0 logout and then back to your app
    };

    // Determine the header title and status based on role
    const headerTitle = userProfile?.name || (isAuthenticated ? user?.name || user?.email : 'Guest');
    let statusText = '';
    let statusColorClass = '';

    const displayUserRole = isAuthenticated ? userRole : 'loggedOut'; // Use derived userRole from Auth0 or default 'loggedOut'

    if (displayUserRole === 'loggedOut') {
        statusText = 'Logged Out';
        statusColorClass = 'bg-gray-100 text-gray-800';
    } else if (displayUserRole === 'admin') {
        statusText = 'Administrator';
        statusColorClass = 'bg-purple-100 text-purple-800';
    } else if (displayUserRole === 'provider') {
        statusText = userProfile?.isProviderApproved ? 'Approved Provider' : 'Pending Approval';
        statusColorClass = userProfile?.isProviderApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else { // member
        statusText = isPaidMember ? 'Paid Member' : 'Free Member';
        statusColorClass = isPaidMember ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    }

    // Overall loading state combines Auth0 loading and app data loading
    if (auth0Loading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#964b00] mx-auto mb-4"></div>
                    <p className="text-gray-700 text-lg">Loading application data...</p>
                </div>
            </div>
        );
    }

    // Use the usePermissions hook
    const { canAccess } = usePermissions();

    return (
        <AppContext.Provider value={{
            userId, userProfile, setUserProfile: updateUserProfile, userRole: displayUserRole, isPaidMember, setIsPaidMember,
            problems, setProblems: updateProblemInApp,
            userProfiles,
            pricingPlans, setPricingPlans: savePricingPlanInApp,
            appName, setAppName,
            appLogo, setAppLogo,
            setShowPostProblemModal,
            setMessage,
            handleRegister,
            handleBecomePaidMember: updateUserProfile,
            setSelectedPlan,
            updateProblemInFirestore: updateProblemInApp,
            deleteProblemFromFirestore: deleteProblemInApp,
            deletePricingPlanFromFirestore: deletePricingPlanInApp,
            savePricingPlanToFirestore: savePricingPlanInApp,
            updateBrandingInFirestore: updateBrandingInApp,
            loginWithRedirect, // Expose Auth0 login
            logout, // Expose Auth0 logout
            isAuthenticated, // Expose Auth0 isAuthenticated
            user, // Expose Auth0 user object
        }}>
            <div className="min-h-screen flex bg-gray-100 font-sans">
                {/* Sidebar */}
                <aside className="w-64 bg-[#964b00] text-white flex flex-col rounded-tr-lg rounded-br-lg shadow-lg">
                    <div className="p-4 md:p-6 text-center border-b border-[#b3641a]">
                        {appLogo && (
                            <img
                                src={appLogo}
                                alt={`${appName} Logo`}
                                className="mx-auto mb-4 w-24 h-auto rounded-md"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/964b00/ffffff?text=Logo"; }}
                            />
                        )}
                        <h2 className="text-2xl font-bold">
                            {appName}
                        </h2>
                        {/* Display Auth0 user email if logged in */}
                        {isAuthenticated && user?.email && <p className="text-sm text-gray-200 mt-1">Logged in as: {user.email}</p>}
                        {/* Removed the "Switch User" dropdown as Auth0 manages login */}
                    </div>
                    <nav className="flex-1 mt-4">
                        <ul>
                            <li>
                                <button
                                    onClick={() => setCurrentPage('dashboard')}
                                    className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                        currentPage === 'dashboard' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                    }`}
                                >
                                    <HomeIcon size={20} className="mr-3" />
                                    Dashboard
                                </button>
                            </li>
                            {!isAuthenticated && (
                                <li>
                                    <button
                                        onClick={handleLogin} // Use Auth0 login
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 hover:bg-[#7a3d00] text-gray-100`}
                                    >
                                        <KeyIcon size={20} className="mr-3" />
                                        Login / Register
                                    </button>
                                </li>
                            )}
                            {canAccess(['member', 'provider', 'admin']) && ( // Everyone logged in can view profile
                                <li>
                                    <button
                                        onClick={() => setCurrentPage('profile')}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                            currentPage === 'profile' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                        }`}
                                    >
                                        <UserIcon size={20} className="mr-3" />
                                        Profile
                                    </button>
                                </li>
                            )}
                            {canAccess('member') && ( // Only members can post problems
                                <li>
                                    <button
                                        onClick={() => setShowPostProblemModal(true)}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 hover:bg-[#7a3d00] text-gray-100`}
                                    >
                                        <PlusCircleIcon size={20} className="mr-3" />
                                        Post Problem
                                    </button>
                                </li>
                            )}
                            {canAccess('provider') && ( // Only providers see provider dashboard and pricing
                                <>
                                    <li>
                                        <button
                                            onClick={() => setCurrentPage('provider-dashboard')}
                                            className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                                currentPage === 'provider-dashboard' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                            }`}
                                        >
                                            <BriefcaseIcon size={20} className="mr-3" />
                                            Provider Dashboard
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setCurrentPage('pricing')}
                                            className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                                currentPage === 'pricing' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                            }`}
                                        >
                                            <DollarSignIcon size={20} className="mr-3" />
                                            Pricing
                                        </button>
                                    </li>
                                </>
                            )}
                            {canAccess('admin') && ( // Only admins see admin panel and branding settings
                                <>
                                    <li>
                                        <button
                                            onClick={() => setCurrentPage('admin-panel')}
                                            className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                                currentPage === 'admin-panel' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                            }`}
                                        >
                                            <ShieldCheckIcon size={20} className="mr-3" />
                                            Admin Panel
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => setCurrentPage('branding-settings')}
                                            className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                                currentPage === 'branding-settings' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                            }`}
                                        >
                                            <PaintbrushIcon size={20} className="mr-3" />
                                            Branding Settings
                                        </button>
                                    </li>
                                </>
                            )}
                            {isAuthenticated && ( // Logout is available if authenticated
                                <li>
                                    <button
                                        onClick={handleLogout} // Use Auth0 logout
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 hover:bg-[#7a3d00] text-gray-100`}
                                    >
                                        <LogOutIcon size={20} className="mr-3" />
                                        Logout
                                    </button>
                                </li>
                            )}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 bg-gray-100 overflow-auto">
                    {message.text && (
                        <div
                            className={`mb-4 p-3 rounded-md text-white ${
                                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            role="alert"
                        >
                            {message.text}
                        </div>
                    )}
                    <header className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 capitalize">
                            {currentPage.replace('-', ' ')}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}>
                                {statusText}
                            </span>
                        </div>
                    </header>

                    {/* Page Content based on currentPage state */}
                    {currentPage === 'dashboard' && (
                        <DashboardPage userRole={displayUserRole} problems={problems} userProfiles={userProfiles} userId={userId} />
                    )}
                    {currentPage === 'profile' && userProfile && (
                        <ProfilePage userProfile={userProfile} updateUserProfile={updateUserProfile} />
                    )}
                    {currentPage === 'provider-dashboard' && canAccess('provider') && (
                        <ProviderDashboard problems={problems} userProfiles={userProfiles} userId={userId} />
                    )}
                    {currentPage === 'pricing' && canAccess('provider') && (
                        <PricingPage pricingPlans={pricingPlans} />
                    )}
                    {currentPage === 'admin-panel' && canAccess('admin') && (
                        <AdminPanel userProfiles={userProfiles} problems={problems} />
                    )}
                    {currentPage === 'branding-settings' && canAccess('admin') && (
                        <BrandingSettings appName={appName} appLogo={appLogo} updateBranding={updateBrandingInApp} />
                    )}

                    {/* Modals */}
                    {showPostProblemModal && canAccess('member') && (
                        <PostProblemModal
                            onClose={() => setShowPostProblemModal(false)}
                            onPost={handlePostProblem}
                        />
                    )}
                    {/* RegisterModal will now only show if Auth0 user exists but no DB profile */}
                    {showRegisterModal && isAuthenticated && !userProfile && (
                        <RegisterModal
                            onClose={() => setShowRegisterModal(false)}
                            onRegister={handleRegister}
                            onSelectPlan={(plan) => setSelectedPlan(plan)}
                            pricingPlans={pricingPlans}
                            auth0User={user} // Pass Auth0 user data to registration
                        />
                    )}
                </main>
            </div>
        </AppContext.Provider>
    );
};

export default App;


// --- Dashboard Page Component ---
const DashboardPage = ({ userRole, problems, userProfiles, userId }) => {
    // Filter problems based on user role
    const filteredProblems = problems.filter(problem => {
        if (userRole === 'admin') {
            return true; // Admins see all problems
        } else if (userRole === 'member') {
            return problem.requesterId === userId; // Members see only their own problems
        } else if (userRole === 'provider') {
            // Providers see approved problems they haven't quoted, or problems they have quoted
            return problem.isApproved && (!problem.quotes.some(q => q.providerId === userId) || problem.quotes.some(q => q.providerId === userId));
        }
        return false; // Logged out users see nothing
    });

    const pendingProblems = filteredProblems.filter(p => !p.isApproved && userRole === 'admin');
    const approvedProblems = filteredProblems.filter(p => p.isApproved || userRole === 'member' || userRole === 'provider');


    return (
        <div className="space-y-6">
            {userRole === 'admin' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Overview</h2>
                    {pendingProblems.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-xl font-medium text-red-700">Pending Problems for Approval:</h3>
                            {pendingProblems.map(problem => (
                                <ProblemCard key={problem.id} problem={problem} userRole={userRole} userProfiles={userProfiles} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">No problems pending approval.</p>
                    )}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {userRole === 'member' ? 'My Posted Problems' : userRole === 'provider' ? 'Available Problems for Quoting' : 'All Approved Problems'}
                </h2>
                {approvedProblems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedProblems.map(problem => (
                            <ProblemCard key={problem.id} problem={problem} userRole={userRole} userProfiles={userProfiles} currentUserId={userId} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No approved problems to display {userRole === 'member' && 'or you have not posted any problems yet'}.</p>
                )}
            </div>
        </div>
    );
};


// --- Problem Card Component ---
const ProblemCard = ({ problem, userRole, userProfiles, currentUserId }) => {
    const { updateProblemInFirestore, setMessage } = useContext(AppContext);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState(null); // 'delete' or 'approve'

    const requesterName = userProfiles[problem.requesterId]?.name || 'Unknown User';
    const requesterRole = userProfiles[problem.requesterId]?.role || 'N/A';

    const handleApprove = async () => {
        setConfirmationAction('approve');
        setShowConfirmation(true);
    };

    const confirmApprove = async () => {
        try {
            await updateProblemInFirestore(problem.id, { isApproved: true });
            setMessage({ type: 'success', text: `Problem "${problem.title}" approved!` });
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error approving problem:", error);
            setMessage({ type: 'error', text: `Failed to approve problem: ${error.message}` });
        }
    };

    const handleDelete = async () => {
        setConfirmationAction('delete');
        setShowConfirmation(true);
    };

    const confirmDelete = async () => {
        try {
            await useContext(AppContext).deleteProblemFromFirestore(problem.id);
            setMessage({ type: 'success', text: `Problem "${problem.title}" deleted!` });
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error deleting problem:", error);
            setMessage({ type: 'error', text: `Failed to delete problem: ${error.message}` });
        }
    };

    const handlePostQuote = async (quoteDetails) => {
        try {
            const newQuote = {
                id: crypto.randomUUID(),
                providerId: currentUserId,
                amount: parseFloat(quoteDetails.amount),
                message: quoteDetails.message,
                status: 'pending', // Initial status of a quote
                createdAt: new Date().toISOString(),
            };
            const updatedQuotes = [...problem.quotes, newQuote];
            await updateProblemInFirestore(problem.id, { quotes: updatedQuotes });
            setMessage({ type: 'success', text: 'Quote posted successfully!' });
            setShowQuoteModal(false);
        } catch (error) {
            console.error("Error posting quote:", error);
            setMessage({ type: 'error', text: `Failed to post quote: ${error.message}` });
        }
    };

    const handleAcceptQuote = async (quoteId) => {
        try {
            const updatedQuotes = problem.quotes.map(q =>
                q.id === quoteId ? { ...q, status: 'accepted' } : { ...q, status: 'rejected' }
            );
            await updateProblemInFirestore(problem.id, { quotes: updatedQuotes, acceptedQuoteId: quoteId });
            setMessage({ type: 'success', text: 'Quote accepted successfully! Provider notified.' });
        } catch (error) {
            console.error("Error accepting quote:", error);
            setMessage({ type: 'error', text: `Failed to accept quote: ${error.message}` });
        }
    };

    const hasQuoted = problem.quotes.some(q => q.providerId === currentUserId);
    const acceptedProviderId = problem.acceptedQuoteId ? problem.quotes.find(q => q.id === problem.acceptedQuoteId)?.providerId : null;


    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
            <p className="text-gray-700 text-sm mb-3">By: {requesterName} ({requesterRole})</p>
            <p className="text-gray-600 mb-4 text-sm">{problem.description}</p>
            <div className="flex justify-between items-center text-sm font-medium text-gray-800 mb-4">
                <span>Category: <span className="font-semibold text-[#964b00]">{problem.category}</span></span>
                <span>Budget: <span className="font-semibold text-green-600">R{problem.estimatedBudget?.toLocaleString()}</span></span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
                Location: <span className="font-medium">{problem.location}</span>
            </div>
            <div className="text-sm text-gray-600 mb-4">
                Posted: <span className="font-medium">{problem.createdAt?.toLocaleDateString()}</span>
            </div>


            {userRole === 'admin' && !problem.isApproved && (
                <div className="flex space-x-2 mt-4">
                    <button
                        onClick={handleApprove}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                    >
                        <CheckCircleIcon size={18} className="mr-2" /> Approve
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
                    >
                        <XCircleIcon size={18} className="mr-2" /> Delete
                    </button>
                </div>
            )}

            {problem.isApproved && (userRole === 'provider' || userRole === 'member' || userRole === 'admin') && (
                <div className="mt-4 border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Quotes ({problem.quotes.length})</h4>
                    {problem.quotes.length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {problem.quotes.map(quote => (
                                <div key={quote.id} className={`p-3 rounded-md border ${quote.status === 'accepted' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <p className="text-gray-700 text-sm font-medium">Provider: {userProfiles[quote.providerId]?.name || 'Unknown'}</p>
                                    <p className="text-gray-600 text-xs">Amount: R{quote.amount?.toLocaleString()}</p>
                                    <p className="text-gray-600 text-xs italic">"{quote.message}"</p>
                                    <p className={`text-xs font-semibold mt-1 ${quote.status === 'accepted' ? 'text-green-600' : 'text-gray-500'}`}>
                                        Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                    </p>
                                    {userRole === 'member' && problem.requesterId === currentUserId && !problem.acceptedQuoteId && quote.status === 'pending' && (
                                        <button
                                            onClick={() => handleAcceptQuote(quote.id)}
                                            className="mt-2 px-3 py-1 bg-[#964b00] text-white text-xs rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                                        >
                                            Accept Quote
                                        </button>
                                    )}
                                    {problem.acceptedQuoteId === quote.id && (
                                        <span className="mt-2 ml-2 px-3 py-1 bg-green-500 text-white text-xs rounded-md">Accepted</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-sm">No quotes yet.</p>
                    )}
                    {userRole === 'provider' && problem.isApproved && !hasQuoted && !problem.acceptedQuoteId && (
                        <button
                            onClick={() => setShowQuoteModal(true)}
                            className="mt-4 w-full px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                        >
                            Post a Quote
                        </button>
                    )}
                    {userRole === 'member' && problem.acceptedQuoteId && problem.requesterId === currentUserId && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
                            <p>You have accepted a quote for this problem.</p>
                            <p>Accepted Provider: {userProfiles[acceptedProviderId]?.name || 'Unknown'}</p>
                        </div>
                    )}
                     {userRole === 'provider' && hasQuoted && !problem.acceptedQuoteId && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                            <p>You have already quoted for this problem.</p>
                        </div>
                    )}
                    {userRole === 'provider' && hasQuoted && problem.acceptedQuoteId && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                            <p>The requester has accepted a quote for this problem.</p>
                        </div>
                    )}
                </div>
            )}
            {showQuoteModal && (
                <PostQuoteModal
                    onClose={() => setShowQuoteModal(false)}
                    onPostQuote={handlePostQuote}
                />
            )}
            {showConfirmation && (
                <ConfirmationModal
                    message={`Are you sure you want to ${confirmationAction === 'approve' ? 'approve' : 'delete'} this problem "${problem.title}"?`}
                    onConfirm={confirmationAction === 'approve' ? confirmApprove : confirmDelete}
                    onCancel={() => setShowConfirmation(false)}
                    confirmText={confirmationAction === 'approve' ? 'Approve' : 'Delete'}
                />
            )}
        </div>
    );
};


// --- Profile Page Component ---
const ProfilePage = ({ userProfile, updateUserProfile }) => {
    const { setMessage } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState({ ...userProfile });

    useEffect(() => {
        setEditableProfile({ ...userProfile });
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateUserProfile(editableProfile.uid, editableProfile);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile saved successfully!' });
        } catch (error) {
            console.error("Error saving profile:", error);
            setMessage({ type: 'error', text: `Failed to save profile: ${error.message}` });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Profile</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={editableProfile.name || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    ) : (
                        <p className="text-gray-800">{userProfile?.name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                    <p className="text-gray-800">{userProfile?.email}</p>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                    <p className="text-gray-800 capitalize">{userProfile?.role}</p>
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="phone"
                            value={editableProfile.phone || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    ) : (
                        <p className="text-gray-800">{userProfile?.phone || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address"
                            value={editableProfile.address || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    ) : (
                        <p className="text-gray-800">{userProfile?.address || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Bio:</label>
                    {isEditing ? (
                        <textarea
                            name="bio"
                            value={editableProfile.bio || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="4"
                        ></textarea>
                    ) : (
                        <p className="text-gray-800 whitespace-pre-wrap">{userProfile?.bio || 'N/A'}</p>
                    )}
                </div>

                {userProfile?.role === 'provider' && (
                    <>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="companyName"
                                    value={editableProfile.companyName || ''}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            ) : (
                                <p className="text-gray-800">{userProfile?.companyName || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Specialties (comma-separated):</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="specialties"
                                    value={editableProfile.specialties ? (Array.isArray(editableProfile.specialties) ? editableProfile.specialties.join(', ') : editableProfile.specialties) : ''}
                                    onChange={(e) => {
                                        setEditableProfile(prev => ({
                                            ...prev,
                                            specialties: e.target.value.split(',').map(s => s.trim())
                                        }));
                                    }}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            ) : (
                                <p className="text-gray-800">{userProfile?.specialties?.join(', ') || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Provider Status:</label>
                            <p className={`font-semibold ${userProfile?.isProviderApproved ? 'text-green-600' : 'text-red-600'}`}>
                                {userProfile?.isProviderApproved ? 'Approved' : 'Pending Approval'}
                            </p>
                        </div>
                    </>
                )}

                {userProfile?.role === 'member' && (
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Membership Status:</label>
                        <p className={`font-semibold ${userProfile?.isPaidMember ? 'text-blue-600' : 'text-yellow-600'}`}>
                            {userProfile?.isPaidMember ? 'Paid Member' : 'Free Member'}
                        </p>
                        {!userProfile?.isPaidMember && (
                            <button
                                onClick={() => useContext(AppContext).setCurrentPage('pricing')}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                Upgrade to Paid Membership
                            </button>
                        )}
                    </div>
                )}

                <div className="flex justify-end space-x-4 mt-6">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditableProfile({ ...userProfile });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                        >
                            <EditIcon size={18} className="inline-block mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Post Problem Modal Component ---
const PostProblemModal = ({ onClose, onPost }) => {
    const [problemTitle, setProblemTitle] = useState('');
    const [problemDescription, setProblemDescription] = useState('');
    const [problemCategory, setProblemCategory] = useState('Plumbing');
    const [problemLocation, setProblemLocation] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onPost({
            title: problemTitle,
            description: problemDescription,
            category: problemCategory,
            location: problemLocation,
            estimatedBudget: parseFloat(estimatedBudget),
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Post a New Problem</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Problem Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={problemTitle}
                            onChange={(e) => setProblemTitle(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
                        <textarea
                            id="description"
                            value={problemDescription}
                            onChange={(e) => setProblemDescription(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
                        <select
                            id="category"
                            value={problemCategory}
                            onChange={(e) => setProblemCategory(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        >
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Construction">Construction</option>
                            <option value="Gardening">Gardening</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">Location:</label>
                        <input
                            type="text"
                            id="location"
                            value={problemLocation}
                            onChange={(e) => setProblemLocation(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="budget" className="block text-gray-700 text-sm font-bold mb-2">Estimated Budget (R):</label>
                        <input
                            type="number"
                            id="budget"
                            value={estimatedBudget}
                            onChange={(e) => setEstimatedBudget(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                        >
                            Post Problem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Register Modal Component ---
const RegisterModal = ({ onClose, onRegister, onSelectPlan, pricingPlans, auth0User }) => {
    const [name, setName] = useState(auth0User?.name || '');
    const [email, setEmail] = useState(auth0User?.email || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [bio, setBio] = useState('');
    // Password fields are removed as Auth0 handles user passwords
    const [role, setRole] = useState('member');
    const [companyName, setCompanyName] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [selectedPricingPlanId, setSelectedPricingPlanId] = useState('');

    const { setMessage } = useContext(AppContext);

    useEffect(() => {
        if (pricingPlans.length > 0 && !selectedPricingPlanId) {
            setSelectedPricingPlanId(pricingPlans[0].id);
        }
    }, [pricingPlans, selectedPricingPlanId]);


    const handleSubmit = (e) => {
        e.preventDefault();

        // No password check needed here, Auth0 handles it.

        const isPaid = role === 'member' && selectedPricingPlanId && pricingPlans.find(p => p.id === selectedPricingPlanId && p.rawPrice > 0);

        onRegister({
            uid: auth0User.sub, // Use Auth0's user.sub as the UID
            name,
            email,
            phone,
            address,
            bio,
            companyName: role === 'provider' ? companyName : undefined,
            specialties: role === 'provider' ? specialties.split(',').map(s => s.trim()) : undefined,
        }, role, isPaid);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl my-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reg-name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        <input type="text" id="reg-name" value={name} onChange={(e) => setName(e.target.value)}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                    </div>
                    <div>
                        <label htmlFor="reg-email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required readOnly />
                    </div>
                    <div>
                        <label htmlFor="reg-phone" className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                        <input type="text" id="reg-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label htmlFor="reg-address" className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                        <input type="text" id="reg-address" value={address} onChange={(e) => setAddress(e.target.value)}
                               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label htmlFor="reg-bio" className="block text-gray-700 text-sm font-bold mb-2">Bio:</label>
                        <textarea id="reg-bio" value={bio} onChange={(e) => setBio(e.target.value)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="3"></textarea>
                    </div>
                    {/* Password fields removed as Auth0 manages this */}
                    <div>
                        <label htmlFor="reg-role" className="block text-gray-700 text-sm font-bold mb-2">Register as:</label>
                        <select id="reg-role" value={role} onChange={(e) => setRole(e.target.value)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                            <option value="member">Member</option>
                            <option value="provider">Service Provider</option>
                        </select>
                    </div>

                    {role === 'provider' && (
                        <>
                            <div>
                                <label htmlFor="companyName" className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                                <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div>
                                <label htmlFor="specialties" className="block text-gray-700 text-sm font-bold mb-2">Specialties (comma-separated):</label>
                                <input type="text" id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)}
                                       className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                        </>
                    )}

                    {role === 'member' && pricingPlans.length > 0 && (
                        <div>
                            <label htmlFor="pricingPlan" className="block text-gray-700 text-sm font-bold mb-2">Select Pricing Plan:</label>
                            <select id="pricingPlan" value={selectedPricingPlanId} onChange={(e) => {
                                setSelectedPricingPlanId(e.target.value);
                                onSelectPlan(pricingPlans.find(p => p.id === e.target.value));
                            }}
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                                {pricingPlans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name} - {plan.price}</option>
                                ))}
                            </select>
                        </div>
                    )}


                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose}
                                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">
                            Cancel
                        </button>
                        <button type="submit"
                                className="px-6 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200">
                            Complete Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Provider Dashboard Component ---
const ProviderDashboard = ({ problems, userProfiles, userId }) => {
    const relevantProblems = problems.filter(problem =>
        problem.isApproved && (
            problem.quotes.some(quote => quote.providerId === userId) ||
            (problem.acceptedQuoteId && problem.quotes.find(q => q.id === problem.acceptedQuoteId)?.providerId === userId)
        )
    );

    const problemsQuotedByMe = relevantProblems.filter(problem => problem.quotes.some(q => q.providerId === userId));
    const problemsWithMyQuoteAccepted = relevantProblems.filter(problem => problem.acceptedQuoteId && problem.quotes.find(q => q.id === problem.acceptedQuoteId)?.providerId === userId);

    // Removed `quotesReceivedCount` since it was marked as unused in ESLint warnings.

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Problems Quoted</h3>
                        <p className="text-3xl font-bold text-[#964b00]">{problemsQuotedByMe.length}</p>
                    </div>
                    <FileTextIcon size={40} className="text-gray-400" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Accepted Quotes</h3>
                        <p className="text-3xl font-bold text-green-600">{problemsWithMyQuoteAccepted.length}</p>
                    </div>
                    <CheckCircle2Icon size={40} className="text-gray-400" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Quotes & Accepted Jobs</h2>
                {relevantProblems.length > 0 ? (
                    <div className="space-y-4">
                        {relevantProblems.map(problem => (
                            <div key={problem.id} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{problem.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{problem.description}</p>
                                <div className="flex justify-between items-center text-sm font-medium text-gray-800 mb-2">
                                    <span>Category: <span className="font-semibold text-[#964b00]">{problem.category}</span></span>
                                    <span>Budget: <span className="font-semibold text-green-600">R{problem.estimatedBudget?.toLocaleString()}</span></span>
                                </div>

                                <div className="mt-3">
                                    <h4 className="text-md font-semibold text-gray-700">My Quotes:</h4>
                                    {problem.quotes.filter(q => q.providerId === userId).map(quote => (
                                        <div key={quote.id} className={`p-2 rounded-md mt-2 ${quote.status === 'accepted' ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-200'} border`}>
                                            <p className="text-sm">Amount: R{quote.amount?.toLocaleString()}</p>
                                            <p className="text-xs italic">"{quote.message}"</p>
                                            <p className={`text-xs font-semibold mt-1 ${quote.status === 'accepted' ? 'text-green-600' : 'text-gray-500'}`}>
                                                Status: {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                            </p>
                                            {quote.status === 'accepted' && (
                                                <p className="text-xs text-green-700 mt-1 font-bold">This quote was accepted!</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">You haven't quoted on any problems yet, or no quotes have been accepted.</p>
                )}
            </div>
        </div>
    );
};

// --- Admin Panel Component ---
const AdminPanel = ({ userProfiles, problems }) => {
    const { updateProblemInFirestore, setUserProfile, setMessage } = useContext(AppContext);
    const { canAccess } = usePermissions(); // Use the permissions hook here
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmActionCallback, setConfirmActionCallback] = useState(null);

    const pendingProviders = Object.values(userProfiles).filter(p => p.role === 'provider' && !p.isProviderApproved);
    const allProblems = problems;

    const handleApproveProvider = (uid, name) => {
        setConfirmationMessage(`Are you sure you want to approve provider "${name}"?`);
        setConfirmActionCallback(() => async () => {
            try {
                await setUserProfile(uid, { isProviderApproved: true });
                setMessage({ type: 'success', text: `Provider "${name}" approved successfully!` });
            } catch (error) {
                setMessage({ type: 'error', text: `Failed to approve provider: ${error.message}` });
            } finally {
                setShowConfirmation(false);
            }
        });
        setShowConfirmation(true);
    };

    const handleDeleteUser = (uid, name) => {
        setConfirmationMessage(`Are you sure you want to DELETE user "${name}"? This action cannot be undone.`);
        setConfirmActionCallback(() => async () => {
            setMessage({ type: 'success', text: `User "${name}" deleted (demo only - no actual DB delete).` });
            const newProfiles = { ...userProfiles };
            delete newProfiles[uid];
            console.log(`User ${uid} deleted.`);
            setShowConfirmation(false);
        });
        setShowConfirmation(true);
    };


    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Provider Approvals</h2>
                {pendingProviders.length > 0 ? (
                    <div className="space-y-4">
                        {pendingProviders.map(profile => (
                            <div key={profile.uid} className="p-4 border rounded-md bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{profile.name} ({profile.email})</p>
                                    <p className="text-sm text-gray-600">Company: {profile.companyName || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Specialties: {profile.specialties?.join(', ') || 'N/A'}</p>
                                </div>
                                {/* Example of using canAccess for a button */}
                                {canAccess('admin') && (
                                    <button
                                        onClick={() => handleApproveProvider(profile.uid, profile.name)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Approve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No providers pending approval.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Registered Users</h2>
                {Object.values(userProfiles).length > 0 ? (
                    <div className="space-y-4">
                        {Object.values(userProfiles).map(profile => (
                            <div key={profile.uid} className="p-4 border rounded-md bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{profile.name} ({profile.email})</p>
                                    <p className="text-sm text-gray-600 capitalize">Role: {profile.role}</p>
                                    {profile.role === 'provider' && (
                                        <p className={`text-sm font-medium ${profile.isProviderApproved ? 'text-green-600' : 'text-red-600'}`}>
                                            Status: {profile.isProviderApproved ? 'Approved' : 'Pending'}
                                        </p>
                                    )}
                                </div>
                                {canAccess('admin') && ( // Only admins can see delete user button
                                    <button
                                        onClick={() => handleDeleteUser(profile.uid, profile.name)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                                    >
                                        Delete User (Demo)
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No users registered.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Problems (Admin View)</h2>
                {allProblems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allProblems.map(problem => (
                            <ProblemCard key={problem.id} problem={problem} userRole="admin" userProfiles={userProfiles} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No problems posted yet.</p>
                )}
            </div>
            {showConfirmation && (
                <ConfirmationModal
                    message={confirmationMessage}
                    onConfirm={confirmActionCallback}
                    onCancel={() => setShowConfirmation(false)}
                    confirmText="Confirm"
                />
            )}
        </div>
    );
};

// --- Pricing Page Component ---
const PricingPage = ({ pricingPlans }) => {
    const { userRole, userProfile, handleBecomePaidMember, setSelectedPlan, setMessage } = useContext(AppContext);
    const { canAccess } = usePermissions(); // Use the permissions hook
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState(null);

    const handleSelectPlanForPurchase = (plan) => {
        setSelectedPlanForPurchase(plan);
        setShowConfirmation(true);
    };

    const confirmPurchase = async () => {
        if (selectedPlanForPurchase && userProfile) {
            try {
                await handleBecomePaidMember(userProfile.uid, { ...userProfile, isPaidMember: true });
                setMessage({ type: 'success', text: `You are now a paid member with the "${selectedPlanForPurchase.name}" plan!` });
                setSelectedPlan(selectedPlanForPurchase);
            } catch (error) {
                setMessage({ type: 'error', text: `Failed to become paid member: ${error.message}` });
            } finally {
                setShowConfirmation(false);
            }
        }
    };


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pricingPlans.map(plan => (
                    <div key={plan.id} className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center text-center border-2 border-gray-200 hover:border-[#964b00] transition-all duration-300">
                        <PackageIcon size={48} className="text-[#964b00] mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <p className="text-5xl font-extrabold text-[#964b00] mb-4">
                            R{plan.rawPrice}{plan.interval === 'monthly' ? '/mo' : ''}
                        </p>
                        <ul className="text-gray-700 mb-6 space-y-2 text-left w-full">
                            {plan.features?.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <CheckCircleIcon size={18} className="text-green-500 mr-2" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {canAccess('member') && !userProfile?.isPaidMember && plan.rawPrice > 0 && ( // Only members not paid can choose paid plans
                            <button
                                onClick={() => handleSelectPlanForPurchase(plan)}
                                className="mt-auto w-full px-6 py-3 bg-[#964b00] text-white font-semibold rounded-lg hover:bg-[#b3641a] transition-colors duration-300 transform hover:scale-105"
                            >
                                Choose Plan
                            </button>
                        )}
                        {canAccess('member') && userProfile?.isPaidMember && plan.rawPrice > 0 && ( // Members who are paid
                            <span className="mt-auto w-full text-center py-3 text-green-600 font-semibold">
                                Already a paid member!
                            </span>
                        )}
                        {canAccess('member') && plan.rawPrice === 0 && ( // Members with free plan
                            <span className="mt-auto w-full text-center py-3 text-gray-600 font-semibold">
                                Free Plan
                            </span>
                        )}
                        {canAccess('admin') && ( // Admins can edit/delete plans
                            <div className="mt-auto w-full flex space-x-2">
                                <button
                                    onClick={() => { /* Implement edit logic */ alert('Edit Plan Not Implemented'); }}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => useContext(AppContext).deletePricingPlanFromFirestore(plan.id, plan.name)}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                        {canAccess('provider') && ( // Providers see pricing for members (read-only)
                            <span className="mt-auto w-full text-center py-3 text-gray-600 font-semibold">
                                Pricing for Members
                            </span>
                        )}
                    </div>
                ))}
                {canAccess('admin') && ( // Only admins can add new plans
                    <button
                        onClick={() => { /* Implement add new plan modal */ alert('Add Plan Not Implemented'); }}
                        className="bg-gray-200 text-gray-700 rounded-lg shadow-md p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 hover:border-[#964b00] hover:bg-gray-300 transition-all duration-300"
                    >
                        <PlusCircleIcon size={48} className="text-gray-500 mb-2" />
                        <span className="text-lg font-semibold">Add New Plan</span>
                    </button>
                )}
            </div>
            {showConfirmation && (
                <ConfirmationModal
                    message={`Are you sure you want to purchase the "${selectedPlanForPurchase?.name}" plan for R${selectedPlanForPurchase?.rawPrice}?`}
                    onConfirm={confirmPurchase}
                    onCancel={() => setShowConfirmation(false)}
                    confirmText="Proceed to Payment"
                />
            )}
        </div>
    );
};

// --- Post Quote Modal Component ---
const PostQuoteModal = ({ onClose, onPostQuote }) => {
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onPostQuote({ amount: parseFloat(amount), message });
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Post Your Quote</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="quote-amount" className="block text-gray-700 text-sm font-bold mb-2">Quote Amount (R):</label>
                        <input
                            type="number"
                            id="quote-amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="quote-message" className="block text-gray-700 text-sm font-bold mb-2">Message:</label>
                        <textarea
                            id="quote-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                        >
                            Submit Quote
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Branding Settings Component ---
const BrandingSettings = ({ appName, appLogo, updateBranding }) => {
    const { setMessage } = useContext(AppContext);
    const { canAccess } = usePermissions(); // Use the permissions hook
    const [newAppName, setNewAppName] = useState(appName);
    const [newAppLogo, setNewAppLogo] = useState(appLogo);

    useEffect(() => {
        setNewAppName(appName);
        setNewAppLogo(appLogo);
    }, [appName, appLogo]);

    const handleSaveBranding = async () => {
        try {
            await updateBranding(newAppName, newAppLogo);
            setMessage({ type: 'success', text: 'Branding updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: `Failed to update branding: ${error.message}` });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Branding Settings</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="appName" className="block text-gray-700 text-sm font-bold mb-2">App Name:</label>
                    <input
                        type="text"
                        id="appName"
                        value={newAppName}
                        onChange={(e) => setNewAppName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="appLogo" className="block text-gray-700 text-sm font-bold mb-2">App Logo URL:</label>
                    <input
                        type="url"
                        id="appLogo"
                        value={newAppLogo}
                        onChange={(e) => setNewAppLogo(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {newAppLogo && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">Logo Preview:</p>
                            <img
                                src={newAppLogo}
                                alt="App Logo Preview"
                                className="w-24 h-auto rounded-md mt-1"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/964b00/ffffff?text=Logo"; }}
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    {canAccess('admin') && ( // Only admins can save branding
                        <button
                            onClick={handleSaveBranding}
                            className="px-6 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200"
                        >
                            Save Branding
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
