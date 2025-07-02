// app/components/StackAuthIsolation.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StackClientApp } from '@stackframe/stack'; // Import StackClientApp here for type safety

// Create a context to track when Stack Auth is safe to use
const   StackAuthReadyContext = createContext<{
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
    // Multiple checks to ensure environment is completely ready
    const initializeStackAuth = async () => {
      try {
        // Check 1: Ensure we're in browser
        if (typeof window === 'undefined') {
          return;
        }

        // Check 2: Ensure localStorage is available and working
        try {
          localStorage.setItem('__stack_test__', 'test');
          localStorage.removeItem('__stack_test__');
        } catch (e) {
          throw new Error('localStorage not available');
        }

        // Check 3: Ensure document is ready
        if (document.readyState !== 'complete') {
          await new Promise<void>(resolve => { // Explicitly type resolve as void
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve(), { once: true });
            }
          });
        }

        // Check 4: Additional delay to ensure hydration is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check 5: Verify Stack Auth module can be imported without errors
        // const { StackClientApp } = await import('@stackframe/stack'); // No need to re-import here, already imported at top

        // Check 6: Try to create a minimal Stack instance to test initialization
        // This part needs to be careful not to create a new instance every time,
        // but rather verify if the environment allows for it.
        // We will rely on getStackClientApp from lib/stack.ts for the actual instance.

        // If we get here, the environment is likely ready for Stack Auth
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
