// src/utils/ethersUtils.js
import { ethers } from 'ethers';

/**
 * Formats a BigNumber value to a human-readable string
 * @param {any} value - The value to format (BigNumber, hex string, or regular value)
 * @param {number} decimals - Number of decimals to format to (default: 18 for ETH)
 * @returns {string} Formatted string value
 */
export const formatBigNumberValue = (value, decimals = 18) => {
  // If value is null, undefined, or empty string
  if (value == null || value === '') {
    return '0';
  }
  
  // Check if the value is a BigNumber
  if (value && value._isBigNumber) {
    return ethers.utils.formatUnits(value, decimals);
  }
  
  // Check if it's a string that could be a BigNumber (hex string)
  if (typeof value === 'string' && value.startsWith('0x')) {
    try {
      return ethers.utils.formatUnits(value, decimals);
    } catch (e) {
      console.warn('Invalid hex string for BigNumber:', value);
      return '0';
    }
  }
  
  // Return the value as string if it's not a BigNumber
  return String(value);
};

/**
 * Formats an amount with ETH label
 * @param {any} wei - Value in wei to format
 * @param {boolean} includeLabel - Whether to include the ETH label
 * @returns {string} Formatted ETH amount
 */
export const formatEth = (wei, includeLabel = true) => {
  if (!wei) return includeLabel ? '0 ETH' : '0';
  
  const formatted = formatBigNumberValue(wei);
  return includeLabel ? `${formatted} ETH` : formatted;
};

/**
 * Formats an amount with token label
 * @param {any} amount - Token amount to format
 * @param {string} tokenSymbol - Token symbol to display
 * @returns {string} Formatted token amount
 */
export const formatTokenAmount = (amount, tokenSymbol = 'tokens') => {
  const formatted = formatBigNumberValue(amount);
  return `${formatted} ${tokenSymbol}`;
};

/**
 * Calculates eligible amount based on profile score
 * @param {number} score - User's profile score
 * @param {any} totalAmount - Total bounty amount (can be BigNumber)
 * @returns {object} Object with amount and percentage
 */
export const calculateEligibleAmount = (score, totalAmount) => {
  if (!score) return { amount: 10, percentage: "10%" };
  
  // Format the totalAmount if needed
  const formattedAmount = formatBigNumberValue(totalAmount);
  const numericAmount = parseFloat(formattedAmount);
  
  const scoreRanges = [
    { min: 0, max: 20, amount: 10, percentage: "10%" },
    { min: 20, max: 40, amount: 20, percentage: "20%" },
    { min: 40, max: 60, amount: 40, percentage: "40%" },
    { min: 60, max: 80, amount: 60, percentage: "60%" },
    { min: 80, max: 100, amount: numericAmount, percentage: "100%" }
  ];
  
  const range = scoreRanges.find(range => score >= range.min && score <= range.max);
  return range || { amount: 10, percentage: "10%" };
};

/**
 * Parses an amount to BigNumber (opposite of formatBigNumberValue)
 * @param {string|number} amount - Amount to parse
 * @param {number} decimals - Number of decimals (default: 18 for ETH)
 * @returns {BigNumber} BigNumber instance
 */
export const parseToBigNumber = (amount, decimals = 18) => {
  try {
    return ethers.utils.parseUnits(String(amount), decimals);
  } catch (e) {
    console.error('Error parsing to BigNumber:', e);
    return ethers.constants.Zero;
  }
};