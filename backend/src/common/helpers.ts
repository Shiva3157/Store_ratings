// Helper functions - might be useful later

// Hash password function - not used yet but keeping it
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 10);
};

// Validate email format - basic check
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random string - for testing purposes
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// TODO: Add more helper functions as needed
