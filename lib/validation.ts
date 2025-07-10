export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Please enter a valid email address');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || password.length === 0) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateQuote(quote: {
    job_title?: string;
    description?: string;
    client_id?: string;
    items?: any[];
  }): ValidationResult {
    const errors: string[] = [];
    
    if (!quote.job_title || quote.job_title.trim().length === 0) {
      errors.push('Job title is required');
    }
    
    if (!quote.description || quote.description.trim().length === 0) {
      errors.push('Job description is required');
    }
    
    if (!quote.client_id) {
      errors.push('Please select a client');
    }
    
    if (!quote.items || quote.items.length === 0) {
      errors.push('At least one quote item is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateClient(client: {
    name?: string;
    email?: string;
    phone?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    if (!client.name || client.name.trim().length === 0) {
      errors.push('Client name is required');
    }
    
    if (!client.email || client.email.trim().length === 0) {
      errors.push('Client email is required');
    } else {
      const emailValidation = this.validateEmail(client.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }
    
    // Phone is optional, but if provided, should be valid
    if (client.phone && client.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(client.phone.trim())) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateQuoteItem(item: {
    name?: string;
    quantity?: number;
    unit_price?: number;
    type?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    if (!item.name || item.name.trim().length === 0) {
      errors.push('Item name is required');
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
    
    if (!item.unit_price || item.unit_price < 0) {
      errors.push('Unit price must be 0 or greater');
    }
    
    if (!item.type || item.type.trim().length === 0) {
      errors.push('Item type is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  static validateBusinessProfile(profile: {
    business_name?: string;
    email?: string;
    hourly_rate?: number;
  }): ValidationResult {
    const errors: string[] = [];
    
    if (profile.email && profile.email.trim().length > 0) {
      const emailValidation = this.validateEmail(profile.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }
    
    if (profile.hourly_rate !== undefined && profile.hourly_rate !== null) {
      if (profile.hourly_rate < 30 || profile.hourly_rate > 300) {
        errors.push('Hourly rate must be between $30 and $300');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const validateEmail = Validator.validateEmail;
export const validatePassword = Validator.validatePassword;
export const validateQuote = Validator.validateQuote;
export const validateClient = Validator.validateClient;
export const validateQuoteItem = Validator.validateQuoteItem;
export const validateBusinessProfile = Validator.validateBusinessProfile;