import React from 'react';
// Corrected import based on previous steps and search results.
import { StackProvider, useUser, useStackApp } from '@stackframe/stack';
import { stackClientApp } from './stack'; // Assuming this file is correctly set up

const App = () => {
  // Use Stack Auth hooks
  const { isAuthenticated, user, isLoading } = useUser();
  const stackApp = useStackApp(); // Get the Stack App client instance for login/logout functions

  const handleLogin = () => {
    stackApp.login(); // Initiate login flow via Stack Auth
  };

  const handleLogout = () => {
    stackApp.logout(); // Initiate logout flow via Stack Auth
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-700">Loading authentication...</div>
      </div>
    );
  }

  return (
    // Wrap with StackProvider
    <StackProvider app={stackClientApp}>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Mphakathi Online (Auth Test)</h1>
        {isAuthenticated ? (
          <div className="text-center">
            <p className="text-xl text-green-700 mb-2">You are logged in!</p>
            <p className="text-gray-800 mb-4">Welcome, {user?.displayName || user?.email || 'User'}!</p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-200 shadow-md"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-2">You are not logged in.</p>
            <button
              onClick={handleLogin}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </StackProvider>
  );
};

export default App;
