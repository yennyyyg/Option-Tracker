const fs = require('fs').promises;
const path = require('path');

class FileStorageUtil {
  constructor() {
    this.plaidDataDir = path.join(__dirname, '../plaiddata');
    console.log(`FileStorageUtil: Constructor - plaidDataDir set to: ${this.plaidDataDir}`);
  }

  async ensureDirectoryExists(dirPath) {
    try {
      console.log(`FileStorageUtil: Checking if directory exists: ${dirPath}`);
      await fs.access(dirPath);
      console.log(`FileStorageUtil: Directory exists: ${dirPath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`FileStorageUtil: Directory does not exist, creating: ${dirPath}`);
        try {
          await fs.mkdir(dirPath, { recursive: true });
          console.log(`FileStorageUtil: Successfully created directory: ${dirPath}`);
        } catch (mkdirError) {
          console.error(`FileStorageUtil: Failed to create directory ${dirPath}:`, mkdirError);
          throw mkdirError;
        }
      } else {
        console.error(`FileStorageUtil: Error accessing directory ${dirPath}:`, error);
        throw error;
      }
    }
  }

  async savePlaidData(userId, dataType, data) {
    try {
      console.log(`FileStorageUtil: Starting savePlaidData - userId: ${userId}, dataType: ${dataType}`);
      console.log(`FileStorageUtil: Data keys:`, data ? Object.keys(data) : 'data is null/undefined');

      console.log(`FileStorageUtil: About to ensure directory exists: ${this.plaidDataDir}`);
      await this.ensureDirectoryExists(this.plaidDataDir);
      console.log(`FileStorageUtil: Directory ensured, proceeding with file creation`);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${dataType}_${userId}_${timestamp}.json`;
      const filepath = path.join(this.plaidDataDir, filename);

      console.log(`FileStorageUtil: Generated filename: ${filename}`);
      console.log(`FileStorageUtil: Full filepath: ${filepath}`);

      const dataToSave = {
        userId: userId,
        dataType: dataType,
        timestamp: new Date().toISOString(),
        rawData: data
      };

      console.log(`FileStorageUtil: About to write file with data size:`, JSON.stringify(dataToSave).length, 'characters');
      
      try {
        await fs.writeFile(filepath, JSON.stringify(dataToSave, null, 2));
        console.log(`FileStorageUtil: Successfully wrote file: ${filename}`);
        
        // Verify file was created
        try {
          const stats = await fs.stat(filepath);
          console.log(`FileStorageUtil: File verification - size: ${stats.size} bytes, created: ${stats.birthtime}`);
        } catch (statError) {
          console.error(`FileStorageUtil: Error verifying file creation:`, statError);
        }
      } catch (writeError) {
        console.error(`FileStorageUtil: Error writing file ${filepath}:`, writeError);
        throw writeError;
      }

      return filename;
    } catch (error) {
      console.error(`FileStorageUtil: Error in savePlaidData for user ${userId}, dataType ${dataType}:`, error);
      console.error(`FileStorageUtil: Error stack:`, error.stack);
      throw error;
    }
  }

  async saveInvestmentHoldings(userId, holdingsData) {
    console.log(`FileStorageUtil: saveInvestmentHoldings called for user ${userId}`);
    return await this.savePlaidData(userId, 'investment_holdings', holdingsData);
  }

  async saveAccountsData(userId, accountsData) {
    console.log(`FileStorageUtil: saveAccountsData called for user ${userId}`);
    return await this.savePlaidData(userId, 'accounts', accountsData);
  }

  async saveItemData(userId, itemData) {
    console.log(`FileStorageUtil: saveItemData called for user ${userId}`);
    return await this.savePlaidData(userId, 'item_info', itemData);
  }

  async saveInstitutionData(userId, institutionData) {
    console.log(`FileStorageUtil: saveInstitutionData called for user ${userId}`);
    return await this.savePlaidData(userId, 'institution_info', institutionData);
  }
}

module.exports = new FileStorageUtil();