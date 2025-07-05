import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Plus, Trash2, Building2, Calendar, RefreshCw } from 'lucide-react';
import { createLinkToken, exchangePublicToken, getConnectedAccounts, disconnectAccount } from '../api/plaid';
import { toast } from '../hooks/useToast';

declare global {
  interface Window {
    Plaid: any;
  }
}

interface ConnectedAccount {
  id: string;
  institutionName: string;
  institutionId: string;
  accountCount: number;
  lastSyncAt: string | null;
  createdAt: string;
}

export const PlaidLink: React.FC = () => {
  console.log('PlaidLink: Component function called');

  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  console.log('PlaidLink: State initialized');

  useEffect(() => {
    console.log('PlaidLink: useEffect triggered, loading connected accounts...');
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    console.log('PlaidLink: loadConnectedAccounts function called');
    try {
      console.log('PlaidLink: Starting to load connected accounts...');
      setLoadingAccounts(true);

      console.log('PlaidLink: About to call getConnectedAccounts API');
      const response = await getConnectedAccounts();
      console.log('PlaidLink: getConnectedAccounts response:', response);
      console.log('PlaidLink: Response type:', typeof response);
      console.log('PlaidLink: Response.data type:', typeof response?.data);

      setConnectedAccounts(response.data);
      console.log('PlaidLink: Connected accounts state set');
    } catch (error: any) {
      console.error('PlaidLink: Error loading connected accounts:', error);
      console.error('PlaidLink: Error type:', typeof error);
      console.error('PlaidLink: Error message:', error?.message);
      console.error('PlaidLink: Error stack:', error?.stack);
      toast({
        title: "Error",
        description: error?.message || 'Failed to load connected accounts',
        variant: "destructive",
      });
    } finally {
      console.log('PlaidLink: Finished loading connected accounts');
      setLoadingAccounts(false);
    }
  };

  const handlePlaidLink = async () => {
    console.log('PlaidLink: handlePlaidLink function called');
    try {
      console.log('PlaidLink: Starting Plaid Link flow...');
      setIsLoading(true);

      console.log('PlaidLink: Checking if Plaid SDK is loaded...');
      if (!window.Plaid) {
        console.error('PlaidLink: Plaid SDK not loaded');
        throw new Error('Plaid SDK not loaded');
      }
      console.log('PlaidLink: Plaid SDK is available');

      console.log('PlaidLink: Creating link token...');
      const linkTokenResponse = await createLinkToken();
      console.log('PlaidLink: Link token response:', linkTokenResponse);

      const linkToken = linkTokenResponse.data.link_token;
      console.log('PlaidLink: Link token received:', linkToken ? `${linkToken.substring(0, 10)}...` : 'undefined');

      console.log('PlaidLink: Creating Plaid handler...');
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (publicToken: string, metadata: any) => {
          console.log('PlaidLink: onSuccess callback triggered');
          console.log('PlaidLink: Public token received:', publicToken ? `${publicToken.substring(0, 10)}...` : 'undefined');
          console.log('PlaidLink: Metadata:', metadata);
          
          try {
            console.log('PlaidLink: About to exchange public token...');
            const response = await exchangePublicToken(publicToken);
            console.log('PlaidLink: Exchange response:', response);

            toast({
              title: "Account Connected",
              description: `Successfully connected ${response.data.institutionName} with ${response.data.accountCount} account(s)`,
            });

            // Reload connected accounts
            console.log('PlaidLink: Reloading connected accounts...');
            await loadConnectedAccounts();
            console.log('PlaidLink: Connected accounts reloaded');
          } catch (error: any) {
            console.error('PlaidLink: Error in onSuccess callback:', error);
            console.error('PlaidLink: Exchange error type:', typeof error);
            console.error('PlaidLink: Exchange error message:', error?.message);
            console.error('PlaidLink: Exchange error stack:', error?.stack);
            toast({
              title: "Connection Error",
              description: error?.message || 'Failed to connect account',
              variant: "destructive",
            });
          }
        },
        onExit: (error: any, metadata: any) => {
          console.log('PlaidLink: onExit callback triggered');
          if (error) {
            console.error('PlaidLink: Plaid Link error:', error);
            console.error('PlaidLink: Exit error type:', typeof error);
            console.error('PlaidLink: Exit error message:', error?.display_message);
            console.error('PlaidLink: Exit error object keys:', error ? Object.keys(error) : 'error is null');
            toast({
              title: "Connection Error",
              description: error.display_message || "Failed to connect account",
              variant: "destructive",
            });
          } else {
            console.log('PlaidLink: User exited without error');
          }
          console.log('PlaidLink: Exit metadata:', metadata);
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log('PlaidLink: Plaid Link event:', eventName, metadata);
        }
      });

      console.log('PlaidLink: Opening Plaid handler...');
      handler.open();
    } catch (error: any) {
      console.error('PlaidLink: Error initializing Plaid Link:', error);
      console.error('PlaidLink: Init error type:', typeof error);
      console.error('PlaidLink: Init error message:', error?.message);
      console.error('PlaidLink: Init error stack:', error?.stack);
      toast({
        title: "Error",
        description: error?.message || 'Failed to initialize Plaid Link',
        variant: "destructive",
      });
    } finally {
      console.log('PlaidLink: Plaid Link flow completed');
      setIsLoading(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string, institutionName: string) => {
    console.log('PlaidLink: handleDisconnectAccount called');
    try {
      console.log(`PlaidLink: Disconnecting account ${accountId} (${institutionName})...`);
      await disconnectAccount(accountId);
      console.log('PlaidLink: Account disconnected successfully');

      toast({
        title: "Account Disconnected",
        description: `Successfully disconnected ${institutionName}`,
      });

      // Reload connected accounts
      console.log('PlaidLink: Reloading connected accounts after disconnect...');
      await loadConnectedAccounts();
    } catch (error: any) {
      console.error('PlaidLink: Error disconnecting account:', error);
      console.error('PlaidLink: Disconnect error message:', error?.message);
      toast({
        title: "Error",
        description: error?.message || 'Failed to disconnect account',
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('PlaidLink: Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  console.log('PlaidLink: Rendering component - loadingAccounts:', loadingAccounts, 'connectedAccounts:', connectedAccounts.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Connected Brokerage Accounts
          </CardTitle>
          <CardDescription>
            Connect your brokerage accounts to automatically sync your positions and trades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handlePlaidLink}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Connect New Account
              </>
            )}
          </Button>

          {loadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading connected accounts...</span>
            </div>
          ) : connectedAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No accounts connected yet</p>
              <p className="text-sm">Connect your first brokerage account to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connectedAccounts.map((account) => (
                <Card key={account.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-semibold">{account.institutionName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">
                              {account.accountCount} account{account.accountCount !== 1 ? 's' : ''}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Last sync: {formatDate(account.lastSyncAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadConnectedAccounts()}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnectAccount(account.id, account.institutionName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};