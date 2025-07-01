// app/components/StackAuthProviderWrapper.js
"use client";

import React, { useEffect, useState } from 'react';
import { StackProvider } from '@stackframe/stack';
import { getStackClientApp } from '../../lib/stack';

export default function StackAuthProviderWrapper({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [appInstance, setAppInstance] = useState(null);

  useEffect(() => {
    const app = getStackClientApp();
    if (app) {
      setAppInstance(app);
      setIsReady(true);
      // console.log("StackAuthProviderWrapper: StackClientApp instance is ready.");
    } else {
      // console.log("StackAuthProviderWrapper: StackClientApp instance not yet available or keys missing.");
      // If it's not available, we might want to re-check after a short delay
      // or just wait for a re-render if dependencies change.
      // For now, let's just rely on the initial check.
    }
  }, []); // Empty dependency array means this runs once on mount

  if (!isReady || !appInstance) {
    // Render a loading state or null while StackClientApp is not ready
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Initializing authentication...</p>
      </div>
    );
  }

  return (
    <StackProvider app={appInstance}>
      {children}
    </StackProvider>
  );
}
