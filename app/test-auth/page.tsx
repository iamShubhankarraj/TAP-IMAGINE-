// app/test-auth/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        tests: []
      };

      // Test 1: Check environment variables
      results.tests.push({
        name: '1. Environment Variables',
        status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ PASS' : '❌ FAIL',
        details: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing'
        }
      });

      // Test 2: Check Supabase connection
      try {
        const { data, error } = await supabase.auth.getSession();
        results.tests.push({
          name: '2. Supabase Connection',
          status: !error ? '✅ PASS' : '❌ FAIL',
          details: {
            session: data.session ? 'Active' : 'None',
            error: error?.message || 'None'
          }
        });
      } catch (err: any) {
        results.tests.push({
          name: '2. Supabase Connection',
          status: '❌ FAIL',
          details: { error: err.message }
        });
      }

      // Test 3: Check auth settings
      try {
        const { data: settings } = await supabase.auth.getSession();
        results.tests.push({
          name: '3. Auth Settings',
          status: '✅ INFO',
          details: {
            message: 'Check Supabase dashboard for email confirmation settings'
          }
        });
      } catch (err) {
        results.tests.push({
          name: '3. Auth Settings',
          status: '⚠️ WARN',
          details: { message: 'Unable to check' }
        });
      }

      setResult(results);
    } catch (error: any) {
      setResult({
        error: 'Test failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        email,
        tests: []
      };

      console.log('🔐 Starting login test...');

      // Test login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      results.tests.push({
        name: 'Login Attempt',
        status: !error ? '✅ SUCCESS' : '❌ FAILED',
        details: {
          error: error?.message || 'None',
          session: data.session ? 'Created' : 'Not created',
          user: data.user ? {
            id: data.user.id,
            email: data.user.email,
            confirmed: data.user.email_confirmed_at ? 'Yes' : 'No ❌ EMAIL NOT CONFIRMED',
            lastSignIn: data.user.last_sign_in_at
          } : 'No user data'
        }
      });

      // If login succeeded, check session
      if (data.session) {
        const { data: sessionData } = await supabase.auth.getSession();
        results.tests.push({
          name: 'Session Verification',
          status: sessionData.session ? '✅ PASS' : '❌ FAIL',
          details: {
            sessionExists: sessionData.session ? 'Yes' : 'No',
            expiresAt: sessionData.session?.expires_at || 'N/A'
          }
        });
      }

      setResult(results);
    } catch (error: any) {
      setResult({
        error: 'Login test failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">🔧 Auth Diagnostic Tool</h1>
          <p className="text-gray-400 mb-6">
            Use this tool to diagnose authentication issues
          </p>

          <div className="space-y-4">
            {/* Connection Test */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-2">Step 1: Test Connection</h2>
              <p className="text-gray-400 mb-4">Check if Supabase is properly configured</p>
              <button
                onClick={testConnection}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {/* Login Test */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-2">Step 2: Test Login</h2>
              <p className="text-gray-400 mb-4">Test your actual login credentials</p>
              
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={testLogin}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Results</h2>
            <pre className="bg-gray-900 p-4 rounded-lg text-green-400 overflow-auto max-h-96 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>

            {/* Interpretation */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <h3 className="text-yellow-400 font-semibold mb-2">🔍 What to look for:</h3>
              <ul className="text-yellow-200 space-y-2 text-sm">
                <li>✅ <strong>Environment Variables:</strong> Should be "Set"</li>
                <li>✅ <strong>Supabase Connection:</strong> Should be "PASS"</li>
                <li>⚠️ <strong>Email Confirmed:</strong> Should be "Yes" - if "No", that's your problem!</li>
                <li>✅ <strong>Session Created:</strong> Should be "Created" after login</li>
              </ul>

              <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded">
                <p className="text-red-200 font-semibold">🚨 Common Issues:</p>
                <p className="text-red-300 text-sm mt-2">
                  If you see "EMAIL NOT CONFIRMED", go to your Supabase dashboard:
                </p>
                <ol className="text-red-300 text-sm mt-2 ml-4 list-decimal">
                  <li>Go to Authentication → Settings</li>
                  <li>UNCHECK "Enable email confirmations"</li>
                  <li>Save changes</li>
                  <li>Try logging in again</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">🔗 Quick Links</h3>
          <div className="space-y-2">
            <a 
              href="https://app.supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300"
            >
              → Supabase Dashboard
            </a>
            <a 
              href="/auth/login" 
              className="block text-blue-400 hover:text-blue-300"
            >
              → Back to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
