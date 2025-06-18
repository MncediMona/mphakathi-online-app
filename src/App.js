import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    addDoc,
    serverTimestamp,
    onSnapshot
} from 'firebase/firestore';
import Chart from 'chart.js/auto'; // For the benefit chart

/* global __app_id, __firebase_config, __initial_auth_token */

// Firebase Initialization
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Services Data (Hardcoded for LLM Suggester and public display)
const servicesListForLLM = `
    Security Services: Community Guarding & Response (R100-R250 / callout), Affordable Alarm Systems (R150-R300 callout), Community CCTV Setup (From R200+ / setup), Safe Escort Services (From R50 / hour), Offline Crime Reporting App (Included with Membership).
    Asset Management: Informal Dispute Resolution (Free for Members / R100 non-members), Basic Property Advisory (R50 / month for Members), Simplified Lease Agreements (R50 once-off), Legal Support Navigation (R200-R1000 / consultation).
    Screening Services: Community-Based Tenant Vetting (R100 once-off), Domestic Worker/Gardener Vetting (R80 once-off), Affordable Property Listing (R500 once-off for tenant finding).
    Community Convenience & Support: Clinic/Hospital Drop-off (R50-R100 / trip), Grocery Collection (R30-R50 / trip), Local Delivery Service (R30-R50 / delivery), Medication Collection (R30-R50 / collection), Queuing Service (R40-R60 / hour).
`;

const serviceCategories = [
    { id: 'security', name: 'Security', icon: '🛡️', description: 'Solutions to keep your home and family safe.' },
    { id: 'asset', name: 'Asset Management', icon: '🏡', description: 'Support for property, legal, and financial matters.' },
    { id: 'screening', name: 'Screening', icon: '🤝', description: 'Vetting services for tenants, domestic workers, and more.' },
    { id: 'convenience', name: 'Convenience', icon: '📦', description: 'Daily errands and support to ease your life.' }
];

// Inline SVG Icons (replacing lucide-react)
const HomeIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12H2l10-10 10 10h-3"></path>
        <path d="M19 22v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path>
        <path d="M12 22v-4"></path>
    </svg>
);

const UserIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M12 14v6"></path>
        <path d="M7 19h10"></path>
    </svg>
);

const DollarSignIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);

const BriefcaseIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
);

const PlusCircleIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const SearchIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const CalendarIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const AwardIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="8" r="7"></circle>
        <path d="M8.21 13.89l-1.63 4.54 4.54-1.63L12 21l-1.63-4.54L5.83 13.89z"></path>
    </svg>
);

const MessageCircleIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-2.2c-.3-.4-.5-.9-.6-1.4A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 7.6 4.7c.4.9.6 1.9.7 2.9z"></path>
    </svg>
);

const LogOutIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="17 16 22 11 17 6"></polyline>
        <line x1="22" y1="11" x2="10" y2="11"></line>
    </svg>
);

const CheckCircleIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-8.81"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const XCircleIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

const MailIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
        <path d="M22 6L12 13L2 6"></path>
    </svg>
);

const PhoneIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2H7.08a2 2 0 0 1 2 1.74 15.74 15.74 0 0 0 .96 4.37 2 2 0 0 1-.27 2.1l-1.93 1.93a15 15 0 0 0 6 6l1.93-1.93a2 2 0 0 1 2.1-.27 15.74 15.74 0 0 0 4.35.96A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const MapPinIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 21.7C17.3 17 22 13 22 9A7 7 0 0 0 12 2a7 7 0 0 0-10 7c0 4 4.7 8 9.7 12.7z"></path>
        <circle cx="12" cy="9" r="3"></circle>
    </svg>
);

const InfoIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const WalletIcon = ({ size = 24, className = '', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H5a2 2 0 0 0 0 4h12a2 2 0 0 0 2-2v-3"></path>
        <path d="M19 17v-2"></path>
    </svg>
);


// Reusable Modal Component
const Modal = ({ show, title, message, onClose, onConfirm, showConfirm = false, confirmText = "Confirm" }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Close</button>
                    {showConfirm && (
                        <button onClick={onConfirm} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">{confirmText}</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable Loading Spinner
const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
        <p className="text-gray-600">{message}</p>
    </div>
);

// --- Public Pages ---

const HomePage = ({ onNavigate, userId, userProfile, currentAuthUser }) => {
    // LLM Service Suggester Refs
    const userNeedInputRef = useRef(null);
    const suggestionLoadingRef = useRef(null);
    const serviceSuggestionOutputRef = useRef(null);
    const chartInstance = useRef(null); // For the cost-benefit chart

    const [activeCategoryTab, setActiveCategoryTab] = useState('security');
    const [recentProblems, setRecentProblems] = useState([]);
    const [problemsLoading, setProblemsLoading] = useState(true);

    // Fetch recent problems for the homepage tabs
    useEffect(() => {
        const fetchRecentProblems = async () => {
            setProblemsLoading(true);
            try {
                // Fetch up to 3 recent open problems for the active category
                const q = query(
                    collection(db, `artifacts/${appId}/serviceRequests`),
                    where("category", "==", activeCategoryTab),
                    where("status", "==", "pending"), // Only show open problems
                    // orderBy("createdAt", "desc"), // Disabling orderBy due to potential index issues as per instructions
                    // limit(3) // Limit the number of problems
                );
                const querySnapshot = await getDocs(q);
                let problems = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate().toLocaleString()
                }));
                // Sort in memory and limit if orderBy is not used
                problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setRecentProblems(problems.slice(0, 3));
            } catch (error) {
                console.error("Error fetching recent problems:", error);
                setRecentProblems([]);
            } finally {
                setProblemsLoading(false);
            }
        };

        fetchRecentProblems();
    }, [activeCategoryTab]); // Re-fetch when category tab changes

    const handleGetSuggestion = async () => {
        const userPrompt = userNeedInputRef.current.value.trim();
        if (!userPrompt) {
            serviceSuggestionOutputRef.current.innerHTML = '<p class="text-red-500">Please describe your need to get a suggestion.</p>';
            return;
        }

        suggestionLoadingRef.current.classList.remove('hidden');
        serviceSuggestionOutputRef.current.innerHTML = ''; // Clear previous output

        const prompt = `
            Based on the Mphakathi Online services and pricing provided below, and the user's described need, suggest which Mphakathi Online service(s) would be most suitable. Explain why, and provide the approximate price range if applicable. If no direct service applies, suggest the closest one or a general community support idea. Keep the response concise and helpful.

            Mphakathi Online Services:
            ${servicesListForLLM}

            User's Need: "${userPrompt}"
        `;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // API Key set to empty string for secure Canvas runtime injection
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                serviceSuggestionOutputRef.current.innerHTML = `<p>${text}</p>`;
            } else {
                serviceSuggestionOutputRef.current.innerHTML = '<p class="text-red-500">Could not get a suggestion. Please try again.</p>';
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            serviceSuggestionOutputRef.current.innerHTML = '<p class="text-red-500">An error occurred while getting suggestions. Please try again later.</p>';
        } finally {
            suggestionLoadingRef.current.classList.add('hidden');
        }
    };

    // Chart.js Initialization
    useEffect(() => {
        const ctx = document.getElementById('costBenefitChart')?.getContext('2d');
        if (ctx) {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Your Monthly Cost vs. Potential Incident Cost'],
                    datasets: [
                        {
                            label: 'MKYN Monthly Membership',
                            data: [50],
                            backgroundColor: 'rgba(217, 119, 6, 0.8)', // amber-600
                            borderColor: 'rgba(217, 119, 6, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Avg. Cost of One Burglary',
                            data: [4500],
                            backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'R ' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function(tooltipItems) {
                                    const item = tooltipItems[0];
                                    let label = item.chart.data.labels[item.dataIndex];
                                    if (Array.isArray(label)) {
                                        return label.join(' ');
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }, []);

    return (
        <div className="bg-amber-50 min-h-screen">
            <header className="bg-amber-800 text-white shadow-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <img src="https://i.ibb.co/WNnqYmPf/MO-Official-Logo.png" alt="MO-Official-Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                    <div className="space-x-4">
                        <button onClick={() => onNavigate('pricing')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Pricing</button>
                        <button onClick={() => onNavigate('problemLists')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Problem Listings</button>
                        {!currentAuthUser ? (
                            <>
                                <button onClick={() => onNavigate('login')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Login</button>
                                <button onClick={() => onNavigate('signup')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Sign Up</button>
                            </>
                        ) : (
                            <>
                                {userProfile?.role === 'member' && (
                                    <button onClick={() => onNavigate('memberDashboard')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Dashboard</button>
                                )}
                                {userProfile?.role === 'provider' && (
                                    <button onClick={() => onNavigate('providerDashboard')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Dashboard</button>
                                )}
                                <button onClick={() => auth.signOut()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Logout</button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                <section className="bg-amber-700 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Safer Homes, Stronger Communities.</h1>
                        <p className="text-lg md:text-xl text-amber-200 max-w-3xl mx-auto">
                            Mphakathi Online is here to empower our community in Soweto by connecting those with needs to reliable, local service providers.
                        </p>
                        {userId && (
                            <p className="mt-4 text-sm text-amber-100">
                                Your User ID: <span className="font-semibold">{userId}</span>
                                {userProfile && userProfile.membershipStatus && userProfile.role && (
                                    <span className="ml-4">Role: <span className="font-semibold capitalize">{userProfile.role}</span> | Membership: <span className="font-semibold">{userProfile.membershipStatus}</span></span>
                                )}
                            </p>
                        )}
                        <div className="mt-8 space-x-4">
                            <button onClick={() => onNavigate('signup')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">Join as Member</button>
                            <button onClick={() => onNavigate('becomeProvider')} className="bg-white hover:bg-gray-100 text-amber-800 font-bold py-3 px-6 rounded-lg transition duration-300">Become a Provider</button>
                        </div>
                    </div>
                </section>

                <section id="services" className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Our Services, Designed For You</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Mphakathi Online connects community members to verified, local service providers for these essential needs.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {serviceCategories.map(category => (
                                <div key={category.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                    <h3 className="text-xl font-bold text-amber-700 mb-2">{category.icon} {category.name}</h3>
                                    <p className="text-gray-600">{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Problem Listings on Home Page */}
                <section id="problem-listings" className="py-16 md:py-20 bg-amber-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Community Needs: Recent Problems Posted</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">See how members are using Mphakathi Online to find solutions. Providers can click "View All" to help!</p>
                        </div>
                        <div className="flex justify-center mb-8 flex-wrap">
                            {serviceCategories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategoryTab(category.id)}
                                    className={`px-6 py-3 rounded-t-lg font-semibold text-lg transition-colors duration-300 ${activeCategoryTab === category.id ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {problemsLoading ? (
                            <LoadingSpinner message={`Loading ${activeCategoryTab} problems...`} />
                        ) : recentProblems.length === 0 ? (
                            <p className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">No recent {activeCategoryTab} problems posted yet. Be the first to create one!</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recentProblems.map(problem => (
                                    <div key={problem.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-amber-600">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{problem.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{problem.description}</p>
                                        <p className="text-xs text-gray-500">Category: <span className="font-semibold capitalize">{problem.category}</span></p>
                                        <p className="text-xs text-gray-500">Location: <span className="font-semibold">{problem.location || 'N/A'}</span></p>
                                        <p className="text-xs text-gray-500">Posted on: {problem.createdAt}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="text-center mt-10">
                            <button onClick={() => onNavigate('problemLists')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">View All Problem Listings</button>
                        </div>
                    </div>
                </section>


                {/* LLM-Powered Service Recommender Section */}
                <section id="llm-recommender" className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Unsure What You Need? Ask Our AI! ✨</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                                Describe your situation or challenge, and our Mphakathi AI will suggest the best services for you from our provider network.
                            </p>
                        </div>
                        <div className="bg-amber-50 p-8 rounded-xl shadow-md max-w-3xl mx-auto">
                            <textarea
                                ref={userNeedInputRef}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-amber-500 focus:border-amber-500 mb-4"
                                rows="4"
                                placeholder="e.g., 'I need help getting my grandmother's medication from the clinic.', or 'My tenant isn't paying rent and I need advice.'"
                            ></textarea>
                            <button
                                onClick={handleGetSuggestion}
                                className="bg-[#1A3A5A] hover:bg-[#3E618A] text-white font-bold py-3 px-6 rounded-lg transition duration-300 w-full md:w-auto"
                            >
                                Get Service Suggestion ✨
                            </button>
                            <div ref={suggestionLoadingRef} className="mt-4 text-center text-gray-600 hidden">
                                <LoadingSpinner message="Fetching suggestion..." />
                            </div>
                            <div ref={serviceSuggestionOutputRef} className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 text-gray-700">
                                Suggestions will appear here.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Why Choose Mphakathi Online?</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">We are more than a service. We are your neighbours, committed to building a better, safer Soweto together by connecting you to the right help.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                            <div className="bg-amber-50 p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">💰</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Affordable for Soweto</h3>
                                <p className="text-gray-600">Our prices are designed to fit your budget, connecting you to cost-effective local solutions.</p>
                            </div>
                            <div className="bg-amber-50 p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">❤️</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">From Soweto, For Soweto</h3>
                                <p className="text-gray-600">We understand our community's needs and empower local providers to serve their neighbours.</p>
                            </div>
                            <div className="bg-amber-50 p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">👷</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Local Employment</h3>
                                <p className="text-gray-600">We create opportunities by connecting skilled individuals with community needs, fostering local growth.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="value" className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">An Investment in Your Peace of Mind</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">See how our low monthly fee compares to the high potential cost of a single security incident. Proactive safety is always more affordable.</p>
                        </div>
                        <div className="chart-container w-full max-w-2xl mx-auto h-80 md:h-96 max-h-[400px] relative">
                            <canvas id="costBenefitChart"></canvas>
                        </div>
                    </div>
                </section>

                <section id="join" className="bg-amber-800 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-4">Join Our Mphakathi Today!</h2>
                        <p className="text-lg text-amber-200 mb-6 max-w-3xl mx-auto">Become a Community Member and unlock a safer, stronger community for your family and neighbours, powered by our network of local providers.</p>
                        <div className="bg-white text-gray-800 rounded-lg p-8 inline-block shadow-lg">
                            <p className="text-xl font-bold">Membership</p>
                            <p className="text-4xl font-bold my-2">R50 <span className="text-lg font-normal">/ month</span></p>
                            <p className="text-gray-600">+ R150 once-off joining fee</p>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                            <p className="text-amber-200 mb-2">Contact us today!</p>
                            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 text-lg">
                                <span><MailIcon className="inline-block mr-2" size={20} /> Email: info@mphakathi.co.za</span>
                                <span><PhoneIcon className="inline-block mr-2" size={20} /> Call: 0782262177</span>
                                <span><MessageCircleIcon className="inline-block mr-2" size={20} /> WhatsApp: 0685326165</span>
                                <span><MapPinIcon className="inline-block mr-2" size={20} /> Visit: Orange Street, Protea Glenn, Soweto</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; 2025 Back Effort Works T/A Mphakathi Online. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const LoginPage = ({ onNavigate, setCurrentUser, setUserProfile, setShowModal, setModalContent }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setCurrentUser(user);

            const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/doc`);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setUserProfile(userDocSnap.data());
                setShowModal(true);
                setModalContent({ title: "Success", message: `Welcome back, ${userDocSnap.data().name || user.email}!` });
                if (userDocSnap.data().role === 'member') {
                    onNavigate('memberDashboard');
                } else if (userDocSnap.data().role === 'provider') {
                    onNavigate('providerDashboard');
                } else {
                    onNavigate('home'); // Fallback
                }
            } else {
                // Should not happen if signup created the profile correctly
                setShowModal(true);
                setModalContent({ title: "Error", message: "User profile not found. Please contact support." });
                await signOut(auth); // Force logout
                onNavigate('login');
            }
        } catch (error) {
            console.error("Login error:", error);
            setShowModal(true);
            let errorMessage = "Login failed. Please check your credentials.";
            if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed login attempts. Please try again later.";
            }
            setModalContent({ title: "Login Error", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner message="Signing in..." /> : 'Sign in'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <p className="text-gray-600">Don't have an account? <button onClick={() => onNavigate('signup')} className="font-medium text-amber-600 hover:text-amber-500">Sign up</button></p>
                    <p className="mt-2 text-gray-600">Back to <button onClick={() => onNavigate('home')} className="font-medium text-amber-600 hover:text-amber-500">Home</button></p>
                </div>
            </div>
        </div>
    );
};

const SignupPage = ({ onNavigate, setShowModal, setModalContent }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Default role is 'member' for signup
            const userProfileData = {
                uid: user.uid,
                role: 'member',
                name: name,
                email: email,
                isProviderApproved: false, // Only applicable if they later become a provider
                isProviderPaid: false, // Only applicable if they later become a provider
                membershipStatus: 'Free', // Default for new members
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            };

            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profile/doc`), userProfileData);

            setShowModal(true);
            setModalContent({
                title: "Success",
                message: "Account created successfully! You are now logged in as a Member."
            });
            onNavigate('memberDashboard');
        } catch (error) {
            console.error("Signup error:", error);
            setShowModal(true);
            let errorMessage = "Signup failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email address is already in use.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please choose a stronger password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            }
            setModalContent({ title: "Signup Error", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a New Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Join as a Member for free</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner message="Creating account..." /> : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <p className="text-gray-600">Already have an account? <button onClick={() => onNavigate('login')} className="font-medium text-amber-600 hover:text-amber-500">Sign in</button></p>
                    <p className="mt-2 text-gray-600">Back to <button onClick={() => onNavigate('home')} className="font-medium text-amber-600 hover:text-amber-500">Home</button></p>
                </div>
            </div>
        </div>
    );
};

const BecomeProviderPage = ({ onNavigate, userId, setShowModal, setModalContent, userProfile }) => {
    const [providerName, setProviderName] = useState('');
    const [providerContact, setProviderContact] = useState('');
    const [providerService, setProviderService] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmitApplication = async (e) => {
        e.preventDefault();
        if (!userId) {
            setShowModal(true);
            setModalContent({ title: "Error", message: "You must be logged in to apply as a provider." });
            return;
        }
        setLoading(true);
        try {
            // Add application to a 'providerApplications' collection
            await addDoc(collection(db, `artifacts/${appId}/providerApplications`), {
                userId: userId,
                name: providerName,
                contact: providerContact,
                service: providerService,
                status: 'pending', // pending, approved, rejected
                applicationDate: serverTimestamp(),
            });

            // Update user's role to 'pending_provider'
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
            await updateDoc(userDocRef, {
                role: 'pending_provider',
                applicationSubmitted: true
            });

            setShowModal(true);
            setModalContent({ title: "Application Submitted", message: "Thank you for your interest! Your provider application has been submitted and is awaiting review. We will contact you soon." });
            onNavigate('home');
        } catch (error) {
            console.error("Error submitting provider application:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to submit application. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Become a Mphakathi Provider</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Join our network and offer services to the community.</p>
                </div>
                {!userId ? (
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Please log in or sign up to apply as a provider.</p>
                        <button onClick={() => onNavigate('login')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 mr-2">Login</button>
                        <button onClick={() => onNavigate('signup')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300">Sign Up</button>
                    </div>
                ) : userProfile?.role === 'pending_provider' ? (
                    <div className="text-center p-6 bg-blue-100 border border-blue-200 text-blue-800 rounded-lg">
                        <InfoIcon className="inline-block mr-2" size={20} />
                        <p className="font-semibold">Your provider application is currently pending review.</p>
                        <p className="text-sm mt-2">We will notify you once it has been processed.</p>
                        <button onClick={() => onNavigate('home')} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Back to Home</button>
                    </div>
                ) : userProfile?.role === 'provider' ? (
                    <div className="text-center p-6 bg-green-100 border border-green-200 text-green-800 rounded-lg">
                        <CheckCircleIcon className="inline-block mr-2" size={20} />
                        <p className="font-semibold">You are already an approved Mphakathi Provider!</p>
                        <p className="text-sm mt-2">Proceed to your dashboard to manage your services.</p>
                        <button onClick={() => onNavigate('providerDashboard')} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Go to Dashboard</button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmitApplication}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="provider-name" className="sr-only">Your Name / Business Name</label>
                                <input
                                    id="provider-name"
                                    name="provider-name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                    placeholder="Your Name or Business Name"
                                    value={providerName}
                                    onChange={(e) => setProviderName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="provider-contact" className="sr-only">Contact Number or Email</label>
                                <input
                                    id="provider-contact"
                                    name="provider-contact"
                                    type="text"
                                    autoComplete="tel"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                    placeholder="Contact Number or Email"
                                    value={providerContact}
                                    onChange={(e) => setProviderContact(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="provider-service" className="sr-only">Services You Offer</label>
                                <textarea
                                    id="provider-service"
                                    name="provider-service"
                                    rows="3"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                                    placeholder="Briefly describe the services you can offer (e.g., 'Home security installations', 'Tenant background checks', 'Local deliveries')"
                                    value={providerService}
                                    onChange={(e) => setProviderService(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                                disabled={loading}
                            >
                                {loading ? <LoadingSpinner message="Submitting..." /> : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                )}
                <div className="text-center text-sm mt-4">
                    <button onClick={() => onNavigate('home')} className="font-medium text-amber-600 hover:text-amber-500">Back to Home</button>
                </div>
            </div>
        </div>
    );
};

const PricingPage = ({ onNavigate }) => {
    const pricingTiers = [
        {
            name: 'Bronze',
            price: 'R50',
            frequency: '/month',
            description: 'Basic access to community services.',
            features: [
                'Access to Problem Listing platform',
                'Basic community support resources',
                'Emergency contact directory'
            ],
            buttonText: 'Get Started (Current)'
        },
        {
            name: 'Silver',
            price: 'R150',
            frequency: '/month',
            description: 'Enhanced access with priority support.',
            features: [
                'All Bronze features',
                'Priority matching with providers',
                'Dispute resolution support (limited)',
                '1 free basic service consultation/month'
            ],
            buttonText: 'Choose Silver'
        },
        {
            name: 'Gold',
            price: 'R300',
            frequency: '/month',
            description: 'Premium benefits for comprehensive support.',
            features: [
                'All Silver features',
                'Dedicated account manager',
                'Unlimited dispute resolution support',
                '2 free basic service consultations/month',
                'Exclusive early access to new services'
            ],
            buttonText: 'Choose Gold'
        },
        {
            name: 'Platinum',
            price: 'R500',
            frequency: '/month',
            description: 'Ultimate safety and convenience package.',
            features: [
                'All Gold features',
                '24/7 priority emergency response coordination',
                'Personalized security advisory',
                'Concierge service for errands',
                'Annual security audit of your property'
            ],
            buttonText: 'Choose Platinum'
        },
    ];

    return (
        <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
            <header className="bg-amber-800 text-white shadow-lg mb-8 rounded-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <img src="https://i.ibb.co/WNnqYmPf/MO-Official-Logo.png" alt="MO-Official-Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                    <button onClick={() => onNavigate('home')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Back to Home</button>
                </nav>
            </header>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Choose Your Mphakathi Membership</h2>
                    <p className="text-lg text-gray-600">Select a plan that best fits your needs and budget. Each tier connects you to a wider range of community support and verified service providers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {pricingTiers.map((tier) => (
                        <div key={tier.name} className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center text-center border-t-8 border-amber-600 transition-transform transform hover:scale-105">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                            <p className="text-4xl font-extrabold text-amber-800 mb-4">{tier.price} <span className="text-xl font-medium text-gray-600">{tier.frequency}</span></p>
                            <p className="text-gray-600 text-sm mb-6">{tier.description}</p>
                            <ul className="text-gray-700 text-left space-y-2 mb-8 flex-grow">
                                {tier.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircleIcon size={20} className="text-green-500 mr-2 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="mt-auto w-full py-3 px-6 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition duration-300">
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProblemListsPage = ({ onNavigate }) => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLocation, setSearchLocation] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchBudget, setSearchBudget] = useState('');

    const locations = ['All', 'Soweto - Zone 1', 'Soweto - Zone 2', 'Soweto - Zone 3', 'General'];
    const categories = ['All', ...serviceCategories.map(cat => cat.id)]; // 'security', 'asset', etc.

    useEffect(() => {
        const fetchProblems = () => {
            setLoading(true);
            let q = collection(db, `artifacts/${appId}/serviceRequests`);
            let filters = [];

            // Add filters based on search criteria
            if (searchCategory && searchCategory !== 'All') {
                filters.push(where("category", "==", searchCategory));
            }
            if (searchLocation && searchLocation !== 'All') {
                filters.push(where("location", "==", searchLocation));
            }
            // For budget, we can filter client-side or implement range queries if needed
            // For simplicity, we'll fetch all matching other filters and then filter by budget client-side.
            // All problems on this page are 'pending' and unassigned for providers to pick up
            filters.push(where("status", "==", "pending"));
            filters.push(where("providerId", "==", null));

            // Apply filters to query
            let finalQuery = query(q, ...filters);

            const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
                let fetchedProblems = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate().toLocaleString()
                }));

                // Client-side budget filter
                if (searchBudget) {
                    const budgetValue = parseFloat(searchBudget);
                    if (!isNaN(budgetValue)) {
                        fetchedProblems = fetchedProblems.filter(problem => {
                            // Assuming budget is stored as a number in the problem document
                            return problem.budget && problem.budget <= budgetValue;
                        });
                    }
                }
                
                // Sort by creation date (most recent first)
                fetchedProblems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setProblems(fetchedProblems);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching problems:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        };

        fetchProblems();
    }, [searchLocation, searchCategory, searchBudget]); // Re-run when filters change

    return (
        <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
            <header className="bg-amber-800 text-white shadow-lg mb-8 rounded-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <img src="https://i.ibb.co/WNnqYmPf/MO-Official-Logo.png" alt="MO-Official-Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
                    <button onClick={() => onNavigate('home')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Back to Home</button>
                </nav>
            </header>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Mphakathi Problem Listings</h2>
                    <p className="text-lg text-gray-600">Browse problems posted by community members. Providers can filter and view available requests to offer their services.</p>
                </div>

                {/* Filter/Search Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700">Location:</label>
                        <select
                            id="location-filter"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">Category:</label>
                        <select
                            id="category-filter"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : serviceCategories.find(s => s.id === cat)?.name || cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="budget-filter" className="block text-sm font-medium text-gray-700">Max Budget (R):</label>
                        <input
                            type="number"
                            id="budget-filter"
                            value={searchBudget}
                            onChange={(e) => setSearchBudget(e.target.value)}
                            placeholder="e.g., 500"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading problems..." />
                ) : problems.length === 0 ? (
                    <p className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-md">No problems found matching your criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {problems.map(problem => (
                            <div key={problem.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{problem.title}</h3>
                                <p className="text-gray-600 text-sm mb-3">{problem.description}</p>
                                <p className="text-xs text-gray-500 mb-1">Category: <span className="font-semibold capitalize">{serviceCategories.find(s => s.id === problem.category)?.name || problem.category}</span></p>
                                <p className="text-xs text-gray-500 mb-1">Location: <span className="font-semibold">{problem.location || 'N/A'}</span></p>
                                {problem.budget && <p className="text-xs text-gray-500 mb-1">Budget: <span className="font-semibold">R {problem.budget}</span></p>}
                                <p className="text-xs text-gray-400">Posted by: {problem.memberName} on {problem.createdAt}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Member Dashboard Pages ---

const MemberDashboardLayout = ({ children, onNavigate, userProfile, handleSignOut }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-amber-50">
            {/* Sidebar for larger screens */}
            <aside className={`w-64 bg-amber-800 text-white p-6 space-y-6 hidden md:block flex-shrink-0`}>
                <h2 className="text-2xl font-bold mb-6">Member Dashboard</h2>
                <nav>
                    <ul>
                        <li className="mb-4"><button onClick={() => onNavigate('memberDashboard')} className="flex items-center text-white hover:text-amber-200 transition duration-200"><HomeIcon className="mr-3" size={20} /> Dashboard</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('memberProfile')} className="flex items-center text-white hover:text-amber-200 transition duration-200"><UserIcon className="mr-3" size={20} /> Profile</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('memberRequests')} className="flex items-center text-white hover:text-amber-200 transition duration-200"><PlusCircleIcon className="mr-3" size={20} /> My Requests</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('memberPayments')} className="flex items-center text-white hover:text-amber-200 transition duration-200"><DollarSignIcon className="mr-3" size={20} /> Payments</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('home')} className="flex items-center text-white hover:text-amber-200 transition duration-200"><HomeIcon className="mr-3" size={20} /> Back to Home</button></li>
                        <li className="mb-4"><button onClick={handleSignOut} className="flex items-center text-white hover:text-amber-200 transition duration-200"><LogOutIcon className="mr-3" size={20} /> Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="bg-amber-800 text-white p-4 flex justify-between items-center md:hidden w-full">
                <h2 className="text-xl font-bold">Member Dashboard</h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </header>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-amber-800 text-white p-6 space-y-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden z-50`}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Member Menu</h2>
                <nav>
                    <ul>
                        <li className="mb-4"><button onClick={() => { onNavigate('memberDashboard'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><HomeIcon className="mr-3" size={20} /> Dashboard</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('memberProfile'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><UserIcon className="mr-3" size={20} /> Profile</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('memberRequests'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><PlusCircleIcon className="mr-3" size={20} /> My Requests</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('memberPayments'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><DollarSignIcon className="mr-3" size={20} /> Payments</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('home'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><HomeIcon className="mr-3" size={20} /> Back to Home</button></li>
                        <li className="mb-4"><button onClick={() => { handleSignOut(); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-amber-200 transition duration-200"><LogOutIcon className="mr-3" size={20} /> Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow p-4 md:p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome, {userProfile?.name || 'Member'}!
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${userProfile?.membershipStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {userProfile?.membershipStatus || 'Status Unavailable'}
                    </span>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

const MemberDashboardPage = ({ userProfile, onNavigate }) => {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Membership Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <AwardIcon className="text-amber-600" size={36} />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Membership Status</h3>
                        <p className={`text-xl font-bold ${userProfile?.membershipStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                            {userProfile?.membershipStatus || 'N/A'}
                        </p>
                        {userProfile?.membershipStatus === 'Free' && (
                            <button onClick={() => onNavigate('memberPayments')} className="text-amber-600 text-sm mt-1 hover:underline">Upgrade Now</button>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button onClick={() => onNavigate('memberRequests')} className="w-full text-left flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition"><PlusCircleIcon className="mr-2" size={20} /> Make a new request</button>
                        <button onClick={() => onNavigate('memberProfile')} className="w-full text-left flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition"><UserIcon className="mr-2" size={20} /> Update my profile</button>
                    </div>
                </div>

                {/* Announcements/Tips */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Community News</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start"><InfoIcon size={16} className="mr-2 mt-1 text-blue-500 flex-shrink-0" /> Important: Verify provider credentials before service.</li>
                        <li className="flex items-start"><InfoIcon size={16} className="mr-2 mt-1 text-blue-500 flex-shrink-0" /> Reminder: Keep your contact info updated in your profile!</li>
                    </ul>
                </div>
            </div>

            {/* Recent Activity / Requests */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Recent Activity</h3>
                <p className="text-gray-600">No recent activities to display. Make a new request to get started!</p>
                {/* In a real app, you'd fetch and display recent requests/payments here */}
                <button onClick={() => onNavigate('memberRequests')} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">View All Requests</button>
            </div>
        </div>
    );
};

const MemberProfilePage = ({ userProfile, userId, setShowModal, setModalContent }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');
    const [contact, setContact] = useState(userProfile?.contact || '');
    const [address, setAddress] = useState(userProfile?.address || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setContact(userProfile.contact || '');
            setAddress(userProfile.address || '');
        }
    }, [userProfile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
            await updateDoc(userDocRef, {
                name,
                contact,
                address,
                lastUpdated: serverTimestamp()
            });
            setShowModal(true);
            setModalContent({ title: "Profile Updated", message: "Your profile has been successfully updated." });
            setEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to update profile. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
            {loading && <LoadingSpinner />}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    {editing ? (
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.name || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-lg text-gray-900">{userProfile?.email || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    {editing ? (
                        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.contact || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    {editing ? (
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.address || 'N/A'}</p>
                    )}
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    {editing ? (
                        <>
                            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition" disabled={loading}>Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition" disabled={loading}>Save Changes</button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MemberRequestsPage = ({ userId, userProfile, setShowModal, setModalContent }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewRequestModal, setShowNewRequestModal] = useState(false);
    const [newRequestTitle, setNewRequestTitle] = useState('');
    const [newRequestDescription, setNewRequestDescription] = useState('');
    const [newRequestCategory, setNewRequestCategory] = useState(serviceCategories[0].id); // Default category
    const [newRequestLocation, setNewRequestLocation] = useState('Soweto - Zone 1'); // Default location
    const [newRequestBudget, setNewRequestBudget] = useState(''); // Optional budget

    const locations = ['Soweto - Zone 1', 'Soweto - Zone 2', 'Soweto - Zone 3', 'General'];

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setRequests([]);
            return;
        }

        const q = query(
            collection(db, `artifacts/${appId}/serviceRequests`),
            where("memberId", "==", userId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleString(),
                updatedAt: doc.data().updatedAt?.toDate().toLocaleString()
            }));
            // Sort by creation date (most recent first)
            fetchedRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(fetchedRequests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching requests:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to load requests." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, setShowModal, setModalContent]);

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!userId || !userProfile) {
            setShowModal(true);
            setModalContent({ title: "Error", message: "You must be logged in to create a request." });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, `artifacts/${appId}/serviceRequests`), {
                memberId: userId,
                memberName: userProfile.name || 'Anonymous Member',
                title: newRequestTitle,
                description: newRequestDescription,
                category: newRequestCategory,
                location: newRequestLocation,
                budget: newRequestBudget ? parseFloat(newRequestBudget) : null,
                status: 'pending', // pending, assigned, completed, cancelled
                providerId: null,
                assignedProviderName: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            setShowNewRequestModal(false);
            setNewRequestTitle('');
            setNewRequestDescription('');
            setNewRequestCategory(serviceCategories[0].id);
            setNewRequestLocation('Soweto - Zone 1');
            setNewRequestBudget('');
            setShowModal(true);
            setModalContent({ title: "Request Submitted", message: "Your service request has been submitted successfully and will be visible to providers." });
        } catch (error) {
            console.error("Error creating request:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to create request. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Service Requests / Problems Posted</h2>

            <button
                onClick={() => setShowNewRequestModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg flex items-center mb-6 transition duration-300"
            >
                <PlusCircleIcon className="mr-2" size={20} /> Post a New Problem/Request
            </button>

            {loading ? (
                <LoadingSpinner message="Loading your requests..." />
            ) : requests.length === 0 ? (
                <p className="text-gray-600 p-4 bg-white rounded-lg shadow-md">You haven't posted any service requests/problems yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map(request => (
                        <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-amber-600">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h3>
                            <p className="text-gray-600 mb-2">{request.description}</p>
                            <p className="text-sm text-gray-500 mb-1">Category: <span className="font-semibold capitalize">{serviceCategories.find(c => c.id === request.category)?.name || request.category}</span></p>
                            <p className="text-sm text-gray-500 mb-1">Location: <span className="font-semibold">{request.location || 'N/A'}</span></p>
                            {request.budget && <p className="text-sm text-gray-500 mb-1">Budget: <span className="font-semibold">R {request.budget}</span></p>}
                            <p className="text-sm text-gray-500 mb-1">Status: <span className={`font-semibold capitalize ${request.status === 'completed' ? 'text-green-600' : request.status === 'pending' ? 'text-orange-500' : 'text-blue-600'}`}>{request.status}</span></p>
                            {request.assignedProviderName && (
                                <p className="text-sm text-gray-500 mb-1">Assigned Provider: <span className="font-semibold">{request.assignedProviderName}</span></p>
                            )}
                            <p className="text-xs text-gray-400">Posted on: {request.createdAt}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* New Request Modal */}
            <Modal
                show={showNewRequestModal}
                title="Post a New Problem/Service Request"
                onClose={() => setShowNewRequestModal(false)}
            >
                <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div>
                        <label htmlFor="request-title" className="block text-sm font-medium text-gray-700">Request Title (Brief Summary)</label>
                        <input
                            type="text"
                            id="request-title"
                            value={newRequestTitle}
                            onChange={(e) => setNewRequestTitle(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="request-description" className="block text-sm font-medium text-gray-700">Detailed Description of the Problem/Need</label>
                        <textarea
                            id="request-description"
                            value={newRequestDescription}
                            onChange={(e) => setNewRequestDescription(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="request-category" className="block text-sm font-medium text-gray-700">Category of Service Needed</label>
                        <select
                            id="request-category"
                            value={newRequestCategory}
                            onChange={(e) => setNewRequestCategory(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {serviceCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="request-location" className="block text-sm font-medium text-gray-700">Your Location</label>
                        <select
                            id="request-location"
                            value={newRequestLocation}
                            onChange={(e) => setNewRequestLocation(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="request-budget" className="block text-sm font-medium text-gray-700">Approximate Budget (Optional, R)</label>
                        <input
                            type="number"
                            id="request-budget"
                            value={newRequestBudget}
                            onChange={(e) => setNewRequestBudget(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g., 500"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => setShowNewRequestModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition" disabled={loading}>
                            {loading ? <LoadingSpinner message="" /> : 'Post Request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const MemberPaymentsPage = ({ setShowModal, setModalContent, userProfile, userId }) => {
    const [paystackLoading, setPaystackLoading] = useState(false);
    const [showPaystackPopup, setShowPaystackPopup] = useState(false);

    const handleUpgradeMembership = async () => {
        if (userProfile?.membershipStatus === 'Active') {
            setShowModal(true);
            setModalContent({ title: "Membership Status", message: "Your membership is already active. No upgrade needed at this time." });
            return;
        }

        setPaystackLoading(true);
        setShowPaystackPopup(true);

        // In a real application, you'd integrate with Paystack's API here to get a payment URL or initiate transaction.
        // For this mock-up, we'll just open the shop link.
        // After successful payment confirmation (which would be a webhook or callback in a real scenario):
        // We'll simulate this after a delay and update membership status.
        setTimeout(async () => {
            setPaystackLoading(false);
            await updateMembershipStatus('Active');
            setShowModal(true);
            setModalContent({ title: "Membership Activated!", message: "Welcome to Active Membership! Enjoy full Mphakathi benefits." });
            setShowPaystackPopup(false); // Close the iframe after simulation
        }, 3000); // Simulate network delay
    };

    const updateMembershipStatus = useCallback(async (status) => {
        if (!userId) return;
        try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
            await updateDoc(userDocRef, {
                membershipStatus: status,
                lastMembershipUpdate: serverTimestamp()
            });
            // The onSnapshot in App.js will automatically update userProfile state
        } catch (error) {
            console.error("Error updating membership status:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to update membership status in database." });
        }
    }, [userId, setShowModal, setModalContent]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Payments & Membership</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Current Membership Plan</h3>
                <p className="text-gray-700 text-lg mb-2">Status: <span className={`font-semibold ${userProfile?.membershipStatus === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{userProfile?.membershipStatus || 'N/A'}</span></p>
                <p className="text-gray-600 mb-4">Base Plan: R50 / month + R150 once-off joining fee</p>

                {userProfile?.membershipStatus === 'Free' ? (
                    <>
                        <p className="text-amber-700 mb-4 font-semibold">Upgrade to 'Active' membership to unlock all benefits and services!</p>
                        <button
                            onClick={handleUpgradeMembership}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            disabled={paystackLoading}
                        >
                            {paystackLoading ? <LoadingSpinner message="Redirecting to Paystack..." /> : 'Upgrade to Active Membership'}
                        </button>
                    </>
                ) : (
                    <p className="text-green-600 font-semibold">You are enjoying full Mphakathi benefits!</p>
                )}
            </div>

            {/* Paystack Popup */}
            {showPaystackPopup && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000]">
                    <div className="bg-white p-2 rounded-xl shadow-lg w-[95vw] h-[95vh] max-w-4xl max-h-[900px] flex flex-col">
                        <div className="flex justify-between items-center p-3 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800">Complete Your Payment</h3>
                            <button onClick={() => setShowPaystackPopup(false)} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
                        </div>
                        <div className="flex-grow flex items-center justify-center">
                            {paystackLoading ? (
                                <LoadingSpinner message="Loading Paystack..." />
                            ) : (
                                <iframe
                                    src="https://paystack.shop/mphakathi-online"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowTransparency="true"
                                    className="rounded-b-xl"
                                ></iframe>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment History</h3>
                <p className="text-gray-600">No payment history to display.</p>
                {/* In a real app, fetch and display payment records */}
            </div>
        </div>
    );
};

// --- Provider Dashboard Pages ---

const ProviderDashboardLayout = ({ children, onNavigate, userProfile, handleSignOut }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-amber-50">
            {/* Sidebar for larger screens */}
            <aside className={`w-64 bg-[#1A3A5A] text-white p-6 space-y-6 hidden md:block flex-shrink-0`}>
                <h2 className="text-2xl font-bold mb-6">Provider Dashboard</h2>
                <nav>
                    <ul>
                        <li className="mb-4"><button onClick={() => onNavigate('providerDashboard')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><HomeIcon className="mr-3" size={20} /> Dashboard</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('providerProfile')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><UserIcon className="mr-3" size={20} /> Profile</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('providerRequests')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><SearchIcon className="mr-3" size={20} /> View Requests</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('providerAssignments')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><CalendarIcon className="mr-3" size={20} /> My Assignments</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('providerEarnings')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><DollarSignIcon className="mr-3" size={20} /> Earnings</button></li>
                        <li className="mb-4"><button onClick={() => onNavigate('home')} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><HomeIcon className="mr-3" size={20} /> Back to Home</button></li>
                        <li className="mb-4"><button onClick={handleSignOut} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><LogOutIcon className="mr-3" size={20} /> Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Mobile Header */}
            <header className="bg-[#1A3A5A] text-white p-4 flex justify-between items-center md:hidden w-full">
                <h2 className="text-xl font-bold">Provider Dashboard</h2>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </header>

            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[#1A3A5A] text-white p-6 space-y-6 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden z-50`}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Provider Menu</h2>
                <nav>
                    <ul>
                        <li className="mb-4"><button onClick={() => { onNavigate('providerDashboard'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><HomeIcon className="mr-3" size={20} /> Dashboard</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('providerProfile'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><UserIcon className="mr-3" size={20} /> Profile</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('providerRequests'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><SearchIcon className="mr-3" size={20} /> View Requests</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('providerAssignments'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><CalendarIcon className="mr-3" size={20} /> My Assignments</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('providerEarnings'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><DollarSignIcon className="mr-3" size={20} /> Earnings</button></li>
                        <li className="mb-4"><button onClick={() => { onNavigate('home'); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><HomeIcon className="mr-3" size={20} /> Back to Home</button></li>
                        <li className="mb-4"><button onClick={() => { handleSignOut(); setIsSidebarOpen(false); }} className="flex items-center text-white hover:text-[#FF8A5B] transition duration-200"><LogOutIcon className="mr-3" size={20} /> Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow p-4 md:p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome, {userProfile?.name || 'Provider'}!
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${userProfile?.isProviderApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {userProfile?.isProviderApproved ? 'Approved Provider' : 'Pending Approval'}
                    </span>
                </header>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

const ProviderDashboardPage = ({ userProfile, onNavigate }) => {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Provider Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <BriefcaseIcon className="text-[#1A3A5A]" size={36} />
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

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button onClick={() => onNavigate('providerRequests')} className="w-full text-left flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition"><SearchIcon className="mr-2" size={20} /> View new requests</button>
                        <button onClick={() => onNavigate('providerAssignments')} className="w-full text-left flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition"><CalendarIcon className="mr-2" size={20} /> My current assignments</button>
                    </div>
                </div>

                {/* Announcements/Tips */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Provider Tips</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start"><InfoIcon size={16} className="mr-2 mt-1 text-blue-500 flex-shrink-0" /> Keep your profile updated for better request matching!</li>
                        <li className="flex items-start"><InfoIcon size={16} className="mr-2 mt-1 text-blue-500 flex-shrink-0" /> Timely service completion boosts your rating.</li>
                    </ul>
                </div>
            </div>

            {/* Recent Assignments (Placeholder) */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Recent Assignments</h3>
                <p className="text-gray-600">No recent assignments to display.</p>
                <button onClick={() => onNavigate('providerAssignments')} className="mt-4 bg-[#1A3A5A] hover:bg-[#3E618A] text-white font-bold py-2 px-4 rounded-lg transition duration-300">View All Assignments</button>
            </div>
        </div>
    );
};

const ProviderProfilePage = ({ userProfile, userId, setShowModal, setModalContent }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');
    const [contact, setContact] = useState(userProfile?.contact || '');
    const [serviceDescription, setServiceDescription] = useState(userProfile?.serviceDescription || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setContact(userProfile.contact || '');
            setServiceDescription(userProfile.serviceDescription || '');
        }
    }, [userProfile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
            await updateDoc(userDocRef, {
                name,
                contact,
                serviceDescription,
                lastUpdated: serverTimestamp()
            });
            setShowModal(true);
            setModalContent({ title: "Profile Updated", message: "Your provider profile has been successfully updated." });
            setEditing(false);
        } catch (error) {
            console.error("Error updating provider profile:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to update profile. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Provider Profile</h2>
            {loading && <LoadingSpinner />}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name / Business Name</label>
                    {editing ? (
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.name || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-lg text-gray-900">{userProfile?.email || 'N/A'}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    {editing ? (
                        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.contact || 'N/A'}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Services Offered</label>
                    {editing ? (
                        <textarea rows="3" value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                    ) : (
                        <p className="mt-1 text-lg text-gray-900">{userProfile?.serviceDescription || 'N/A'}</p>
                    )}
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    {editing ? (
                        <>
                            <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition" disabled={loading}>Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-[#1A3A5A] text-white rounded-lg hover:bg-[#3E618A] transition" disabled={loading}>Save Changes</button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-4 py-2 bg-[#1A3A5A] text-white rounded-lg hover:bg-[#3E618A] transition">Edit Profile</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProviderRequestsPage = ({ userId, userProfile, setShowModal, setModalContent }) => {
    const [availableRequests, setAvailableRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only fetch requests if the provider is approved
        if (!userProfile?.isProviderApproved) {
            setLoading(false);
            setAvailableRequests([]);
            return;
        }

        // Query for requests that are 'pending' and not yet assigned to any provider
        const q = query(
            collection(db, `artifacts/${appId}/serviceRequests`),
            where("status", "==", "pending"),
            where("providerId", "==", null) // Ensure it's not assigned
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedRequests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleString()
            }));
            // Sort by creation date (most recent first)
            fetchedRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAvailableRequests(fetchedRequests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching available requests:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to load available requests." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, userProfile, setShowModal, setModalContent]);

    const handleAssignToSelf = async (requestId, memberName) => {
        if (!userId || !userProfile?.isProviderApproved) {
            setShowModal(true);
            setModalContent({ title: "Error", message: "You are not authorized to take this request." });
            return;
        }

        setLoading(true);
        try {
            const requestRef = doc(db, `artifacts/${appId}/serviceRequests`, requestId);
            await updateDoc(requestRef, {
                status: 'assigned',
                providerId: userId,
                assignedProviderName: userProfile.name || 'Assigned Provider',
                updatedAt: serverTimestamp()
            });
            setShowModal(true);
            setModalContent({ title: "Success", message: `Problem from ${memberName} assigned to you.` });
        } catch (error) {
            console.error("Error assigning request:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to assign request. It might have been taken by another provider." });
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile?.isProviderApproved) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">Your provider account is pending approval. You will be able to view and accept requests once approved.</p>
                <LoadingSpinner message="Awaiting approval..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Service Requests/Problems</h2>

            {loading ? (
                <LoadingSpinner message="Loading available requests..." />
            ) : availableRequests.length === 0 ? (
                <p className="text-gray-600 p-4 bg-white rounded-lg shadow-md">No new service requests available at the moment. Check back later!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableRequests.map(request => (
                        <div key={request.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h3>
                            <p className="text-gray-600 mb-2">{request.description}</p>
                            <p className="text-sm text-gray-500 mb-1">Category: <span className="font-semibold capitalize">{serviceCategories.find(c => c.id === request.category)?.name || request.category}</span></p>
                            <p className="text-sm text-gray-500 mb-1">Location: <span className="font-semibold">{request.location || 'N/A'}</span></p>
                            {request.budget && <p className="text-sm text-gray-500 mb-1">Budget: <span className="font-semibold">R {request.budget}</span></p>}
                            <p className="text-sm text-gray-500 mb-1">Requested by: <span className="font-semibold">{request.memberName}</span></p>
                            <p className="text-xs text-gray-400 mb-4">Requested on: {request.createdAt}</p>
                            <button
                                onClick={() => handleAssignToSelf(request.id, request.memberName)}
                                className="bg-[#1A3A5A] hover:bg-[#3E618A] text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                disabled={loading}
                            >
                                Take This Request
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProviderAssignmentsPage = ({ userId, userProfile, setShowModal, setModalContent }) => {
    const [myAssignments, setMyAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !userProfile?.isProviderApproved) {
            setLoading(false);
            setMyAssignments([]);
            return;
        }

        // Query for requests assigned to the current provider
        const q = query(
            collection(db, `artifacts/${appId}/serviceRequests`),
            where("providerId", "==", userId),
            where("status", "in", ['assigned', 'pending']) // Include requests that are assigned or still pending, but assigned to me
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAssignments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleString(),
                updatedAt: doc.data().updatedAt?.toDate().toLocaleString()
            }));
            // Sort by creation date (most recent first)
            fetchedAssignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setMyAssignments(fetchedAssignments);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching assignments:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to load assignments." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, userProfile, setShowModal, setModalContent]);

    const handleCompleteRequest = async (requestId, memberName) => {
        setLoading(true);
        try {
            const requestRef = doc(db, `artifacts/${appId}/serviceRequests`, requestId);
            await updateDoc(requestRef, {
                status: 'completed',
                updatedAt: serverTimestamp()
            });
            setShowModal(true);
            setModalContent({ title: "Request Completed", message: `Service for ${memberName} marked as completed.` });
        } catch (error) {
            console.error("Error completing request:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to mark request as complete." });
        } finally {
            setLoading(false);
        }
    };

    if (!userProfile?.isProviderApproved) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">Your provider account is pending approval. You will be able to manage assignments once approved.</p>
                <LoadingSpinner message="Awaiting approval..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Current Assignments</h2>

            {loading ? (
                <LoadingSpinner message="Loading your assignments..." />
            ) : myAssignments.length === 0 ? (
                <p className="text-gray-600 p-4 bg-white rounded-lg shadow-md">You have no active assignments.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myAssignments.map(assignment => (
                        <div key={assignment.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-600">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{assignment.title}</h3>
                            <p className="text-gray-600 mb-2">{assignment.description}</p>
                            <p className="text-sm text-gray-500 mb-1">Category: <span className="font-semibold capitalize">{serviceCategories.find(c => c.id === assignment.category)?.name || assignment.category}</span></p>
                            <p className="text-sm text-gray-500 mb-1">Location: <span className="font-semibold">{assignment.location || 'N/A'}</span></p>
                            {assignment.budget && <p className="text-sm text-gray-500 mb-1">Budget: <span className="font-semibold">R {assignment.budget}</span></p>}
                            <p className="text-sm text-gray-500 mb-1">Member: <span className="font-semibold">{assignment.memberName}</span></p>
                            <p className="text-sm text-gray-500 mb-1">Status: <span className={`font-semibold capitalize ${assignment.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>{assignment.status}</span></p>
                            <p className="text-xs text-gray-400 mb-4">Assigned on: {assignment.updatedAt}</p>
                            {assignment.status !== 'completed' && (
                                <button
                                    onClick={() => handleCompleteRequest(assignment.id, assignment.memberName)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                                    disabled={loading}
                                >
                                    Mark as Complete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProviderEarningsPage = ({ userId, userProfile, setShowModal, setModalContent }) => {
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handlePayProviderFee = async () => {
        if (userProfile?.isProviderPaid) {
            setShowModal(true);
            setModalContent({ title: "Provider Fee Status", message: "Your provider fee is already paid for this period." });
            return;
        }

        setLoading(true);
        setShowPaymentModal(true);
        // Simulate payment gateway interaction
        setTimeout(async () => {
            try {
                const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
                await updateDoc(userDocRef, {
                    isProviderPaid: true,
                    lastProviderPayment: serverTimestamp()
                });
                setShowModal(true);
                setModalContent({ title: "Payment Successful", message: "Thank you! Your provider fee has been paid." });
            } catch (error) {
                console.error("Error updating provider payment status:", error);
                setShowModal(true);
                setModalContent({ title: "Error", message: "Failed to record payment. Please try again or contact support." });
            } finally {
                setLoading(false);
                setShowPaymentModal(false);
            }
        }, 2000);
    };

    if (!userProfile?.isProviderApproved) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">Your provider account is pending approval. Earnings and payments will be accessible once approved.</p>
                <LoadingSpinner message="Awaiting approval..." />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Earnings & Payments</h2>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Provider Fee Status</h3>
                <p className="text-gray-700 text-lg mb-2">Status: <span className={`font-semibold ${userProfile?.isProviderPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {userProfile?.isProviderPaid ? 'Paid' : 'Outstanding'}
                </span></p>
                <p className="text-gray-600 mb-4">Monthly Provider Fee: R100</p>
                {!userProfile?.isProviderPaid && (
                    <button
                        onClick={handlePayProviderFee}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                        disabled={loading}
                    >
                        {loading ? <LoadingSpinner message="Processing..." /> : 'Pay Provider Fee'}
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Total Earnings</h3>
                <p className="text-gray-700 text-4xl font-bold mb-4">R 0.00</p>
                <p className="text-gray-600">Earnings will be calculated and displayed here based on completed assignments.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Earning History</h3>
                <p className="text-gray-600">No earning history to display.</p>
            </div>

            {showPaymentModal && (
                <Modal
                    show={showPaymentModal}
                    title="Processing Payment"
                    message="Please wait while we process your provider fee payment. Do not close this window."
                    onClose={() => {}} // Disable closing during processing
                    showConfirm={false}
                >
                    <LoadingSpinner message="Processing payment..." />
                </Modal>
            )}
        </div>
    );
};


// Main App Component
const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    // Firebase Auth State Listener & Custom Token Sign-in
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Listen to user profile changes in real-time
                const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/doc`);
                const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    } else {
                        // If profile disappears (e.g., deleted by admin), sign out
                        console.warn("User profile not found, signing out.");
                        signOut(auth);
                        setUserProfile(null);
                        setCurrentUser(null);
                        setCurrentPage('home');
                        setShowModal(true);
                        setModalContent({ title: "Account Issue", message: "Your user profile could not be loaded. You have been logged out." });
                    }
                    setLoadingAuth(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    setLoadingAuth(false);
                    setShowModal(true);
                    setModalContent({ title: "Error", message: "Failed to load user profile." });
                });

                return () => unsubscribeProfile(); // Clean up profile listener
            } else {
                setCurrentUser(null);
                setUserProfile(null);
                setLoadingAuth(false);
            }
        });

        // Attempt to sign in with custom token if available
        const signInWithToken = async () => {
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                    // onAuthStateChanged will handle setting currentUser and fetching profile
                } catch (error) {
                    console.error("Error signing in with custom token:", error);
                    // Fallback to anonymous or just continue as unauthenticated
                    await signInAnonymously(auth); // Sign in anonymously if custom token fails
                }
            } else {
                 signInAnonymously(auth); // Sign in anonymously if no token
            }
        };

        signInWithToken();

        return () => unsubscribeAuth(); // Clean up auth listener
    }, [initialAuthToken]); // Only re-run if initialAuthToken changes

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setCurrentPage('home');
            setShowModal(true);
            setModalContent({ title: "Logged Out", message: "You have been successfully logged out." });
        } catch (error) {
            console.error("Error signing out:", error);
            setShowModal(true);
            setModalContent({ title: "Error", message: "Failed to log out. Please try again." });
        }
    };

    const handleNavigate = (page) => {
        // Enforce private routes
        if ((page === 'memberDashboard' || page === 'memberProfile' || page === 'memberRequests' || page === 'memberPayments') && (!currentUser || userProfile?.role !== 'member')) {
            setShowModal(true);
            setModalContent({ title: "Access Denied", message: "You must be logged in as a member to access this page." });
            setCurrentPage('login'); // Redirect to login if unauthorized
            return;
        }
        if ((page === 'providerDashboard' || page === 'providerProfile' || page === 'providerRequests' || page === 'providerAssignments' || page === 'providerEarnings') && (!currentUser || userProfile?.role !== 'provider')) {
            setShowModal(true);
            setModalContent({ title: "Access Denied", message: "You must be logged in as an approved provider to access this page." });
            setCurrentPage('login'); // Redirect to login if unauthorized
            return;
        }
        setCurrentPage(page);
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50">
                <LoadingSpinner message="Initializing application..." />
            </div>
        );
    }

    let content;
    switch (currentPage) {
        case 'home':
            content = <HomePage onNavigate={handleNavigate} userId={currentUser?.uid} userProfile={userProfile} currentAuthUser={currentUser} />;
            break;
        case 'login':
            content = <LoginPage onNavigate={handleNavigate} setCurrentUser={setCurrentUser} setUserProfile={setUserProfile} setShowModal={setShowModal} setModalContent={setModalContent} />;
            break;
        case 'signup':
            content = <SignupPage onNavigate={handleNavigate} setShowModal={setShowModal} setModalContent={setModalContent} />;
            break;
        case 'becomeProvider':
            content = <BecomeProviderPage onNavigate={handleNavigate} userId={currentUser?.uid} setShowModal={setShowModal} setModalContent={setModalContent} userProfile={userProfile} />;
            break;
        case 'pricing':
            content = <PricingPage onNavigate={handleNavigate} />;
            break;
        case 'problemLists':
            content = <ProblemListsPage onNavigate={handleNavigate} />;
            break;
        case 'memberDashboard':
            content = (
                <MemberDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <MemberDashboardPage userProfile={userProfile} onNavigate={handleNavigate} />
                </MemberDashboardLayout>
            );
            break;
        case 'memberProfile':
            content = (
                <MemberDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <MemberProfilePage userProfile={userProfile} userId={currentUser?.uid} setShowModal={setShowModal} setModalContent={setModalContent} />
                </MemberDashboardLayout>
            );
            break;
        case 'memberRequests':
            content = (
                <MemberDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <MemberRequestsPage userId={currentUser?.uid} userProfile={userProfile} setShowModal={setShowModal} setModalContent={setModalContent} />
                </MemberDashboardLayout>
            );
            break;
        case 'memberPayments':
            content = (
                <MemberDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <MemberPaymentsPage setShowModal={setShowModal} setModalContent={setModalContent} userProfile={userProfile} userId={currentUser?.uid} />
                </MemberDashboardLayout>
            );
            break;
        case 'providerDashboard':
            content = (
                <ProviderDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <ProviderDashboardPage userProfile={userProfile} onNavigate={handleNavigate} />
                </ProviderDashboardLayout>
            );
            break;
        case 'providerProfile':
            content = (
                <ProviderDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <ProviderProfilePage userProfile={userProfile} userId={currentUser?.uid} setShowModal={setShowModal} setModalContent={setModalContent} />
                </ProviderDashboardLayout>
            );
            break;
        case 'providerRequests':
            content = (
                <ProviderDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <ProviderRequestsPage userId={currentUser?.uid} userProfile={userProfile} setShowModal={setShowModal} setModalContent={setModalContent} />
                </ProviderDashboardLayout>
            );
            break;
        case 'providerAssignments':
            content = (
                <ProviderDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <ProviderAssignmentsPage userId={currentUser?.uid} userProfile={userProfile} setShowModal={setShowModal} setModalContent={setModalContent} />
                </ProviderDashboardLayout>
            );
            break;
        case 'providerEarnings':
            content = (
                <ProviderDashboardLayout onNavigate={handleNavigate} userProfile={userProfile} handleSignOut={handleSignOut}>
                    <ProviderEarningsPage userId={currentUser?.uid} userProfile={userProfile} setShowModal={setShowModal} setModalContent={setModalContent} />
                </ProviderDashboardLayout>
            );
            break;
        default:
            content = <HomePage onNavigate={handleNavigate} userId={currentUser?.uid} userProfile={userProfile} currentAuthUser={currentUser} />;
            break;
    }

    return (
        <>
            {/* Tailwind CSS CDN and Font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                /* chart-container styling is now primarily handled by Tailwind classes on the div itself */
                .chart-container {
                    position: relative;
                }
                `}
            </style>

            {content}

            <Modal
                show={showModal}
                title={modalContent.title}
                message={modalContent.message}
                onClose={() => setShowModal(false)}
            />
        </>
    );
};

export default App;
