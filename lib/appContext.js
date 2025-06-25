// lib/appContext.js
"use client"; // Ensure this is explicitly a client component

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { getStackClientApp } from './stack'; // Import the function, not the direct instance

export const AppContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const AppProvider = ({ children }) => {
  // Get the stackClientApp instance here. It will be a dummy object during SSR.
  const stackClientApp = getStackClientApp();

  // Ensure useUser and useStackApp are called conditionally or after hydration
  // or understand that during SSR, they might return default/null values.
  const { isAuthenticated, user: stackAuthUser, isLoading: isStackAuthLoading } = useUser();

  const [branding, setBranding] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [publicProblems, setPublicProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appDataLoading, setAppDataLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);

  // Data fetching functions
  const fetchBranding = useCallback(async () => { /* ... (keep existing logic) ... */ }, []);
  const fetchPlans = useCallback(async () => { /* ... (keep existing logic) ... */ }, []);
  const fetchPublicProblems = useCallback(async () => { /* ... (keep existing logic) ... */ }, []);
  const fetchOrCreateUserProfile = useCallback(async () => { /* ... (keep existing logic) ... */ }, [isAuthenticated, stackAuthUser]);
  const fetchMyRequests = useCallback(async () => { /* ... (keep existing logic) ... */ }, [isAuthenticated, userProfile?.id]);
  const fetchMyQuotes = useCallback(async () => { /* ... (keep existing logic) ... */ }, [isAuthenticated, userProfile?.id, userProfile?.role]);


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
    // Make sure to call login/logout from the instance, which can be dummy during SSR
    login: stackClientApp?.login || (() => console.log("Login not available")),
    logout: stackClientApp?.logout || (() => console.log("Logout not available")),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
