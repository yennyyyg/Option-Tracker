const math = require('mathjs');

class GreeksService {
  // Standard normal cumulative distribution function
  static normalCDF(x) {
    return 0.5 * (1 + math.erf(x / Math.sqrt(2)));
  }

  // Standard normal probability density function
  static normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  // Calculate d1 and d2 for Black-Scholes formula
  static calculateD1D2(S, K, T, r, sigma) {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return { d1, d2 };
  }

  // Calculate Delta
  static calculateDelta(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating Delta for ${optionType} option: S=${S}, K=${K}, T=${T}, r=${r}, sigma=${sigma}`);
      
      if (T <= 0) {
        throw new Error('Time to expiration must be greater than 0');
      }
      
      const { d1 } = this.calculateD1D2(S, K, T, r, sigma);
      
      let delta;
      if (optionType.toLowerCase() === 'call') {
        delta = this.normalCDF(d1);
      } else if (optionType.toLowerCase() === 'put') {
        delta = this.normalCDF(d1) - 1;
      } else {
        throw new Error('Option type must be either "call" or "put"');
      }
      
      console.log(`Delta calculated: ${delta}`);
      return delta;
    } catch (error) {
      console.error(`Error calculating Delta: ${error.message}`);
      throw error;
    }
  }

  // Calculate Gamma
  static calculateGamma(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating Gamma for ${optionType} option: S=${S}, K=${K}, T=${T}, r=${r}, sigma=${sigma}`);
      
      if (T <= 0) {
        throw new Error('Time to expiration must be greater than 0');
      }
      
      const { d1 } = this.calculateD1D2(S, K, T, r, sigma);
      const gamma = this.normalPDF(d1) / (S * sigma * Math.sqrt(T));
      
      console.log(`Gamma calculated: ${gamma}`);
      return gamma;
    } catch (error) {
      console.error(`Error calculating Gamma: ${error.message}`);
      throw error;
    }
  }

  // Calculate Theta
  static calculateTheta(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating Theta for ${optionType} option: S=${S}, K=${K}, T=${T}, r=${r}, sigma=${sigma}`);
      
      if (T <= 0) {
        throw new Error('Time to expiration must be greater than 0');
      }
      
      const { d1, d2 } = this.calculateD1D2(S, K, T, r, sigma);
      
      let theta;
      if (optionType.toLowerCase() === 'call') {
        theta = (-S * this.normalPDF(d1) * sigma / (2 * Math.sqrt(T)) 
                - r * K * Math.exp(-r * T) * this.normalCDF(d2)) / 365;
      } else if (optionType.toLowerCase() === 'put') {
        theta = (-S * this.normalPDF(d1) * sigma / (2 * Math.sqrt(T)) 
                + r * K * Math.exp(-r * T) * this.normalCDF(-d2)) / 365;
      } else {
        throw new Error('Option type must be either "call" or "put"');
      }
      
      console.log(`Theta calculated: ${theta}`);
      return theta;
    } catch (error) {
      console.error(`Error calculating Theta: ${error.message}`);
      throw error;
    }
  }

  // Calculate Vega
  static calculateVega(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating Vega for ${optionType} option: S=${S}, K=${K}, T=${T}, r=${r}, sigma=${sigma}`);
      
      if (T <= 0) {
        throw new Error('Time to expiration must be greater than 0');
      }
      
      const { d1 } = this.calculateD1D2(S, K, T, r, sigma);
      const vega = S * this.normalPDF(d1) * Math.sqrt(T) / 100;
      
      console.log(`Vega calculated: ${vega}`);
      return vega;
    } catch (error) {
      console.error(`Error calculating Vega: ${error.message}`);
      throw error;
    }
  }

  // Calculate Rho
  static calculateRho(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating Rho for ${optionType} option: S=${S}, K=${K}, T=${T}, r=${r}, sigma=${sigma}`);
      
      if (T <= 0) {
        throw new Error('Time to expiration must be greater than 0');
      }
      
      const { d2 } = this.calculateD1D2(S, K, T, r, sigma);
      
      let rho;
      if (optionType.toLowerCase() === 'call') {
        rho = K * T * Math.exp(-r * T) * this.normalCDF(d2) / 100;
      } else if (optionType.toLowerCase() === 'put') {
        rho = -K * T * Math.exp(-r * T) * this.normalCDF(-d2) / 100;
      } else {
        throw new Error('Option type must be either "call" or "put"');
      }
      
      console.log(`Rho calculated: ${rho}`);
      return rho;
    } catch (error) {
      console.error(`Error calculating Rho: ${error.message}`);
      throw error;
    }
  }

  // Calculate all Greeks at once
  static calculateAllGreeks(S, K, T, r, sigma, optionType) {
    try {
      console.log(`Calculating all Greeks for ${optionType} option`);
      
      const delta = this.calculateDelta(S, K, T, r, sigma, optionType);
      const gamma = this.calculateGamma(S, K, T, r, sigma, optionType);
      const theta = this.calculateTheta(S, K, T, r, sigma, optionType);
      const vega = this.calculateVega(S, K, T, r, sigma, optionType);
      const rho = this.calculateRho(S, K, T, r, sigma, optionType);
      
      const result = { delta, gamma, theta, vega, rho };
      console.log('All Greeks calculated successfully:', result);
      return result;
    } catch (error) {
      console.error(`Error calculating all Greeks: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GreeksService;