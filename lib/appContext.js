// lib/appContext.js
"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useUser, useStackApp } from '@stackframe/stack'; // Keep these imports
import { getStackClientApp } from './stack';

export const AppContext = createContext(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const AppProvider = ({ children }) => {
  // We no longer call getStackClientApp directly here to avoid potential issues.
  // We rely on useUser and useStackApp to get their context from StackProvider.

  // Use local state to track if StackProvider context is available
  const [isStackContextReady, setIsStackContextReady] = useState(false);

  // Attempt to use useUser and useStackApp. They will throw if StackProvider is not active.
  // We'll wrap the AppProvider in StackAuthProviderWrapper to ensure StackProvider is there.
  let isAuthenticated = false;
  let stackAuthUser = null;
  let isStackAuthLoading = true;
  let stackAppLogin = () => console.warn("Stack Auth login not available (context not ready).");
  let stackAppLogout = () => console.warn("Stack Auth logout not available (context not ready).");

  try {
    // These hooks will only work if StackProvider is mounted above this component
    const { isAuthenticated: auth, user: sUser, isLoading: sLoading } = useUser();
    const stackApp = useStackApp();

    isAuthenticated = auth;
    stackAuthUser = sUser;
    isStackAuthLoading = sLoading;
    stackAppLogin = stackApp.login;
    stackAppLogout = stackApp.logout;
    setIsStackContextReady(true); // Mark context as ready if hooks succeed
  } catch (error) {
    // console.warn("Stack Auth context not yet available in AppProvider:", error.message);
    // Keep default loading states if context is not ready
    setIsStackContextReady(false);
  }


  const [branding, setBranding] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [publicProblems, setPublicProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [appDataLoading, setAppDataLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);

  // Data fetching functions (keep existing logic)
  const fetchBranding = useCallback(async () => { /* ... */ }, []);
  const fetchPlans = useCallback(async () => { /* ... */ }, []);
  const fetchPublicProblems = useCallback(async () => { /* ... */ }, []);
  const fetchOrCreateUserProfile = useCallback(async () => { /* ... */ }, [isAuthenticated, stackAuthUser, isStackContextReady]);
  const fetchMyRequests = useCallback(async () => { /* ... */ }, [isAuthenticated, userProfile?.id]);
  const fetchMyQuotes = useCallback(async () => { /* ... */ }, [isAuthenticated, userProfile?.id, userProfile?.role]);


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
    // Only fetch user profile if isAuthenticated is true AND Stack Auth context is ready
    if (isAuthenticated && isStackContextReady) {
      fetchOrCreateUserProfile();
    } else {
      setUserProfile(null);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile, isStackContextReady]);

  useEffect(() => {
    if (userProfile?.id && isAuthenticated && isStackContextReady) {
      fetchMyRequests();
      fetchMyQuotes();
    }
  }, [userProfile?.id, isAuthenticated, fetchMyRequests, fetchMyQuotes, isStackContextReady]);


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
    isLoading: isStackAuthLoading || appDataLoading || !isStackContextReady, // Add isStackContextReady to overall loading
    login: stackAppLogin,
    logout: stackAppLogout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
