// app/components/StackAuthProviderWrapper.js
"use client"; // This component MUST be a client component

import React from 'react';
import { StackProvider } from '@stackframe/stack';
import { getStackClientApp } from '../../lib/stack'; // Adjust path as needed

export default function StackAuthProviderWrapper({ children }) {
  const stackClientApp = getStackClientApp();

  // Only render StackProvider if stackClientApp is initialized (i.e., on client-side)
  if (!stackClientApp) {
    // You can render a loading spinner, or null, or a message here during SSR/initial render
    // before the client-side code takes over.
    return <div>Loading authentication...</div>; // Or null
  }

  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
}
