// app/components/SafeStackProvider.tsx
'use client';

import { ReactNode } from 'react';
import { useStackAuthReady } from './StackAuthIsolation'; // Relative path
import { StackProvider } from '@stackframe/stack';
import { getStackClientApp } from '../../lib/stack'; // Relative path

interface SafeStackProviderProps {
  children: ReactNode;
}

export function SafeStackProvider({ children }: SafeStackProviderProps) {
  const { isStackReady, stackError } = useStackAuthReady();
  const stackClientApp = getStackClientApp();

  if (stackError) {
    console.warn('Stack Auth Error:', stackError);
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

  if (!isStackReady || !stackClientApp) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <StackProvider app={stackClientApp}>
      {children}
    </StackProvider>
  );
}
