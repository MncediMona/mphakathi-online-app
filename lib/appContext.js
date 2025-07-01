// lib/appContext.js
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack'; // This hook will now only be called when StackProvider is active
import { getStackClientApp } from './stack';

export const AppContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const AppProvider = ({ children }) => {
  // Get the stackClientApp instance here. It will be null until StackAuthProviderWrapper mounts.
  const stackClientApp = getStackClientApp();

  // useUser will return default values (isAuthenticated: false, user: null, isLoading: true)
  // until the StackProvider is fully mounted and providing context.
  const { isAuthenticated, user: stackAuthUser, isLoading: isStackAuthLoading } = useUser();

  const [branding, setBranding] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [publicProblems, setPublicProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appDataLoading, setAppDataLoading] = useState(true); // Initial loading state
  const [myRequests, setMyRequests] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);

  // Data fetching functions (keep existing logic)
  const fetchBranding = useCallback(async () => { /* ... */ }, []);
  const fetchPlans = useCallback(async () => { /* ... */ }, []);
  const fetchPublicProblems = useCallback(async () => { /* ... */ }, []);
  const fetchOrCreateUserProfile = useCallback(async () => { /* ... */ }, [isAuthenticated, stackAuthUser]);
  const fetchMyRequests = useCallback(async () => { /* ... */ }, [isAuthenticated, userProfile?.id]);
  const fetchMyQuotes = useCallback(async () => { /* ... */ }, [isAuthenticated, userProfile?.id, userProfile?.role]);


  // Effects for data loading
  useEffect(() => {
    const loadAllPublicData = async () => {
      setAppDataLoading(true); // Start loading
      await Promise.all([fetchBranding(), fetchPlans(), fetchPublicProblems()]);
      setAppDataLoading(false); // End loading
    };
    loadAllPublicData();
  }, [fetchBranding, fetchPlans, fetchPublicProblems]);

  useEffect(() => {
    // Only fetch user profile if isAuthenticated is true AND stackClientApp is available
    if (isAuthenticated && stackClientApp) {
      fetchOrCreateUserProfile();
    } else {
      setUserProfile(null);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile, stackClientApp]); // Added stackClientApp to dependency array

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
    // Combined loading state: true if Stack Auth is loading OR other app data is loading
    isLoading: isStackAuthLoading || appDataLoading,
    // Ensure login/logout are called only if stackClientApp is valid
    login: stackClientApp?.login || (() => console.warn("Stack Auth login not available yet.")),
    logout: stackClientApp?.logout || (() => console.warn("Stack Auth logout not available yet.")),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
