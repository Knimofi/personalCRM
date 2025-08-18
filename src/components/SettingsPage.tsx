
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { StatisticsCharts } from './StatisticsCharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { preferences, setBirthdayReminders, isUpdating } = useUserPreferences();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  const handleUpdateEmail = async () => {
    if (!newEmail) return;
    
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      toast({
        title: "Email update initiated",
        description: "Please check your new email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-birthday-reminder', {
        body: { 
          isTest: true,
          userEmail: user?.email 
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test email sent",
        description: "Check your inbox for the test birthday reminder email.",
      });
    } catch (error: any) {
      toast({
        title: "Error sending test email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleBirthdayReminderToggle = async (enabled: boolean) => {
    try {
      await setBirthdayReminders(enabled);
      toast({
        title: enabled ? "Birthday reminders enabled" : "Birthday reminders disabled",
        description: enabled 
          ? "You'll receive email reminders for contact birthdays."
          : "Birthday reminder emails have been disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your email address and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                />
                <Button 
                  onClick={handleUpdateEmail}
                  disabled={isUpdatingEmail || newEmail === user?.email}
                >
                  {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Birthday Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Birthday Reminders</CardTitle>
            <CardDescription>
              Get email notifications for your contacts' birthdays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="birthday-reminders">Birthday Reminder Emails</Label>
                <p className="text-sm text-gray-500">
                  Receive daily emails about upcoming birthdays
                </p>
              </div>
              <Switch
                id="birthday-reminders"
                checked={preferences?.birthday_reminders_enabled || false}
                onCheckedChange={handleBirthdayReminderToggle}
                disabled={isUpdating}
              />
            </div>
            
            <Button 
              onClick={handleSendTestEmail}
              disabled={isSendingTestEmail}
              variant="outline"
            >
              {isSendingTestEmail ? 'Sending...' : 'Send Test Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>
              Overview of your contact database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="text-3xl font-bold text-blue-600">{contacts.length}</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
            <StatisticsCharts contacts={contacts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
