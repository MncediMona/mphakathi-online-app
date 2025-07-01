// app/components/StackAuthProviderWrapper.js
"use client";

import React, { useEffect, useState } from 'react';
import { StackProvider } from '@stackframe/stack';
import { getStackClientApp } from '../../lib/stack';

export default function StackAuthProviderWrapper({ children }) {
  const [isClient, setIsClient] = useState(false);
  const stackClientApp = getStackClientApp(); // Get the instance (might be null on server)

  useEffect(() => {
    // This effect runs only once, after the component mounts on the client
    setIsClient(true);
  }, []);

  // During SSR or initial client render before useEffect runs, or if stackClientApp is null
  if (!isClient || !stackClientApp) {
    // Render a minimal placeholder or null on the server/during initial hydration
    // This prevents React from trying to hydrate a StackProvider that isn't fully ready.
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can add a loading spinner or message here */}
        <p className="text-gray-500">Loading authentication services...</p>
      </div>
    );
  }

  // Only render StackProvider when we are definitely on the client and have a valid app instance
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
}
