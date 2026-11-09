/**
 * Validation Utilities
 * Centralized validation functions for consistent data validation
 */

const mongoose = require('mongoose');

/**
 * Validate required fields
 * @param {Array} fields - Field names to validate
 * @param {Object} body - Request body
 * @returns {Object} - Validation result {isValid, message}
 */
const validateRequired = (fields, body) => {
  const missing = fields.filter(
    field => !body[field] || body[field].toString().trim() === ''
  );

  if (missing.length > 0) {
    return {
      isValid: false,
      message: `Missing required fields: ${missing.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result {isValid, message}
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }

  // Optional: Add more strength requirements
  // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
  //   return { isValid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
  // }

  return { isValid: true };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result {isValid, message}
 */
const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, message: 'Username is required' };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters' };
  }

  if (trimmedUsername.length > 30) {
    return { isValid: false, message: 'Username cannot exceed 30 characters' };
  }

  return { isValid: true };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Is valid ObjectId
 */
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate enum value
 * @param {string} value - Value to validate
 * @param {Array} enumValues - Valid enum values
 * @returns {Object} - Validation result {isValid, message}
 */
const validateEnum = (value, enumValues) => {
  if (!value) {
    return { isValid: false, message: 'Value is required' };
  }

  if (!enumValues.includes(value.trim())) {
    return {
      isValid: false,
      message: `Invalid value. Must be one of: ${enumValues.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * Validate string length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - Validation result {isValid, message}
 */
const validateLength = (value, minLength, maxLength, fieldName = 'Value') => {
  if (!value) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const trimmedValue = value.toString().trim();

  if (trimmedValue.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters`
    };
  }

  if (trimmedValue.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed ${maxLength} characters`
    };
  }

  return { isValid: true };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - Validation result {isValid, message}
 */
const validateNumberRange = (value, min, max, fieldName = 'Value') => {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      message: `${fieldName} must be between ${min} and ${max}`
    };
  }

  return { isValid: true };
};

/**
 * Validate date
 * @param {string} dateString - Date string to validate
 * @returns {Object} - Validation result {isValid, message, date}
 */
const validateDate = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }

  return { isValid: true, date };
};

/**
 * Validate date range
 * @param {string} startDateString - Start date
 * @param {string} endDateString - End date
 * @returns {Object} - Validation result {isValid, message, startDate, endDate}
 */
const validateDateRange = (startDateString, endDateString) => {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }

  if (startDate >= endDate) {
    return {
      isValid: false,
      message: 'Start date must be before end date'
    };
  }

  return { isValid: true, startDate, endDate };
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateUsername,
  validateObjectId,
  validateEnum,
  validateLength,
  validateNumberRange,
  validateDate,
  validateDateRange
};
