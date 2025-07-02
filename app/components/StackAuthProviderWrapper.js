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
    }
  }, []);

  if (!isReady || !appInstance) {
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
