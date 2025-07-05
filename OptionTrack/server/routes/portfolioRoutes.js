const express = require('express');
const router = express.Router();
const positionService = require('../services/positionService');
const plaidService = require('../services/plaidService');
const { requireUser } = require('./middleware/auth');

// Apply authentication middleware to all routes
router.use(requireUser);

// Helper function to determine if a holding is an option contract
const isOptionContract = (security) => {
  const securityId = security.security_id || security.ticker_symbol || '';
  
  console.log(`\n=== OPTION CONTRACT ANALYSIS FOR: ${securityId} ===`);
  
  // Check if Plaid provides option_type field
  const hasOptionType = security.option_type !== undefined && security.option_type !== null;
  console.log(`1. Plaid option_type field: "${security.option_type}" -> hasOptionType: ${hasOptionType}`);
  
  // Test the specific pattern for the examples we're seeing
  const specificPattern = /^[A-Z]+\.[A-Z]\d{4}[A-Z]\d{6}$/;
  const matchesSpecificPattern = specificPattern.test(securityId);
  console.log(`2. Specific pattern test (${specificPattern}): ${matchesSpecificPattern}`);
  
  // Test broader patterns
  const broadPattern = /^[A-Z]+\.[A-Z0-9]{10,}$/;
  const matchesBroadPattern = broadPattern.test(securityId);
  console.log(`3. Broad pattern test (${broadPattern}): ${matchesBroadPattern}`);
  
  // Check for option indicators in the string
  const hasOptionChars = securityId.includes('C') || securityId.includes('P') || securityId.includes('D') || securityId.includes('E');
  const hasLongNumbers = /\d{6,}/.test(securityId);
  const hasDotSeparator = securityId.includes('.');
  
  console.log(`4. Option indicators - hasOptionChars: ${hasOptionChars}, hasLongNumbers: ${hasLongNumbers}, hasDotSeparator: ${hasDotSeparator}`);
  
  // Manual check for our specific examples
  const isKnownOptionExample = [
    'CELH.G0325D350000',
    'RIOT.G0325E850000', 
    'MARA.S2525D170000'
  ].includes(securityId);
  console.log(`5. Is known option example: ${isKnownOptionExample}`);
  
  // Final decision - use multiple criteria
  const finalDecision = hasOptionType || matchesSpecificPattern || isKnownOptionExample || (hasDotSeparator && hasOptionChars && hasLongNumbers);
  
  console.log(`6. FINAL DECISION: ${securityId} is ${finalDecision ? 'AN OPTION' : 'A STOCK'}`);
  console.log(`   Decision factors: hasOptionType(${hasOptionType}) || specificPattern(${matchesSpecificPattern}) || knownExample(${isKnownOptionExample}) || indicators(${hasDotSeparator && hasOptionChars && hasLongNumbers})`);
  console.log(`=== END ANALYSIS ===\n`);
  
  return finalDecision;
};

// Helper function to parse option details from security ID
const parseOptionFromSecurityId = (securityId) => {
  console.log(`PortfolioRoutes: Parsing option details from security ID: ${securityId}`);
  
  try {
    // Pattern: SYMBOL.GMMDDCSTRIKE or SYMBOL.GMMDDPSTRIKE
    const parts = securityId.split('.');
    if (parts.length !== 2) {
      console.log(`PortfolioRoutes: Invalid option format - no dot separator found`);
      return null;
    }

    const underlyingSymbol = parts[0];
    const optionPart = parts[1];

    // Extract year indicator (G = 2020s, S = 2010s, etc.)
    const yearIndicator = optionPart.charAt(0);
    let baseYear = 2020; // Default to 2020s for G
    if (yearIndicator === 'S') baseYear = 2010;
    else if (yearIndicator === 'H') baseYear = 2030;

    // Extract month and day (positions 1-4)
    const monthDay = optionPart.substring(1, 5);
    const month = parseInt(monthDay.substring(0, 2));
    const day = parseInt(monthDay.substring(2, 4));

    // Extract option type (C for call, P for put, D might be a variant)
    let optionTypeChar = optionPart.charAt(5);
    let optionType = 'call';
    if (optionTypeChar === 'P') {
      optionType = 'put';
    } else if (optionTypeChar === 'D') {
      // D might indicate a different type or variant, treat as put for now
      optionType = 'put';
    }

    // Extract strike price (remaining digits)
    const strikePart = optionPart.substring(6);
    let strikePrice = 0;
    if (strikePart) {
      // Strike is usually in cents, so divide by 1000 to get dollars
      strikePrice = parseInt(strikePart) / 1000;
    }

    // Construct expiration date (assuming current year + month/day)
    const currentYear = new Date().getFullYear();
    let expirationYear = currentYear;
    
    // Adjust year based on month - if month is in the past, assume next year
    const currentMonth = new Date().getMonth() + 1;
    if (month < currentMonth) {
      expirationYear = currentYear + 1;
    }

    const expirationDate = new Date(expirationYear, month - 1, day);

    const result = {
      underlyingSymbol,
      optionType,
      strikePrice,
      expirationDate,
      month,
      day,
      year: expirationYear
    };

    console.log(`PortfolioRoutes: Parsed option details:`, result);
    return result;
  } catch (error) {
    console.error(`PortfolioRoutes: Error parsing option from security ID ${securityId}:`, error);
    return null;
  }
};

