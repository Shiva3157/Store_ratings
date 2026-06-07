// Constants file - probably should be .ts but whatever
export const API_BASE_URL = 'http://localhost:3000/api';

// User roles - copied from backend
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user', 
  STORE_OWNER: 'store_owner'
};

// Validation constants
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 20,
  NAME_MAX_LENGTH: 60,
  ADDRESS_MAX_LENGTH: 400,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 16
};

// TODO: Add more constants as needed
