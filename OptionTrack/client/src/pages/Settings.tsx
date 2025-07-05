import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/useToast';
import { Loader2, Save, User, Bell, Shield, Link, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import { PlaidLink } from '../components/PlaidLink';
import {
  getUserPreferences,
  createUserPreferences,
  updateUserPreferences,
  type UserPreferences
} from '../api/userPreferences';
import { positionsCache } from '../api/positions';

export const Settings: React.FC = () => {
  console.log('Settings: Component function called');

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingPortfolios, setRefreshingPortfolios] = useState(false);

  console.log('Settings: State initialized - preferences:', !!preferences, 'loading:', loading);

  useEffect(() => {
    console.log('Settings: useEffect triggered, loading preferences...');
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    console.log('Settings: loadPreferences function called');
    try {
      console.log('Settings: Starting to load preferences...');
      setLoading(true);

      console.log('Settings: About to call getUserPreferences API');
      const response = await getUserPreferences();
      console.log('Settings: getUserPreferences response received:', response);
      console.log('Settings: Response type:', typeof response);
      console.log('Settings: Response keys:', response ? Object.keys(response) : 'response is null');
      console.log('Settings: Response.data type:', typeof response?.data);
      console.log('Settings: Response.data keys:', response?.data ? Object.keys(response.data) : 'response.data is null');

      console.log('Settings: About to set preferences state');
      setPreferences(response.data);
      console.log('Settings: Preferences state set successfully');

    } catch (error: any) {
      console.error('Settings: Error in loadPreferences:', error);
      console.error('Settings: Error type:', typeof error);
      console.error('Settings: Error keys:', error ? Object.keys(error) : 'error is null/undefined');
      console.error('Settings: Error message:', error?.message);
      console.error('Settings: Error response:', error?.response);
      console.error('Settings: Error stack:', error?.stack);

      // If no preferences exist, create default ones
      if (error?.message && error.message.includes('not found')) {
        console.log('Settings: No preferences found, creating default ones...');
        const defaultPreferences: Omit<UserPreferences, '_id' | 'user' | 'createdAt' | 'updatedAt'> = {
          notifications: {
            email: true,
            push: true,
            sms: false,
            expirationAlerts: true,
            assignmentAlerts: true,
            profitTargetAlerts: true,
            lossLimitAlerts: true,
            volatilityAlerts: false,
            marginAlerts: true,
            concentrationAlerts: true,
            greeksAlerts: false,
            marketEventAlerts: true,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00'
          },
          display: {
            theme: 'dark',
            compactMode: false,
            showGreeks: true,
            showProbabilities: true,
            defaultTimeframe: '30d',
            defaultSorting: 'expiration',
            rowDensity: 'comfortable',
            chartType: 'line'
          },
          trading: {
            defaultExpiration: '30-45',
            defaultDelta: '0.30',
            profitTarget: 50,
            maxPositionSize: 10,
            concentrationLimit: 20,
            marginUsageLimit: 75,
            commissionRate: 0.65,
            taxLotMethod: 'FIFO',
            washSaleTracking: true
          },
          security: {
            twoFactorEnabled: false,
            sessionTimeout: 60,
            dataRetention: 365,
            shareData: false,
            backupEnabled: true
          }
        };

        try {
          console.log('Settings: Creating default preferences...');
          const createResponse = await createUserPreferences(defaultPreferences);
          console.log('Settings: Default preferences created:', createResponse);
          setPreferences(createResponse.data);
        } catch (createError: any) {
          console.error('Settings: Error creating default preferences:', createError);
          console.error('Settings: Create error type:', typeof createError);
          console.error('Settings: Create error message:', createError?.message);
          toast({
            title: "Error",
            description: createError?.message || 'Failed to create default preferences',
            variant: "destructive",
          });
        }
      } else {
        console.log('Settings: Showing error toast...');
        toast({
          title: "Error",
          description: error?.message || 'Failed to load preferences',
          variant: "destructive",
        });
      }
    } finally {
      console.log('Settings: Loading preferences completed, setting loading to false');
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    console.log('Settings: savePreferences called');
    if (!preferences) {
      console.log('Settings: No preferences to save');
      return;
    }

    try {
      console.log('Settings: Saving preferences...');
      setSaving(true);
      await updateUserPreferences(preferences._id, preferences);
      console.log('Settings: Preferences saved successfully');
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Settings: Error saving preferences:', error);
      console.error('Settings: Save error message:', error?.message);
      toast({
        title: "Error",
        description: error?.message || 'Failed to save preferences',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const refreshPortfolios = async () => {
    try {
      console.log('Settings: Refreshing portfolio data...');
      setRefreshingPortfolios(true);

      // Clear the cache to force fresh data on next request
      positionsCache.clear();

      toast({
        title: "Success",
        description: "Portfolio cache cleared. Fresh data will be loaded on next page visit.",
      });
    } catch (error: any) {
      console.error('Settings: Error refreshing portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to refresh portfolios",
        variant: "destructive",
      });
    } finally {
      setRefreshingPortfolios(false);
    }
  };

  const updatePreference = (section: keyof UserPreferences, key: string, value: any) => {
    console.log('Settings: updatePreference called', { section, key, value });
    if (!preferences) {
      console.log('Settings: Cannot update preference - no preferences loaded');
      return;
    }

    console.log(`Settings: Updating preference ${section}.${key} to:`, value);
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value
      }
    });
  };

  console.log('Settings: About to render - loading:', loading, 'preferences:', !!preferences);

  if (loading) {
    console.log('Settings: Rendering loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  if (!preferences) {
    console.log('Settings: Rendering no preferences state');
    return (
      <div className="text-center py-8">
        <p>Failed to load preferences. Please try refreshing the page.</p>
      </div>
    );
  }

  console.log('Settings: About to render main component');
  console.log('Settings: Preferences structure check:');
  console.log('Settings: preferences.notifications exists:', !!preferences.notifications);
  console.log('Settings: preferences.notifications.email exists:', !!preferences.notifications?.email);
  console.log('Settings: preferences.display exists:', !!preferences.display);
  console.log('Settings: preferences.trading exists:', !!preferences.trading);
  console.log('Settings: preferences.security exists:', !!preferences.security);

  try {
    console.log('Settings: Starting to render main JSX');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and connected accounts</p>
          </div>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Trading
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            {console.log('Settings: About to render PlaidLink component')}
            <PlaidLink />
            {console.log('Settings: PlaidLink component rendered')}
            
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Data</CardTitle>
                <CardDescription>Manage your portfolio data cache and refresh settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Refresh Portfolio Data</Label>
                    <p className="text-sm text-muted-foreground">Clear cached data and force fresh data on next page visit</p>
                  </div>
                  <Button 
                    onClick={refreshPortfolios} 
                    disabled={refreshingPortfolios}
                    variant="outline"
                  >
                    {refreshingPortfolios ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Portfolios
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how and when you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.notifications?.email || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={preferences.notifications?.push || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'push', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <Switch
                        id="sms-notifications"
                        checked={preferences.notifications?.sms || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'sms', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Alert Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiration-alerts">Expiration Alerts</Label>
                      <Switch
                        id="expiration-alerts"
                        checked={preferences.notifications?.expirationAlerts || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'expirationAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignment-alerts">Assignment Alerts</Label>
                      <Switch
                        id="assignment-alerts"
                        checked={preferences.notifications?.assignmentAlerts || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'assignmentAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profit-target-alerts">Profit Target Alerts</Label>
                      <Switch
                        id="profit-target-alerts"
                        checked={preferences.notifications?.profitTargetAlerts || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'profitTargetAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="loss-limit-alerts">Loss Limit Alerts</Label>
                      <Switch
                        id="loss-limit-alerts"
                        checked={preferences.notifications?.lossLimitAlerts || false}
                        onCheckedChange={(checked) => updatePreference('notifications', 'lossLimitAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Quiet Hours</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={preferences.notifications?.quietHoursStart || '22:00'}
                        onChange={(e) => updatePreference('notifications', 'quietHoursStart', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiet-end">End Time</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.notifications?.quietHoursEnd || '08:00'}
                        onChange={(e) => updatePreference('notifications', 'quietHoursEnd', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize how information is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.display?.theme || 'dark'}
                      onValueChange={(value) => updatePreference('display', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-timeframe">Default Timeframe</Label>
                    <Select
                      value={preferences.display?.defaultTimeframe || '30d'}
                      onValueChange={(value) => updatePreference('display', 'defaultTimeframe', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 Days</SelectItem>
                        <SelectItem value="30d">30 Days</SelectItem>
                        <SelectItem value="90d">90 Days</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <Switch
                      id="compact-mode"
                      checked={preferences.display?.compactMode || false}
                      onCheckedChange={(checked) => updatePreference('display', 'compactMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-greeks">Show Greeks</Label>
                    <Switch
                      id="show-greeks"
                      checked={preferences.display?.showGreeks || false}
                      onCheckedChange={(checked) => updatePreference('display', 'showGreeks', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-probabilities">Show Probabilities</Label>
                    <Switch
                      id="show-probabilities"
                      checked={preferences.display?.showProbabilities || false}
                      onCheckedChange={(checked) => updatePreference('display', 'showProbabilities', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Set your default trading parameters and risk limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-expiration">Default Expiration</Label>
                    <Select
                      value={preferences.trading?.defaultExpiration || '30-45'}
                      onValueChange={(value) => updatePreference('trading', 'defaultExpiration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7-14">7-14 Days</SelectItem>
                        <SelectItem value="30-45">30-45 Days</SelectItem>
                        <SelectItem value="45-60">45-60 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-delta">Default Delta Target</Label>
                    <Input
                      id="default-delta"
                      value={preferences.trading?.defaultDelta || '0.30'}
                      onChange={(e) => updatePreference('trading', 'defaultDelta', e.target.value)}
                      placeholder="0.30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profit-target">Profit Target (%)</Label>
                    <Input
                      id="profit-target"
                      type="number"
                      value={preferences.trading?.profitTarget || 50}
                      onChange={(e) => updatePreference('trading', 'profitTarget', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission-rate">Commission Rate ($)</Label>
                    <Input
                      id="commission-rate"
                      type="number"
                      step="0.01"
                      value={preferences.trading?.commissionRate || 0.65}
                      onChange={(e) => updatePreference('trading', 'commissionRate', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={preferences.security?.twoFactorEnabled || false}
                      onCheckedChange={(checked) => updatePreference('security', 'twoFactorEnabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={preferences.security?.sessionTimeout || 60}
                      onChange={(e) => updatePreference('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-enabled">Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup your settings and data</p>
                    </div>
                    <Switch
                      id="backup-enabled"
                      checked={preferences.security?.backupEnabled || false}
                      onCheckedChange={(checked) => updatePreference('security', 'backupEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (renderError) {
    console.error('Settings: Error during render:', renderError);
    return (
      <div className="text-center py-8">
        <p>Error rendering settings. Please check the console.</p>
      </div>
    );
  }
};