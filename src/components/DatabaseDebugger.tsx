
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Database, User } from 'lucide-react';

export const DatabaseDebugger = () => {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDatabaseDebug = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('contacts').select('count').single();
      results.tests.push({
        name: 'Database Connection',
        status: error ? 'error' : 'success',
        details: error ? error.message : 'Connected successfully',
        data: data
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Database Connection',
        status: 'error',
        details: err.message
      });
    }

    // Test 2: Count all contacts
    try {
      const { count, error } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });
      
      results.tests.push({
        name: 'Total Contacts Count',
        status: error ? 'error' : 'success',
        details: error ? error.message : `Found ${count} total contacts`,
        data: { count }
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Total Contacts Count',
        status: 'error',
        details: err.message
      });
    }

    // Test 3: Sample contacts
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, user_id, created_at')
        .limit(3);
      
      results.tests.push({
        name: 'Sample Contacts',
        status: error ? 'error' : 'success',
        details: error ? error.message : `Retrieved ${data?.length || 0} sample contacts`,
        data: data
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Sample Contacts',
        status: 'error',
        details: err.message
      });
    }

    // Test 4: Current user
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      results.tests.push({
        name: 'Current User',
        status: error ? 'error' : 'success',
        details: user ? `Authenticated as ${user.email}` : 'No authenticated user',
        data: { user_id: user?.id, email: user?.email }
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Current User',
        status: 'error',
        details: err.message
      });
    }

    // Test 5: Telegram user contacts
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .limit(5);
      
      results.tests.push({
        name: 'Telegram Contacts',
        status: error ? 'error' : 'success',
        details: error ? error.message : `Found ${data?.length || 0} Telegram contacts`,
        data: data
      });
    } catch (err: any) {
      results.tests.push({
        name: 'Telegram Contacts',
        status: 'error',
        details: err.message
      });
    }

    setDebugResults(results);
    setIsRunning(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Debugger</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runDatabaseDebug}
          disabled={isRunning}
          className="mb-4"
        >
          {isRunning ? 'Running Tests...' : 'Run Debug Tests'}
        </Button>

        {debugResults && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Last run: {new Date(debugResults.timestamp).toLocaleString()}
            </div>
            
            {debugResults.tests.map((test: any, index: number) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  {test.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {test.details}
                </div>
                {test.data && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
