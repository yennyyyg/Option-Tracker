const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        name,
      });

      await user.save();
      return user;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }

  static async updateOptionsProfile(userId, profileData) {
    const { account_balance, risk_tolerance, preferred_strategies } = profileData;

    // Validation
    if (account_balance !== undefined && account_balance < 0) {
      throw new Error('Account balance cannot be negative');
    }

    if (risk_tolerance && !['conservative', 'moderate', 'aggressive'].includes(risk_tolerance)) {
      throw new Error('Invalid risk tolerance. Must be conservative, moderate, or aggressive');
    }

    const validStrategies = [
      'covered_calls', 'cash_secured_puts', 'protective_puts', 'iron_condors',
      'strangles', 'spreads', 'naked_puts', 'naked_calls'
    ];

    if (preferred_strategies && preferred_strategies.some(strategy => !validStrategies.includes(strategy))) {
      throw new Error('Invalid preferred strategy provided');
    }

    try {
      console.log(`Updating options profile for user ${userId}`);
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          ...(account_balance !== undefined && { account_balance }),
          ...(risk_tolerance && { risk_tolerance }),
          ...(preferred_strategies && { preferred_strategies }),
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      console.log(`Options profile updated successfully for user ${userId}`);
      return updatedUser;
    } catch (err) {
      console.error(`Error updating options profile for user ${userId}: ${err.message}`);
      throw new Error(`Database error while updating options profile: ${err.message}`);
    }
  }

  static async getOptionsProfile(userId) {
    try {
      console.log(`Fetching options profile for user ${userId}`);
      const user = await User.findOne({ _id: userId }).exec();
      
      if (!user) {
        throw new Error('User not found');
      }

      const optionsProfile = {
        account_balance: user.account_balance || 0,
        risk_tolerance: user.risk_tolerance || 'moderate',
        preferred_strategies: user.preferred_strategies || [],
      };

      console.log(`Options profile retrieved successfully for user ${userId}`);
      return optionsProfile;
    } catch (err) {
      console.error(`Error fetching options profile for user ${userId}: ${err.message}`);
      throw new Error(`Database error while fetching options profile: ${err.message}`);
    }
  }
}

module.exports = UserService;