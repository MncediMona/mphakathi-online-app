import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

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

const App = () => {
    // Mock user data (in-memory, resets on refresh)
    const [userId, setUserId] = useState(crypto.randomUUID()); // Generate a new ID on each load
    const [userProfile, setUserProfileState] = useState(() => {
        // Default to 'member' for initial load, can be toggled via mock login/role switch
        const initialRole = 'loggedOut'; // Start as logged out
        return {
            uid: '', // Set empty for loggedOut
            name: 'Guest User',
            email: '',
            phone: '',
            role: initialRole,
            isProviderApproved: false,
            isPaidMember: false,
            bio: '',
            address: '',
            companyName: undefined,
            specialties: undefined,
        };
    });
    const [userRole, setUserRole] = useState(userProfile.role);
    const [isPaidMember, setIsPaidMember] = useState(userProfile.isPaidMember);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [showPostProblemModal, setShowPostProblemModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false); // For general registration
    const [selectedPlan, setSelectedPlan] = useState(null); // For membership plan selection
    const [message, setMessage] = useState({ type: '', text: '' }); // Global app messages

    // Global App Branding State
    const [appName, setAppName] = useState('Mphakathi Online');
    const [appLogo, setAppLogo] = useState('https://placehold.co/100x40/964b00/ffffff?text=Logo'); // Default placeholder logo


    // Mock data storage (in-memory, resets on refresh)
    const [mockProblems, setMockProblems] = useState([
        {
            id: crypto.randomUUID(),
            title: 'Leaky Faucet Repair',
            description: 'My kitchen faucet has a steady drip, needs repair or replacement.',
            category: 'Plumbing',
            location: 'Pretoria',
            estimatedBudget: 500,
            requesterId: 'mock-member-alice', // Pre-existing user
            status: 'open',
            isApproved: true,
            createdAt: new Date(Date.now() - 86400000 * 5),
            quotes: [
                { id: crypto.randomUUID(), providerId: 'mock-provider-alpha', providerName: 'Alpha Services', amount: 150, details: 'Standard repair, parts included.', status: 'pending', proposedStartDate: '2025-07-01', proposedEndDate: '2025-07-02', createdAt: new Date(Date.now() - 86400000 * 4) },
                { id: crypto.randomUUID(), providerId: 'mock-provider-beta', providerName: 'Beta Fixers', amount: 120, details: 'Will inspect and fix, lowest price.', status: 'pending', proposedStartDate: '2025-07-03', proposedEndDate: '2025-07-03', createdAt: new Date(Date.now() - 86400000 * 3) },
            ]
        },
        {
            id: crypto.randomUUID(),
            title: 'Garden Landscaping',
            description: 'Need basic landscaping for a small backyard. Ideas welcome.',
            category: 'Gardening',
            location: 'Durban',
            estimatedBudget: 2500,
            requesterId: 'mock-member-bob', // Pre-existing user
            status: 'open',
            isApproved: true,
            createdAt: new Date(Date.now() - 86400000 * 2),
            quotes: [
                 { id: crypto.randomUUID(), providerId: 'mock-provider-charlie', providerName: 'Charlie Gardens', amount: 500, details: 'Includes design and plant selection.', status: 'pending', proposedStartDate: '2025-07-10', proposedEndDate: '2025-07-15', createdAt: new Date(Date.now() - 86400000 * 1) },
            ]
        },
         {
            id: crypto.randomUUID(),
            title: 'Broken Washing Machine',
            description: 'Washing machine not spinning. Believe it is a motor issue.',
            category: 'Appliance Repair',
            location: 'Cape Town',
            estimatedBudget: 800,
            requesterId: 'mock-member-bob',
            status: 'closed',
            isApproved: true,
            acceptedQuoteId: 'mock-quote-gamma',
            createdAt: new Date(Date.now() - 86400000 * 10),
            quotes: [
                { id: crypto.randomUUID(), providerId: 'mock-provider-delta', providerName: 'Delta Appliances', amount: 300, details: 'Motor replacement cost.', status: 'pending', proposedStartDate: '2025-06-20', proposedEndDate: '2025-06-21', createdAt: new Date(Date.now() - 86400000 * 9) },
                { id: 'mock-quote-gamma', providerId: 'mock-provider-epsilon', providerName: 'Epsilon Repairs', amount: 250, details: 'Quick diagnosis and repair.', status: 'accepted', proposedStartDate: '2025-06-22', proposedEndDate: '2025-06-22', createdAt: new Date(Date.now() - 86400000 * 8) },
            ]
        },
    ]);

    // Mock other user profiles for MemberDetailsModal and ProviderApproval
    const [mockUserProfiles, setMockUserProfiles] = useState({
        'mock-member-alice': {
            uid: 'mock-member-alice', name: 'Alice Member', email: 'alice@example.com', phone: '071-123-4567', role: 'member', isPaidMember: true, bio: 'A mock user looking for help.', address: '456 Oak Avenue, Johannesburg'
        },
        'mock-member-bob': {
            uid: 'mock-member-bob', name: 'Bob Member', email: 'bob@example.com', phone: '082-222-3333', role: 'member', isPaidMember: false, bio: 'Another mock user.', address: '789 Pine Street, Cape Town'
        },
        'mock-provider-alpha': {
            uid: 'mock-provider-alpha', name: 'Alpha Services', email: 'alpha@example.com', phone: '060-111-2222', role: 'provider', isProviderApproved: true, companyName: 'Alpha Plumbing', specialties: 'Plumbing', bio: 'Expert plumbers in Gauteng.', address: '101 Pipe Rd, Pretoria'
        },
         'mock-provider-beta': {
            uid: 'mock-provider-beta', name: 'Beta Fixers', email: 'beta@example.com', phone: '073-333-4444', role: 'provider', isProviderApproved: true, companyName: 'Beta General', specialties: 'General Handyman', bio: 'Reliable handymen for all your needs.', address: '202 Tool St, Durban'
        },
         'mock-provider-charlie': {
            uid: 'mock-provider-charlie', name: 'Charlie Gardens', email: 'charlie@example.com', phone: '084-555-6666', role: 'provider', isProviderApproved: false, companyName: 'Charlie Landscaping', specialties: 'Landscaping', bio: 'Creative landscaping solutions.', address: '303 Green Ave, Cape Town'
        },
         'mock-provider-delta': {
            uid: 'mock-provider-delta', name: 'Delta Appliances', email: 'delta@example.com', phone: '079-777-8888', role: 'provider', isProviderApproved: true, companyName: 'Delta Repairs', specialties: 'Appliance Repair', bio: 'Fast and affordable appliance repairs.', address: '404 Repair Ln, Johannesburg'
        },
         'mock-provider-epsilon': {
            uid: 'mock-provider-epsilon', name: 'Epsilon Repairs', email: 'epsilon@example.com', phone: '081-999-0000', role: 'provider', isProviderApproved: true, companyName: 'Epsilon Tech', specialties: 'Electronics Repair', bio: 'Specializing in electronics repair.', address: '505 Circuit Rd, Pretoria'
        },
        'admin-user': {
            uid: 'admin-user', name: 'Admin Account', email: 'admin@example.com', phone: '000-000-0000', role: 'admin', isProviderApproved: undefined, isPaidMember: undefined, bio: 'System administrator.', address: 'Admin HQ'
        }
    });

    // Mock Pricing Plans - Moved to central state for admin editing
    const [mockPricingPlans, setMockPricingPlans] = useState([
        {
            id: 'bronze-plan', // Added unique ID for easier management
            name: 'Bronze',
            price: 'R50/month', // Updated to match plan codes.PNG
            rawPrice: 50, // Added for numerical comparisons if needed
            interval: 'monthly',
            features: [
                'Post up to 5 problems',
                'View basic problem details',
                'Community support'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_ot4wcmec30yw311', // Updated with actual plan code
            planCode: 'PLN_ot4wcmec30yw311', // Added plan code
        },
        {
            id: 'silver-plan',
            name: 'Silver',
            price: 'R150/month', // Updated to match plan codes.PNG
            rawPrice: 150,
            interval: 'monthly',
            features: [
                'Unlimited problem posts',
                'View all problem details',
                'Submit and manage quotes',
                'Priority support'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_9zom3j5yjqjox10', // Updated with actual plan code
            planCode: 'PLN_9zom3j5yjqjox10', // Added plan code
        },
        {
            id: 'gold-plan',
            name: 'Gold',
            price: 'R300/month', // Updated to match plan codes.PNG
            rawPrice: 300,
            interval: 'monthly',
            features: [
                'All Silver features',
                'Advanced analytics',
                'Dedicated account manager',
                'Early access to features'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_2cun96f18ckdlzd', // Updated with actual plan code
            planCode: 'PLN_2cun96f18ckdlzd', // Added plan code
        },
        {
            id: 'platinum-plan',
            name: 'Platinum',
            price: 'R500/month', // Updated to match plan codes.PNG
            rawPrice: 500,
            interval: 'monthly',
            features: [
                'All Gold features',
                'Premium partner listings',
                'Exclusive workshops',
                'API access'
            ],
            paystackLink: 'https://paystack.shop/pay/PLN_zy6223r71ftmy11', // Updated with actual plan code
            planCode: 'PLN_zy6223r71ftmy11', // Added plan code
        },
    ]);


    // Effect to initialize user profile on first load (e.g., if starting logged out)
    useEffect(() => {
        if (userProfile.uid === '') { // Only if uid is initially empty (loggedOut state)
            const newUserId = crypto.randomUUID();
            setUserId(newUserId);
            setUserProfileState(prev => ({ ...prev, uid: newUserId }));
            // Add this new user to mockUserProfiles
            setMockUserProfiles(prev => ({
                ...prev,
                [newUserId]: { ...userProfile, uid: newUserId }
            }));
        } else {
             // Ensure the current userProfile is always in mockUserProfiles
            setMockUserProfiles(prev => ({
                ...prev,
                [userId]: { ...prev[userId], ...userProfile, uid: userId }
            }));
        }
    }, [userId, userProfile]); // Only re-run if userId or userProfile changes (initial setup)

    // Handle posting new problem (moved from ProblemListPage)
    const handlePostProblem = (problemData) => {
        const newProblem = {
            id: crypto.randomUUID(),
            title: problemData.title,
            description: problemData.description,
            category: problemData.category,
            location: problemData.location,
            estimatedBudget: parseFloat(problemData.estimatedBudget),
            requesterId: userId,
            status: 'open',
            isApproved: false, // New problems require admin approval
            createdAt: new Date(),
            quotes: [] // Initialize with empty quotes array
        };
        setMockProblems(prevProblems => [newProblem, ...prevProblems]);
        setShowPostProblemModal(false); // Close modal on save
        setMessage({ type: 'success', text: 'Problem posted successfully! Awaiting admin approval.' });
    };

    // Generic registration handler
    const handleRegister = (newUserData, roleType, isPaid = false) => {
        const newUid = crypto.randomUUID();
        const newUserProfile = {
            uid: newUid,
            name: newUserData.name,
            email: newUserData.email,
            phone: newUserData.phone,
            role: roleType,
            isProviderApproved: roleType === 'provider' ? false : undefined, // Providers need approval
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
        setMessage({ type: 'success', text: `Welcome, ${newUserData.name}! You are now registered as a ${roleType}.` });
        setCurrentPage('dashboard');
        setShowRegisterModal(false);
    };

    // Handle becoming a paid member after selecting a plan and filling form
    const handleBecomePaidMember = (newUserData, selectedPlanDetails) => {
        // Find the user if they already exist (e.g., free member upgrading)
        let existingUser = mockUserProfiles[userId];

        // If the current user is logged out, create a new one based on form data
        // If current user is a free member, update their profile
        const newUid = userRole === 'loggedOut' ? crypto.randomUUID() : userId;

        const updatedProfile = {
            ...existingUser, // Start with existing data if available
            uid: newUid,
            name: newUserData.name || existingUser?.name || `New Member ${newUid.substring(0,4)}`,
            email: newUserData.email || existingUser?.email || `newmember-${newUid.substring(0,4)}@example.com`,
            phone: newUserData.phone || existingUser?.phone || '',
            role: 'member', // Always 'member' after this flow
            isPaidMember: true, // Key change: now a paid member
            bio: newUserData.bio || existingUser?.bio || '',
            address: newUserData.address || existingUser?.address || '',
            // Clear provider-specific fields if they were in provider registration flow and switching to member
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
        setSelectedPlan(null); // Clear selected plan
        setMessage({ type: 'success', text: `Congratulations! You are now a Paid Member (${selectedPlanDetails.name}).` });
        setCurrentPage('problems'); // Redirect to problem listings after successful payment
    };


    const handleLoginAs = (targetUid) => {
        let newUserId;
        let newProfile;

        if (targetUid === 'loggedOut') {
            newUserId = crypto.randomUUID(); // Give a new ID for a guest session
            newProfile = {
                uid: '', // No actual UID for logged out guest, set to empty
                name: 'Guest User',
                email: '',
                phone: '',
                role: 'loggedOut',
                isProviderApproved: false,
                isPaidMember: false,
                bio: '',
                address: ''
            };
        } else { // existing mock users for quick testing
            newUserId = targetUid;
            newProfile = mockUserProfiles[targetUid];
        }
        setUserId(newUserId);
        setUserProfileState(newProfile);
        setUserRole(newProfile.role);
        setIsPaidMember(newProfile.isPaidMember || false); // Ensure it's boolean
        setCurrentPage('dashboard');
        setMessage({ type: '', text: '' }); // Clear any previous messages
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
            userId, userProfile, setUserProfile: setUserProfileState, userRole, setUserRole, isPaidMember, setIsPaidMember,
            problems: mockProblems, setProblems: setMockProblems, userProfiles: mockUserProfiles, setUserProfiles: setMockUserProfiles,
            pricingPlans: mockPricingPlans, setPricingPlans: setMockPricingPlans, // Provide pricing plans
            appName, setAppName, // Provide app name state
            appLogo, setAppLogo, // Provide app logo state
            setShowPostProblemModal,
            setMessage, // Provide setMessage globally
            handleRegister, // Provide general registration handler
            handleBecomePaidMember, // Provide paid membership handler
            setSelectedPlan, // Provide setter for selected plan
            updateProblemInFirestore: setMockProblems, // Mock update: direct state set
            deleteProblemFromFirestore: (id) => setMockProblems(prev => prev.filter(p => p.id !== id)), // Mock delete
            deletePricingPlanFromFirestore: (id) => setMockPricingPlans(prev => prev.filter(p => p.id !== id)), // Mock delete
            savePricingPlanToFirestore: (plan) => { // Mock save/update
                setMockPricingPlans(prev => {
                    if (plan.id) { // Editing existing
                        return prev.map(p => p.id === plan.id ? plan : p);
                    } else { // Adding new
                        return [...prev, { ...plan, id: crypto.randomUUID() }];
                    }
                });
            },
            updateBrandingInFirestore: (name, logo) => { // Mock branding update
                setAppName(name);
                setAppLogo(logo);
            },
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
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/964b00/ffffff?text=Logo"; }} // Fallback
                        />
                        )}
                        <h2 className="text-2xl font-bold">
                            {appName}
                        </h2>
                        <p className="text-sm text-gray-200 mt-1">ID: {userId || 'N/A'}</p> {/* Display N/A for logged out */}
                         <div className="mt-4 flex flex-col space-y-2">
                            <label className="text-sm text-gray-200">Switch User:</label>
                            <select
                                value={userProfile.uid || 'loggedOut'} // Use UID for specific mock users
                                onChange={(e) => handleLoginAs(e.target.value)}
                                className="p-2 rounded-md bg-[#7a3d00] text-white text-sm"
                            >
                                <option value="loggedOut">Logged Out</option>
                                <option value="mock-member-alice">Member (Paid - Alice)</option>
                                <option value="mock-member-bob">Member (Free - Bob)</option>
                                <option value="mock-provider-alpha">Provider (Approved - Alpha)</option>
                                <option value="mock-provider-charlie">Provider (Pending - Charlie)</option>
                                <option value="admin-user">Admin</option>
                                {/* Dynamically add newly registered mock users */}
                                {Object.values(mockUserProfiles)
                                    .filter(u => !['mock-member-alice', 'mock-member-bob', 'mock-provider-alpha', 'mock-provider-charlie', 'admin-user', ''].includes(u.uid))
                                    .map(u => (
                                        <option key={u.uid} value={u.uid}>
                                            {u.name} ({u.role} - {u.isPaidMember ? 'Paid' : u.role === 'member' ? 'Free' : (u.isProviderApproved ? 'Approved' : 'Pending')})
                                        </option>
                                    ))
                                }
                            </select>
                            {userRole === 'member' && (
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="paidMemberToggle"
                                        checked={isPaidMember}
                                        onChange={(e) => {
                                            setIsPaidMember(e.target.checked);
                                            setUserProfileState(prev => ({ ...prev, isPaidMember: e.target.checked }));
                                            setMessage({ type: 'info', text: 'Membership status updated (demo only). Upgrade via Pricing to persist.' });
                                        }}
                                        className="mr-2"
                                        disabled // Disable in-app toggle for demo, encourage pricing page
                                    />
                                    <label htmlFor="paidMemberToggle" className="text-sm text-gray-200">Paid Member</label>
                                </div>
                            )}
                        </div>
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
                            {userRole === 'loggedOut' && (
                                <li>
                                    <button
                                        onClick={() => setShowRegisterModal(true)}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 hover:bg-[#7a3d00] text-gray-100`}
                                    >
                                        <KeyIcon size={20} className="mr-3" />
                                        Register
                                    </button>
                                </li>
                            )}
                            {userRole !== 'loggedOut' && (
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
                            <li>
                                <button
                                    onClick={() => setCurrentPage('problems')}
                                    className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                        currentPage === 'problems' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                    }`}
                                >
                                    <FileTextIcon size={20} className="mr-3" />
                                    Problem List
                                </button>
                            </li>
                            {userRole === 'provider' && (
                                <li>
                                    <button
                                        onClick={() => setCurrentPage('quotes')}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                            currentPage === 'quotes' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                        }`}
                                    >
                                        <PackageIcon size={20} className="mr-3" />
                                        My Quotes
                                    </button>
                                </li>
                            )}
                            {userRole === 'member' && (
                                <li>
                                    <button
                                        onClick={() => setCurrentPage('my-requests')}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                            currentPage === 'my-requests' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                        }`}
                                    >
                                        <CalendarIcon size={20} className="mr-3" />
                                        My Requests
                                    </button>
                                </li>
                            )}
                            {userRole === 'admin' && (
                                <li>
                                    <button
                                        onClick={() => setCurrentPage('admin-tools')}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                            currentPage === 'admin-tools' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                        }`}
                                    >
                                        <ShieldCheckIcon size={20} className="mr-3" />
                                        Admin Tools
                                    </button>
                                </li>
                            )}
                            {userRole !== 'loggedOut' && (
                                <li>
                                    <button
                                        onClick={() => setCurrentPage('settings')}
                                        className={`flex items-center w-full px-4 py-3 text-lg rounded-md transition-colors duration-200 ${
                                            currentPage === 'settings' ? 'bg-[#b3641a] text-white' : 'hover:bg-[#7a3d00] text-gray-100'
                                        }`}
                                    >
                                        <SettingsIcon size={20} className="mr-3" />
                                        Settings
                                    </button>
                                </li>
                            )}
                        </ul>
                    </nav>
                    {userRole !== 'loggedOut' && (
                        <div className="p-4 md:p-6 border-t border-[#b3641a]">
                            <button
                                onClick={() => handleLoginAs('loggedOut')}
                                className="flex items-center w-full px-4 py-3 text-lg text-red-300 rounded-md hover:bg-red-700 transition-colors duration-200"
                            >
                                <LogOutIcon size={20} className="mr-3" />
                                Log Out
                            </button>
                        </div>
                    )}
                </aside>

// ... some part of your JSX structure ends here, but not cleanly ...
)} // <--- THIS IS THE ISSUE: An unclosed JavaScript/JSX expression/block

