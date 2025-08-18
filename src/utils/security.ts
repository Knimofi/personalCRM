
// Security utility functions for input validation and sanitization

export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Basic HTML entity encoding to prevent XSS
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol) && url.length <= 2048;
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation - allows international formats
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7 && phone.replace(/\D/g, '').length <= 15;
};

export const sanitizeContactName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  // Remove potential harmful characters while preserving international names
  return name
    .trim()
    .replace(/[<>\"'&]/g, '')
    .slice(0, 100);
};

export const validateDateString = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && 
         date.getFullYear() >= 1900 && 
         date.getFullYear() <= new Date().getFullYear() + 10;
};

export const rateLimitKey = (identifier: string): string => {
  // Create a consistent key for rate limiting
  return `rate_limit_${identifier}_${Math.floor(Date.now() / 60000)}`; // Per minute
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password should contain at least one special character');
  }
  
  // Check for common weak patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456/, // Sequential numbers
    /password/i, // Common word
    /qwerty/i, // Keyboard patterns
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains common weak patterns');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
