
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
      // Test 1: Check if we can access the contacts table
      console.log('🔍 Testing database access...');
      
      // Test basic table access
      const { data: countData, error: countError } = await supabase
        .from('contacts')
        .select('count')
        .single();
      
      results.tableAccess = {
        success: !countError,
        count: countData?.count || 0,
        error: countError?.message
      };

      // Test 2: Try to fetch all contacts without filters
      const { data: allContacts, error: allError } = await supabase
        .from('contacts')
        .select('*')
        .limit(5);
      
      results.allContactsFetch = {
        success: !allError,
        count: allContacts?.length || 0,
        data: allContacts,
        error: allError?.message
      };

      // Test 3: Try with user_id filter
      const { data: filteredContacts, error: filteredError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .limit(5);
      
      results.filteredContactsFetch = {
        success: !filteredError,
        count: filteredContacts?.length || 0,
        data: filteredContacts,
        error: filteredError?.message
      };

      // Test 4: Check current user authentication
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

      // Test 5: Check if we can query Telegram user contacts specifically
      const { data: telegramContacts, error: telegramError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000001')
        .limit(5);
      
      results.telegramContactsFetch = {
        success: !telegramError,
        count: telegramContacts?.length || 0,
        data: telegramContacts,
        error: telegramError?.message
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
              {/* Table Access Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Table Access</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.tableAccess?.success ? "default" : "destructive"}>
                    {debugResults.tableAccess?.success ? "✅ SUCCESS" : "❌ FAILED"}
                  </Badge>
                  {debugResults.tableAccess?.count !== undefined && (
                    <span className="text-sm text-gray-600">
                      Count: {debugResults.tableAccess.count}
                    </span>
                  )}
                </div>
              </div>

              {/* All Contacts Fetch Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>All Contacts Fetch</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.allContactsFetch?.success ? "default" : "destructive"}>
                    {debugResults.allContactsFetch?.success ? "✅ SUCCESS" : "❌ FAILED"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Found: {debugResults.allContactsFetch?.count || 0}
                  </span>
                </div>
              </div>

              {/* Filtered Contacts Test */}
              <div className="flex items-center justify-between p-3 border rounded">
                <span>Telegram User Contacts</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={debugResults.telegramContactsFetch?.success ? "default" : "destructive"}>
                    {debugResults.telegramContactsFetch?.success ? "✅ SUCCESS" : "❌ FAILED"}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Found: {debugResults.telegramContactsFetch?.count || 0}
                  </span>
                </div>
              </div>

              {/* User Auth Test */}
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
            {debugResults.telegramContactsFetch?.data && debugResults.telegramContactsFetch.data.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-green-800 mb-2">Sample Contacts Found:</h4>
                <div className="text-sm text-green-700 space-y-2">
                  {debugResults.telegramContactsFetch.data.slice(0, 3).map((contact: any) => (
                    <div key={contact.id} className="border-l-2 border-green-300 pl-2">
                      <div><strong>Name:</strong> {contact.name}</div>
                      <div><strong>Location:</strong> {contact.location || 'N/A'}</div>
                      <div><strong>User ID:</strong> {contact.user_id}</div>
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
