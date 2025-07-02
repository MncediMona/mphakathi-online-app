// app/components/SafeStackProvider.tsx
'use client';

import { ReactNode } from 'react';
import { useStackAuthReady } from './StackAuthIsolation';
import { StackProvider } from '@stackframe/stack'; // Import StackProvider
import { getStackClientApp } from '../../lib/stack'; // Import the client app getter

interface SafeStackProviderProps {
  children: ReactNode;
}

export function SafeStackProvider({ children }: SafeStackProviderProps) {
  const { isStackReady, stackError } = useStackAuthReady();
  const stackClientApp = getStackClientApp(); // Get the client app instance

  if (stackError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-red-800 font-semibold">Authentication Error</h2>
        <p className="text-red-600 text-sm">{stackError}</p>
        <p className="text-red-600 text-sm mt-2">
          Please refresh the page or contact support if this persists.
        </p>
      </div>
    );
  }

  // Show loading while Stack Auth environment is not ready OR if StackClientApp instance is null
  if (!isStackReady || !stackClientApp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Only render StackProvider when completely ready and app instance is available
  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
}
