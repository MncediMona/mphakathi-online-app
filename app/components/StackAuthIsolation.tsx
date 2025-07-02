// app/components/StackAuthIsolation.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StackClientApp } from '@stackframe/stack';

// Create a context to track when Stack Auth is safe to use
const StackAuthReadyContext = createContext<{
  isStackReady: boolean;
  stackError: string | null;
}>({
  isStackReady: false,
  stackError: null,
});

interface StackAuthIsolationProps {
  children: ReactNode;
}

export function StackAuthIsolation({ children }: StackAuthIsolationProps) {
  const [isStackReady, setIsStackReady] = useState(false);
  const [stackError, setStackError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStackAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          return;
        }

        try {
          localStorage.setItem('__stack_test__', 'test');
          localStorage.removeItem('__stack_test__');
        } catch (e) {
          throw new Error('localStorage not available');
        }

        if (document.readyState !== 'complete') {
          await new Promise<void>(resolve => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve(), { once: true });
            }
          });
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        if (!process.env.NEXT_PUBLIC_STACK_PROJECT_ID || !process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
          throw new Error('Stack Auth environment variables not configured');
        }

        setIsStackReady(true);
      } catch (error) {
        console.error('Stack Auth initialization failed:', error);
        setStackError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initializeStackAuth();
  }, []);

  return (
    <StackAuthReadyContext.Provider value={{ isStackReady, stackError }}>
      {children}
    </StackAuthReadyContext.Provider>
  );
}

export function useStackAuthReady() {
  return useContext(StackAuthReadyContext);
}
