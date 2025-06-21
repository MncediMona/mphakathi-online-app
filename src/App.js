import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  HomeIcon, UserIcon, FileTextIcon, PackageIcon,
  ShieldCheckIcon, SettingsIcon, LogOutIcon, BriefcaseIcon, PlusCircleIcon,
  EditIcon, CheckCircleIcon, XCircleIcon, DollarSignIcon, CheckCircle2Icon,
  PaintbrushIcon, MenuIcon, XIcon // Added MenuIcon and XIcon for mobile sidebar
} from 'lucide-react';

// AppContext definition
const AppContext = createContext(null);

// =========================================================================
// GLOBAL CONSTANTS AND HELPER FUNCTIONS GO HERE:
// =========================================================================

// Custom Confirmation Modal
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
    // --- Mock Data and State ---
    const [userId, setUserId] = useState('loggedOut'); // Start as logged out by default
    const [userProfile, setUserProfileState] = useState(() => ({
        uid: '',
        name: 'Guest User',
        email: '',
        phone: '',
        role: 'loggedOut',
        isProviderApproved: false,
        isPaidMember: false,
        bio: '',
        address: '',
        companyName: undefined,
        specialties: undefined,
    }));
    const [userRole, setUserRole] = useState(userProfile.role);
    const [isPaidMember, setIsPaidMember] = useState(userProfile.isPaidMember);
    const [currentPage, setCurrentPage] = useState('problems'); // Set problem list as main feature
    const [loading, setLoading] = useState(false);
    const [showPostProblemModal, setShowPostProblemModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [editingProblem, setEditingProblem] = useState(null);
    const [submittingQuoteForProblem, setSubmittingQuoteForProblem] = useState(null);
    const [editingQuote, setEditingQuote] = useState(null);
    const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);
    const [currentEditingPlan, setCurrentEditingPlan] = useState(null);

    // Global App Branding State
    const [appName, setAppName] = useState(process.env.REACT_APP_APP_NAME || 'Mphakathi Online');
    const [appLogo, setAppLogo] = useState(process.env.REACT_APP_APP_LOGO || 'https://placehold.co/100x40/964b00/ffffff?text=Logo');

    // State for mobile sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Environment variable to control dev features
    const enableDevFeatures = process.env.REACT_APP_ENABLE_DEV_FEATURES === 'true'; // Set this in Netlify for dev builds, leave false or unset for production

    // Mock data storage (in-memory, resets on refresh) - WILL BE REPLACED BY DATABASE CALLS
    const [mockProblems, setMockProblems] = useState([
        {
            id: 'problem-1',
            title: 'Leaky Faucet Repair',
            description: 'My kitchen faucet has a steady drip, needs repair or replacement.',
            category: 'Plumbing',
            location: 'Pretoria',
            estimatedBudget: 500,
            requesterId: 'mock-member-alice',
            status: 'open',
            isApproved: true,
            createdAt: new Date(Date.now() - 86400000 * 5),
            quotes: [
                { id: 'quote-1a', providerId: 'mock-provider-alpha', providerName: 'Alpha Services', amount: 150, details: 'Standard repair, parts included.', status: 'pending', proposedStartDate: '2025-07-01', proposedEndDate: '2025-07-02', createdAt: new Date(Date.now() - 86400000 * 4) },
                { id: 'quote-1b', providerId: 'mock-provider-beta', providerName: 'Beta Fixers', amount: 120, details: 'Will inspect and fix, lowest price.', status: 'pending', proposedStartDate: '2025-07-03', proposedEndDate: '2025-07-03', createdAt: new Date(Date.now() - 86400000 * 3) },
            ]
        },
        {
            id: 'problem-2',
            title: 'Garden Landscaping',
            description: 'Need basic landscaping for a small backyard. Ideas welcome.',
            category: 'Gardening',
            location: 'Durban',
            estimatedBudget: 2500,
            requesterId: 'mock-member-bob',
            status: 'open',
            isApproved: true,
            createdAt: new Date(Date.now() - 86400000 * 2),
            quotes: [
                { id: 'quote-2a', providerId: 'mock-provider-charlie', providerName: 'Charlie Gardens', amount: 500, details: 'Includes design and plant selection.', status: 'pending', proposedStartDate: '2025-07-10', proposedEndDate: '2025-07-15', createdAt: new Date(Date.now() - 86400000 * 1) },
            ]
        },
        {
            id: 'problem-3',
            title: 'Broken Washing Machine',
            description: 'Washing machine not spinning. Believe it is a motor issue.',
            category: 'Appliance Repair',
            location: 'Cape Town',
            estimatedBudget: 800,
            requesterId: 'mock-member-bob',
            status: 'closed',
            isApproved: true,
            acceptedQuoteId: 'quote-3b',
            createdAt: new Date(Date.now() - 86400000 * 10),
            quotes: [
                { id: 'quote-3a', providerId: 'mock-provider-delta', providerName: 'Delta Appliances', amount: 300, details: 'Motor replacement cost.', status: 'pending', proposedStartDate: '2025-06-20', proposedEndDate: '2025-06-21', createdAt: new Date(Date.now() - 86400000 * 9) },
                { id: 'quote-3b', providerId: 'mock-provider-epsilon', providerName: 'Epsilon Repairs', amount: 250, details: 'Quick diagnosis and repair.', status: 'accepted', proposedStartDate: '2025-06-22', proposedEndDate: '2025-06-22', createdAt: new Date(Date.now() - 86400000 * 8) },
            ]
        },
    ]);
    const [mockUserProfiles, setMockUserProfiles] = useState({
        'mock-member-alice': { uid: 'mock-member-alice', name: 'Alice Member', email: 'alice@example.com', phone: '071-123-4567', role: 'member', isPaidMember: true, bio: 'A mock user looking for help.', address: '456 Oak Avenue, Johannesburg' },
        'mock-member-bob': { uid: 'mock-member-bob', name: 'Bob Member', email: 'bob@example.com', phone: '082-222-3333', role: 'member', isPaidMember: false, bio: 'Another mock user.', address: '789 Pine Street, Cape Town' },
        'mock-provider-alpha': { uid: 'mock-provider-alpha', name: 'Alpha Services', email: 'alpha@example.com', phone: '060-111-2222', role: 'provider', isProviderApproved: true, companyName: 'Alpha Plumbing', specialties: 'Plumbing', bio: 'Expert plumbers in Gauteng.', address: '101 Pipe Rd, Pretoria' },
        'mock-provider-beta': { uid: 'mock-provider-beta', name: 'Beta Fixers', email: 'beta@example.com', phone: '073-333-4444', role: 'provider', isProviderApproved: true, companyName: 'Beta General', specialties: 'General Handyman', bio: 'Reliable handymen for all your needs.', address: '202 Tool St, Durban' },
        'mock-provider-charlie': { uid: 'mock-provider-charlie', name: 'Charlie Gardens', email: 'charlie@example.com', phone: '084-555-6666', role: 'provider', isProviderApproved: false, companyName: 'Charlie Landscaping', specialties: 'Landscaping', bio: 'Creative landscaping solutions.', address: '303 Green Ave, Cape Town' },
        'mock-provider-delta': { uid: 'mock-provider-delta', name: 'Delta Appliances', email: 'delta@example.com', phone: '079-777-8888', role: 'provider', isProviderApproved: true, companyName: 'Delta Repairs', specialties: 'Appliance Repair', bio: 'Fast and affordable appliance repairs.', address: '404 Repair Ln, Johannesburg' },
        'mock-provider-epsilon': { uid: 'mock-provider-epsilon', name: 'Epsilon Repairs', email: 'epsilon@example.com', phone: '081-999-0000', role: 'provider', isProviderApproved: true, companyName: 'Epsilon Tech', specialties: 'Electronics Repair', bio: 'Specializing in electronics repair.', address: '505 Circuit Rd, Pretoria' },
        'admin-user': { uid: 'admin-user', name: 'Admin Account', email: 'admin@example.com', phone: '000-000-0000', role: 'admin', isProviderApproved: undefined, isPaidMember: undefined, bio: 'System administrator.', address: 'Admin HQ' }
    });
    // Updated mock pricing plans with new features and details
    const [mockPricingPlans, setMockPricingPlans] = useState([
        {
            id: 'bronze-plan',
            name: 'Bronze',
            price: 'R50/month',
            rawPrice: 50,
            interval: 'monthly',
            features: [
                'For unskilled & students',
                'Post up to 5 problems',
                'View basic problem details',
                'Community support',
                'Budget limit: R500 per transaction',
                'Limited to 50 quotes',
                'Category specific',
                'Specific location'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_ot4wcmec30yw311',
            planCode: 'PLN_ot4wcmec30yw311'
        },
        {
            id: 'silver-plan',
            name: 'Silver',
            price: 'R150/month',
            rawPrice: 150,
            interval: 'monthly',
            features: [
                'For skilled individuals',
                'Unlimited problem posts',
                'View all problem details',
                'Submit and manage quotes (limited to 150)',
                'Priority support',
                'Budget limit: R1500 per transaction',
                'Up to 5 categories',
                'Provincial'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_9zom3j5yjqjox10',
            planCode: 'PLN_9zom3j5yjqjox10'
        },
        {
            id: 'gold-plan',
            name: 'Gold',
            price: 'R300/month',
            rawPrice: 300,
            interval: 'monthly',
            features: [
                'For professionals & small businesses',
                'All Silver features',
                'Advanced analytics',
                'Dedicated account manager',
                'Early access to features',
                'Budget limit: R10,000 per transaction',
                'Limited to 500 quotes',
                'Up to 20 categories',
                '3 province locations'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_2cun96f18ckdlzd',
            planCode: 'PLN_2cun96f18ckdlzd'
        },
        {
            id: 'platinum-plan',
            name: 'Platinum',
            price: 'Contact us for price',
            rawPrice: 0,
            interval: 'custom',
            features: [
                'For large businesses',
                'All Gold features',
                'Premium partner listings',
                'Exclusive workshops',
                'API access',
                'Unlimited budget',
                'Unlimited quotes',
                'Unlimited categories',
                'Global locations'
            ],
            paystackLink: null,
            planCode: null
        },
    ]);


    // Effect to initialize user profile on first load - this mock logic will be replaced by Auth0
    useEffect(() => {
        if (userProfile.uid === '') {
            const newUserId = crypto.randomUUID();
            setUserId(newUserId);
            setUserProfileState(prev => ({ ...prev, uid: newUserId }));
            setMockUserProfiles(prev => ({
                ...prev,
                [newUserId]: { ...userProfile, uid: newUserId }
            }));
        } else {
            setMockUserProfiles(prev => ({
                ...prev,
                [userId]: { ...prev[userId], ...userProfile, uid: userId }
            }));
        }
    }, [userId, userProfile, setMockUserProfiles]);

    // --- Handlers for Problem Management ---
    const handlePostProblem = (problemData) => {
        // In a real app, this would be an API call to save to Neon DB
        const newProblem = {
            id: crypto.randomUUID(),
            title: problemData.title,
            description: problemData.description,
            category: problemData.category,
            location: problemData.location,
            estimatedBudget: parseFloat(problemData.estimatedBudget),
            requesterId: userId, // This would be the actual Auth0 user ID
            status: 'open',
            isApproved: userRole === 'admin', // Admin approval logic would be server-side
            createdAt: new Date(),
            quotes: []
        };
        setMockProblems(prevProblems => [newProblem, ...prevProblems]);
        setShowPostProblemModal(false);
        setMessage({ type: 'success', text: 'Problem posted successfully! Awaiting admin approval (mock).' });
    };

    const handleDeleteProblem = (problemId) => {
        setConfirmationMessage('Are you sure you want to delete this problem? This action cannot be undone.');
        setConfirmationAction(() => () => {
            // API call to delete from Neon DB
            setMockProblems(prevProblems => prevProblems.filter(p => p.id !== problemId));
            setMessage({ type: 'success', text: 'Problem deleted successfully (mock).' });
            setShowConfirmationModal(false);
        });
        setShowConfirmationModal(true);
    };

    const handleEditProblem = (problemId, updatedData) => {
        // API call to update problem in Neon DB
        setMockProblems(prevProblems => prevProblems.map(p =>
            p.id === problemId ? { ...p, ...updatedData } : p
        ));
        setMessage({ type: 'success', text: 'Problem updated successfully (mock).' });
    };

    const handleApproveProblem = (problemId) => {
        // API call to update problem status in Neon DB
        setMockProblems(prevProblems => prevProblems.map(p =>
            p.id === problemId ? { ...p, isApproved: true, status: 'open' } : p
        ));
        setMessage({ type: 'success', text: 'Problem approved and made public (mock).' });
    };

    const handleMarkProblemResolved = (problemId) => {
        // API call to update problem status in Neon DB
        setMockProblems(prevProblems => prevProblems.map(p =>
            p.id === problemId ? { ...p, status: 'resolved' } : p
        ));
        setMessage({ type: 'success', text: 'Problem marked as resolved (mock).' });
    };


    // --- Handlers for Quote Management ---
    const handleSubmitQuote = (problemId, quoteData) => {
        // API call to save quote to Neon DB
        setMockProblems(prevProblems => prevProblems.map(problem => {
            if (problem.id === problemId) {
                const newQuote = {
                    id: crypto.randomUUID(),
                    providerId: userId, // This would be the actual Auth0 user ID
                    providerName: userProfile.name,
                    amount: parseFloat(quoteData.proposedBudget),
                    details: quoteData.motivation,
                    proposedStartDate: quoteData.proposedStartDate,
                    proposedEndDate: quoteData.proposedEndDate,
                    status: 'pending',
                    createdAt: new Date(),
                };
                return { ...problem, quotes: [...problem.quotes, newQuote] };
            }
            return problem;
        }));
        setMessage({ type: 'success', text: 'Quote submitted successfully (mock)!' });
        setSubmittingQuoteForProblem(null);
    };

    const handleAcceptQuote = (problemId, quoteId) => {
        setConfirmationMessage("By accepting this quote, your contact information (name, email, phone) will be shared with the selected provider. Do you wish to proceed?");
        setConfirmationAction(() => () => {
            // API call to update quote/problem status in Neon DB
            setMockProblems(prevProblems => prevProblems.map(problem => {
                if (problem.id === problemId) {
                    return {
                        ...problem,
                        status: 'closed',
                        acceptedQuoteId: quoteId,
                        quotes: problem.quotes.map(quote =>
                            quote.id === quoteId ? { ...quote, status: 'accepted' } : { ...quote, status: 'rejected' }
                        )
                    };
                }
                return problem;
            }));
            setMessage({ type: 'success', text: 'Quote accepted! Problem marked as closed (mock).' });
            setShowConfirmationModal(false);
        });
        setShowConfirmationModal(true);
    };

    const handleWithdrawQuote = (problemId, quoteId) => {
        setConfirmationMessage('Are you sure you want to withdraw this quote?');
        setConfirmationAction(() => () => {
            // API call to delete quote from Neon DB
            setMockProblems(prevProblems => prevProblems.map(problem => {
                if (problem.id === problemId) {
                    return { ...problem, quotes: problem.quotes.filter(q => q.id !== quoteId) };
                }
                return problem;
            }));
            setMessage({ type: 'success', text: 'Quote withdrawn successfully (mock).' });
            setShowConfirmationModal(false);
        });
        setShowConfirmationModal(true);
    };

    const handleEditQuote = (problemId, quoteId, updatedQuoteData) => {
        // API call to update quote in Neon DB
        setMockProblems(prevProblems => prevProblems.map(problem => {
            if (problem.id === problemId) {
                return {
                    ...problem,
                    quotes: problem.quotes.map(quote =>
                        quote.id === quoteId ? { ...quote, ...updatedQuoteData } : quote
                    )
                };
            }
            return problem;
        }));
        setMessage({ type: 'success', text: 'Quote updated successfully (mock).' });
        setEditingQuote(null);
    };


    // --- General Authentication/Registration Handlers ---
    const handleRegister = (newUserData, roleType, isPaid = false) => {
        // This will be replaced by Auth0 registration and then saving to Neon DB
        const newUid = crypto.randomUUID();
        const newUserProfile = {
            uid: newUid,
            name: newUserData.name,
            email: newUserData.email,
            phone: newUserData.phone,
            role: roleType,
            isProviderApproved: roleType === 'provider' ? false : undefined,
            isPaidMember: isPaid,
            bio: newUserData.bio || '',
            address: newUserData.address || '',
            companyName: newUserData.companyName || undefined,
            specialties: newUserData.specialties || undefined,
        };

        setMockUserProfiles(prev => ({
            ...prev,
            [newUid]: newUserProfile
        }));
        setUserId(newUid);
        setUserProfileState(newUserProfile);
        setUserRole(newUserProfile.role);
        setIsPaidMember(newUserProfile.isPaidMember);
        setMessage({ type: 'success', text: `Welcome, ${newUserData.name}! You are now registered as a ${roleType} (mock).` });
        setCurrentPage('dashboard');
        setShowRegisterModal(false);
    };

    const handleBecomePaidMember = (newUserData, selectedPlanDetails) => {
        // This will trigger Paystack payment and rely on webhook for DB update
        let existingUser = mockUserProfiles[userId];
        const newUid = userRole === 'loggedOut' ? crypto.randomUUID() : userId;

        const updatedProfile = {
            ...existingUser,
            uid: newUid,
            name: newUserData.name || existingUser?.name || `New Member ${newUid.substring(0,4)}`,
            email: newUserData.email || existingUser?.email || `newmember-${newUid.substring(0,4)}@example.com`,
            phone: newUserData.phone || existingUser?.phone || '',
            role: 'member',
            isPaidMember: true,
            bio: newUserData.bio || existingUser?.bio || '',
            address: newUserData.address || existingUser?.address || '',
            companyName: undefined,
            specialties: undefined,
            isProviderApproved: undefined,
        };
        setMockUserProfiles(prev => ({
            ...prev,
            [newUid]: updatedProfile
        }));
        setUserId(newUid);
        setUserProfileState(updatedProfile);
        setUserRole('member');
        setIsPaidMember(true);
        setSelectedPlan(null);
        setMessage({ type: 'success', text: `Congratulations! You are now a Paid Member (${selectedPlanDetails.name}) (mock).` });
        setCurrentPage('problems');
    };

    // This mock login will be removed for production Auth0 login
    const handleLoginAs = (targetUid) => {
        let newUserId;
        let newProfile;
        if (targetUid === 'loggedOut') {
            newUserId = crypto.randomUUID();
            newProfile = {
                uid: '',
                name: 'Guest User',
                email: '',
                phone: '',
                role: 'loggedOut',
                isProviderApproved: false,
                isPaidMember: false,
                bio: '',
                address: ''
            };
        } else {
            newUserId = targetUid;
            newProfile = mockUserProfiles[targetUid];
        }
        setUserId(newUserId);
        setUserProfileState(newProfile);
        setUserRole(newProfile.role);
        setIsPaidMember(newProfile.isPaidMember || false);
        setCurrentPage('dashboard');
        setMessage({ type: '', text: '' });
    };

    // --- Branding Management (manage:branding) ---
    const handleUpdateBranding = (newName, newLogo) => {
        // API call to update branding in Neon DB
        setAppName(newName);
        setAppLogo(newLogo);
        setMessage({ type: 'success', text: 'Branding updated successfully (mock).' });
    };

    // --- Pricing Plan Management (manage:pricing_plans) ---
    const handleSavePricingPlan = (plan) => {
        // API call to save/update pricing plan in Neon DB
        setMockPricingPlans(prev => {
            if (plan.id) {
                return prev.map(p => p.id === plan.id ? plan : p);
            } else {
                return [...prev, { ...plan, id: crypto.randomUUID() }];
            }
        });
        setMessage({ type: 'success', text: 'Pricing plan saved successfully (mock).' });
    };

    const handleDeletePricingPlan = (planId, planName) => {
        setConfirmationMessage(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`);
        setConfirmationAction(() => () => {
            // API call to delete pricing plan from Neon DB
            setMockPricingPlans(prev => prev.filter(p => p.id !== planId));
            setMessage({ type: 'success', text: `Plan "${planName}" deleted (mock).` });
            setShowConfirmationModal(false);
        });
        setShowConfirmationModal(true);
    };

    const handleApproveProvider = (providerId) => {
        // API call to update provider status in Neon DB
        setMockUserProfiles(prevProfiles => ({
            ...prevProfiles,
            [providerId]: { ...prevProfiles[providerId], isProviderApproved: true }
        }));
        setMessage({ type: 'success', text: `Provider ${mockUserProfiles[providerId]?.name} approved (mock).` });
    };

    const handleDeleteProvider = (providerId) => {
        setConfirmationMessage("Are you sure you want to delete this provider? This will remove their profile.");
        setConfirmationAction(() => () => {
            // API call to delete provider from Neon DB
            setMockUserProfiles(prevProfiles => {
                const newProfiles = { ...prevProfiles };
                delete newProfiles[providerId];
                return newProfiles;
            });
            setMessage({ type: 'success', text: `Provider ${mockUserProfiles[providerId]?.name} deleted (mock).` });
            setShowConfirmationModal(false);
        });
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
        statusText = userProfile?.isProviderApproved ? 'Approved Provider' : 'Pending Approval';
        statusColorClass = userProfile?.isProviderApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    } else { // member
        statusText = isPaidMember ? 'Paid Member' : 'Free Member';
        statusColorClass = isPaidMember ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    }

    return (
        <AppContext.Provider value={{
            userId, userProfile, userRole, isPaidMember, currentPage, loading, message, appName, appLogo,
            mockProblems, mockUserProfiles, mockPricingPlans, selectedPlan,
            setUserId, setUserProfileState, setUserRole, setIsPaidMember, setCurrentPage, setLoading, setMessage,
            setAppName, setAppLogo, setMockProblems, setMockUserProfiles, setMockPricingPlans, setSelectedPlan,
            handlePostProblem, handleRegister, handleBecomePaidMember, handleLoginAs, // handleLoginAs will eventually be removed
            setShowPostProblemModal, showPostProblemModal, setShowRegisterModal, showRegisterModal,
            handleDeleteProblem, handleEditProblem, handleApproveProblem, handleMarkProblemResolved,
            handleSubmitQuote, handleAcceptQuote, handleWithdrawQuote, handleEditQuote,
            handleUpdateBranding, handleSavePricingPlan, handleDeletePricingPlan,
            setShowBecomeProviderModal, handleApproveProvider, handleDeleteProvider
        }}>
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
                        <p className="text-sm text-gray-200 mt-1">ID: {userId || 'N/A'}</p>
                        {/* Conditional rendering for the "Switch User" dropdown based on enableDevFeatures */}
                        {enableDevFeatures && userRole !== 'loggedOut' && (
                            <div className="mt-4 flex flex-col space-y-2">
                                <label className="text-sm text-gray-200">Switch User (Dev Only):</label>
                                <select
                                    onChange={(e) => handleLoginAs(e.target.value)}
                                    value={userId}
                                    className="p-2 rounded-md bg-[#7a3d00] text-white text-sm"
                                >
                                    <option value="loggedOut">Log Out / Guest</option>
                                    <option value="mock-member-alice">Login as Alice (Paid Member)</option>
                                    <option value="mock-member-bob">Login as Bob (Free Member)</option>
                                    <option value="mock-provider-alpha">Login as Alpha (Approved Provider)</option>
                                    <option value="mock-provider-charlie">Login as Charlie (Pending Provider)</option>
                                    <option value="admin-user">Login as Admin</option>
                                    {/* Dynamically add other mock users if they register */}
                                    {Object.values(mockUserProfiles)
                                        .filter(u => !['mock-member-alice', 'mock-member-bob', 'mock-provider-alpha', 'mock-provider-charlie', 'admin-user', ''].includes(u.uid))
                                        .map(u => (
                                            <option key={u.uid} value={u.uid}>
                                                {u.name} ({u.role} - {u.isPaidMember ? 'Paid' : (u.isProviderApproved ? 'Approved' : 'Pending')})
                                            </option>
                                        ))
                                    }
                                </select>
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
                        {userRole !== 'loggedOut' ? (
                            <button
                                onClick={() => handleLoginAs('loggedOut')} // This will eventually be Auth0 logout
                                className="flex items-center w-full px-4 py-3 text-lg text-red-300 rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                                <LogOutIcon size={20} className="mr-3" /> Log Out
                            </button>
                        ) : (
                            <div className="flex justify-center space-x-2">
                                <button
                                    onClick={() => {/* Implement Auth0 Login */ setMessage({type: 'info', text: 'Auth0 Login integration coming soon!'})}}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setShowRegisterModal(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                                >
                                    Register / Sign Up
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
                    {message.text && (
                        <div className={`p-3 text-white text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Page Content based on currentPage state */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {(() => {
                            switch (currentPage) {
                                case 'dashboard':
                                    return userRole === 'provider' ?
                                        <ProviderDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} /> :
                                        <MemberDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} />;
                                case 'profile':
                                    return <ProfilePage />;
                                case 'problems':
                                    return <ProblemListPage onNavigate={setCurrentPage} setShowPostProblemModal={setShowPostProblemModal} />;
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
                                    const problemId = window.location.hash.split('/').pop();
                                    const problem = mockProblems.find(p => p.id === problemId);
                                    return problem ? <ProblemDetailPage problem={problem} onNavigate={setCurrentPage} /> : <p className="text-red-500">Problem not found.</p>;
                                default:
                                    return <ProblemListPage onNavigate={setCurrentPage} setShowPostProblemModal={setShowPostProblemModal} />;
                            }
                        })()}
                    </div>
                </main>

                {/* --- Modals --- */}
                {showPostProblemModal && (
                    <PostProblemModal
                        onClose={() => setShowPostProblemModal(false)}
                        onSave={handlePostProblem}
                        activeProblemsCount={mockProblems.filter(p => p.requesterId === userId && p.status === 'open').length}
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
                        mockUserProfiles={mockUserProfiles}
                        onNavigate={setCurrentPage} // Pass onNavigate for 'Back to Problems' button
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
                        problemTitle={mockProblems.find(p => p.id === editingQuote.problemId)?.title}
                    />
                )}

                {showRegisterModal && (
                    <RegistrationPage
                        onClose={() => setShowRegisterModal(false)}
                        onRegister={handleRegister}
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
                        onRegister={handleRegister}
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
// =========================================================================


// --- Dashboard Components ---

const ProviderDashboardPage = ({ userProfile, onNavigate }) => {
    const { userId, mockProblems } = useContext(AppContext);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const [pendingQuotes, setPendingQuotes] = useState(0);

    useEffect(() => {
        let providerQuotes = [];
        mockProblems.forEach(problem => {
            problem.quotes.forEach(quote => {
                if (quote.providerId === userId) {
                    providerQuotes.push({ ...quote, problemTitle: problem.title });
                }
            });
        });
        setTotalQuotes(providerQuotes.length);
        setPendingQuotes(providerQuotes.filter(quote => quote.status === 'pending').length);
    }, [mockProblems, userId]);

    const sortedMyQuotes = [...mockProblems.flatMap(problem =>
        problem.quotes.filter(quote => quote.providerId === userId)
            .map(quote => ({ ...quote, problemTitle: problem.title, problemStatus: problem.status }))
    )].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());


    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Provider Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Provider Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <BriefcaseIcon className="text-[#964b00]" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Provider Status</h3>
                        <p className={`text-xl font-bold ${userProfile?.isProviderApproved ? 'text-green-600' : 'text-red-600'}`}>
                            {userProfile?.isProviderApproved ? 'Approved' : 'Pending Approval'}
                        </p>
                        {!userProfile?.isProviderApproved && (
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
                            onClick={() => onNavigate('my-quotes')}
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
                            onClick={() => onNavigate('problems')}
                            className="flex items-center w-full px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 shadow-md"
                        >
                            <FileTextIcon size={20} className="mr-2" />
                            View Problem List
                        </button>
                        <button
                            onClick={() => onNavigate('profile')}
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
                                        <td className="py-2 px-4">{quote.createdAt?.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button
                    onClick={() => onNavigate('my-quotes')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Go to My Quotes
                </button>
            </div>
        </div>
    );
};

const MemberDashboardPage = ({ userProfile, onNavigate }) => {
    const { isPaidMember, userId, mockProblems, setShowPostProblemModal, setShowBecomeProviderModal } = useContext(AppContext);
    const [myProblemsCount, setMyProblemsCount] = useState(0);
    const [recentQuotes, setRecentQuotes] = useState([]);

    useEffect(() => {
        let memberProblems = mockProblems.filter(p => p.requesterId === userId);
        setMyProblemsCount(memberProblems.length);

        let collectedRecentQuotes = [];
        memberProblems.forEach(problem => {
            problem.quotes.forEach(quote => {
                collectedRecentQuotes.push({
                    ...quote,
                    problemTitle: problem.title,
                    problemStatus: problem.status,
                    problemId: problem.id
                });
            });
        });
        setRecentQuotes(collectedRecentQuotes.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [mockProblems, userId]);

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
                            onClick={() => onNavigate('my-requests')}
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
                            onClick={() => onNavigate('problems')}
                            className="flex items-center w-full px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 shadow-md"
                        >
                            <FileTextIcon size={20} className="mr-2" />
                            View Public Problems
                        </button>
                        {userProfile.role === 'member' && (
                            <button
                                onClick={() => setShowPostProblemModal(true)}
                                className="flex items-center w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md"
                            >
                                <PlusCircleIcon size={20} className="mr-2" />
                                Post New Problem
                            </button>
                        )}
                        {!isPaidMember && userProfile.role === 'member' && (
                             <button
                                onClick={() => onNavigate('pricing')}
                                className="flex items-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md"
                            >
                                <DollarSignIcon size={20} className="mr-2" />
                                Become a Paid Member
                            </button>
                        )}
                        {userProfile.role === 'member' && !userProfile.isProviderApproved && (
                             <button
                                onClick={() => setShowBecomeProviderModal(true)}
                                className="flex items-center w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 shadow-md"
                            >
                                <BriefcaseIcon size={20} className="mr-2" />
                                Register as a Provider
                            </button>
                        )}
                        <button
                            onClick={() => onNavigate('profile')}
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
                {recentQuotes.length === 0 || userProfile.role === 'loggedOut' ? (
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
                                        <td className="py-2 px-4">{quote.createdAt?.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <button
                    onClick={() => onNavigate('my-requests')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Go to My Requests
                </button>
            </div>
        </div>
    );
};

// --- General Pages ---

const RegistrationPage = ({ onClose, onRegister }) => {
    const { setMessage } = useContext(AppContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('member');
    const [companyName, setCompanyName] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [bio, setBio] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email || !password || !role) {
            setFormError('Name, Email, Password, and Role are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        if (role === 'provider' && (!companyName || !specialties)) {
            setFormError('For providers, Company Name and Specialties are required.');
            return;
        }

        onRegister({ name, email, password, phone, address, companyName, specialties, bio }, role, false);
        setMessage({type: 'success', text: `Registration successful! Welcome, ${name}.`});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Register a New Account</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regName">Full Name</label>
                        <input type="text" id="regName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regEmail">Email</label>
                        <input type="email" id="regEmail" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regPassword">Password</label>
                        <input type="password" id="regPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regPhone">Phone (Optional)</label>
                        <input type="tel" id="regPhone" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regAddress">Address (Optional)</label>
                        <textarea id="regAddress" rows="2" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regRole">Register as:</label>
                        <select id="regRole" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={role} onChange={(e) => setRole(e.target.value)} required>
                            <option value="member">Member</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>
                    {role === 'provider' && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">Company Name</label>
                                <input type="text" id="companyName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required={role === 'provider'} />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialties">Specialties (e.g., Plumbing, Electrical)</label>
                                <input type="text" id="specialties" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={specialties} onChange={(e) => setSpecialties(e.target.value)} required={role === 'provider'} />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regBio">Bio (Optional)</label>
                        <textarea id="regBio" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Register</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BecomeProviderModal = ({ onClose, onRegister }) => {
    const { userProfile, setMessage } = useContext(AppContext);
    const [companyName, setCompanyName] = useState(userProfile.companyName || '');
    const [specialties, setSpecialties] = useState(userProfile.specialties || '');
    const [bio, setBio] = useState(userProfile.bio || '');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!companyName || !specialties) {
            setFormError('Company Name and Specialties are required.');
            return;
        }

        const updatedUserData = {
            ...userProfile,
            companyName,
            specialties,
            bio: bio || userProfile.bio,
        };

        onRegister(updatedUserData, 'provider', userProfile.isPaidMember);
        setMessage({type: 'success', text: `You are now registered as a Provider! Awaiting admin approval (mock).`});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
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
    const { setSelectedPlan, setMessage, mockPricingPlans } = useContext(AppContext);

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
                {mockPricingPlans.length === 0 ? (
                    <p className="text-gray-600 col-span-full text-center">No pricing plans available. Please check back later. (Admin can add them)</p>
                ) : (
                    mockPricingPlans.map(plan => (
                        <div key={plan.id} className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-2xl font-bold text-[#964b00] mb-2">{plan.name}</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mb-4">{plan.price}</p>
                            <ul className="text-gray-700 space-y-2 mb-6 text-left w-full">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircle2Icon size={18} className="text-green-500 mr-2" />
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
    const [password, setPassword] = useState('');
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email || !password) {
            setFormError('Name, Email, and Password are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        // Open Paystack payment link
        const paystackPaymentLink = `https://paystack.com/pay/${plan.planCode || 'default_plan_code'}`;
        window.open(paystackPaymentLink, '_blank');

        // This will now rely on Paystack webhook to update the user status
        onCompleteSignUp({ name, email, password, phone, address }, plan);
        onClose();
        setMessage({type: 'info', text: 'Redirecting to Paystack. Your membership will be updated upon successful payment confirmation!'});
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Sign Up for {plan.name} Plan</h3>
                <p className="text-gray-700 mb-4">Complete your details to proceed to payment.</p>
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
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupPassword">Password</label>
                        <input type="password" id="signupPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                            Proceed to Payment ({plan.price})
                        </button>
                        {/* Removed the "Simulate Payment Success" button */}
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
    const { userProfile, setUserProfileState, mockUserProfiles, setMockUserProfiles, setMessage } = useContext(AppContext);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', bio: '', address: '', companyName: '', specialties: '',
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '', email: userProfile.email || '', phone: userProfile.phone || '',
                bio: userProfile.bio || '', address: userProfile.address || '',
                companyName: userProfile.companyName || '', specialties: userProfile.specialties || '',
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // API call to update user profile in Neon DB
        const updatedProfile = { ...userProfile, ...formData };
        setUserProfileState(updatedProfile);
        setMockUserProfiles(prev => ({
            ...prev,
            [userProfile.uid]: updatedProfile
        }));
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully (mock)!' });
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
                    {userProfile.role === 'provider' && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                                {editMode ? ( <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/> ) : ( <p className="text-gray-900 text-lg">{userProfile?.companyName || 'N/A'}</p> )}
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
                    <button onClick={() => { setEditMode(false); setMessage({ type: '', text: '' }); }} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                    <button type="submit" onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Save Changes</button>
                </div>
            )}
        </div>
    );
};

// Added setShowPostProblemModal to ProblemListPage props
const ProblemListPage = ({ onNavigate, setShowPostProblemModal }) => {
    const { userRole, userId, mockProblems, setMessage } = useContext(AppContext);

    const [filterCategory, setFilterCategory] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const uniqueCategories = ['All', ...new Set(mockProblems.map(p => p.category))];
    const uniqueLocations = ['All', ...new Set(mockProblems.map(p => p.location))];

    const filteredProblems = mockProblems.filter(problem => {
        if (userRole !== 'admin' && !problem.isApproved) {
            return false;
        }
        if (filterCategory !== 'All' && problem.category !== filterCategory) {
            return false;
        }
        if (filterLocation !== 'All' && problem.location !== filterLocation) {
            return false;
        }
        const budget = problem.estimatedBudget;
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
    }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

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
                            currentUserId={userId}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ProblemCard = ({ problem, userRole, currentUserId, onNavigate }) => {
    const handleViewDetails = () => {
        window.location.hash = `problem-detail/${problem.id}`;
        onNavigate('problem-detail');
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 rounded-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{problem.title}</h3>
            <p className="text-gray-700 mb-2 text-sm truncate">{problem.description}</p>
            <p className="text-gray-600 font-medium text-xs">Category: {problem.category || 'General'}</p>
            <p className="text-gray-600 font-medium text-xs">Location: {problem.location || 'N/A'}</p>
            <p className="text-gray-600 font-medium text-xs">Budget: R{problem.estimatedBudget?.toFixed(2) || 'N/A'}</p>
            <p className="text-gray-600 font-medium text-xs">Status: <span className="capitalize">{problem.status}</span></p>
            <p className="text-gray-500 text-xs mt-1">Posted: {problem.createdAt?.toLocaleDateString()}</p>
            {!problem.isApproved && (
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
const ProblemDetailPage = ({ problem, onNavigate, onClose, onSave, onAcceptQuote, onDeleteProblem, onMarkResolved, mockUserProfiles }) => {
    const { userRole, userId, isPaidMember, setMessage, handleSubmitQuote } = useContext(AppContext);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null);
    const [showConfirmModalLocal, setShowConfirmModalLocal] = useState(false);


    const [formData, setFormData] = useState({
        title: problem.title, description: problem.description, category: problem.category,
        location: problem.location, estimatedBudget: problem.estimatedBudget,
    });

    useEffect(() => {
        setFormData({
            title: problem.title, description: problem.description, category: problem.category,
            location: problem.location, estimatedBudget: problem.estimatedBudget,
        });
    }, [problem]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLocal = (e) => {
        e.preventDefault();
        onSave(problem.id, formData);
        setMessage({ type: 'success', text: 'Problem updated successfully (mock).' });
    };


    const isRequester = userRole === 'member' && problem.requesterId === userId;
    const isProblemOpen = problem.status === 'open';
    const hasAcceptedQuote = problem.status === 'closed' && problem.acceptedQuoteId;

    const triggerConfirmation = (message, action) => {
        setConfirmModalMessage(message);
        setConfirmModalAction(() => action);
        setShowConfirmModalLocal(true);
    };

    // Determine if this component is rendered as a modal or a page based on 'onClose' prop
    const isModal = typeof onClose === 'function';

    return (
        <div className={`bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-md ${isModal ? 'fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50' : ''}`}>
            <div className={isModal ? 'bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-md' : ''}> {/* Adjusted max-h for mobile */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{problem.title}</h2>
                <form onSubmit={handleSaveLocal}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="edit-problem-title" className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="edit-problem-title" name="title" value={formData.title} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requesterId !== userId} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-problem-category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" id="edit-problem-category" name="category" value={formData.category} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requesterId !== userId} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-problem-description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="edit-problem-description" name="description" value={formData.description} onChange={handleChange} rows="3" readOnly={userRole !== 'admin' && problem.requesterId !== userId} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="edit-problem-location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" id="edit-problem-location" name="location" value={formData.location} onChange={handleChange} readOnly={userRole !== 'admin' && problem.requesterId !== userId} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="edit-problem-budget" className="block text-sm font-medium text-gray-700">Estimated Budget (R)</label>
                            <input type="number" id="edit-problem-budget" name="estimatedBudget" value={formData.estimatedBudget} step="0.01" onChange={handleChange} readOnly={userRole !== 'admin' && problem.requesterId !== userId} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <p className="mt-1 text-lg font-bold text-gray-900 capitalize">{problem.status}</p>
                    </div>

                    <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Quotes for this Problem</h3>
                    {problem.quotes.length === 0 ? (
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
                                    {problem.quotes.map(quote => (
                                        <tr key={quote.id}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{isPaidMember || quote.status === 'accepted' || userRole === 'admin' ? quote.providerName : 'Confidential'}</div></td>
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 mt-6">
                        {isModal ? (
                            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Close</button>
                        ) : (
                            <button type="button" onClick={() => onNavigate('problems')} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Back to Problems</button>
                        )}
                        {(userRole === 'admin' || isRequester) && isProblemOpen && (
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">Save Changes</button>
                        )}
                        {isRequester && problem.status === 'closed' && hasAcceptedQuote && (
                            <button onClick={() => triggerConfirmation("Are you sure you want to mark this problem as resolved?", () => onMarkResolved(problem.id))} className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200">Mark as Resolved</button>
                        )}
                        {(userRole === 'admin' || isRequester) && (
                            <button onClick={() => triggerConfirmation("Are you sure you want to delete this problem and all associated quotes?", () => onDeleteProblem(problem.id))} className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200">Delete Problem</button>
                        )}
                    </div>
                </form>

                {showConfirmModalLocal && (
                    <ConfirmationModal message={confirmModalMessage} onConfirm={confirmModalAction} onCancel={() => setShowConfirmModalLocal(false)}/>
                )}
                 {showQuoteForm && (
                    <QuoteModal
                        onClose={() => setShowQuoteForm(false)}
                        onSubmit={(quoteData) => handleSubmitQuote(problem.id, quoteData)}
                        problemTitle={problem.title}
                        problemId={problem.id}
                    />
                )}
            </div>
        </div>
    );
};


const PostProblemModal = ({ onClose, onSave, activeProblemsCount, isPaidMember }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [formError, setFormError] = useState('');

    const MAX_FREE_PROBLEMS = 5;

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!title || !description || !category || !location || !estimatedBudget) {
            setFormError('All fields are required.');
            return;
        }
        if (isNaN(estimatedBudget) || parseFloat(estimatedBudget) <= 0) {
            setFormError('Budget must be a positive number.');
            return;
        }

        if (!isPaidMember && activeProblemsCount >= MAX_FREE_PROBLEMS) {
            setFormError(`Free members are limited to ${MAX_FREE_PROBLEMS} active problems. Please upgrade to post more.`);
            return;
        }

        onSave({ title, description, category, location, estimatedBudget });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Post a New Problem</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemTitle">Problem Title</label>
                        <input type="text" id="problemTitle" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemDescription">Description</label>
                        <textarea id="problemDescription" rows="4" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={description} onChange={(e) => setDescription(e.target.value)} required ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemCategory">Category</label>
                        <input type="text" id="problemCategory" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemLocation">Location</label>
                        <input type="text" id="problemLocation" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={location} onChange={(e) => setLocation(e.target.value)} required />
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
    const { handleSubmitQuote } = useContext(AppContext);
    const [proposedStartDate, setProposedStartDate] = useState('');
    const [proposedEndDate, setProposedEndDate] = useState('');
    const [proposedBudget, setProposedBudget] = useState('');
    const [motivation, setMotivation] = useState('');
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!proposedStartDate || !proposedEndDate || !proposedBudget || !motivation) {
            setFormError('All fields are required.');
            return;
        }
        if (isNaN(proposedBudget) || parseFloat(proposedBudget) <= 0) {
            setFormError('Proposed Budget must be a positive number.');
            return;
        }
        if (new Date(proposedStartDate) > new Date(proposedEndDate)) {
            setFormError('Proposed Start Date cannot be after Proposed End Date.');
            return;
        }

        onSubmit(problemId, { proposedStartDate, proposedEndDate, proposedBudget: parseFloat(proposedBudget), motivation });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit a Quote for "{problemTitle}"</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedStartDate">Proposed Start Date</label>
                        <input type="date" id="proposedStartDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedStartDate} onChange={(e) => setProposedStartDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedEndDate">Proposed End Date</label>
                        <input type="date" id="proposedEndDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedEndDate} onChange={(e) => setProposedEndDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedBudget">Proposed Budget (R)</label>
                        <input type="number" id="proposedBudget" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proposedBudget} onChange={(e) => setProposedBudget(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motivation">Motivation / Details of Work</label>
                        <textarea id="motivation" rows="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={motivation} onChange={(e) => setMotivation(e.target.value)} required></textarea>
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200">Submit Quote</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditQuoteModal = ({ quote, onClose, onSave, problemTitle }) => {
    const [formData, setFormData] = useState({
        amount: quote.amount,
        details: quote.details,
        proposedStartDate: quote.proposedStartDate,
        proposedEndDate: quote.proposedEndDate,
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!formData.proposedStartDate || !formData.proposedEndDate || !formData.amount || !formData.details) {
            setFormError('All fields are required.');
            return;
        }
        if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            setFormError('Proposed Budget must be a positive number.');
            return;
        }
        if (new Date(formData.proposedStartDate) > new Date(formData.proposedEndDate)) {
            setFormError('Proposed Start Date cannot be after Proposed End Date.');
            return;
        }

        onSave(quote.problemId, quote.id, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Quote for "{problemTitle}"</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteAmount">Quoted Amount (R)</label>
                        <input type="number" id="editQuoteAmount" name="amount" step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.amount} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteDetails">Details</label>
                        <textarea id="editQuoteDetails" name="details" rows="3" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.details} onChange={handleChange} required></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteStartDate">Proposed Start Date</label>
                        <input type="date" id="editQuoteStartDate" name="proposedStartDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.proposedStartDate} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editQuoteEndDate">Proposed End Date</label>
                        <input type="date" id="editQuoteEndDate" name="proposedEndDate" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.proposedEndDate} onChange={handleChange} required />
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

const MyQuotesPage = () => {
    const { userId, mockProblems, handleWithdrawQuote, handleEditQuote } = useContext(AppContext);
    const [myQuotes, setMyQuotes] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [editingQuoteLocal, setEditingQuoteLocal] = useState(null);

    useEffect(() => {
        // This data will be fetched from Neon DB via Netlify Functions
        let providerQuotes = [];
        mockProblems.forEach(problem => {
            problem.quotes.forEach(quote => {
                if (quote.providerId === userId) {
                    providerQuotes.push({
                        ...quote,
                        problemId: problem.id,
                        problemTitle: problem.title,
                        problemStatus: problem.status
                    });
                }
            });
        });
        setMyQuotes(providerQuotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [mockProblems, userId]);

    const triggerConfirmation = (message, action) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <PackageIcon size={28} className="mr-3 text-[#964b00]" /> My Submitted Quotes
            </h2>

            {myQuotes.length === 0 ? (
                <p className="text-gray-600">You haven't submitted any quotes yet. Browse the Problem List to find opportunities!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Problem Title</th>
                                <th className="py-3 px-6 text-left">Amount</th>
                                <th className="py-3 px-6 text-left">Details</th>
                                <th className="py-3 px-6 text-left">Status</th>
                                <th className="py-3 px-6 text-center">Problem Status</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {myQuotes.map(quote => (
                                <tr key={quote.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left whitespace-nowrap">{quote.problemTitle || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left">R{quote.amount?.toFixed(2) || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left max-w-xs overflow-hidden text-ellipsis">{quote.details || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                     <td className="py-3 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                            quote.problemStatus === 'open' ? 'bg-gray-100 text-gray-800' :
                                            quote.problemStatus === 'closed' ? 'bg-blue-100 text-blue-800' :
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {quote.problemStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        {quote.status === 'pending' && quote.problemStatus === 'open' && (
                                            <>
                                                <button onClick={() => setEditingQuoteLocal(quote)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs mr-2">Edit</button>
                                                <button onClick={() => triggerConfirmation("Are you sure you want to withdraw this quote?", () => handleWithdrawQuote(quote.problemId, quote.id))} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs">Withdraw</button>
                                            </>
                                        )}
                                        {quote.status === 'accepted' && ( <span className="text-green-600 text-sm font-bold">Accepted!</span> )}
                                        {quote.status === 'pending' && (quote.problemStatus === 'closed' || quote.problemStatus === 'resolved') && ( <span className="text-gray-500 text-xs">Problem {quote.problemStatus}</span> )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showConfirmModal && ( <ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setShowConfirmModal(false)}/> )}
            {editingQuoteLocal && ( <EditQuoteModal quote={editingQuoteLocal} onClose={() => setEditingQuoteLocal(null)} onSave={handleEditQuote} problemTitle={myQuotes.find(q => q.id === editingQuoteLocal.id)?.problemTitle}/> )}
        </div>
    );
};

const MyRequestsPage = () => {
    const { userId, mockProblems, isPaidMember, handleAcceptQuote, handleMarkProblemResolved, handleDeleteProblem } = useContext(AppContext);
    const [myProblems, setMyProblems] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    useEffect(() => {
        // This data will be fetched from Neon DB via Netlify Functions
        const memberProblems = mockProblems.filter(problem => problem.requesterId === userId);
        setMyProblems(memberProblems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [mockProblems, userId]);

    const triggerConfirmation = (message, action) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    if (!isPaidMember) {
        return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center py-12 rounded-md"> {/* Added rounded-md */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-700 mb-6">
            You must be a <strong>paid member</strong> to view and manage quotes for your problems.
            Free members can post problems (limit 5) but require a paid membership for full interaction.
            </p>
            <button onClick={() => window.location.hash = 'pricing'} className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
            Upgrade Membership
            </button>
        </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <FileTextIcon size={28} className="mr-3 text-[#964b00]" /> My Posted Problems & Quotes
            </h2>

            {myProblems.length === 0 ? (
                <p className="text-gray-600">You haven't posted any problems yet. Click "Post New Problem" on the Problem List page!</p>
            ) : (
                <div className="space-y-6">
                    {myProblems.map(problem => (
                        <div key={problem.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 rounded-md"> {/* Added rounded-md */}
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold text-gray-800">{problem.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                    problem.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                                    problem.status === 'closed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {problem.status}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-2">{problem.description}</p>
                            <p className="text-gray-600 text-sm">Category: {problem.category}</p>
                            <p className="text-gray-500 text-xs mt-1">Posted: {problem.createdAt?.toLocaleString()}</p>
                            {!problem.isApproved && (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full mt-2 inline-block">Awaiting Admin Approval</span>
                            )}

                            <div className="mt-4 flex space-x-3">
                                <button onClick={() => {
                                    window.location.hash = `problem-detail/${problem.id}`;
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                                >
                                    <PackageIcon size={18} className="mr-2" /> View Quotes ({problem.quotes?.length || 0})
                                </button>
                                {problem.status === 'open' && (
                                    <button onClick={() => triggerConfirmation("Are you sure you want to delete this problem and all its quotes?", () => handleDeleteProblem(problem.id))} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm flex items-center">
                                        <XCircleIcon size={18} className="mr-2" /> Delete Problem
                                    </button>
                                )}
                                {(problem.status === 'closed' && problem.acceptedQuoteId) && (
                                    <button onClick={() => triggerConfirmation("Are you sure you want to mark this problem as resolved? This cannot be undone.", () => handleMarkProblemResolved(problem.id))} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm flex items-center">
                                        <CheckCircleIcon size={18} className="mr-2" /> Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {showConfirmModal && (<ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setShowConfirmModal(false)}/>)}
        </div>
    );
};

const AdminToolsPage = () => {
    const { userRole, mockProblems, setMockProblems, mockUserProfiles, handleApproveProvider, handleDeleteProvider, setMessage } = useContext(AppContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12 rounded-md"> {/* Added rounded-md */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleApproveProblemLocal = (problemId) => {
        // API call to approve problem in Neon DB
        setMockProblems(prevProblems =>
            prevProblems.map(problem =>
                problem.id === problemId ? { ...problem, isApproved: true } : problem
            )
        );
        setMessage({ type: 'success', text: `Problem ${problemId} approved (mock).` });
    };

    const handleDeleteProblemLocal = (problemId) => {
        setConfirmMessage("Are you sure you want to delete this problem and all its quotes? This is permanent.");
        setConfirmAction(() => () => {
            // API call to delete problem from Neon DB
            setMockProblems(prevProblems => prevProblems.filter(problem => problem.id !== problemId));
            setMessage({ type: 'success', text: `Problem ${problemId} deleted (mock).` });
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const problemsAwaitingApproval = mockProblems.filter(p => !p.isApproved);
    const pendingProviderApprovals = Object.values(mockUserProfiles).filter(p => p.role === 'provider' && !p.isProviderApproved);
    const allProviders = Object.values(mockUserProfiles).filter(p => p.role === 'provider');


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ShieldCheckIcon size={28} className="mr-3 text-[#964b00]" /> Admin Tools
            </h2>

            <div className="space-y-8">
                {/* Admin Quick Actions */}
                <div className="border border-gray-200 rounded-lg p-4 rounded-md"> {/* Added rounded-md */}
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Admin Quick Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => window.location.hash = 'admin-pricing'} className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center justify-center">
                            <DollarSignIcon size={20} className="mr-2" /> Manage Pricing Plans
                        </button>
                        <button onClick={() => window.location.hash = 'admin-branding'} className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center justify-center">
                            <PaintbrushIcon size={20} className="mr-2" /> Manage Branding
                        </button>
                    </div>
                </div>

                {/* Problem Management */}
                <div className="border border-gray-200 rounded-lg p-4 rounded-md"> {/* Added rounded-md */}
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Problem Management</h3>
                    <h4 className="text-lg font-semibold text-gray-600 mb-3">Problems Awaiting Approval ({problemsAwaitingApproval.length})</h4>
                    {problemsAwaitingApproval.length === 0 ? (
                        <p className="text-gray-500">No problems awaiting approval.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {problemsAwaitingApproval.map(problem => (
                                <li key={problem.id} className="py-2 flex justify-between items-center">
                                    <span>{problem.title} (by {mockUserProfiles[problem.requesterId]?.name || 'Unknown'})</span>
                                    <div>
                                        <button onClick={() => handleApproveProblemLocal(problem.id)} className="ml-3 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Approve</button>
                                        <button onClick={() => handleDeleteProblemLocal(problem.id)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                     <h4 className="text-lg font-semibold text-gray-600 mt-6 mb-3">All Problems ({mockProblems.length})</h4>
                     <ul className="divide-y divide-gray-200">
                        {mockProblems.map(problem => (
                            <li key={problem.id} className="py-2 flex justify-between items-center">
                                <span>{problem.title} ({problem.status} - {problem.isApproved ? 'Approved' : 'Pending'})</span>
                                <button onClick={() => handleDeleteProblemLocal(problem.id)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                            </li>
                        ))}
                     </ul>
                </div>

                {/* Provider Management */}
                <div className="border border-gray-200 rounded-lg p-4 rounded-md"> {/* Added rounded-md */}
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Provider Management</h3>
                    <h4 className="text-lg font-semibold text-gray-600 mb-3">Providers Awaiting Approval ({pendingProviderApprovals.length})</h4>
                    {pendingProviderApprovals.length === 0 ? (
                        <p className="text-gray-500">No providers awaiting approval.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {pendingProviderApprovals.map(provider => (
                                <li key={provider.uid} className="py-2 flex justify-between items-center">
                                    <span>{provider.name} ({provider.companyName || 'N/A'})</span>
                                    <div>
                                        <button onClick={() => handleApproveProvider(provider.uid)} className="ml-3 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Approve</button>
                                        <button onClick={() => handleDeleteProvider(provider.uid)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <h4 className="text-lg font-semibold text-gray-600 mt-6 mb-3">All Providers ({allProviders.length})</h4>
                     <ul className="divide-y divide-gray-200">
                        {allProviders.map(provider => (
                            <li key={provider.uid} className="py-2 flex justify-between items-center">
                                <span>{provider.name} ({provider.isProviderApproved ? 'Approved' : 'Pending'})</span>
                                <button onClick={() => handleDeleteProvider(provider.uid)} className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>
            {showConfirmModal && (<ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setShowConfirmModal(false)}/>)}
        </div>
    );
};

const AdminPricingPage = () => {
    const { userRole, mockPricingPlans, handleSavePricingPlan, handleDeletePricingPlan, setMessage } = useContext(AppContext);
    const [showEditPlanModal, setShowEditPlanModal] = useState(false);
    const [currentEditingPlan, setCurrentEditingPlan] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12 rounded-md"> {/* Added rounded-md */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleAddPlan = () => {
        setCurrentEditingPlan(null);
        setShowEditPlanModal(true);
    };

    const handleEditPlan = (plan) => {
        setCurrentEditingPlan(plan);
        setShowEditPlanModal(true);
    };

    const handleSavePlan = (updatedPlan) => {
        // API call to save/update pricing plan in Neon DB
        handleSavePricingPlan(updatedPlan);
        setMessage({ type: 'success', text: updatedPlan.id ? `Plan "${updatedPlan.name}" updated successfully (mock)!` : `New plan "${updatedPlan.name}" added successfully (mock)!` });
        setShowEditPlanModal(false);
    };

    const handleDeletePlan = (planId, planName) => {
        setConfirmMessage(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`);
        setConfirmAction(() => () => {
            // API call to delete pricing plan from Neon DB
            handleDeletePricingPlan(planId, planName);
            setMessage({ type: 'success', text: `Plan "${planName}" deleted (mock).` });
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <DollarSignIcon size={28} className="mr-3 text-[#964b00]" /> Manage Pricing Plans
                <button onClick={handleAddPlan} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center">
                    <PlusCircleIcon size={18} className="mr-2" /> Add New Plan
                </button>
            </h2>

            {mockPricingPlans.length === 0 ? (
                <p className="text-gray-600">No pricing plans defined. Add one to get started!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Plan Name</th>
                                <th className="py-3 px-6 text-left">Price</th>
                                <th className="py-3 px-6 text-left">Interval</th>
                                <th className="py-3 px-6 text-left">Plan Code</th>
                                <th className="py-3 px-6 text-left">Features</th>
                                <th className="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm font-light">
                            {mockPricingPlans.map(plan => (
                                <tr key={plan.id} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="py-3 px-6 text-left font-semibold">{plan.name}</td>
                                    <td className="py-3 px-6 text-left">{plan.price}</td>
                                    <td className="py-3 px-6 text-left capitalize">{plan.interval}</td>
                                    <td className="py-3 px-6 text-left font-mono text-xs">{plan.planCode || 'N/A'}</td>
                                    <td className="py-3 px-6 text-left">
                                        <ul className="list-disc list-inside">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="whitespace-nowrap overflow-hidden text-ellipsis">{feature}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="py-3 px-6 text-center whitespace-nowrap">
                                        <button onClick={() => handleEditPlan(plan)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs mr-2">Edit</button>
                                        <button onClick={() => handleDeletePlan(plan.id, plan.name)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showEditPlanModal && (<EditPricingPlanModal plan={currentEditingPlan} onClose={() => setShowEditPlanModal(false)} onSave={handleSavePlan}/>)}
             {showConfirmModal && (<ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setShowConfirmModal(false)}/>)}
        </div>
    );
};

const EditPricingPlanModal = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: plan?.id || null, name: plan?.name || '', price: String(plan?.rawPrice || ''),
        rawPrice: plan?.rawPrice || '', interval: plan?.interval || 'monthly',
        planCode: plan?.planCode || '', features: plan?.features?.join('\n') || '',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (plan) {
            setFormData({
                id: plan.id, name: plan.name, price: String(plan.rawPrice),
                rawPrice: plan.rawPrice, interval: plan.interval,
                planCode: plan.planCode, features: plan.features.join('\n'),
            });
        } else {
            setFormData({
                id: null, name: '', price: '', rawPrice: '', interval: 'monthly', planCode: '', features: '',
            });
        }
    }, [plan]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        const { name, price, interval, planCode, features } = formData;

        if (!name || !interval || !features) {
            setFormError('Name, Interval, and Features are required.');
            return;
        }

        const parsedPrice = parseFloat(price);
        if (interval !== 'custom' && (isNaN(parsedPrice) || parsedPrice <= 0)) {
            setFormError('Price must be a positive number for non-custom plans.');
            return;
        }
        if (interval !== 'custom' && !planCode) {
            setFormError('Paystack Plan Code is required for non-custom plans.');
            return;
        }


        const updatedPlan = {
            id: formData.id, name,
            price: interval === 'custom' ? 'Contact us for price' : `R${parsedPrice.toFixed(0)}/${interval}`,
            rawPrice: interval === 'custom' ? 0 : parsedPrice,
            interval,
            planCode: interval === 'custom' ? null : planCode,
            features: features.split('\n').map(f => f.trim()).filter(f => f),
        };

        onSave(updatedPlan);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto rounded-md"> {/* Added max-h-screen overflow-y-auto and rounded-md */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{plan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planName">Plan Name</label>
                        <input type="text" id="planName" name="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planInterval">Interval</label>
                        <select id="planInterval" name="interval" className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.interval} onChange={handleChange} required >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom (Contact us)</option>
                        </select>
                    </div>
                    {formData.interval !== 'custom' && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planPrice">Price (e.g., 50, 150)</label>
                                <input type="number" id="planPrice" name="price" step="1" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.price} onChange={handleChange} required={formData.interval !== 'custom'} />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planCode">Paystack Plan Code</label>
                                <input type="text" id="planCode" name="planCode" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.planCode} onChange={handleChange} required={formData.interval !== 'custom'} />
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planFeatures">Features (one per line)</label>
                        <textarea id="planFeatures" name="features" rows="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={formData.features} onChange={handleChange} required></textarea>
                    </div>

                    {formError && (<p className="text-red-500 text-sm">{formError}</p>)}

                    <div className="flex justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">{plan ? 'Save Changes' : 'Add Plan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminBrandingPage = () => {
    const { userRole, appName, appLogo, handleUpdateBranding, setMessage } = useContext(AppContext);
    const [tempAppName, setTempAppName] = useState(appName);
    const [tempAppLogo, setTempAppLogo] = useState(appLogo);

    useEffect(() => {
        setTempAppName(appName);
        setTempAppLogo(appLogo);
    }, [appName, appLogo]);

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12 rounded-md"> {/* Added rounded-md */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleSaveBranding = () => {
        if (tempAppLogo && !/^https?:\/\/.+\..+/.test(tempAppLogo)) {
            setMessage({ type: 'error', text: 'Please enter a valid URL for the logo (starts with http:// or https://).' });
            return;
        }
        handleUpdateBranding(tempAppName, tempAppLogo);
        setMessage({ type: 'success', text: 'Branding updated successfully (mock)!' });
    };

    const handleResetBranding = () => {
        handleUpdateBranding('Mphakathi Online', 'https://placehold.co/100x40/964b00/ffffff?text=Logo');
        setMessage({ type: 'info', text: 'Branding reset to default values (mock).' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <PaintbrushIcon size={28} className="mr-3 text-[#964b00]" /> Manage Branding
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="app-name-input">Application Name</label>
                    <input type="text" id="app-name-input" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={tempAppName} onChange={(e) => setTempAppName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="app-logo-input">Logo Image URL</label>
                    <input type="url" id="app-logo-input" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={tempAppLogo} onChange={(e) => setTempAppLogo(e.target.value)} placeholder="e.g., https://example.com/logo.png" />
                    {tempAppLogo && (
                        <div className="mt-4 p-2 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center">
                            <img src={tempAppLogo} alt="Current Logo Preview" className="max-w-xs max-h-24 object-contain rounded-md" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/cccccc/333333?text=Invalid+URL"; setMessage({ type: 'error', text: 'Invalid logo URL provided.' }); }} />
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={handleResetBranding} className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">Reset to Default</button>
                    <button onClick={handleSaveBranding} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = () => {
    const { userId, userRole, isPaidMember, userProfile, setUserProfileState, setMessage } = useContext(AppContext);
    // Local state for toggles, reflecting main App state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);

    // Mock toggles for isPaidMember and isProviderApproved for admin access only
    const handleTogglePaidMember = (e) => {
        setUserProfileState(prev => ({ ...prev, isPaidMember: e.target.checked }));
        setMessage({ type: 'info', text: 'Membership status updated (demo only). Upgrade via Pricing to persist.' });
    };

    const handleToggleProviderApproved = (e) => {
        setUserProfileState(prev => ({ ...prev, isProviderApproved: e.target.checked }));
        setMessage({ type: 'info', text: 'Provider approval status updated (demo only).' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <SettingsIcon size={28} className="mr-3 text-[#964b00]" /> Settings
            </h2>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md"> {/* Added rounded-md */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Account Information</h3>
                    <p className="text-gray-600">Your unique User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded-sm text-sm">{userId || 'N/A'}</span></p>
                    <p className="text-gray-600">Your Role: <span className="font-semibold capitalize">{userRole}</span></p>
                    {userRole === 'member' && (
                        <p className="text-gray-600">Membership Status: <span className={`font-semibold ${isPaidMember ? 'text-blue-600' : 'text-yellow-600'}`}>{isPaidMember ? 'Paid' : 'Free'}</span></p>
                    )}
                    {userRole === 'provider' && (
                        <p className="text-gray-600">Provider Status: <span className={`font-semibold ${userProfile.isProviderApproved ? 'text-green-600' : 'text-red-600'}`}>{userProfile.isProviderApproved ? 'Approved' : 'Pending Approval'}</span></p>
                    )}
                    <p className="text-gray-600 mt-2">Manage your public profile visibility and contact information from the Profile page.</p>

                    {/* Conditional rendering for admin overrides */}
                    {process.env.REACT_APP_ENABLE_DEV_FEATURES === 'true' && userRole === 'admin' && (
                        <div className="mt-4 border-t pt-4 border-gray-300">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Admin Overrides (Demo)</h4>
                            <div className="mt-2 flex items-center">
                                <input type="checkbox" id="adminPaidMemberToggle" className="mr-2" checked={isPaidMember} onChange={handleTogglePaidMember}/>
                                <label htmlFor="adminPaidMemberToggle" className="text-gray-700">Toggle Paid Member Status for Current User</label>
                            </div>
                            {userRole === 'provider' && (
                                <div className="mt-2 flex items-center">
                                    <input type="checkbox" id="adminProviderApprovedToggle" className="mr-2" checked={userProfile.isProviderApproved || false} onChange={handleToggleProviderApproved}/>
                                    <label htmlFor="adminProviderApprovedToggle" className="text-gray-700">Toggle Provider Approved Status for Current User</label>
                                </div>
                            )}
                        </div>
                    )}

                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md"> {/* Added rounded-md */}
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
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200 rounded-md"> {/* Added rounded-md */}
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Data Management</h3>
                    <p className="text-gray-600">Review and manage your data.</p>
                    <button className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200">
                        Export My Data
                    </button>
                </div>
            </div>
        </div>
    );
};