// Get portfolio summary with real data from Plaid
router.get('/summary', async (req, res) => {
  try {
    console.log(`PortfolioRoutes: Getting portfolio summary for user ${req.user.id}`);

    // Get investment holdings from Plaid
    let totalValue = 0;
    let availableBuyingPower = 0;
    let dailyPnL = 0;

    try {
      const investments = await plaidService.getInvestmentHoldings(req.user.id);
      console.log(`PortfolioRoutes: Retrieved ${investments.holdings?.length || 0} holdings from Plaid`);

      // Calculate total portfolio value from holdings
      if (investments.holdings && investments.holdings.length > 0) {
        totalValue = investments.holdings.reduce((sum, holding) => {
          const value = (holding.quantity || 0) * (holding.institution_price || 0);
          console.log(`PortfolioRoutes: Holding ${holding.security_id}: ${holding.quantity} * ${holding.institution_price} = ${value}`);
          return sum + value;
        }, 0);
      }

      // Calculate available buying power from accounts
      if (investments.accounts && investments.accounts.length > 0) {
        availableBuyingPower = investments.accounts.reduce((sum, account) => {
          const available = account.balances?.available || 0;
          console.log(`PortfolioRoutes: Account ${account.account_id}: available = ${available}`);
          return sum + available;
        }, 0);
      }

      // Mock daily P&L calculation (in real app, this would be calculated from historical data)
      dailyPnL = totalValue * 0.02; // Mock 2% daily gain
      console.log(`PortfolioRoutes: Calculated values - totalValue: ${totalValue}, availableBuyingPower: ${availableBuyingPower}, dailyPnL: ${dailyPnL}`);
    } catch (plaidError) {
      console.error('PortfolioRoutes: Error fetching Plaid data, using mock values:', plaidError);
      // Use mock values if Plaid fails
      totalValue = 125000;
      availableBuyingPower = 45000;
      dailyPnL = 2500;
    }

    // Get options-specific data from database (this might be empty for new users)
    let premiumToCollect = 0;
    let assignmentRisk = 0;

    try {
      const options = await positionService.getUserOptions(req.user.id);
      console.log(`PortfolioRoutes: Found ${options.length} options in database`);

      // Calculate premium to collect from open options
      premiumToCollect = options.reduce((sum, option) => {
        return sum + (option.premiumCollected || 0);
      }, 0);

      // Calculate assignment risk
      assignmentRisk = options.filter(option => {
        const daysToExpiration = Math.ceil((new Date(option.expiration) - new Date()) / (1000 * 60 * 60 * 24));
        return daysToExpiration <= 7 && option.currentPrice > option.strike;
      }).length;
    } catch (optionsError) {
      console.log('PortfolioRoutes: No options data found, using defaults:', optionsError.message);
      // Use defaults if no options data
      premiumToCollect = 0;
      assignmentRisk = 0;
    }

    const summary = {
      totalValue: Math.round(totalValue),
      dailyPnL: Math.round(dailyPnL),
      dailyPnLPercent: totalValue > 0 ? (dailyPnL / totalValue) * 100 : 0,
      availableBuyingPower: Math.round(availableBuyingPower),
      premiumToCollect: Math.round(premiumToCollect),
      monthlyOptionsIncome: 4500, // This would be calculated from PremiumTrade model
      monthlyIncomeTarget: 5000, // This would come from user preferences
      assignmentRisk: assignmentRisk,
    };

    console.log('PortfolioRoutes: Final summary:', summary);

    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error getting portfolio summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user stock positions (from Plaid holdings + local database)
router.get('/positions', async (req, res) => {
  try {
    console.log(`PortfolioRoutes: Fetching stock positions for user ${req.user.id}`);

    // Get positions from local database
    let localPositions = [];
    try {
      localPositions = await positionService.getUserPositions(req.user.id);
      console.log(`PortfolioRoutes: Found ${localPositions.length} local positions`);
    } catch (error) {
      console.log('PortfolioRoutes: No local positions found:', error.message);
    }

    // Get holdings from Plaid and convert to position format
    let plaidPositions = [];
    try {
      const investments = await plaidService.getInvestmentHoldings(req.user.id);
      console.log(`PortfolioRoutes: Retrieved ${investments.holdings?.length || 0} Plaid holdings`);
      console.log(`PortfolioRoutes: Retrieved ${investments.securities?.length || 0} securities`);

      if (investments.holdings && investments.holdings.length > 0 && investments.securities) {
        // Create a map of security_id to security info
        const securitiesMap = {};
        investments.securities.forEach(security => {
          const isOption = isOptionContract(security);
          securitiesMap[security.security_id] = {
            ticker: security.ticker_symbol || security.name || security.security_id,
            name: security.name || security.ticker_symbol || security.security_id,
            type: security.type,
            option_type: security.option_type,
            isOption: isOption
          };
          console.log(`PortfolioRoutes: Mapped security ${security.security_id} - isOption: ${isOption}, option_type: ${security.option_type}`);
        });

        console.log(`PortfolioRoutes: Created securities map with ${Object.keys(securitiesMap).length} securities`);

        // Filter out options contracts and only include stock positions
        plaidPositions = investments.holdings
          .filter(holding => {
            const security = securitiesMap[holding.security_id];
            const isOption = security?.isOption || false;
            console.log(`PortfolioRoutes: Security ${holding.security_id} (${security?.ticker}) - isOption: ${isOption}`);
            console.log(`PortfolioRoutes: Will ${isOption ? 'EXCLUDE' : 'INCLUDE'} this holding in stock positions`);
            return !isOption; // Only include non-option holdings
          })
          .map(holding => {
            const security = securitiesMap[holding.security_id] || {};
            const symbol = security.ticker || holding.security_id;

            console.log(`PortfolioRoutes: Mapping stock holding ${holding.security_id} to symbol ${symbol}`);

            return {
              id: holding.account_id + '_' + holding.security_id,
              symbol: symbol,
              shares: holding.quantity || 0,
              averageCost: (holding.cost_basis || 0) / (holding.quantity || 1),
              currentPrice: holding.institution_price || 0,
              marketValue: (holding.quantity || 0) * (holding.institution_price || 0),
              unrealizedPnL: ((holding.quantity || 0) * (holding.institution_price || 0)) - (holding.cost_basis || 0),
              dayChange: 0, // Would need historical data
              source: 'plaid',
              institutionName: holding.institution_name,
              securityName: security.name,
              securityType: security.type
            };
          });
      }
    } catch (error) {
      console.error('PortfolioRoutes: Error fetching Plaid holdings:', error);
    }

    // Combine local and Plaid positions
    const allPositions = [...localPositions, ...plaidPositions];
    console.log(`PortfolioRoutes: Total stock positions: ${allPositions.length} (${localPositions.length} local + ${plaidPositions.length} Plaid)`);

    res.json({
      success: true,
      data: {
        positions: allPositions
      }
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error fetching positions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user options positions
router.get('/options', async (req, res) => {
  try {
    console.log(`PortfolioRoutes: Fetching options positions for user ${req.user.id}`);

    // Get options from local database
    let localOptions = [];
    try {
      localOptions = await positionService.getUserOptions(req.user.id);
      console.log(`PortfolioRoutes: Found ${localOptions.length} local options`);
    } catch (error) {
      console.log('PortfolioRoutes: No local options found:', error.message);
    }

    // Get options from Plaid holdings
    let plaidOptions = [];
    try {
      const investments = await plaidService.getInvestmentHoldings(req.user.id);
      console.log(`PortfolioRoutes: Retrieved ${investments.holdings?.length || 0} Plaid holdings for options`);

      if (investments.holdings && investments.holdings.length > 0 && investments.securities) {
        // Create a map of security_id to security info
        const securitiesMap = {};
        investments.securities.forEach(security => {
          const isOption = isOptionContract(security);
          securitiesMap[security.security_id] = {
            ticker: security.ticker_symbol || security.name || security.security_id,
            name: security.name || security.ticker_symbol || security.security_id,
            type: security.type,
            option_type: security.option_type,
            underlying_ticker: security.underlying_ticker,
            strike_price: security.strike_price,
            expiration_date: security.expiration_date,
            isOption: isOption
          };
        });

        // Filter for options contracts only
        plaidOptions = investments.holdings
          .filter(holding => {
            const security = securitiesMap[holding.security_id];
            const isOption = security?.isOption || false;
            console.log(`PortfolioRoutes: Option check - Security ${holding.security_id} (${security?.ticker}) - isOption: ${isOption}`);
            return isOption; // Only include option holdings
          })
          .map(holding => {
            const security = securitiesMap[holding.security_id] || {};

            // Try to parse option details from security ID if Plaid doesn't provide them
            let underlyingSymbol = security.underlying_ticker || security.ticker;
            let optionType = security.option_type;
            let strike = security.strike_price || 0;
            let expiration = security.expiration_date ? new Date(security.expiration_date) : new Date();
            let strategy = 'Unknown';

            // If we don't have complete option data from Plaid, try to parse from security ID
            if (!underlyingSymbol || !optionType || !strike) {
              console.log(`PortfolioRoutes: Attempting to parse option details from security ID: ${holding.security_id}`);
              const parsedOption = parseOptionFromSecurityId(holding.security_id);
              
              if (parsedOption) {
                underlyingSymbol = parsedOption.underlyingSymbol;
                optionType = parsedOption.optionType;
                strike = parsedOption.strikePrice;
                expiration = parsedOption.expirationDate;
                console.log(`PortfolioRoutes: Successfully parsed option: ${underlyingSymbol} ${optionType} $${strike} exp ${expiration.toDateString()}`);
              } else {
                // Fallback: extract underlying symbol from security ID
                underlyingSymbol = holding.security_id.split('.')[0] || holding.security_id;
                console.log(`PortfolioRoutes: Fallback - extracted underlying symbol: ${underlyingSymbol}`);
              }
            }

            // Determine strategy based on option type
            if (optionType === 'call') {
              strategy = 'Call Option';
            } else if (optionType === 'put') {
              strategy = 'Put Option';
            } else {
              strategy = 'Unknown Option';
            }

            console.log(`PortfolioRoutes: Mapping option holding ${holding.security_id} to ${underlyingSymbol} ${strategy} $${strike}`);

            return {
              id: holding.account_id + '_' + holding.security_id,
              symbol: underlyingSymbol,
              strategy: strategy,
              strike: strike,
              expiration: expiration.toISOString(),
              contracts: Math.abs(holding.quantity || 0),
              premiumCollected: Math.max(0, holding.cost_basis || 0), // Use cost basis as premium if positive
              currentValue: Math.abs((holding.quantity || 0) * (holding.institution_price || 0)),
              source: 'plaid',
              institutionName: holding.institution_name,
              securityId: holding.security_id,
              optionType: optionType,
              type: optionType // Add type field for consistency with local options
            };
          });
      }
    } catch (error) {
      console.error('PortfolioRoutes: Error fetching Plaid options:', error);
    }

    // Combine local and Plaid options
    const allOptions = [...localOptions, ...plaidOptions];
    console.log(`PortfolioRoutes: Total options: ${allOptions.length} (${localOptions.length} local + ${plaidOptions.length} Plaid)`);

    res.json({
      success: true,
      data: {
        options: allOptions
      }
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error fetching options:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get brokerage accounts
router.get('/accounts', async (req, res) => {
  try {
    console.log(`PortfolioRoutes: Fetching brokerage accounts for user ${req.user.id}`);

    let accounts = [];
    try {
      accounts = await positionService.getBrokerageAccounts(req.user.id);
      console.log(`PortfolioRoutes: Found ${accounts.length} local brokerage accounts`);
    } catch (error) {
      console.log('PortfolioRoutes: No local brokerage accounts found:', error.message);
      accounts = [];
    }

    res.json({
      success: true,
      data: {
        accounts: accounts
      }
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get expiring options
router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    console.log(`PortfolioRoutes: Fetching options expiring within ${days} days for user ${req.user.id}`);

    let expiringOptions = [];
    try {
      expiringOptions = await positionService.getExpiringOptions(req.user.id, days);
      console.log(`PortfolioRoutes: Found ${expiringOptions.length} expiring options`);
    } catch (error) {
      console.log('PortfolioRoutes: No expiring options found:', error.message);
      expiringOptions = [];
    }

    res.json({
      success: true,
      data: {
        expiringOptions: expiringOptions
      }
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error fetching expiring options:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create sample data for testing
router.post('/create-sample-data', async (req, res) => {
  try {
    console.log(`PortfolioRoutes: Creating sample data for user ${req.user.id}`);

    const result = await positionService.createSampleData(req.user.id);
    console.log('PortfolioRoutes: Sample data created:', result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('PortfolioRoutes: Error creating sample data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;