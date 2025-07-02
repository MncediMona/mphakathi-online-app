// lib/appContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useUser, useStackApp } from '@stackframe/stack';
import { useStackAuthReady } from '../app/components/StackAuthIsolation';

interface AppContextType {
  isAuthenticated: boolean;
  user: any; // Stackframe's user object type
  isLoading: boolean;
  error: string | null;
  userProfile: any; // Your custom user profile
  login: () => void;
  logout: () => void;
  branding: any;
  pricingPlans: any[];
  publicProblems: any[];
  myRequests: any[];
  myQuotes: any[];
  fetchMyRequests: () => Promise<void>;
  fetchPublicProblems: () => Promise<void>;
  fetchMyQuotes: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8888';

export function AppProvider({ children }: { children: ReactNode }) {
  const { isStackReady, stackError } = useStackAuthReady();

  // Get the full return object from useUser
  const userHookResult = useUser();
  const stackApp = useStackApp(); // Call useStackApp unconditionally

  // Safely access properties from userHookResult
  // Check if userHookResult itself is null/undefined before accessing properties
  const stackAuthUser = userHookResult && 'user' in userHookResult ? userHookResult.user : null;
  const isStackAuthLoading = userHookResult && 'isLoading' in userHookResult ? userHookResult.isLoading : true;

  // Derive isAuthenticated from stackAuthUser
  const isAuthenticated = !!stackAuthUser; // True if user object exists, false otherwise

  const [branding, setBranding] = useState<any>(null);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [publicProblems, setPublicProblems] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appDataLoading, setAppDataLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  const login = useCallback(() => {
    if (stackApp?.login) {
      stackApp.login();
    } else {
      console.warn("Stack Auth login not available.");
    }
  }, [stackApp]);

  const logout = useCallback(() => {
    if (stackApp?.logout) {
      stackApp.logout();
    } else {
      console.warn("Stack Auth logout not available.");
    }
  }, [stackApp]);


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
    if (!isStackReady || stackError || !isAuthenticated || !stackAuthUser?.id) {
      setUserProfile(null);
      return;
    }
    try {
      const idToken = stackAuthUser ? await stackAuthUser.getIdToken() : null;
      if (!idToken) {
        console.warn("No ID token available for user profile fetch.");
        setUserProfile(null);
        return;
      }

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
  }, [isAuthenticated, stackAuthUser, isStackReady, stackError]);

  const fetchMyRequests = useCallback(async () => {
    if (!isStackReady || stackError || !isAuthenticated || !userProfile?.id) {
      setMyRequests([]);
      return;
    }
    try {
      const idToken = stackAuthUser ? await stackAuthUser.getIdToken() : null;
      if (!idToken) {
        console.warn("No ID token available for my requests fetch.");
        setMyRequests([]);
        return;
      }
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
  }, [isAuthenticated, userProfile?.id, stackAuthUser, isStackReady, stackError]);

  const fetchMyQuotes = useCallback(async () => {
    if (!isStackReady || stackError || !isAuthenticated || !userProfile?.id || userProfile?.role !== 'provider') {
      setMyQuotes([]);
      return;
    }
    try {
      const idToken = stackAuthUser ? await stackAuthUser.getIdToken() : null;
      if (!idToken) {
        console.warn("No ID token available for my quotes fetch.");
        setMyQuotes([]);
        return;
      }
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
  }, [isAuthenticated, userProfile?.id, userProfile?.role, stackAuthUser, isStackReady, stackError]);


  useEffect(() => {
    const loadAllPublicData = async () => {
      setAppDataLoading(true);
      await Promise.all([fetchBranding(), fetchPlans(), fetchPublicProblems()]);
      setAppDataLoading(false);
    };
    loadAllPublicData();
  }, [fetchBranding, fetchPlans, fetchPublicProblems]);

  useEffect(() => {
    if (isAuthenticated && isStackReady && !stackError) {
      fetchOrCreateUserProfile();
    } else {
      setUserProfile(null);
      setMyRequests([]);
      setMyQuotes([]);
    }
  }, [isAuthenticated, fetchOrCreateUserProfile, isStackReady, stackError]);

  useEffect(() => {
    if (userProfile?.id && isAuthenticated && isStackReady && !stackError) {
      fetchMyRequests();
      fetchMyQuotes();
    }
  }, [userProfile?.id, isAuthenticated, fetchMyRequests, fetchMyQuotes, isStackReady, stackError]);


  const contextValue: AppContextType = {
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
    error: stackError,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
