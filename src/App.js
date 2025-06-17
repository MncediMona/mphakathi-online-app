import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, onSnapshot } from 'firebase/firestore';

// Ensure __app_id, __firebase_config, and __initial_auth_token are available in the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Services Data - Keep this consistent with your business plan and pamphlet
const servicesData = {
    security: [
        { title: 'Community Guarding & Response', price: 'R100-R250 / callout', description: 'Quick assistance from local security partners, plus low-cost panic buzzers.' },
        { title: 'Affordable Alarm Systems', price: 'R150-R300 callout', description: 'Basic, reliable installations and repairs to keep your home protected.' },
        { title: 'Community CCTV Setup', price: 'From R200+ / setup', description: 'We help set up communal cameras in strategic spots to deter crime.' },
        { title: 'Safe Escort Services', price: 'From R50 / hour', description: 'A trusted companion to walk with you or your children, provided by vetted community members.' },
        { title: 'Offline Crime Reporting App', price: 'Included with Membership', description: 'Report suspicious activity easily, even without internet!' },
    ],
    asset: [
        { title: 'Informal Dispute Resolution', price: 'Free for Members', description: 'Mediation for landlord-tenant or neighbour disagreements to avoid costly legal battles.' },
        { title: 'Basic Property Advisory', price: 'R50 / month (Members)', description: 'Essential guidance on rent collection, maintenance, and tenant communication.' },
        { title: 'Simplified Lease Agreements', price: 'R50 once-off', description: 'Get a clear, legally sound lease agreement to protect yourself and your tenants.' },
        { title: 'Legal Support Navigation', price: 'R200-R1000 / consultation', description: 'We guide you to affordable legal aid for evictions or court summons.' },
    ],
    screening: [
        { title: 'Community-Based Tenant Vetting', price: 'R100 once-off', description: 'We screen potential tenants using local insights to find reliable people.' },
        { title: 'Domestic Worker/Gardener Vetting', price: 'R80 once-off', description: 'Find trusted help for your home. We vet local individuals, creating jobs and peace of mind.' },
        { title: 'Affordable Property Listing', price: 'R500 once-off', description: 'We list your property locally and match you with vetted individuals to find good tenants fast.' },
    ],
    convenience: [
        { title: 'Clinic/Hospital Drop-off', price: 'R50-R100 / trip', description: 'Reliable and affordable transport for medical appointments.' },
        { title: 'Grocery Collection', price: 'R30-R50 / trip', description: 'We collect your groceries from local shops, saving you time and effort.' },
        { title: 'Local Delivery Service', price: 'R30-R50 / delivery', description: 'Affordable deliveries of packages or documents within Soweto.' },
        { title: 'Medication Collection', price: 'R30-R50 / collection', description: 'Ensuring you get your prescriptions from pharmacies or clinics safely and on time.' },
        { title: 'Queuing Service', price: 'R40-R60 / hour', description: 'Save your valuable time! We queue for you at government services or other busy locations.' },
    ]
};

