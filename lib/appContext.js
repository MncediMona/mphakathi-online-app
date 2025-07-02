// lib/appContext.js
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser, useStackApp } from '@stackframe/stack';
import { getStackClientApp } from './stack'; // Still needed for getStackClientApp in login/logout functions

export const AppContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const AppProvider = ({ children }) => {
  // These hooks will now be called within the StackProvider context
  const { isAuthenticated, user: stackAuthUser, isLoading: isStackAuthLoading } = useUser();
  const stackApp = useStackApp(); // Get the stackApp instance for login/logout

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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBranding(data);
    } catch (error) {
      console.error("Failed to fetch branding:", error);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-pricing-plans`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPricingPlans(data);
    } catch (error) {
      console.error("Failed to fetch pricing plans:", error);
    }
  }, []);

  const fetchPublicProblems = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-problems`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPublicProblems(data);
    } catch (error) {
      console.error("Failed to fetch public problems:", error);
    }
  }, []);

  const fetchOrCreateUserProfile = useCallback(async () => {
    if (!isAuthenticated || !stackAuthUser?.id) {
      setUserProfile(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-or-create-user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await stackAuthUser.getIdToken()}` // Pass ID token for auth
        },
        body: JSON.stringify({
          auth_id: stackAuthUser.id,
          email: stackAuthUser.email,
          name: stackAuthUser.name || stackAuthUser.email.split('@')[0] // Fallback name
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Failed to fetch or create user profile:", error);
      setUserProfile(null); // Clear profile on error
    }
  }, [isAuthenticated, stackAuthUser]);

  const fetchMyRequests = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.id) {
      setMyRequests([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-my-requests?userId=${userProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${await stackAuthUser.getIdToken()}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMyRequests(data);
    } catch (error) {
      console.error("Failed to fetch my requests:", error);
      setMyRequests([]);
    }
  }, [isAuthenticated, userProfile?.id, stackAuthUser]);

  const fetchMyQuotes = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.id || userProfile?.role !== 'provider') {
      setMyQuotes([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-my-quotes?providerId=${userProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${await stackAuthUser.getIdToken()}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMyQuotes(data);
    } catch (error) {
      console.error("Failed to fetch my quotes:", error);
      setMyQuotes([]);
    }
  }, [isAuthenticated, userProfile?.id, userProfile?.role, stackAuthUser]);


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
    isLoading: isStackAuthLoading || appDataLoading,
    login: stackApp?.login, // Use optional chaining for safety
    logout: stackApp?.logout, // Use optional chaining for safety
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
