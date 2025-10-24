'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, User, Mail, LogOut } from 'lucide-react';

export default function TestAuthComplete() {
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [runningTests, setRunningTests] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    runAuthTests();
  }, [user, profile]);

  const runAuthTests = async () => {
    setRunningTests(true);
    const results: {[key: string]: boolean} = {};

    // Test 1: Check if user session exists
    results.session = !!user;

    // Test 2: Check if profile exists
    results.profile = !!profile;

    // Test 3: Test database connection
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        results.database = !error && !!data;
      } else {
        results.database = false;
      }
    } catch (error) {
      results.database = false;
    }

    // Test 4: Test auth context
    results.authContext = !isLoading;

    // Test 5: Test user metadata
    results.userMetadata = !!user?.user_metadata;

    setTestResults(results);
    setRunningTests(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToAuth = () => {
    router.push('/auth');
  };

  if (isLoading || runningTests) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-banana mx-auto mb-4" />
          <p className="text-white text-lg">Running authentication tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Authentication System Test
        </h1>

        {/* User Info Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white">
                Status: {user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            {user && (
              <>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="h-4 w-4" />
                  <span>Email: {user.email}</span>
                </div>
                <div className="text-white/80">
                  <span>User ID: {user.id}</span>
                </div>
                {profile && (
                  <div className="text-white/80">
                    <span>Profile: {profile.first_name || 'No first name'} {profile.last_name || ''}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(testResults).map(([test, passed]) => (
              <div key={test} className="flex items-center justify-between">
                <span className="text-white/80 capitalize">
                  {test.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Button
                onClick={handleGoToDashboard}
                className="bg-banana text-gray-900 hover:bg-yellow-400"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGoToAuth}
              className="bg-banana text-gray-900 hover:bg-yellow-400"
            >
              Go to Sign In
            </Button>
          )}
          <Button
            onClick={runAuthTests}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Run Tests Again
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How to Use This Test</CardTitle>
          </CardHeader>
          <CardContent className="text-white/70 space-y-2">
            <p>1. If not authenticated, click "Go to Sign In" to test the login flow</p>
            <p>2. After signing in, you should be redirected back here automatically</p>
            <p>3. All tests should show green checkmarks if auth is working correctly</p>
            <p>4. Click "Go to Dashboard" to test protected route access</p>
            <p>5. Test sign out and sign in flow to ensure everything works</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}