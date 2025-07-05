import api from './api';

export interface Position {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  dayChange: number;
  source?: string;
  institutionName?: string;
}

export interface Option {
  id: string;
  symbol: string;
  strategy: string;
  strike: number;
  expiration: string;
  contracts: number;
  premiumCollected: number;
  currentValue: number;
  delta?: number;
  theta?: number;
  gamma?: number;
  vega?: number;
  rho?: number;
}

export interface BrokerageAccount {
  id: string;
  accountName: string;
  brokerageName: string;
  accountType: string;
  totalValue: number;
  availableCash: number;
  buyingPower: number;
}

export interface ExpiringOption {
  id: string;
  symbol: string;
  strategy: string;
  strike: number;
  expiration: string;
  contracts: number;
  premiumCollected: number;
  assignmentProbability: number;
  daysToExpiration: number;
}

// Cache management with localStorage persistence
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userId: string;
}

class PositionsCache {
  private readonly CACHE_KEY_PREFIX = 'optiontrack_positions_cache_';

  private getCacheKey(endpoint: string, userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${endpoint}_${userId}`;
  }

  private getCurrentUserId(): string {
    const token = localStorage.getItem('accessToken');
    if (!token) return 'anonymous';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  get<T>(endpoint: string): T | null {
    const userId = this.getCurrentUserId();
    const key = this.getCacheKey(endpoint, userId);
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) {
        console.log(`PositionsCache: No cache entry found for ${endpoint}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      
      // Check if it's for the correct user
      if (entry.userId !== userId) {
        console.log(`PositionsCache: Cache entry is for different user, clearing for ${endpoint}`);
        localStorage.removeItem(key);
        return null;
      }

      console.log(`PositionsCache: Returning cached data for ${endpoint} (cached at ${new Date(entry.timestamp).toLocaleString()})`);
      return entry.data;
    } catch (error) {
      console.error(`PositionsCache: Error reading cache for ${endpoint}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  }

  set<T>(endpoint: string, data: T): void {
    const userId = this.getCurrentUserId();
    const key = this.getCacheKey(endpoint, userId);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      userId
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
      console.log(`PositionsCache: Cached data for ${endpoint} in localStorage`);
    } catch (error) {
      console.error(`PositionsCache: Error caching data for ${endpoint}:`, error);
    }
  }

  clear(): void {
    console.log('PositionsCache: Clearing all cache from localStorage');
    
    // Get all keys that start with our cache prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all cache keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`PositionsCache: Removed cache key: ${key}`);
    });
    
    console.log(`PositionsCache: Cleared ${keysToRemove.length} cache entries`);
  }

  clearForUser(userId?: string): void {
    const targetUserId = userId || this.getCurrentUserId();
    console.log(`PositionsCache: Clearing cache for user ${targetUserId}`);
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            if (entry.userId === targetUserId) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // If we can't parse it, remove it anyway
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`PositionsCache: Removed user cache key: ${key}`);
    });
    
    console.log(`PositionsCache: Cleared ${keysToRemove.length} cache entries for user ${targetUserId}`);
  }

  // Method to check what's currently cached
  getCacheInfo(): { endpoint: string; timestamp: Date; userId: string }[] {
    const cacheInfo: { endpoint: string; timestamp: Date; userId: string }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            const endpoint = key.replace(this.CACHE_KEY_PREFIX, '').split('_')[0];
            cacheInfo.push({
              endpoint,
              timestamp: new Date(entry.timestamp),
              userId: entry.userId
            });
          }
        } catch (error) {
          console.error(`Error reading cache info for ${key}:`, error);
        }
      }
    }
    
    return cacheInfo;
  }
}

const positionsCache = new PositionsCache();

// Export cache for use in settings
export { positionsCache };

// Description: Get user stock positions
// Endpoint: GET /api/portfolio/positions
// Request: {}
// Response: { success: boolean, data: { positions: Array<Position> } }
export const getPositions = async (forceRefresh: boolean = false) => {
  const cacheKey = '/api/portfolio/positions';
  
  if (!forceRefresh) {
    const cachedData = positionsCache.get<{ positions: Position[] }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    console.log('PositionsAPI: Fetching positions from server (cache miss or force refresh)');
    const response = await api.get('/api/portfolio/positions');
    const data = response.data.data;
    
    positionsCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user options positions
// Endpoint: GET /api/portfolio/options
// Request: {}
// Response: { success: boolean, data: { options: Array<Option> } }
export const getOptions = async (forceRefresh: boolean = false) => {
  const cacheKey = '/api/portfolio/options';
  
  if (!forceRefresh) {
    const cachedData = positionsCache.get<{ options: Option[] }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    console.log('PositionsAPI: Fetching options from server (cache miss or force refresh)');
    const response = await api.get('/api/portfolio/options');
    const data = response.data.data;
    
    positionsCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user brokerage accounts
// Endpoint: GET /api/portfolio/accounts
// Request: {}
// Response: { success: boolean, data: { accounts: Array<BrokerageAccount> } }
export const getBrokerageAccounts = async (forceRefresh: boolean = false) => {
  const cacheKey = '/api/portfolio/accounts';
  
  if (!forceRefresh) {
    const cachedData = positionsCache.get<{ accounts: BrokerageAccount[] }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    console.log('PositionsAPI: Fetching accounts from server (cache miss or force refresh)');
    const response = await api.get('/api/portfolio/accounts');
    const data = response.data.data;
    
    positionsCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get expiring options within specified days
// Endpoint: GET /api/portfolio/expiring
// Request: { days: number }
// Response: { success: boolean, data: { expiringOptions: Array<ExpiringOption> } }
export const getExpiringOptions = async (days: number = 7, forceRefresh: boolean = false) => {
  const cacheKey = `/api/portfolio/expiring?days=${days}`;
  
  if (!forceRefresh) {
    const cachedData = positionsCache.get<{ expiringOptions: ExpiringOption[] }>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  try {
    console.log(`PositionsAPI: Fetching expiring options from server (cache miss or force refresh) for ${days} days`);
    const response = await api.get(`/api/portfolio/expiring?days=${days}`);
    const data = response.data.data;
    
    positionsCache.set(cacheKey, data);
    return data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};