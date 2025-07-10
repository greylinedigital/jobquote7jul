import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, context?: string): void {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    if (error?.message) {
      // Supabase errors
      if (error.message.includes('row-level security policy')) {
        userMessage = 'Authentication required. Please log in to continue.';
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('RESEND_API_KEY')) {
        userMessage = 'Email service not configured. Please contact support.';
      } else {
        userMessage = error.message;
      }
    }
    
    Alert.alert('Error', userMessage);
  }
  
  static handleAsync(error: any, context?: string): Promise<void> {
    return new Promise((resolve) => {
      this.handle(error, context);
      resolve();
    });
  }
  
  static createError(code: string, message: string, details?: any): AppError {
    return { code, message, details };
  }
}

export const handleError = ErrorHandler.handle;
export const handleAsyncError = ErrorHandler.handleAsync;
export const createError = ErrorHandler.createError;