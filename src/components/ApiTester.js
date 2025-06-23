
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ApiTester = () => {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = `${window.location.origin}/.netlify/functions`;

  const runTest = async (testName, testFn) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result, error: null }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message }
      }));
    }
    setIsLoading(false);
  };

  const testDatabaseConnection = async () => {
    const response = await fetch(`${API_BASE}/test-db`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const testUserProfile = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const token = await getAccessTokenSilently();
    const response = await fetch(`${API_BASE}/get-or-create-user-profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const testGetProblems = async () => {
    const response = await fetch(`${API_BASE}/get-problems`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const testGetBranding = async () => {
    const response = await fetch(`${API_BASE}/get-branding`);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const testPostProblem = async () => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const token = await getAccessTokenSilently();
    const testProblem = {
      title: `Test Problem ${Date.now()}`,
      description: 'This is a test problem created by API tester',
      category: 'Technology',
      budget_min: 100,
      budget_max: 500,
      location: 'Remote',
      urgency: 'Medium'
    };
    
    const response = await fetch(`${API_BASE}/post-problem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(testProblem)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const allTests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'User Profile', fn: testUserProfile, requiresAuth: true },
    { name: 'Get Problems', fn: testGetProblems },
    { name: 'Get Branding', fn: testGetBranding },
    { name: 'Post Problem', fn: testPostProblem, requiresAuth: true }
  ];

  const runAllTests = async () => {
    for (const test of allTests) {
      if (test.requiresAuth && !isAuthenticated) {
        setTestResults(prev => ({
          ...prev,
          [test.name]: { success: false, data: null, error: 'Authentication required' }
        }));
        continue;
      }
      await runTest(test.name, test.fn);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  const TestResult = ({ testName, result }) => (
    <div className={`p-3 mb-2 border rounded ${result?.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <div className="flex justify-between items-center">
        <strong>{testName}</strong>
        <span className={`px-2 py-1 rounded text-sm ${result?.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          {result?.success ? '✅ PASS' : '❌ FAIL'}
        </span>
      </div>
      {result?.error && (
        <div className="mt-2 text-red-600 text-sm">
          <strong>Error:</strong> {result.error}
        </div>
      )}
      {result?.data && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-gray-600">View Response Data</summary>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧪 API Test Suite</h2>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={runAllTests}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {allTests.map(test => (
            <button
              key={test.name}
              onClick={() => runTest(test.name, test.fn)}
              disabled={isLoading || (test.requiresAuth && !isAuthenticated)}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              Test {test.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allTests.map(test => (
          <TestResult 
            key={test.name}
            testName={test.name}
            result={testResults[test.name]}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">🔧 Debug Info</h3>
        <div className="text-sm space-y-1">
          <div><strong>API Base URL:</strong> {API_BASE}</div>
          <div><strong>Current URL:</strong> {window.location.href}</div>
          <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
          {user && <div><strong>User:</strong> {user.email}</div>}
        </div>
      </div>
    </div>
  );
};

export default ApiTester;
