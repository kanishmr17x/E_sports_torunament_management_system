/**
 * Application Constants
 * Centralized configuration and constants used throughout the application
 */

// User Roles
const USER_ROLES = {
  PLAYER: 'player',
  ORGANIZER: 'organizer',
  ADMIN: 'admin'
};

// Tournament Types
const TOURNAMENT_TYPES = {
  SOLO: 'solo',
  DUO: 'duo',
  TEAM: 'team'
};

// Tournament Status
const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  COMPLETED: 'completed'
};

// Team Status
const TEAM_STATUS = {
  CURRENT: 'current',
  PAST: 'past',
  UPCOMING: 'upcoming'
};

// Games
const GAMES = [
  'PUBG',
  'BGMI',
  'Free Fire',
  'COD',
  'Valorant',
  'Other'
];

// Player Roles
const PLAYER_ROLES = [
  'IGL',
  'Assaulter',
  'Support',
  'Sniper',
  'Entry Fragger',
  'Other'
];

// API Response Messages
const MESSAGES = {
  // Success Messages
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'Login successful',
  PROFILE_FETCHED: 'Profile fetched successfully',
  
  // Tournament Messages
  TOURNAMENT_CREATED: 'Tournament created successfully',
  TOURNAMENT_UPDATED: 'Tournament updated successfully',
  TOURNAMENT_DELETED: 'Tournament deleted successfully',
  TOURNAMENT_FOUND: 'Tournament found',
  TOURNAMENTS_FOUND: 'Tournaments found',
  
  // Team Messages
  TEAM_CREATED: 'Team created successfully',
  TEAM_UPDATED: 'Team updated successfully',
  TEAM_DELETED: 'Team deleted successfully',
  TEAM_FOUND: 'Team found',
  TEAMS_FOUND: 'Teams found',
  
  // Player Messages
  PLAYER_CREATED: 'Player created successfully',
  PLAYER_UPDATED: 'Player updated successfully',
  PLAYER_DELETED: 'Player deleted successfully',
  PLAYER_FOUND: 'Player found',
  PLAYERS_FOUND: 'Players found',
  
  // Error Messages
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Your token has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid token. Please log in again.',
  NOT_AUTHORIZED: 'Not authorized, no token provided',
  ADMIN_REQUIRED: 'Admin access required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already registered',
  USERNAME_EXISTS: 'Username already taken',
  TOURNAMENT_FULL: 'Tournament is full. Maximum teams reached.',
  NOT_FOUND: 'Resource not found',
  INVALID_OBJECT_ID: 'Invalid ID format',
  DB_CONNECTION_ERROR: 'Database connection error. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  
  // Validation Messages
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_EMAIL: 'Please provide a valid email',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  TEAM_NAME_TOO_SHORT: 'Team name must be at least 3 characters'
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Pagination
const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

module.exports = {
  USER_ROLES,
  TOURNAMENT_TYPES,
  TOURNAMENT_STATUS,
  TEAM_STATUS,
  GAMES,
  PLAYER_ROLES,
  MESSAGES,
  ERROR_CODES,
  PAGINATION
};
