// lib/appContext.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useStackApp } from '@stackframe/stack';
import { useStackAuthReady } from '../app/components/StackAuthIsolation'; // Relative path

export const AppContext = createContext<any>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { isStackReady, stackError } = useStackAuthReady();

  let isAuthenticated = false;
  let stackAuthUser: any = null;
  let isStackAuthLoading = true;
  let stackAppLogin = () => console.warn("Stack Auth login not available (context not ready).");
  let stackAppLogout = () => console.warn("Stack Auth logout not available (context not ready).");

  if (isStackReady && !stackError) {
    try {
      const { isAuthenticated: auth, user: sUser, isLoading: sLoading } = useUser();
      const stackApp = useStackApp();

      isAuthenticated = auth;
      stackAuthUser = sUser;
      isStackAuthLoading = sLoading;
      stackAppLogin = stackApp.login;
      stackAppLogout = stackApp.logout;
    } catch (error) {
      console.warn("Error accessing Stack Auth context in AppProvider (might be a transient issue):", error);
    }
  }

  const [branding, setBranding] = useState<any>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [publicProblems, setPublicProblems] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appDataLoading, setAppDataLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);

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
      const idToken = await stackAuthUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-or-create-user-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          auth_id: stackAuthUser.id,
          email: stackAuthUser.email,
          name: stackAuthUser.name || (stackAuthUser.email ? stackAuthUser.email.split('@')[0] : 'User')
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Failed to fetch or create user profile:", error);
      setUserProfile(null);
    }
  }, [isAuthenticated, stackAuthUser]);

  const fetchMyRequests = useCallback(async () => {
    if (!isAuthenticated || !userProfile?.id) {
      setMyRequests([]);
      return;
    }
    try {
      const idToken = await stackAuthUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-my-requests?userId=${userProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
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
      const idToken = await stackAuthUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/.netlify/functions/get-my-quotes?providerId=${userProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
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


  useEffect(() => {
    const loadAllPublicData = async () => {
      setAppDataLoading(true);
      await Promise.all([fetchBranding(), fetchPlans(), fetchPublicProblems()]);
      setAppDataLoading(false);
    };
    loadAllPublicData();
  }, [fetchBranding, fetchPlans, fetchPublicProblems]);

  useEffect(() => {
    if (isAuthenticated && isStackReady) {
      fetchOrCreateUserProfile();
    } else {
      setUserProfile(null);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile, isStackReady]);

  useEffect(() => {
    if (userProfile?.id && isAuthenticated && isStackReady) {
      fetchMyRequests();
      fetchMyQuotes();
    }
  }, [userProfile?.id, isAuthenticated, fetchMyRequests, fetchMyQuotes, isStackReady]);


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
    isLoading: isStackAuthLoading || appDataLoading || !isStackReady,
    login: stackAppLogin,
    logout: stackAppLogout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
