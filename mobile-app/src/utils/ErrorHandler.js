import { Alert } from 'react-native';
import { ValidationError } from './ValidationUtils';

export class AppError extends Error {
  constructor(message, code = null, type = 'GENERAL', recoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.type = type;
    this.recoverable = recoverable;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends AppError {
  constructor(message, code = null) {
    super(message, code, 'NETWORK', true);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends AppError {
  constructor(message, code = null) {
    super(message, code, 'DATABASE', true);
    this.name = 'DatabaseError';
  }
}

export class SyncError extends AppError {
  constructor(message, code = null, operation = null) {
    super(message, code, 'SYNC', true);
    this.name = 'SyncError';
    this.operation = operation;
  }
}

export class ErrorHandler {
  static errorLog = [];
  static maxLogSize = 100;

  // Main error handling method
  static handle(error, context = null, showAlert = true) {
    // Log the error
    this.logError(error, context);

    // Determine error type and handle accordingly
    if (error instanceof ValidationError) {
      return this.handleValidationError(error, showAlert);
    } else if (error instanceof NetworkError) {
      return this.handleNetworkError(error, showAlert);
    } else if (error instanceof DatabaseError) {
      return this.handleDatabaseError(error, showAlert);
    } else if (error instanceof SyncError) {
      return this.handleSyncError(error, showAlert);
    } else {
      return this.handleGenericError(error, showAlert);
    }
  }

  // Specific error handlers
  static handleValidationError(error, showAlert = true) {
    const userMessage = this.getUserFriendlyMessage(error);
    
    if (showAlert) {
      Alert.alert('Validation Error', userMessage, [{ text: 'OK' }]);
    }

    return {
      type: 'validation',
      message: userMessage,
      field: error.field,
      code: error.code,
      recoverable: true
    };
  }

  static handleNetworkError(error, showAlert = true) {
    const userMessage = this.getNetworkErrorMessage(error);
    
    if (showAlert) {
      Alert.alert(
        'Connection Problem',
        userMessage,
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => this.retryLastOperation() }
        ]
      );
    }

    return {
      type: 'network',
      message: userMessage,
      code: error.code,
      recoverable: true
    };
  }

  static handleDatabaseError(error, showAlert = true) {
    const userMessage = 'There was a problem saving your data. Please try again.';
    
    if (showAlert) {
      Alert.alert('Data Error', userMessage, [{ text: 'OK' }]);
    }

    return {
      type: 'database',
      message: userMessage,
      code: error.code,
      recoverable: true
    };
  }

  static handleSyncError(error, showAlert = true) {
    const userMessage = this.getSyncErrorMessage(error);
    
    if (showAlert) {
      Alert.alert(
        'Sync Problem',
        userMessage,
        [
          { text: 'OK' },
          { text: 'Try Sync Again', onPress: () => this.retrySyncOperation(error.operation) }
        ]
      );
    }

    return {
      type: 'sync',
      message: userMessage,
      operation: error.operation,
      code: error.code,
      recoverable: true
    };
  }

  static handleGenericError(error, showAlert = true) {
    const userMessage = 'Something went wrong. Please try again.';
    
    if (showAlert) {
      Alert.alert('Error', userMessage, [{ text: 'OK' }]);
    }

    return {
      type: 'generic',
      message: userMessage,
      originalError: error.message,
      recoverable: true
    };
  }

  // User-friendly message generators
  static getUserFriendlyMessage(error) {
    const fieldNames = {
      name: 'Item name',
      price: 'Price',
      quantity: 'Quantity',
      category: 'Category',
      payment_method: 'Payment method',
      amount_received: 'Amount received'
    };

    const fieldName = fieldNames[error.field] || error.field || 'Field';
    
    switch (error.code) {
      case 'REQUIRED':
        return `${fieldName} is required.`;
      case 'EMPTY':
        return `${fieldName} cannot be empty.`;
      case 'TOO_LONG':
        return `${fieldName} is too long.`;
      case 'TOO_SHORT':
        return `${fieldName} is too short.`;
      case 'INVALID_TYPE':
        return `${fieldName} has an invalid format.`;
      case 'NEGATIVE':
        return `${fieldName} cannot be negative.`;
      case 'TOO_HIGH':
        return `${fieldName} is too high.`;
      case 'TOO_LOW':
        return `${fieldName} is too low.`;
      case 'INSUFFICIENT_STOCK':
        return 'Not enough items in stock for this sale.';
      case 'INSUFFICIENT_PAYMENT':
        return 'The amount received is less than the total cost.';
      case 'INVALID_PAYMENT_METHOD':
        return 'Please select a valid payment method.';
      default:
        return error.message || 'Please check your input and try again.';
    }
  }

  static getNetworkErrorMessage(error) {
    if (error.message.includes('timeout')) {
      return 'The connection timed out. Please check your internet connection and try again.';
    } else if (error.message.includes('404')) {
      return 'The server could not be reached. Please try again later.';
    } else if (error.message.includes('500')) {
      return 'There is a problem with the server. Please try again later.';
    } else if (error.message.includes('offline')) {
      return 'You are currently offline. Your changes will be saved and synced when you reconnect.';
    } else {
      return 'There is a connection problem. Please check your internet and try again.';
    }
  }

  static getSyncErrorMessage(error) {
    if (error.message.includes('conflict')) {
      return 'There was a conflict syncing your data. Your local changes have been preserved.';
    } else if (error.message.includes('unauthorized')) {
      return 'You are not authorized to sync data. Please check your account.';
    } else if (error.message.includes('quota')) {
      return 'You have reached your data limit. Please contact support.';
    } else {
      return 'There was a problem syncing your data. It will be retried automatically.';
    }
  }

  // Error logging
  static logError(error, context = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type
      },
      context,
      userAgent: 'Township POS Mobile'
    };

    // Add to in-memory log
    this.errorLog.unshift(logEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (__DEV__) {
      console.error('Error logged:', logEntry);
    }

    // TODO: Send to crash reporting service in production
    // this.sendToCrashReporting(logEntry);
  }

  // Error recovery methods
  static retryLastOperation() {
    // This would need to be implemented based on your app's architecture
    console.log('Retrying last operation...');
  }

  static retrySyncOperation(operation) {
    // This would trigger a specific sync operation retry
    console.log('Retrying sync operation:', operation);
  }

  // Error reporting
  static getErrorLog() {
    return [...this.errorLog];
  }

  static clearErrorLog() {
    this.errorLog = [];
  }

  static getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byCode: {},
      recent: this.errorLog.slice(0, 10)
    };

