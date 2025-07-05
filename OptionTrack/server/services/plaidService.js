const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const PlaidAccessToken = require('../models/PlaidAccessToken');
const fileStorageUtil = require('../utils/fileStorage');

class PlaidService {
  constructor() {
    console.log('PlaidService: Initializing Plaid client...');

    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      throw new Error('Plaid credentials not found in environment variables');
    }

    const configuration = new Configuration({
      basePath: this.getPlaidEnvironment(),
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    });

    this.client = new PlaidApi(configuration);
    console.log('PlaidService: Plaid client initialized successfully');
  }

  getPlaidEnvironment() {
    const env = process.env.PLAID_ENV || 'sandbox';
    switch (env) {
      case 'sandbox':
        return PlaidEnvironments.sandbox;
      case 'development':
        return PlaidEnvironments.development;
      case 'production':
        return PlaidEnvironments.production;
      default:
        return PlaidEnvironments.sandbox;
    }
  }

  async createLinkToken(userId) {
    try {
      console.log(`PlaidService: Creating link token for user ${userId}`);

      const request = {
        user: {
          client_user_id: userId.toString(),
        },
        client_name: 'OptionTrack',
        products: ['investments'],
        country_codes: ['US'],
        language: 'en',
      };

      const response = await this.client.linkTokenCreate(request);
      console.log('PlaidService: Link token created successfully');

      // Save raw link token response
      try {
        console.log('PlaidService: About to save link token data to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'link_token_response', response.data);
        console.log('PlaidService: Successfully saved link token data to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving link token data to file:', fileError);
        console.error('PlaidService: File error stack:', fileError.stack);
        // Don't throw error, just log it - file saving shouldn't break the main flow
      }

      return response.data;
    } catch (error) {
      console.error('PlaidService: Error creating link token:', error);
      throw new Error(`Failed to create link token: ${error.message}`);
    }
  }

  async exchangePublicToken(publicToken, userId) {
    try {
      console.log(`PlaidService: Exchanging public token for user ${userId}`);
      console.log(`PlaidService: Public token: ${publicToken ? publicToken.substring(0, 20) + '...' : 'undefined'}`);

      const request = {
        public_token: publicToken,
      };

      console.log(`PlaidService: About to call itemPublicTokenExchange`);
      const response = await this.client.itemPublicTokenExchange(request);
      console.log(`PlaidService: itemPublicTokenExchange successful`);
      
      const { access_token, item_id } = response.data;
      console.log(`PlaidService: Received access_token: ${access_token ? access_token.substring(0, 20) + '...' : 'undefined'}`);
      console.log(`PlaidService: Received item_id: ${item_id}`);

      // Save raw token exchange response
      try {
        console.log('PlaidService: About to save token exchange data to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'token_exchange_response', response.data);
        console.log('PlaidService: Successfully saved token exchange data to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving token exchange data to file:', fileError);
        console.error('PlaidService: Token exchange file error stack:', fileError.stack);
      }

      // Get institution info
      console.log(`PlaidService: About to get institution info`);
      const institutionResponse = await this.client.itemGet({
        access_token: access_token,
      });
      console.log(`PlaidService: Institution info retrieved successfully`);

      // Save raw item response
      try {
        console.log('PlaidService: About to save item data to file');
        const savedFile = await fileStorageUtil.saveItemData(userId, institutionResponse.data);
        console.log('PlaidService: Successfully saved item data to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving item data to file:', fileError);
        console.error('PlaidService: Item data file error stack:', fileError.stack);
      }

      const institutionId = institutionResponse.data.item.institution_id;
      console.log(`PlaidService: Institution ID: ${institutionId}`);

      // Get institution details
      console.log(`PlaidService: About to get institution details`);
      const institutionDetailsResponse = await this.client.institutionsGetById({
        institution_id: institutionId,
        country_codes: ['US'],
      });
      console.log(`PlaidService: Institution details retrieved successfully`);

      // Save raw institution details
      try {
        console.log('PlaidService: About to save institution data to file');
        const savedFile = await fileStorageUtil.saveInstitutionData(userId, institutionDetailsResponse.data);
        console.log('PlaidService: Successfully saved institution data to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving institution data to file:', fileError);
        console.error('PlaidService: Institution data file error stack:', fileError.stack);
      }

      const institutionName = institutionDetailsResponse.data.institution.name;
      console.log(`PlaidService: Institution name: ${institutionName}`);

      // Get account IDs
      console.log(`PlaidService: About to get accounts`);
      const accountsResponse = await this.client.accountsGet({
        access_token: access_token,
      });
      console.log(`PlaidService: Accounts retrieved successfully - count: ${accountsResponse.data.accounts.length}`);

      // Save raw accounts response
      try {
        console.log('PlaidService: About to save accounts data to file');
        const savedFile = await fileStorageUtil.saveAccountsData(userId, accountsResponse.data);
        console.log('PlaidService: Successfully saved accounts data to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving accounts data to file:', fileError);
        console.error('PlaidService: Accounts data file error stack:', fileError.stack);
      }

      const accountIds = accountsResponse.data.accounts.map(account => account.account_id);
      console.log(`PlaidService: Account IDs: ${accountIds.join(', ')}`);

      // Store access token in database
      console.log(`PlaidService: About to store access token in database`);
      const plaidToken = new PlaidAccessToken({
        user: userId,
        accessToken: access_token,
        itemId: item_id,
        institutionId: institutionId,
        institutionName: institutionName,
        accountIds: accountIds,
      });

      await plaidToken.save();
      console.log('PlaidService: Access token stored successfully in database');
      console.log(`PlaidService: Stored token record ID: ${plaidToken._id}`);

      // IMPORTANT: Fetch and save investment holdings immediately after connecting account
      console.log('PlaidService: ===== STARTING INVESTMENT HOLDINGS FETCH =====');
      try {
        console.log('PlaidService: Fetching investment holdings immediately after account connection...');

        const holdingsRequest = {
          access_token: access_token,
        };

        console.log('PlaidService: About to call investmentsHoldingsGet');
        const holdingsResponse = await this.client.investmentsHoldingsGet(holdingsRequest);
        console.log(`PlaidService: investmentsHoldingsGet completed successfully`);
        console.log(`PlaidService: Retrieved ${holdingsResponse.data.holdings.length} holdings from newly connected ${institutionName}`);
        console.log(`PlaidService: Retrieved ${holdingsResponse.data.accounts.length} accounts from holdings response`);
        console.log(`PlaidService: Retrieved ${holdingsResponse.data.securities.length} securities from holdings response`);

        // Log some sample holdings data
        if (holdingsResponse.data.holdings.length > 0) {
          console.log(`PlaidService: Sample holding data:`, JSON.stringify(holdingsResponse.data.holdings[0], null, 2));
        }

        // Save raw investment holdings response with context
        try {
          const rawDataWithContext = {
            ...holdingsResponse.data,
            institution_name: institutionName,
            institution_id: institutionId,
            user_id: userId,
            token_record_id: plaidToken._id,
            connection_event: true,
            connection_timestamp: new Date().toISOString()
          };
          console.log('PlaidService: About to save initial investment holdings data to file');
          console.log(`PlaidService: Data to save includes ${rawDataWithContext.holdings.length} holdings`);
          const savedFile = await fileStorageUtil.saveInvestmentHoldings(userId, rawDataWithContext);
          console.log(`PlaidService: Successfully saved initial investment holdings data to file: ${savedFile} for ${institutionName}`);
        } catch (fileError) {
          console.error('PlaidService: Error saving initial investment holdings data to file:', fileError);
          console.error('PlaidService: Initial investment holdings file error stack:', fileError.stack);
        }

        // Update last sync time
        plaidToken.lastSyncAt = new Date();
        await plaidToken.save();
        console.log(`PlaidService: Updated last sync time for newly connected ${institutionName}`);

      } catch (holdingsError) {
        console.error('PlaidService: Error fetching initial investment holdings:', holdingsError);
        console.error('PlaidService: Holdings error type:', typeof holdingsError);
        console.error('PlaidService: Holdings error message:', holdingsError.message);
        console.error('PlaidService: Holdings error stack:', holdingsError.stack);
        // Don't throw error - account connection should still succeed even if holdings fetch fails initially
      }
      console.log('PlaidService: ===== COMPLETED INVESTMENT HOLDINGS FETCH =====');

      console.log(`PlaidService: Returning success response for ${institutionName}`);
      return {
        success: true,
        institutionName: institutionName,
        accountCount: accountIds.length,
      };
    } catch (error) {
      console.error('PlaidService: Error exchanging public token:', error);
      console.error('PlaidService: Error type:', typeof error);
      console.error('PlaidService: Error message:', error.message);
      console.error('PlaidService: Error stack:', error.stack);
      throw new Error(`Failed to exchange public token: ${error.message}`);
    }
  }

  async getInvestmentHoldings(userId) {
    try {
      console.log(`PlaidService: Getting investment holdings for user ${userId}`);

      const plaidTokens = await PlaidAccessToken.find({ user: userId, isActive: true });

      if (plaidTokens.length === 0) {
        console.log('PlaidService: No connected accounts found for user');
        throw new Error('No connected accounts found');
      }

      const allHoldings = [];
      const allAccounts = [];
      const allSecurities = [];

      for (const tokenRecord of plaidTokens) {
        try {
          console.log(`PlaidService: Fetching holdings for institution ${tokenRecord.institutionName}`);

          const request = {
            access_token: tokenRecord.accessToken,
          };

          const response = await this.client.investmentsHoldingsGet(request);
          console.log(`PlaidService: Retrieved ${response.data.holdings.length} holdings from ${tokenRecord.institutionName}`);

          // Save raw investment holdings response
          try {
            const rawDataWithContext = {
              ...response.data,
              institution_name: tokenRecord.institutionName,
              institution_id: tokenRecord.institutionId,
              user_id: userId,
              token_record_id: tokenRecord._id,
              manual_sync: true,
              sync_timestamp: new Date().toISOString()
            };
            console.log('PlaidService: About to save investment holdings data to file');
            const savedFile = await fileStorageUtil.saveInvestmentHoldings(userId, rawDataWithContext);
            console.log(`PlaidService: Successfully saved investment holdings data to file: ${savedFile} for ${tokenRecord.institutionName}`);
          } catch (fileError) {
            console.error('PlaidService: Error saving investment holdings data to file:', fileError);
            console.error('PlaidService: Investment holdings file error stack:', fileError.stack);
          }

          // Add institution info to each holding
          const holdingsWithInstitution = response.data.holdings.map(holding => ({
            ...holding,
            institution_name: tokenRecord.institutionName,
            institution_id: tokenRecord.institutionId,
          }));

          // Add institution info to each account
          const accountsWithInstitution = response.data.accounts.map(account => ({
            ...account,
            institution_name: tokenRecord.institutionName,
            institution_id: tokenRecord.institutionId,
          }));

          // Add securities data
          const securitiesWithInstitution = response.data.securities.map(security => ({
            ...security,
            institution_name: tokenRecord.institutionName,
            institution_id: tokenRecord.institutionId,
          }));

          allHoldings.push(...holdingsWithInstitution);
          allAccounts.push(...accountsWithInstitution);
          allSecurities.push(...securitiesWithInstitution);

          // Update last sync time
          tokenRecord.lastSyncAt = new Date();
          await tokenRecord.save();
          console.log(`PlaidService: Updated last sync time for ${tokenRecord.institutionName}`);
        } catch (error) {
          console.error(`PlaidService: Error getting holdings for institution ${tokenRecord.institutionName}:`, error);
          // Continue with other institutions even if one fails
        }
      }

      console.log(`PlaidService: Retrieved ${allHoldings.length} holdings from ${plaidTokens.length} institutions`);

      // Save combined data summary
      try {
        const combinedSummary = {
          total_holdings: allHoldings.length,
          total_accounts: allAccounts.length,
          total_securities: allSecurities.length,
          institutions_count: plaidTokens.length,
          combined_data: {
            holdings: allHoldings,
            accounts: allAccounts,
            securities: allSecurities
          }
        };
        console.log('PlaidService: About to save combined investment summary to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'combined_investment_summary', combinedSummary);
        console.log('PlaidService: Successfully saved combined investment summary to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving combined investment summary to file:', fileError);
        console.error('PlaidService: Combined summary file error stack:', fileError.stack);
      }

      return {
        holdings: allHoldings,
        accounts: allAccounts,
        securities: allSecurities,
      };
    } catch (error) {
      console.error('PlaidService: Error getting investment holdings:', error);
      throw new Error(`Failed to get investment holdings: ${error.message}`);
    }
  }

  async getConnectedAccounts(userId) {
    try {
      console.log(`PlaidService: Getting connected accounts for user ${userId}`);

      const plaidTokens = await PlaidAccessToken.find({ user: userId, isActive: true });
      console.log(`PlaidService: Found ${plaidTokens.length} connected accounts`);

      const connectedAccounts = plaidTokens.map(token => ({
        id: token._id,
        institutionName: token.institutionName,
        institutionId: token.institutionId,
        accountCount: token.accountIds.length,
        lastSyncAt: token.lastSyncAt,
        createdAt: token.createdAt,
      }));

      // Save connected accounts data
      try {
        const accountsData = {
          connected_accounts_count: connectedAccounts.length,
          accounts: connectedAccounts,
          raw_token_records: plaidTokens.map(token => ({
            id: token._id,
            institutionName: token.institutionName,
            institutionId: token.institutionId,
            accountIds: token.accountIds,
            lastSyncAt: token.lastSyncAt,
            createdAt: token.createdAt,
            isActive: token.isActive
          }))
        };
        console.log('PlaidService: About to save connected accounts summary to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'connected_accounts_summary', accountsData);
        console.log('PlaidService: Successfully saved connected accounts summary to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving connected accounts data to file:', fileError);
        console.error('PlaidService: Connected accounts file error stack:', fileError.stack);
      }

      return connectedAccounts;
    } catch (error) {
      console.error('PlaidService: Error getting connected accounts:', error);
      throw new Error(`Failed to get connected accounts: ${error.message}`);
    }
  }

  async disconnectAccount(userId, tokenId) {
    try {
      console.log(`PlaidService: Disconnecting account ${tokenId} for user ${userId}`);

      const plaidToken = await PlaidAccessToken.findOne({
        _id: tokenId,
        user: userId,
        isActive: true
      });

      if (!plaidToken) {
        console.log('PlaidService: Connected account not found');
        throw new Error('Connected account not found');
      }

      // Save disconnect event data
      try {
        const disconnectData = {
          action: 'disconnect_account',
          token_id: tokenId,
          institution_name: plaidToken.institutionName,
          institution_id: plaidToken.institutionId,
          account_count: plaidToken.accountIds.length,
          was_active: plaidToken.isActive,
          last_sync_at: plaidToken.lastSyncAt,
          created_at: plaidToken.createdAt
        };
        console.log('PlaidService: About to save account disconnect event to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'account_disconnect_event', disconnectData);
        console.log('PlaidService: Successfully saved account disconnect event to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving disconnect event data to file:', fileError);
        console.error('PlaidService: Disconnect event file error stack:', fileError.stack);
      }

      // Mark as inactive instead of deleting for audit purposes
      plaidToken.isActive = false;
      await plaidToken.save();

      console.log('PlaidService: Account disconnected successfully');
      return { success: true };
    } catch (error) {
      console.error('PlaidService: Error disconnecting account:', error);
      throw new Error(`Failed to disconnect account: ${error.message}`);
    }
  }

  async syncAccountData(userId) {
    try {
      console.log(`PlaidService: Syncing account data for user ${userId}`);

      const investments = await this.getInvestmentHoldings(userId);
      console.log(`PlaidService: Sync completed - ${investments.holdings.length} holdings, ${investments.accounts.length} accounts`);

      // Save sync summary
      try {
        const syncSummary = {
          action: 'sync_account_data',
          holdings_count: investments.holdings.length,
          accounts_count: investments.accounts.length,
          sync_timestamp: new Date().toISOString(),
          success: true
        };
        console.log('PlaidService: About to save sync summary to file');
        const savedFile = await fileStorageUtil.savePlaidData(userId, 'sync_summary', syncSummary);
        console.log('PlaidService: Successfully saved sync summary to file:', savedFile);
      } catch (fileError) {
        console.error('PlaidService: Error saving sync summary to file:', fileError);
        console.error('PlaidService: Sync summary file error stack:', fileError.stack);
      }

      return {
        success: true,
        holdingsCount: investments.holdings.length,
        accountsCount: investments.accounts.length,
        lastSyncAt: new Date()
      };
    } catch (error) {
      console.error('PlaidService: Error syncing account data:', error);
      throw new Error(`Failed to sync account data: ${error.message}`);
    }
  }
}

module.exports = new PlaidService();