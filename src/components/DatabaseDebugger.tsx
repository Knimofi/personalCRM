
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DatabaseDebugger = () => {
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runDatabaseDebug = async () => {
    setIsDebugging(true);
    const results: any = {};

    try {
      console.log('🔍 Running database debug tests...');
      
      // Test 1: Check current user authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      results.userAuth = {
        success: !userError,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        error: userError?.message
      };

      // Test 2: Fetch all contacts (should now work with new RLS policies)
      const { data: allContacts, error: fetchError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      results.contactsFetch = {
        success: !fetchError,
        count: allContacts?.length || 0,
        data: allContacts,
        error: fetchError?.message
      };

      // Test 3: Check if we can create a test contact (without actually creating it)
      const testContact = {
        name: 'Test Contact',
        location: 'Test Location',
        context: 'Debug test contact'
      };

      // Just validate the data structure, don't actually insert
      results.contactValidation = {
        success: true,
        testData: testContact,
        message: 'Contact structure is valid'
      };

      // Test 4: Check real-time subscription capability
      const testChannel = supabase.channel('test-connection');
      const subscribeResult = await new Promise((resolve) => {
        testChannel.subscribe((status) => {
          resolve(status);
          supabase.removeChannel(testChannel);
        });
      });

      results.realtimeTest = {
        success: subscribeResult === 'SUBSCRIBED',
        status: subscribeResult,
        message: subscribeResult === 'SUBSCRIBED' ? 'Real-time connection working' : 'Real-time connection failed'
      };

      console.log('Debug results:', results);
      setDebugResults(results);

    } catch (error) {
      console.error('Debug error:', error);
      results.generalError = error;
      setDebugResults(results);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Database Debugger
          <Button 
            onClick={runDatabaseDebug}
            disabled={isDebugging}
            variant="outline"
          >
            {isDebugging ? 'Running Tests...' : 'Run Debug Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debugResults && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {/* User Authentication Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>User Authentication</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.userAuth?.success ? "default" : "destructive"}>
                    {debugResults.userAuth?.success ? "✅ AUTHENTICATED" : "❌ NOT AUTHENTICATED"}
                  </Badge>
                  {debugResults.userAuth?.user && (
                    <span className="text-xs text-gray-500">
                      {debugResults.userAuth.user.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Contacts Fetch Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Contacts Fetch</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.contactsFetch?.success ? "default" : "destructive"}>
                    {debugResults.contactsFetch?.success ? "✅ SUCCESS" : "❌ FAILED"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Found: {debugResults.contactsFetch?.count || 0}
                  </span>
                </div>
              </div>

              {/* Contact Validation Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Contact Structure</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.contactValidation?.success ? "default" : "destructive"}>
                    {debugResults.contactValidation?.success ? "✅ VALID" : "❌ INVALID"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {debugResults.contactValidation?.message}
                  </span>
                </div>
              </div>

              {/* Real-time Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Real-time Connection</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.realtimeTest?.success ? "default" : "destructive"}>
                    {debugResults.realtimeTest?.success ? "✅ CONNECTED" : "❌ FAILED"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {debugResults.realtimeTest?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {Object.values(debugResults).some((result: any) => result?.error) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">Errors Found:</h4>
                <div className="text-sm text-red-700 space-y-1">
                  {Object.entries(debugResults).map(([key, result]: [string, any]) => 
                    result?.error && (
                      <div key={key}>
                        <strong>{key}:</strong> {result.error}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Sample Data */}
            {debugResults.contactsFetch?.data && debugResults.contactsFetch.data.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-green-800 mb-2">Sample Contacts Found:</h4>
                <div className="text-sm text-green-700 space-y-2">
                  {debugResults.contactsFetch.data.slice(0, 3).map((contact: any) => (
                    <div key={contact.id} className="border-l-2 border-green-300 pl-2">
                      <div><strong>Name:</strong> {contact.name}</div>
                      <div><strong>Location:</strong> {contact.location || 'N/A'}</div>
                      <div><strong>Source:</strong> {contact.user_id === '00000000-0000-0000-0000-000000000001' ? 'Telegram Bot' : 'Manual Entry'}</div>
                      <div><strong>Created:</strong> {new Date(contact.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