// At the top of your file, after imports but before the App component definition:
// Paystack configuration using environment variables
const paystackConfig = {
  publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || "pk_live_fdf4452ee756cc1e801f39ebd70f25bb67a005e8",
  callbackUrl: process.env.REACT_APP_PAYSTACK_CALLBACK_URL || "https://app.mphakathi.online",
  webhookUrl: process.env.REACT_APP_PAYSTACK_WEBHOOK_URL || "https://app.mphakathi.online",
};

// ... (Your App component definition starts here)
function App() {
    // ... other component logic, state, useEffects ...

    return (
        // You MUST wrap everything in a single parent element.
        // I'm assuming there's an outer div or fragment that contains the 'aside'
        // and the 'flex-1' div. If not, add one.

        // Example assuming your App component returns something like this:
        <div className="app-container">
  {/* This is the single root element */}
  <aside>
    {/* ... content inside aside ... */}
  </aside>
  {/* This div should be *inside* the single root element */}
  <div className="flex-1 flex flex-col">
    {/* ... content inside the flex-1 div ... */}
  </div>
</div>
    );
}

export default App; // Don't forget to export your component

            <div className="flex-1 flex flex-col">

                <div className="flex-1 flex flex-col">
                    <header className="bg-white shadow p-4 md:p-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome, {headerTitle}!
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColorClass}`}>
                            {statusText}
                        </span>
                    </header>
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                        {message.text && (
                            <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {message.text}
                            </div>
                        )}
                        {(() => {
                            switch (currentPage) {
                                case 'dashboard':
                                    return userRole === 'provider' ?
                                        <ProviderDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} /> :
                                        <MemberDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} />;
                                case 'profile':
                                    return <ProfilePage />;
                                case 'problems':
                                    return <ProblemListPage onNavigate={setCurrentPage} />;
                                case 'quotes':
                                    return userRole === 'provider' ? <MyQuotesPage /> : null;
                                case 'my-requests':
                                    return userRole === 'member' ? <MyRequestsPage /> : null;
                                // Add these component definitions before line 621
const AdminToolsPage = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
            <p>Admin tools functionality coming soon...</p>
        </div>
    );
};

const AdminPricingPage = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Admin Pricing</h2>
            <p>Admin pricing management coming soon...</p>
        </div>
    );
};

const AdminBrandingPage = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Admin Branding</h2>
            <p>Admin branding management coming soon...</p>
        </div>
    );
};
// Add this component definition before it's used (before line 647)
const AdminBrandingPage = () => {
    const { userId, userRole, isPaidMember } = useContext(AppContext);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <SettingsIcon size={28} className="mr-3 text-[#964b00]" /> Admin Branding
            </h2>
            <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Brand Customization</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Logo
                            </label>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Primary Color
                            </label>
                            <input 
                                type="color" 
                                defaultValue="#964b00"
                                className="h-10 w-20 rounded-md border border-gray-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter company name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                        <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200">
                            Reset to Default
                        </button>
                        <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
                                    case 'admin-tools':
                                    return userRole === 'admin' ? <AdminToolsPage onNavigate={setCurrentPage} /> : null;
                                case 'admin-pricing':
                                    return userRole === 'admin' ? <AdminPricingPage /> : null; // New admin page
                                case 'admin-branding': // New page for admin branding
                                    return userRole === 'admin' ? <AdminBrandingPage /> : null;
                                case 'settings':
                                    return userRole !== 'loggedOut' ? <SettingsPage /> : null;
                                case 'pricing':
                                    return <PricingPage />;
                                case 'problem-detail':
                                    // Problem ID must be passed to this page
                                    const pathParts = window.location.hash.split('/');
                                    const problemId = pathParts[pathParts.length - 1];
                                    const problem = mockProblems.find(p => p.id === problemId);
                                    return problem ? <ProblemDetailPage problem={problem} onNavigate={setCurrentPage} /> : <p>Problem not found.</p>;
                                default:
                                    return userRole === 'provider' ?
                                        <ProviderDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} /> :
                                        <MemberDashboardPage userProfile={userProfile} onNavigate={setCurrentPage} />;
                            }
                        })()}
                    </main>
                </div>
            </div>
            {showPostProblemModal && (
                <PostProblemModal
                    onClose={() => setShowPostProblemModal(false)}
                    onSave={handlePostProblem}
                    activeProblemsCount={
                        mockProblems.filter(p => p.requesterId === userId && p.status === 'open').length
                    }
                    isPaidMember={isPaidMember}
                />
            )}
            {showRegisterModal && (
                <RegistrationPage
                    onClose={() => setShowRegisterModal(false)}
                />
            )}
            {selectedPlan && (
                <SignUpFormModal
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </AppContext.Provider>
    );
};

// --- Dashboard Components ---

// ProviderDashboardPage
const ProviderDashboardPage = ({ userProfile, onNavigate }) => {
    const { userId, problems: mockProblems } = useContext(AppContext);
    const [totalQuotes, setTotalQuotes] = useState(0);
    const [pendingQuotes, setPendingQuotes] = useState(0);

    useEffect(() => {
        // Calculate quotes based on mockProblems
        let providerQuotes = [];
        mockProblems.forEach(problem => {
            problem.quotes.forEach(quote => {
                if (quote.providerId === userId) {
                    providerQuotes.push({ ...quote, problemTitle: problem.title }); // Include problem title for context
                }
            });
        });
        setTotalQuotes(providerQuotes.length);
        setPendingQuotes(providerQuotes.filter(quote => quote.status === 'pending').length);
    }, [mockProblems, userId]); // Recalculate if mockProblems change

    // Sort quotes by creation date, newest first for display in dashboard
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
                            onClick={() => onNavigate('quotes')}
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
                                {sortedMyQuotes.slice(0, 3).map(quote => ( // Show top 3 recent quotes
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
                    onClick={() => onNavigate('quotes')}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                    Go to My Quotes
                </button>
            </div>
        </div>
    );
};

// MemberDashboardPage
const MemberDashboardPage = ({ userProfile, onNavigate }) => {
    const { isPaidMember, userId, problems: mockProblems, setShowPostProblemModal, handleRegister } = useContext(AppContext);
    const [myProblemsCount, setMyProblemsCount] = useState(0);
    const [quotesReceivedCount, setQuotesReceivedCount] = useState(0);
    const [recentQuotes, setRecentQuotes] = useState([]);
    const [showBecomeProviderModal, setShowBecomeProviderModal] = useState(false);


    useEffect(() => {
        let memberProblems = mockProblems.filter(p => p.requesterId === userId);
        setMyProblemsCount(memberProblems.length);

        let totalQuotesForMyProblems = 0; // This variable isn't used, consider removing or using it
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
        setQuotesReceivedCount(totalQuotesForMyProblems);
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
                        {userProfile.role === 'member' && ( // Ensure only members see this
                            <button
                                onClick={() => setShowPostProblemModal(true)} // Directly opens the modal
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
                        {userProfile.role === 'member' && !userProfile.isProviderApproved && ( // Members not yet approved as providers
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
                {recentQuotes.length === 0 || userProfile.role === 'loggedOut' ? ( // Check for logged out as well
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
                                {recentQuotes.slice(0, 3).map(quote => ( // Show top 3 recent quotes
                                    <tr key={quote.id} className="border-b border-gray-100">
                                        <td className="py-2 px-4">{quote.problemTitle}</td>
                                        <td className="py-2 px-4">{quote.providerName}</td>
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
            {showBecomeProviderModal && (
                <BecomeProviderModal
                    onClose={() => setShowBecomeProviderModal(false)}
                    onRegister={handleRegister}
                />
            )}
        </div>
    );
};

// --- General Pages ---

// RegistrationPage for new users
const RegistrationPage = ({ onClose }) => {
    const { handleRegister, setMessage } = useContext(AppContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [role, setRole] = useState('member'); // Default to member
    const [formError, setFormError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!name || !email || !password || !role) {
            setFormError('Name, Email, Password, and Role are required.');
            return;
        }

        // Basic email validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFormError('Please enter a valid email address.');
            return;
        }

        // Basic password strength (e.g., min 6 chars)
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        handleRegister({ name, email, password, phone, address }, role, false); // isPaid defaults to false
        setMessage({type: 'success', text: `Registration successful! Welcome, ${name}.`});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Register a New Account</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regName">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="regName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regEmail">
                            Email
                        </label>
                        <input
                            type="email"
                            id="regEmail"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regPassword">
                            Password
                        </label>
                        <input
                            type="password"
                            id="regPassword"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regPhone">
                            Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            id="regPhone"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regAddress">
                            Address (Optional)
                        </label>
                        <textarea
                            id="regAddress"
                            rows="2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regRole">
                            Register as:
                        </label>
                        <select
                            id="regRole"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="member">Member</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

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
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// BecomeProviderModal for existing members
const BecomeProviderModal = ({ onClose }) => {
    const { userProfile, handleRegister, setMessage } = useContext(AppContext);
    const [companyName, setCompanyName] = useState('');
    const [specialties, setSpecialties] = useState('');
    const [bio, setBio] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (userProfile) {
            setCompanyName(userProfile.companyName || '');
            setSpecialties(userProfile.specialties || '');
            setBio(userProfile.bio || '');
        }
    }, [userProfile]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');

        if (!companyName || !specialties) {
            setFormError('Company Name and Specialties are required.');
            return;
        }

        // Use existing user profile data and update role/provider-specific fields
        const updatedUserData = {
            ...userProfile,
            companyName,
            specialties,
            bio: bio || userProfile.bio, // Allow updating bio, or keep existing
        };

        handleRegister(updatedUserData, 'provider', userProfile.isPaidMember); // Pass existing paid status
        setMessage({type: 'success', text: `You are now registered as a Provider! Awaiting admin approval.`});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Register as a Provider</h3>
                <p className="text-gray-700 mb-4">Your current member details will be used. Please provide additional provider-specific information.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">
                            Company Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialties">
                            Specialties (e.g., Plumbing, Electrical)
                        </label>
                        <input
                            type="text"
                            id="specialties"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={specialties}
                            onChange={(e) => setSpecialties(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="providerBio">
                            Provider Bio (Optional)
                        </label>
                        <textarea
                            id="providerBio"
                            rows="3"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

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
                            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                        >
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Pricing Page
const PricingPage = () => {
    const { setSelectedPlan, setMessage, pricingPlans: mockPricingPlans } = useContext(AppContext); // Use context for pricing plans

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setMessage({type: 'info', text: `You've selected the ${plan.name} plan. Please complete the sign-up.`});
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Membership Plans</h2>
            <p className="text-center text-gray-600 mb-8">Choose the plan that best suits your needs.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockPricingPlans.length === 0 ? (
                    <p className="text-gray-600 col-span-full text-center">No pricing plans available. Please check back later. (Admin can add them)</p>
                ) : (
                    mockPricingPlans.map(plan => ( // Use mockPricingPlans from context
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
                                className="mt-auto px-6 py-2 bg-[#964b00] text-white font-semibold rounded-md hover:bg-[#b3641a] transition-colors duration-200 shadow-lg"
                            >
                                Select Plan
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// SignUpFormModal (Appears after selecting a plan)
const SignUpFormModal = ({ plan, onClose }) => {
    const { handleBecomePaidMember, userProfile, setMessage } = useContext(AppContext);
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

// Generate Paystack payment link using live configuration
const paystackPaymentLink = `https://paystack.com/pay/${plan.planCode || 'default_plan_code'}`;
// You can also use the configured callback URL if needed
// const paystackPaymentLink = `${paystackConfig.callbackUrl}/payment/${plan.planCode}`;

        window.open(paystackPaymentLink, '_blank');

        // After redirection, the user would complete payment.
        // For this demo, we immediately simulate success after opening Paystack link.
        // In a real app, this would be handled by a Paystack webhook or callback.
        handleBecomePaidMember({ name, email, password, phone, address }, plan);
        onClose(); // Close the modal
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Sign Up for {plan.name} Plan</h3>
                <p className="text-gray-700 mb-4">Complete your details to proceed to payment.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupName">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="signupName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupEmail">
                            Email
                        </label>
                        <input
                            type="email"
                            id="signupEmail"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupPassword">
                            Password
                        </label>
                        <input
                            type="password"
                            id="signupPassword"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupPhone">
                            Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            id="signupPhone"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupAddress">
                            Address (Optional)
                        </label>
                        <textarea
                            id="signupAddress"
                            rows="2"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

                    <div className="flex flex-col space-y-3 mt-6">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Proceed to Payment ({plan.price})
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // Manual simulation of payment success
                                handleBecomePaidMember({ name, email, password, phone, address }, plan);
                                onClose();
                            }}
                            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                            Simulate Payment Success & Continue to App
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ProfilePage (Shared for Members and Providers)
const ProfilePage = () => {
    const { userProfile, setUserProfile, userRole, setUserProfiles: setMockUserProfiles, setMessage } = useContext(AppContext);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        address: '',
        companyName: '',
        specialties: '',
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                bio: userProfile.bio || '',
                address: userProfile.address || '',
                companyName: userProfile.companyName || '',
                specialties: userProfile.specialties || '',
            });
        }
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const updatedProfile = { ...userProfile, ...formData };
        setUserProfile(updatedProfile); // Update local state immediately
        setMockUserProfiles(prev => ({ // Update global mock profiles
            ...prev,
            [userProfile.uid]: updatedProfile
        }));
        setEditMode(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                My Profile
                {!editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center"
                    >
                        <EditIcon size={18} className="mr-2" /> Edit Profile
                    </button>
                )}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        ) : (
                            <p className="text-gray-900 text-lg">{userProfile?.name || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        {editMode ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        ) : (
                            <p className="text-gray-900 text-lg">{userProfile?.email || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                        {editMode ? (
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        ) : (
                            <p className="text-gray-900 text-lg">{userProfile?.phone || 'N/A'}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address:</label>
                        {editMode ? (
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        ) : (
                            <p className="text-gray-900 text-lg whitespace-pre-wrap">{userProfile?.address || 'N/A'}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Bio:</label>
                        {editMode ? (
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="5"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            ></textarea>
                        ) : (
                            <p className="text-gray-900 text-lg whitespace-pre-wrap">{userProfile?.bio || 'N/A'}</p>
                        )}
                    </div>
                    {userRole === 'provider' && (
                        <>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Company Name:</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                ) : (
                                    <p className="text-gray-900 text-lg">{userProfile?.companyName || 'N/A'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">Specialties:</label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        name="specialties"
                                        value={formData.specialties}
                                        onChange={handleChange}
                                        placeholder="e.g., Plumbing, Electrical, Landscaping"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                ) : (
                                    <p className="text-gray-900 text-lg">{userProfile?.specialties || 'N/A'}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {editMode && (
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={() => { setEditMode(false); setMessage({ type: '', text: '' }); }} // Clear message on cancel
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSave}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

// ProblemListPage (Publicly accessible with filters)
const ProblemListPage = ({ onNavigate }) => {
    const { userRole, userId, isPaidMember, problems: mockProblems, setProblems: setMockProblems, userProfiles: mockUserProfiles, setShowPostProblemModal, setMessage } = useContext(AppContext);
    // Removed local message state, using global one from context now

    // Filter states
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterLocation, setFilterLocation] = useState('All');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');

    const handleSendQuote = (problemId, quoteData) => {
        if (userRole !== 'provider') {
            setMessage({ type: 'error', text: 'Only providers can send quotes.' });
            return;
        }

        setMockProblems(prevProblems =>
            prevProblems.map(problem => {
                if (problem.id === problemId) {
                    const newQuote = {
                        id: crypto.randomUUID(),
                        providerId: userId,
                        providerName: quoteData.providerName,
                        amount: quoteData.amount,
                        details: quoteData.details,
                        proposedStartDate: quoteData.proposedStartDate,
                        proposedEndDate: quoteData.proposedEndDate,
                        status: 'pending',
                        createdAt: new Date(),
                    };
                    return {
                        ...problem,
                        quotes: [...(problem.quotes || []), newQuote]
                    };
                }
                return problem;
            })
        );
        setMessage({ type: 'success', text: 'Quote sent successfully!' });
    };

    const uniqueCategories = ['All', ...new Set(mockProblems.map(p => p.category))];
    const uniqueLocations = ['All', ...new Set(mockProblems.map(p => p.location))];

    const filteredProblems = mockProblems.filter(problem => {
        // Only show approved problems to non-admin users
        if (userRole !== 'admin' && !problem.isApproved) {
            return false;
        }

        // Filter by category
        if (filterCategory !== 'All' && problem.category !== filterCategory) {
            return false;
        }
        // Filter by location
        if (filterLocation !== 'All' && problem.location !== filterLocation) {
            return false;
        }
        // Filter by budget
        const budget = problem.estimatedBudget;
        if (minBudget && budget < parseFloat(minBudget)) {
            return false;
        }
        if (maxBudget && budget > parseFloat(maxBudget)) {
            return false;
        }
        return true;
    }).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort newest first


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                Public Problem List
                {userRole === 'member' && ( // Always allow button click for members
                    <button
                        onClick={() => setShowPostProblemModal(true)}
                        className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center bg-green-600 text-white hover:bg-green-700`}
                        title={`Post a new problem (Free members limited to 5 active problems)`}
                    >
                        <PlusCircleIcon size={18} className="mr-2" /> Post New Problem
                    </button>
                )}
            </h2>

            {/* Message display moved to App.js */}

            {/* Filters Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                    <select
                        id="filterCategory"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="filterLocation" className="block text-gray-700 text-sm font-bold mb-2">Location</label>
                    <select
                        id="filterLocation"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="minBudget" className="block text-gray-700 text-sm font-bold mb-2">Min Budget (R)</label>
                    <input
                        type="number"
                        id="minBudget"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., 100"
                    />
                </div>
                <div>
                    <label htmlFor="maxBudget" className="block text-gray-700 text-sm font-bold mb-2">Max Budget (R)</label>
                    <input
                        type="number"
                        id="maxBudget"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., 1000"
                    />
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
                            isPaidMember={isPaidMember}
                            currentUserId={userId}
                            onSendQuote={handleSendQuote}
                            onNavigate={onNavigate} // Pass onNavigate for problem details page
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ProblemCard component for ProblemListPage
const ProblemCard = ({ problem, userRole, isPaidMember, currentUserId, onSendQuote, onNavigate }) => {
    const { userProfile } = useContext(AppContext);
    const [hasQuoted, setHasQuoted] = useState(false);

    // Determine if the current provider has quoted this problem
    useEffect(() => {
        if (userRole === 'provider' && problem.quotes) {
            setHasQuoted(problem.quotes.some(quote => quote.providerId === currentUserId));
        } else {
            setHasQuoted(false);
        }
    }, [problem.quotes, currentUserId, userRole]);

    const handleViewDetails = () => {
        // Use window.location.hash to simulate routing
        window.location.hash = `problem-detail/${problem.id}`;
        onNavigate('problem-detail'); // Update parent state for rendering ProblemDetailPage
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{problem.title}</h3>
            <p className="text-gray-700 mb-2 text-sm">{problem.description}</p>
            <p className="text-gray-600 font-medium text-xs">Category: {problem.category || 'General'}</p>
            <p className="text-gray-600 font-medium text-xs">Location: {problem.location || 'N/A'}</p>
            <p className="text-gray-600 font-medium text-xs">Budget: R{problem.estimatedBudget?.toFixed(2) || 'N/A'}</p>
            <p className="text-gray-600 font-medium text-xs">Status: <span className="capitalize">{problem.status}</span></p>
            <p className="text-gray-500 text-xs mt-1">Posted: {problem.createdAt?.toLocaleDateString()}</p>
            {!problem.isApproved && userRole !== 'loggedOut' && (
                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full mt-2 inline-block">Awaiting Admin Approval</span>
            )}

            <div className="mt-4 flex flex-col space-y-2">
                {userRole === 'provider' && userProfile?.isProviderApproved && problem.isApproved && (
                    <button
                        onClick={handleViewDetails} // Takes to ProblemDetailPage
                        className="px-3 py-1 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 text-sm flex items-center justify-center"
                    >
                        <PackageIcon size={16} className="mr-1" /> View Details & Quote
                    </button>
                )}
                {userRole === 'member' && problem.requesterId === currentUserId && (
                    <button
                        onClick={handleViewDetails} // Takes to ProblemDetailPage
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center justify-center"
                    >
                        <FileTextIcon size={16} className="mr-1" /> View My Problem
                    </button>
                )}
                {(userRole === 'loggedOut' || (userRole === 'member' && problem.requesterId !== currentUserId)) && (
                     <button
                        onClick={handleViewDetails} // Takes to ProblemDetailPage
                        className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center justify-center"
                    >
                        View Problem Details
                    </button>
                )}
            </div>
        </div>
    );
};

// ProblemDetailPage - New Page for Problem Details and Quoting
const ProblemDetailPage = ({ problem, onNavigate }) => {
    const { userRole, userId, isPaidMember, setProblems: setMockProblems, userProfile, userProfiles: mockUserProfiles, setMessage } = useContext(AppContext);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
    const [showProviderDetailsModal, setShowProviderDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const hasQuoted = userRole === 'provider' && problem.quotes.some(quote => quote.providerId === userId);
    const isRequester = userRole === 'member' && problem.requesterId === userId;
    const isProblemOpen = problem.status === 'open';
    const hasAcceptedQuote = problem.status === 'closed' && problem.acceptedQuoteId;

    const handleSendQuote = (quoteData) => {
        if (userRole !== 'provider' || !userProfile.isProviderApproved) {
            setMessage({ type: 'error', text: 'You must be an approved provider to send quotes.' });
            return;
        }
        if (hasQuoted) {
            setMessage({ type: 'error', text: 'You have already submitted a quote for this problem.' });
            return;
        }

// Fix: Use problem.id instead of the comment
const problemId = problem.id;

        setMockProblems(prevProblems =>
            prevProblems.map(p => {
                if (p.id === problem.id) {
                    const newQuote = {
                        id: crypto.randomUUID(),
                        providerId: userId,
                        providerName: userProfile.name,
                        amount: quoteData.proposedBudget,
                        details: quoteData.motivation,
                        proposedStartDate: quoteData.proposedStartDate,
                        proposedEndDate: quoteData.proposedEndDate,
                        status: 'pending',
                        createdAt: new Date(),
                    };
                    return {
                        ...p,
                        quotes: [...(p.quotes || []), newQuote]
                    };
                }
                return p;
            })
        );
        setShowQuoteForm(false);
        setMessage({ type: 'success', text: 'Quote submitted successfully!' });
    };

    const handleAcceptQuote = (quoteId, providerId) => {
        setConfirmMessage("By accepting this quote, your contact information (name, email, phone) will be shared with the selected provider. Do you wish to proceed?");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems =>
                prevProblems.map(problem => {
                    if (const problemId = problem.id;) {
                        return {
                            ...problem,
                            status: 'closed',
                            acceptedQuoteId: quoteId,
                            quotes: problem.quotes.map(q =>
                                q.id === quoteId ? { ...q, status: 'accepted' } : q
                            )
                        };
                    }
                    return problem;
                })
            );
            setMessage({ type: 'success', text: 'Quote accepted and problem closed! Provider contact details now available.' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' }); // Clear existing message
        setShowConfirmModal(true);
    };


    const handleMarkProblemResolved = () => {
        setConfirmMessage("Are you sure you want to mark this problem as resolved? This cannot be undone.");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems =>
                prevProblems.map(problem =>
                    const problemId = problem.id; ? { ...problem, status: 'resolved' } : problem
                )
            );
            setMessage({ type: 'success', text: 'Problem marked as resolved!' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' }); // Clear existing message
        setShowConfirmModal(true);
    };

    const handleDeleteProblem = () => {
        setConfirmMessage("Are you sure you want to delete this problem and all associated quotes? This action is irreversible.");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems => prevProblems.filter(p => p.id !== problem.id));
            setMessage({ type: 'success', text: 'Problem and all associated quotes deleted successfully!' });
            onNavigate('problems'); // Redirect after deletion
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' }); // Clear existing message
        setShowConfirmModal(true);
    };

    // Determine the accepted provider's ID for the modal
    const acceptedProviderId = problem.quotes.find(q => q.id === problem.acceptedQuoteId)?.providerId;

    // Check if current user (provider) has the accepted quote
    const isCurrentProviderAccepted = userRole === 'provider' && acceptedProviderId === userId;


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <button
                onClick={() => onNavigate('problems')}
                className="mb-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
            >
                &larr; Back to Problem List
            </button>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">{problem.title}</h2>

            <div className="space-y-4 mb-8">
                <p className="text-gray-700 text-lg">{problem.description}</p>
                <p className="text-gray-600"><span className="font-semibold">Category:</span> {problem.category}</p>
                <p className="text-gray-600"><span className="font-semibold">Location:</span> {problem.location}</p>
                <p className="text-gray-600"><span className="font-semibold">Estimated Budget:</span> R{problem.estimatedBudget?.toFixed(2)}</p>
                <p className="text-gray-600"><span className="font-semibold">Status:</span> <span className="capitalize">{problem.status}</span></p>
                <p className="text-gray-500 text-sm">Posted on: {problem.createdAt?.toLocaleDateString()}</p>
                {!problem.isApproved && (userRole === 'admin' || problem.requesterId === userId) && (
                    <span className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full inline-block">Awaiting Admin Approval</span>
                )}
            </div>

            {/* Provider Actions/Info */}
            {userRole === 'provider' && userProfile?.isProviderApproved && problem.isApproved && isProblemOpen && !hasQuoted && (
                <button
                    onClick={() => setShowQuoteForm(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-lg flex items-center mb-6"
                >
                    <PlusCircleIcon size={20} className="mr-2" /> Submit a Quote
                </button>
            )}
            {userRole === 'provider' && userProfile?.isProviderApproved && hasQuoted && (
                <p className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-6 font-semibold">
                    You have already submitted a quote for this problem.
                </p>
            )}
            {userRole === 'provider' && !userProfile?.isProviderApproved && (
                 <p className="bg-red-100 text-red-800 p-3 rounded-md mb-6 font-semibold">
                    Your provider registration is pending approval. You cannot submit quotes yet.
                </p>
            )}
            {userRole === 'provider' && problem.status === 'closed' && !isCurrentProviderAccepted && (
                 <p className="bg-gray-100 text-gray-800 p-3 rounded-md mb-6 font-semibold">
                    This problem has been closed and your quote was not accepted.
                </p>
            )}
             {userRole === 'provider' && isCurrentProviderAccepted && (
                 <p className="bg-green-100 text-green-800 p-3 rounded-md mb-6 font-semibold">
                    Congratulations! Your quote for this problem was accepted.
                </p>
            )}


            {/* Requester (Member) View - Quotes Management */}
            {isRequester && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Quotes Received ({problem.quotes.length})</h3>
                    {!isPaidMember && problem.quotes.length > 0 && (
                        <p className="bg-red-100 text-red-800 p-3 rounded-md mb-4 font-semibold">
                            Upgrade to **paid membership** to view and manage these quotes.
                        </p>
                    )}
                    {problem.quotes.length === 0 ? (
                        <p className="text-gray-600">No quotes received for this problem yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {problem.quotes.map(quote => (
                                <div key={quote.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            Quote by: {isPaidMember || quote.status === 'accepted' ? quote.providerName : 'Confidential'}
                                        </h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {quote.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mb-1">Proposed Budget: <span className="font-bold">R{isPaidMember || quote.status === 'accepted' ? quote.amount?.toFixed(2) : '---'}</span></p>
                                    <p className="text-gray-700 mb-1">Proposed Dates: {isPaidMember || quote.status === 'accepted' ? `${quote.proposedStartDate} to ${quote.proposedEndDate}` : '---'}</p>
                                    <p className="text-gray-600 text-sm">Motivation: {isPaidMember || quote.status === 'accepted' ? quote.details : '---'}</p>
                                    <p className="text-gray-500 text-xs mt-2">Quoted: {quote.createdAt?.toLocaleString()}</p>

                                    {isPaidMember && isProblemOpen && quote.status === 'pending' && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleAcceptQuote(quote.id, quote.providerId)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                                            >
                                                Accept Quote
                                            </button>
                                        </div>
                                    )}
                                    {hasAcceptedQuote && quote.status === 'accepted' && (
                                        <p className="mt-4 text-green-600 font-bold text-sm">This quote has been accepted!</p>
                                    )}
                                     {hasAcceptedQuote && quote.status === 'pending' && (
                                        <p className="mt-4 text-gray-600 font-bold text-sm">Another quote was accepted for this problem.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {problem.status === 'closed' && hasAcceptedQuote && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2">Accepted Quote Details:</h4>
                            <p>Provider: {mockUserProfiles[acceptedProviderId]?.name || 'N/A'}</p>
                            <p>Amount: R{problem.quotes.find(q => q.id === problem.acceptedQuoteId)?.amount?.toFixed(2)}</p>
                            <button
                                onClick={() => setShowProviderDetailsModal(true)}
                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center"
                            >
                                <UserIcon size={18} className="mr-2" /> View Provider Contact Details
                            </button>
                        </div>
                    )}
                     {problem.status === 'closed' && hasAcceptedQuote && (
                        <button
                            onClick={handleMarkProblemResolved}
                            className="mt-6 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-lg flex items-center"
                        >
                            <CheckCircleIcon size={20} className="mr-2" /> Mark as Resolved
                        </button>
                    )}
                    {isProblemOpen && (
                        <button
                            onClick={handleDeleteProblem}
                            className="mt-6 px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-lg flex items-center"
                        >
                            <XCircleIcon size={20} className="mr-2" /> Delete Problem
                        </button>
                    )}
                </div>
            )}

            {showQuoteForm && (
                <QuoteModal
                    onClose={() => setShowQuoteForm(false)}
                    onSubmit={handleSendQuote}
                    problemTitle={problem.title}
                />
            )}
            {showMemberDetailsModal && (
                <MemberDetailsModal
                    onClose={() => setShowMemberDetailsModal(false)}
                    memberId={problem.requesterId}
                />
            )}
            {showProviderDetailsModal && acceptedProviderId && (
                <ProviderDetailsModal
                    onClose={() => setShowProviderDetailsModal(false)}
                    providerId={acceptedProviderId}
                />
            )}
            {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
};


// PostProblemModal component (for members to post problems)
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
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Post a New Problem</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemTitle">
                            Problem Title
                        </label>
                        <input
                            type="text"
                            id="problemTitle"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemDescription">
                            Description
                        </label>
                        <textarea
                            id="problemDescription"
                            rows="4"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemCategory">
                            Category
                        </label>
                        <input
                            type="text"
                            id="problemCategory"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="problemLocation">
                            Location
                        </label>
                        <input
                            type="text"
                            id="problemLocation"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedBudget">
                            Estimated Budget (R)
                        </label>
                        <input
                            type="number"
                            id="estimatedBudget"
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={estimatedBudget}
                            onChange={(e) => setEstimatedBudget(e.target.value)}
                            required
                        />
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

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
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Post Problem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// QuoteModal (for providers to submit quotes)
const QuoteModal = ({ onClose, onSubmit, problemTitle }) => {
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

        onSubmit({ proposedStartDate, proposedEndDate, proposedBudget: parseFloat(proposedBudget), motivation });
        onClose(); // Close the modal on successful submission
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Submit a Quote for "{problemTitle}"</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedStartDate">
                            Proposed Start Date
                        </label>
                        <input
                            type="date"
                            id="proposedStartDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={proposedStartDate}
                            onChange={(e) => setProposedStartDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedEndDate">
                            Proposed End Date
                        </label>
                        <input
                            type="date"
                            id="proposedEndDate"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={proposedEndDate}
                            onChange={(e) => setProposedEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposedBudget">
                            Proposed Budget (R)
                        </label>
                        <input
                            type="number"
                            id="proposedBudget"
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={proposedBudget}
                            onChange={(e) => setProposedBudget(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="motivation">
                            Motivation / Details of Work
                        </label>
                        <textarea
                            id="motivation"
                            rows="5"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

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

// MemberDetailsModal (Only for accepted providers to view member details)
const MemberDetailsModal = ({ onClose, memberId }) => {
    const { userProfiles: mockUserProfiles } = useContext(AppContext);
    const [memberDetails, setMemberDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            const details = mockUserProfiles[memberId];
            if (details) {
                setMemberDetails(details);
            } else {
                setError('Member details not found.');
            }
            setLoading(false);
        }, 300);
    }, [memberId, mockUserProfiles]);


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Member Details</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : memberDetails ? (
                    <div className="space-y-4">
                        <p><span className="font-semibold">Name:</span> {memberDetails.name}</p>
                        <p><span className="font-semibold">Email:</span> {memberDetails.email || 'N/A'}</p>
                        <p><span className="font-semibold">Phone:</span> {memberDetails.phone || 'N/A'}</p>
                        <p><span className="font-semibold">Address:</span> {memberDetails.address || 'N/A'}</p>
                        <p><span className="font-semibold">Bio:</span> {memberDetails.bio || 'N/A'}</p>
                    </div>
                ) : (
                    <p>No details found.</p>
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ProviderDetailsModal (for members to view accepted provider's details)
const ProviderDetailsModal = ({ onClose, providerId }) => {
    const { userProfiles: mockUserProfiles } = useContext(AppContext);
    const [providerDetails, setProviderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            const details = mockUserProfiles[providerId];
            if (details && details.role === 'provider') {
                setProviderDetails(details);
            } else {
                setError('Provider details not found.');
            }
            setLoading(false);
        }, 300);
    }, [providerId, mockUserProfiles]);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Provider Details</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : providerDetails ? (
                    <div className="space-y-4">
                        <p><span className="font-semibold">Company Name:</span> {providerDetails.companyName || 'N/A'}</p>
                        <p><span className="font-semibold">Contact Person:</span> {providerDetails.name}</p>
                        <p><span className="font-semibold">Email:</span> {providerDetails.email || 'N/A'}</p>
                        <p><span className="font-semibold">Phone:</span> {providerDetails.phone || 'N/A'}</p>
                        <p><span className="font-semibold">Specialties:</span> {providerDetails.specialties || 'N/A'}</p>
                        <p><span className="font-semibold">Address:</span> {providerDetails.address || 'N/A'}</p>
                        <p><span className="font-semibold">Bio:</span> {providerDetails.bio || 'N/A'}</p>
                    </div>
                ) : (
                    <p>No details found.</p>
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// MyQuotesPage (For Providers to manage their submitted quotes)
const MyQuotesPage = () => {
    const { userId, problems: mockProblems, setProblems: setMockProblems, setMessage } = useContext(AppContext);
    const [myQuotes, setMyQuotes] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    useEffect(() => {
        // Flatten all quotes from all problems that belong to the current provider
        let providerQuotes = [];
        mockProblems.forEach(problem => {
            problem.quotes.forEach(quote => {
                if (quote.providerId === userId) {
                    providerQuotes.push({
                        ...quote,
                        problemId: problem.id,
                        problemTitle: problem.title, // Add problem title for display
                        problemStatus: problem.status // Add problem status for context
                    });
                }
            });
        });
        setMyQuotes(providerQuotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [mockProblems, userId]);

    const handleWithdrawQuote = (quoteId, problemId) => {
        setConfirmMessage("Are you sure you want to withdraw this quote?");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems =>
                prevProblems.map(problem => {
                    if (problem.id === problemId) {
                        return {
                            ...problem,
                            quotes: problem.quotes.filter(quote => quote.id !== quoteId)
                        };
                    }
                    return problem;
                })
            );
            setMessage({ type: 'success', text: 'Quote withdrawn successfully!' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' }); // Clear existing message
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
                                <th className="py-3 px-6 text-center">Problem Status</th> {/* Added for context */}
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
                                    // Add this state definition before line 2616
const [mockProblems, setMockProblems] = useState([]);

                                    <td className="py-3 px-6 text-center">
                                        {quote.status === 'pending' && quote.problemStatus === 'open' && (
                                            <button
                                                onClick={() => handleWithdrawQuote(quote.id, quote.problemId)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                        {quote.status === 'accepted' && (
                                            <span className="text-green-600 text-sm font-bold">Accepted!</span>
                                        )}
                                        {quote.status === 'pending' && quote.problemStatus === 'closed' && (
                                             <span className="text-gray-500 text-xs">Problem Closed</span>
                                        )}
                                        {quote.status === 'pending' && quote.problemStatus === 'resolved' && (
                                             <span className="text-gray-500 text-xs">Problem Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
};

// MyRequestsPage (For Members to manage their posted problems and received quotes)
const MyRequestsPage = () => {
    const { userId, problems, isPaidMember, updateProblemInFirestore, deleteProblemFromFirestore, setMessage } = useContext(AppContext);
    const [myProblems, setMyProblems] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    useEffect(() => {
        // Filter problems posted by the current user
        const memberProblems = mockProblems.filter(problem => problem.requesterId === userId);
        setMyProblems(memberProblems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, [mockProblems, userId]);

    const handleAcceptQuote = (problemId, quoteId) => {
        setConfirmMessage("By accepting this quote, your contact information (name, email, phone) will be shared with the selected provider. Do you wish to proceed?");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems =>
                prevProblems.map(problem => {
                    if (problem.id === problemId) {
                        return {
                            ...problem,
                            status: 'closed',
                            acceptedQuoteId: quoteId,
                            quotes: problem.quotes.map(q =>
                                q.id === quoteId ? { ...q, status: 'accepted' } : q
                            )
                        };
                    }
                    return problem;
                })
            );
            setMessage({ type: 'success', text: 'Quote accepted and problem closed! Provider contact details now available.' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' });
        setShowConfirmModal(true);
    };

    const handleMarkProblemResolved = (problemId) => {
        setConfirmMessage("Are you sure you want to mark this problem as resolved? This cannot be undone.");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems =>
                prevProblems.map(problem =>
                    problem.id === problemId ? { ...problem, status: 'resolved' } : problem
                )
            );
            setMessage({ type: 'success', text: 'Problem marked as resolved!' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' });
        setShowConfirmModal(true);
    };

    const handleDeleteProblem = (problemId) => {
        setConfirmMessage("Are you sure you want to delete this problem and all associated quotes? This action is irreversible.");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems => prevProblems.filter(problem => problem.id !== problemId));
            setMessage({ type: 'success', text: 'Problem and all associated quotes deleted successfully!' });
            setShowConfirmModal(false);
        });
        setMessage({ type: '', text: '' });
        setShowConfirmModal(true);
    };


// ✅ Move useContext to the top level of the component
const { setCurrentPage } = useContext(AppContext);

if (!isPaidMember) {
    return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
    <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
    <p className="text-gray-700 mb-6">
      You must be a <strong>paid member</strong> to view and manage quotes for your problems.
      Free members can post problems (limit 5) but require a paid membership for full interaction.
    </p>
    <button
      onClick={() => setCurrentPage('pricing')}
      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
    >
      Upgrade Membership
    </button>
  </div>
);

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
                        <div key={problem.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
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
                                <button
                                    onClick={() => window.location.hash = `problem-detail/${problem.id}`}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm flex items-center"
                                >
                                    <PackageIcon size={18} className="mr-2" /> View Quotes ({problem.quotes?.length || 0})
                                </button>
                                {problem.status === 'open' && (
                                    <button
                                        onClick={() => handleDeleteProblem(problem.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm flex items-center"
                                    >
                                        <XCircleIcon size={18} className="mr-2" /> Delete Problem
                                    </button>
                                )}
                                {(problem.status === 'closed' && problem.acceptedQuoteId) && (
                                    <button
                                        onClick={() => handleMarkProblemResolved(problem.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 text-sm flex items-center"
                                    >
                                        <CheckCircleIcon size={18} className="mr-2" /> Mark as Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
};


// AdminToolsPage
const AdminToolsPage = ({ onNavigate }) => { // onNavigate prop added
    const { userRole, problems: mockProblems, setProblems: setMockProblems, userProfiles: mockUserProfiles, setUserProfiles: setMockUserProfiles, setMessage } = useContext(AppContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleApproveProblem = (problemId) => {
        setMockProblems(prevProblems =>
            prevProblems.map(problem =>
                problem.id === problemId ? { ...problem, isApproved: true } : problem
            )
        );
        setMessage({ type: 'success', text: `Problem ${problemId} approved.` });
    };

    const handleDeleteProblem = (problemId) => {
        setConfirmMessage("Are you sure you want to delete this problem and all its quotes? This is permanent.");
        setConfirmAction(() => () => {
            setMockProblems(prevProblems => prevProblems.filter(problem => problem.id !== problemId));
            setMessage({ type: 'success', text: `Problem ${problemId} deleted.` });
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    const handleApproveProvider = (providerId) => {
        setMockUserProfiles(prevProfiles => ({
            ...prevProfiles,
            [providerId]: { ...prevProfiles[providerId], isProviderApproved: true }
        }));
        setMessage({ type: 'success', text: `Provider ${mockUserProfiles[providerId]?.name} approved.` });
    };

    const handleDeleteProvider = (providerId) => {
        setConfirmMessage("Are you sure you want to delete this provider? This will remove their profile.");
        setConfirmAction(() => () => {
            setMockUserProfiles(prevProfiles => {
                const newProfiles = { ...prevProfiles };
                delete newProfiles[providerId];
                return newProfiles;
            });
            setMessage({ type: 'success', text: `Provider ${providerId} deleted.` });
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
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Admin Quick Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => onNavigate('admin-pricing')}
                            className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center justify-center"
                        >
                            <DollarSignIcon size={20} className="mr-2" /> Manage Pricing Plans
                        </button>
                        <button
                            onClick={() => onNavigate('admin-branding')} // New button for branding
                            className="px-4 py-2 bg-[#964b00] text-white rounded-md hover:bg-[#b3641a] transition-colors duration-200 flex items-center justify-center"
                        >
                            <PaintbrushIcon size={20} className="mr-2" /> Manage Branding
                        </button>
                    </div>
                </div>

                {/* Problem Management */}
                <div className="border border-gray-200 rounded-lg p-4">
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
                                        <button
                                            onClick={() => handleApproveProblem(problem.id)}
                                            className="ml-3 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProblem(problem.id)}
                                            className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
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
                                <button
                                    onClick={() => handleDeleteProblem(problem.id)}
                                    className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                     </ul>
                </div>

                {/* Provider Management */}
                <div className="border border-gray-200 rounded-lg p-4">
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
                                        <button
                                            onClick={() => handleApproveProvider(provider.uid)}
                                            className="ml-3 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProvider(provider.uid)}
                                            className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
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
                                <button
                                    onClick={() => handleDeleteProvider(provider.uid)}
                                    className="ml-3 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                     </ul>
                </div>
            </div>
            {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
};

// AdminPricingPage component
const AdminPricingPage = () => {
    const { userRole, pricingPlans: mockPricingPlans, savePricingPlanToFirestore, deletePricingPlanFromFirestore, setMessage } = useContext(AppContext);
    const [showEditPlanModal, setShowEditPlanModal] = useState(false);
    const [currentEditingPlan, setCurrentEditingPlan] = useState(null); // null for new, object for edit
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleAddPlan = () => {
        setCurrentEditingPlan(null); // Indicate new plan
        setShowEditPlanModal(true);
    };

    const handleEditPlan = (plan) => {
        setCurrentEditingPlan(plan);
        setShowEditPlanModal(true);
    };

    const handleSavePlan = (updatedPlan) => {
        // This will call the savePricingPlanToFirestore mock function from context
        savePricingPlanToFirestore(updatedPlan);
        setMessage({ type: 'success', text: updatedPlan.id ? `Plan "${updatedPlan.name}" updated successfully!` : `New plan "${updatedPlan.name}" added successfully!` });
        setShowEditPlanModal(false);
    };

    const handleDeletePlan = (planId, planName) => {
        setConfirmMessage(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`);
        setConfirmAction(() => () => {
            // This will call the deletePricingPlanFromFirestore mock function from context
            deletePricingPlanFromFirestore(planId, planName);
            setMessage({ type: 'success', text: `Plan "${planName}" deleted successfully!` });
            setShowConfirmModal(false);
        });
        setShowConfirmModal(true);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
                <DollarSignIcon size={28} className="mr-3 text-[#964b00]" /> Manage Pricing Plans
                <button
                    onClick={handleAddPlan}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                >
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
                                        <button
                                            onClick={() => handleEditPlan(plan)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-xs mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-xs"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showEditPlanModal && (
                <EditPricingPlanModal
                    plan={currentEditingPlan}
                    onClose={() => setShowEditPlanModal(false)}
                    onSave={handleSavePlan}
                />
            )}
             {showConfirmModal && (
                <ConfirmationModal
                    message={confirmMessage}
                    onConfirm={confirmAction}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}
        </div>
    );
};

// EditPricingPlanModal component
const EditPricingPlanModal = ({ plan, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        id: plan?.id || null,
        name: plan?.name || '',
        price: String(plan?.rawPrice || ''), // Use rawPrice as the number for editing
        rawPrice: plan?.rawPrice || '',
        interval: plan?.interval || 'monthly',
        planCode: plan?.planCode || '',
        features: plan?.features?.join('\n') || '', // Convert array to newline separated string
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (plan) {
            setFormData({
                id: plan.id,
                name: plan.name,
                price: String(plan.rawPrice), // Use rawPrice as the number for editing
                rawPrice: plan.rawPrice,
                interval: plan.interval,
                planCode: plan.planCode,
                features: plan.features.join('\n'),
            });
        } else {
             // Reset for new plan
            setFormData({
                id: null,
                name: '',
                price: '',
                rawPrice: '',
                interval: 'monthly',
                planCode: '',
                features: '',
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

        if (!name || !price || !interval || !planCode || !features) {
            setFormError('All fields are required.');
            return;
        }
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setFormError('Price must be a positive number.');
            return;
        }

        const updatedPlan = {
            id: formData.id,
            name,
            price: `R${parsedPrice.toFixed(0)}/${interval}`, // Reformat price string
            rawPrice: parsedPrice,
            interval,
            planCode,
            features: features.split('\n').map(f => f.trim()).filter(f => f), // Convert back to array
        };

        onSave(updatedPlan);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{plan ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planName">
                            Plan Name
                        </label>
                        <input
                            type="text"
                            id="planName"
                            name="name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planPrice">
                            Price (e.g., 50, 150)
                        </label>
                        <input
                            type="number"
                            id="planPrice"
                            name="price"
                            step="1"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planInterval">
                            Interval
                        </label>
                        <select
                            id="planInterval"
                            name="interval"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.interval}
                            onChange={handleChange}
                            required
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planCode">
                            Paystack Plan Code
                        </label>
                        <input
                            type="text"
                            id="planCode"
                            name="planCode"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.planCode}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="planFeatures">
                            Features (one per line)
                        </label>
                        <textarea
                            id="planFeatures"
                            name="features"
                            rows="5"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.features}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

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
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            {plan ? 'Save Changes' : 'Add Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// AdminBrandingPage component
const AdminBrandingPage = () => {
    const { userRole, appName, setAppName, appLogo, setAppLogo, updateBrandingInFirestore, setMessage } = useContext(AppContext);
    const [tempAppName, setTempAppName] = useState(appName);
    const [tempAppLogo, setTempAppLogo] = useState(appLogo);

    // Update temp states when global appName/appLogo changes (e.g., on initial load from Firestore)
    useEffect(() => {
        setTempAppName(appName);
        setTempAppLogo(appLogo);
    }, [appName, appLogo]);

    if (userRole !== 'admin') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">You must be an **admin** to access this page.</p>
            </div>
        );
    }

    const handleSaveBranding = () => {
        // Validation: basic URL check for logo
        if (tempAppLogo && !/^https?:\/\/.+\..+/.test(tempAppLogo)) {
            setMessage({ type: 'error', text: 'Please enter a valid URL for the logo (starts with http:// or https://).' });
            return;
        }
        updateBrandingInFirestore(tempAppName, tempAppLogo);
        setMessage({ type: 'success', text: 'Branding updated successfully!' });
    };

    const handleResetBranding = () => {
        // Reset to default values and save to Firestore
        updateBrandingInFirestore('Mphakathi Online', 'https://placehold.co/100x40/964b00/ffffff?text=Logo');
        setMessage({ type: 'info', text: 'Branding reset to default values.' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <PaintbrushIcon size={28} className="mr-3 text-[#964b00]" /> Manage Branding
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="app-name-input">
                        Application Name
                    </label>
                    <input
                        type="text"
                        id="app-name-input"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={tempAppName}
                        onChange={(e) => setTempAppName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="app-logo-input">
                        Logo Image URL
                    </label>
                    <input
                        type="url"
                        id="app-logo-input"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={tempAppLogo}
                        onChange={(e) => setTempAppLogo(e.target.value)}
                        placeholder="e.g., https://example.com/logo.png"
                    />
                    {tempAppLogo && (
                        <div className="mt-4 p-2 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center">
                            <img
                                src={tempAppLogo}
                                alt="Current Logo Preview"
                                className="max-w-xs max-h-24 object-contain"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x40/cccccc/333333?text=Invalid+URL"; setMessage({ type: 'error', text: 'Invalid logo URL provided.' }); }}
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={handleResetBranding}
                        className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSaveBranding}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

}

/**
 * Renders the Settings page for user account management and preferences.
 * Displays account information, notification settings, and data management options.
 * 
 * @component
 * @returns {JSX.Element} A settings page with user account details and configuration options
 */
// Settings component (renamed from App)
const SettingsPage = () => {
    const { userId, userRole, isPaidMember } = useContext(AppContext);
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <SettingsIcon size={28} className="mr-3 text-[#964b00]" /> Settings
            </h2>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Account Information</h3>
                    <p className="text-gray-600">Your unique User ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded-sm text-sm">{userId || 'N/A'}</span></p>
                    <p className="text-gray-600">Your Role: <span className="font-semibold capitalize">{userRole}</span></p>
                    {userRole === 'member' && (
                        <p className="text-gray-600">Membership Status: <span className={`font-semibold ${isPaidMember ? 'text-blue-600' : 'text-yellow-600'}`}>{isPaidMember ? 'Paid' : 'Free'}</span></p>
                    )}
                    <p className="text-gray-600 mt-2">Manage your public profile visibility and contact information from the Profile page.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Notification Preferences</h3>
                    <p className="text-gray-600">Configure how you receive alerts for new activity.</p>
                    <div className="mt-3 flex items-center">
                        <input type="checkbox" id="email-notifications" className="mr-2" defaultChecked />
                        <label htmlFor="email-notifications" className="text-gray-700">Email notifications</label>
                    </div>
                    <div className="mt-2 flex items-center">
                        <input type="checkbox" id="sms-notifications" className="mr-2" />
                        <label htmlFor="sms-notifications" className="text-gray-700">SMS notifications (coming soon)</label>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
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

export default App;