    this.errorLog.forEach(entry => {
      const type = entry.error.type || 'unknown';
      const code = entry.error.code || 'unknown';
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byCode[code] = (stats.byCode[code] || 0) + 1;
    });

    return stats;
  }

  // Utility methods
  static isRecoverableError(error) {
    if (error instanceof AppError) {
      return error.recoverable;
    }
    
    // Network errors are usually recoverable
    if (error.message && error.message.includes('network')) {
      return true;
    }
    
    // Validation errors are recoverable
    if (error instanceof ValidationError) {
      return true;
    }
    
    // Default to recoverable
    return true;
  }

  static shouldRetryError(error) {
    // Don't retry validation errors
    if (error instanceof ValidationError) {
      return false;
    }
    
    // Retry network errors
    if (error instanceof NetworkError) {
      return true;
    }
    
    // Retry sync errors
    if (error instanceof SyncError) {
      return true;
    }
    
    // Don't retry by default
    return false;
  }

  // Error boundary helper
  static createErrorBoundary(fallbackComponent) {
    return class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        ErrorHandler.logError(error, { errorInfo, component: 'ErrorBoundary' });
      }

      render() {
        if (this.state.hasError) {
          return fallbackComponent || <Text>Something went wrong.</Text>;
        }

        return this.props.children;
      }
    };
  }
}

export default ErrorHandler;