// Main App Component
const App = () => {
    // State to hold current user ID and authentication readiness
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userProfile, setUserProfile] = useState(null); // To store user-specific data from Firestore
    const [currentServiceCategory, setCurrentServiceCategory] = useState('security'); // Default active tab

    // Ref for the chart instance to destroy/recreate cleanly
    const chartInstance = useRef(null);
    // Ref for LLM input/output elements
    const userNeedInputRef = useRef(null);
    const suggestionLoadingRef = useRef(null);
    const serviceSuggestionOutputRef = useRef(null);

    // --- Firebase Authentication and Firestore Setup ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in.
                setUserId(user.uid);
                // Try to fetch or create user profile
                const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/doc`);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data());
                } else {
                    // Create a basic profile if it doesn't exist
                    const defaultProfile = {
                        uid: user.uid,
                        createdAt: new Date().toISOString(),
                        name: `User_${user.uid.substring(0, 8)}`,
                        membershipStatus: 'Pending', // Default status
                        lastLogin: new Date().toISOString()
                    };
                    await setDoc(userDocRef, defaultProfile);
                    setUserProfile(defaultProfile);
                }
            } else {
                // User is signed out. Sign in anonymously if no token is provided.
                if (initialAuthToken) {
                    try {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } catch (error) {
                        console.error("Error signing in with custom token:", error);
                        // Fallback to anonymous if custom token fails
                        try {
                            await signInAnonymously(auth);
                        } catch (anonError) {
                            console.error("Error signing in anonymously:", anonError);
                        }
                    }
                } else {
                    try {
                        await signInAnonymously(auth);
                    } catch (error) {
                        console.error("Error signing in anonymously:", error);
                    }
                }
                setUserId(null); // Clear userId if signed out or anonymous sign-in failed
            }
            setIsAuthReady(true); // Auth state is ready, regardless of user being signed in or not
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Effect to listen for real-time user profile updates from Firestore
    useEffect(() => {
        if (!isAuthReady || !userId) return; // Only run if auth is ready and a user is logged in

        const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile/doc`);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            } else {
                setUserProfile(null); // Profile might have been deleted or not yet created
            }
        }, (error) => {
            console.error("Error listening to user profile:", error);
        });

        // Cleanup subscription on unmount or userId change
        return () => unsubscribeProfile();
    }, [isAuthReady, userId]); // Re-run when auth readiness or userId changes


    // --- UI Rendering Functions ---
    const renderServices = (category) => {
        const serviceContentContainer = document.getElementById('service-content');
        if (!serviceContentContainer) return; // Ensure element exists

        serviceContentContainer.innerHTML = ''; // Clear previous content
        servicesData[category].forEach(service => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300';
            card.innerHTML = `
                <h3 class="text-xl font-bold text-amber-700 mb-2">${service.title}</h3>
                <p class="text-2xl font-semibold text-gray-800 mb-4">${service.price}</p>
                <p class="text-gray-600">${service.description}</p>
            `;
            serviceContentContainer.appendChild(card);
        });
    };

    // --- Chart.js Initialization ---
    useEffect(() => {
        renderServices(currentServiceCategory); // Initial render of services

        const ctx = document.getElementById('costBenefitChart')?.getContext('2d');
        if (ctx) {
            // Destroy existing chart instance if it exists
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
                            backgroundColor: 'rgba(217, 119, 6, 0.8)', /* amber-600 */
                            borderColor: 'rgba(217, 119, 6, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Avg. Cost of One Burglary',
                            data: [4500],
                            backgroundColor: 'rgba(239, 68, 68, 0.8)', /* red-500 */
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
    }, [currentServiceCategory]); // Re-run chart effect if category changes


    // --- Event Handlers ---
    const handleTabClick = (category) => {
        setCurrentServiceCategory(category);
    };

    const handleGetSuggestion = async () => {
        const userPrompt = userNeedInputRef.current.value.trim();
        if (!userPrompt) {
            serviceSuggestionOutputRef.current.innerHTML = '<p class="text-red-500">Please describe your need to get a suggestion.</p>';
            return;
        }

        suggestionLoadingRef.current.classList.remove('hidden');
        serviceSuggestionOutputRef.current.innerHTML = ''; // Clear previous output

        const servicesList = `
            Security Services: Community Guarding & Response (R100-R250 / callout), Affordable Alarm Systems (R150-R300 callout), Community CCTV Setup (From R200+ / setup), Safe Escort Services (From R50 / hour), Offline Crime Reporting App (Included with Membership).
            Asset Management: Informal Dispute Resolution (Free for Members / R100 non-members), Basic Property Advisory (R50 / month for Members), Simplified Lease Agreements (R50 once-off), Legal Support Navigation (R200-R1000 / consultation).
            Screening Services: Community-Based Tenant Vetting (R100 once-off), Domestic Worker/Gardener Vetting (R80 once-off), Affordable Property Listing (R500 once-off for tenant finding).
            Community Convenience & Support: Clinic/Hospital Drop-off (R50-R100 / trip), Grocery Collection (R30-R50 / trip), Local Delivery Service (R30-R50 / delivery), Medication Collection (R30-R50 / collection), Queuing Service (R40-R60 / hour).
        `;

        const prompt = `
            Based on the Mphakathi Online services and pricing provided below, and the user's described need, suggest which Mphakathi Online service(s) would be most suitable. Explain why, and provide the approximate price range if applicable. If no direct service applies, suggest the closest one or a general community support idea. Keep the response concise and helpful.

            Mphakathi Online Services:
            ${servicesList}

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

    const showPaystackPopup = () => {
        document.querySelector('.popup-overlay').style.display = 'flex';
        document.body.style.overflow = 'hidden'; /* Prevent scrolling on main page */
    };

    const closePaystackPopup = () => {
        document.querySelector('.popup-overlay').style.display = 'none';
        document.body.style.overflow = 'auto'; /* Re-enable scrolling */
    };

    return (
        <div className="bg-amber-50 min-h-screen">
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #FDF4E6; /* Consistent with Mphakathi palette */
                    margin: 0; /* Ensure no default body margin */
                    padding: 0; /* Ensure no default body padding */
                }
                .chart-container {
                    position: relative;
                    width: 100%;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                    height: 300px;
                    max-height: 350px;
                }
                @media (min-width: 768px) {
                    .chart-container {
                        height: 400px;
                    }
                }
                .tab-active {
                    background-color: #D97706; /* amber-600 */
                    color: #ffffff;
                }
                .tab-inactive {
                    background-color: #F3F4F6; /* gray-100 */
                    color: #374151; /* gray-700 */
                }

                /* Styles for the Paystack Pop-up overlay */
                .popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7); /* Dark overlay */
                    display: none; /* Changed from 'flex' to 'none' to hide it initially */
                    justify-content: center;
                    align-items: center;
                    z-index: 1000; /* Ensure it's on top of everything */
                }
                .popup-content {
                    background-color: #ffffff;
                    border-radius: 1rem;
                    width: 95%;
                    max-width: 900px; /* Max width for desktop */
                    height: 95%;
                    max-height: 700px; /* Max height for desktop */
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
                }
                .iframe-container {
                    flex-grow: 1; /* Allows iframe to fill available space */
                    overflow: hidden; /* Hide scrollbars if iframe content overflows its own bounds */
                    border-radius: 0 0 1rem 1rem; /* Rounded corners for the bottom of the iframe area */
                }
                .paystack-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                `}
            </style>
            <header className="bg-amber-800 text-white shadow-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <img src="https://i.ibb.co/WNnqYmPf/MO-Official-Logo.png" alt="MO-Official-Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain" /> {/* Adjusted image sizing */}
                    <button onClick={showPaystackPopup} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Shop Now</button>
                </nav>
            </header>

            <main>
                <section className="bg-amber-700 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Safer Homes, Stronger Communities.</h1>
                        <p className="text-lg md:text-xl text-amber-200 max-w-3xl mx-auto">
                            Mphakathi Online is here to empower our community in Soweto with affordable safety solutions, right where we live.
                        </p>
                         {userId && (
                            <p className="mt-4 text-sm text-amber-100">
                                Your User ID: <span className="font-semibold">{userId}</span>
                                {userProfile && userProfile.membershipStatus && (
                                    <span className="ml-4">Membership: <span className="font-semibold">{userProfile.membershipStatus}</span></span>
                                )}
                            </p>
                        )}
                    </div>
                </section>

                <section id="services" className="py-16 md:py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Our Services, Designed For You</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Click a category to explore our affordable solutions for your home, your assets, and your peace of mind.</p>
                        </div>

                        <div className="flex justify-center mb-8 space-x-2 md:space-x-4 flex-wrap">
                            <button
                                id="tab-security"
                                className={`service-tab px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition duration-300 mb-2 ${currentServiceCategory === 'security' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => handleTabClick('security')}
                            >
                                🛡️ Security
                            </button>
                            <button
                                id="tab-asset"
                                className={`service-tab px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition duration-300 mb-2 ${currentServiceCategory === 'asset' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => handleTabClick('asset')}
                            >
                                🏡 Assets
                            </button>
                            <button
                                id="tab-screening"
                                className={`service-tab px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition duration-300 mb-2 ${currentServiceCategory === 'screening' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => handleTabClick('screening')}
                            >
                                🤝 Screening
                            </button>
                            <button
                                id="tab-convenience"
                                className={`service-tab px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition duration-300 mb-2 ${currentServiceCategory === 'convenience' ? 'tab-active' : 'tab-inactive'}`}
                                onClick={() => handleTabClick('convenience')}
                            >
                                📦 Convenience
                            </button>
                        </div>

                        <div id="service-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Services will be rendered here by renderServices function */}
                        </div>
                    </div>
                </section>

                {/* LLM-Powered Service Recommender Section */}
                <section id="llm-recommender" className="py-16 md:py-20 bg-amber-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Unsure What You Need? Ask Our AI! ✨</h2>
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                                Describe your situation or challenge, and our Mphakathi AI will suggest the best services for you.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
                            <textarea
                                ref={userNeedInputRef}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
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
                                Thinking... this might take a moment.
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
                            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">We are more than a service. We are your neighbours, committed to building a better, safer Soweto together.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                            <div className="bg-white p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">💰</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Affordable for Soweto</h3>
                                <p className="text-gray-600">Our prices are designed to fit your budget, because everyone deserves to feel safe.</p>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">❤️</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">From Soweto, For Soweto</h3>
                                <p className="text-gray-600">We understand our community's needs and are deeply committed to empowering our own people.</p>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-md">
                                <div className="text-4xl mb-4">👷</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Local Employment</h3>
                                <p className="text-gray-600">We create jobs right here by training and hiring our neighbours as guards and technicians.</p>
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
                        <div className="chart-container">
                            <canvas id="costBenefitChart"></canvas>
                        </div>
                    </div>
                </section>

                <section id="join" className="bg-amber-800 text-white py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold mb-4">Join Our Mphakathi Today!</h2>
                        <p className="text-lg text-amber-200 mb-6 max-w-3xl mx-auto">Become a Community Member and unlock a safer, stronger community for your family and neighbours.</p>
                        <div className="bg-white text-gray-800 rounded-lg p-8 inline-block shadow-lg">
                            <p className="text-xl font-bold">Membership</p>
                            <p className="text-4xl font-bold my-2">R50 <span className="text-lg font-normal">/ month</span></p>
                            <p className="text-gray-600">+ R150 once-off joining fee</p>
                        </div>

                        <div className="mt-10">
                            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                            <p className="text-amber-200 mb-2">Contact us today!</p>
                            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 text-lg">
                                <span>📞 Call: 0782262177</span>
                                <span>📱 WhatsApp: 0685326165</span>
                                <span>🏢 Visit: Orange Street, Protea Glenn, Soweto</span>
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

            {/* The entire popup HTML structure is placed here, hidden by default */}
            <div className="popup-overlay">
                <div className="popup-content">
                    <header className="bg-[#1A3A5A] text-white p-4 md:p-6 rounded-t-xl flex justify-between items-center">
                        <h2 className="text-xl md:text-2xl font-bold">Mphakathi Online - Shop</h2>
                        <button onClick={closePaystackPopup} className="text-white text-2xl font-bold hover:text-[#FF8A5B] transition-colors duration-200">
                            &times;
                        </button>
                    </header>
                    <div className="iframe-container">
                        <iframe src="https://paystack.shop/mphakathi-online" className="paystack-iframe"></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
