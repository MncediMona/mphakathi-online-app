
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getConfig } from '../config';

const ApiTester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const { getAccessTokenSilently } = useAuth0();
  const { apiOrigin } = getConfig();

  const testEndpoint = async (endpoint, requiresAuth = false) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (requiresAuth) {
        const token = await getAccessTokenSilently();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiOrigin}/${endpoint}`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          success: response.ok,
          data: data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'ERROR',
          success: false,
          error: error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const endpoints = [
    { name: 'test-db', label: 'Database Connection', auth: false },
    { name: 'get-problems', label: 'Get Problems', auth: false },
    { name: 'get-pricing-plans', label: 'Get Pricing Plans', auth: false },
    { name: 'get-or-create-user-profile', label: 'User Profile', auth: true },
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">API Endpoint Tester</h3>
      
      <div className="grid gap-4">
        {endpoints.map(endpoint => (
          <div key={endpoint.name} className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <span className="font-medium">{endpoint.label}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({endpoint.auth ? 'Requires Auth' : 'Public'})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => testEndpoint(endpoint.name, endpoint.auth)}
                disabled={loading[endpoint.name]}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading[endpoint.name] ? 'Testing...' : 'Test'}
              </button>
              
              {results[endpoint.name] && (
                <span className={`text-sm px-2 py-1 rounded ${
                  results[endpoint.name].success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {results[endpoint.name].success ? 'PASS' : 'FAIL'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">Test Results:</h4>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTester;
