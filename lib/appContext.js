// lib/appContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack'; // Use useUser from Stack Auth
import { stackClientApp } from './stack'; // Import your Stack Auth client app instance

export const AppContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888'; // Use NEXT_PUBLIC_ for client-side env vars

export const AppProvider = ({ children }) => {
  const { isAuthenticated, user: stackAuthUser, isLoading: isStackAuthLoading } = useUser();
  const [branding, setBranding] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [publicProblems, setPublicProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appDataLoading, setAppDataLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);

  // Data fetching functions
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
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-or-create-user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth0Id: stackAuthUser.id,
          email: stackAuthUser.email,
          name: stackAuthUser.displayName || stackAuthUser.email,
        }),
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      setUserProfile(data);
      // Assuming you have notification states in App.js that need to be lifted here
      // setEmailNotifications(data.email_notifications || false);
      // setSmsNotifications(data.sms_notifications || false);
    } catch (error) { console.error("Error fetching or creating user profile:", error); }
  }, [isAuthenticated, stackAuthUser]);

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
    } catch (error) { console.error("Failed to fetch my requests:", error); }
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
    } catch (error) { console.error("Failed to fetch my quotes:", error); }
  }, [isAuthenticated, userProfile?.id, userProfile?.role]);

  // Effects for data loading
  useEffect(() => {
    const loadAllPublicData = async () => {
      setAppDataLoading(true);
      await Promise.all([fetchBranding(), fetchPlans(), fetchPublicProblems()]);
      setAppDataLoading(false);
    };
    loadAllPublicData();
  }, [fetchBranding, fetchPlans, fetchPublicProblems]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrCreateUserProfile();
    } else {
      setUserProfile(null);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile]);

  useEffect(() => {
    if (userProfile?.id && isAuthenticated) {
      fetchMyRequests();
      fetchMyQuotes();
    }
  }, [userProfile?.id, isAuthenticated, fetchMyRequests, fetchMyQuotes]);


  const contextValue = {
    branding,
    pricingPlans,
    publicProblems,
    userProfile,
    myRequests,
    myQuotes,
    fetchMyRequests,
    fetchPublicProblems,
    fetchMyQuotes,
    isAuthenticated,
    user: stackAuthUser,
    isLoading: isStackAuthLoading || appDataLoading, // Combined loading state
    login: stackClientApp.login,
    logout: stackClientApp.logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
