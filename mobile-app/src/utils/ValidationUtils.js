// Validation utilities for the Township POS app

export class ValidationError extends Error {
  constructor(message, field = null, code = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export class ValidationUtils {
  // Inventory validation
  static validateInventoryItem(item) {
    const errors = [];

    // Name validation
    if (!item.name || typeof item.name !== 'string') {
      errors.push(new ValidationError('Item name is required', 'name', 'REQUIRED'));
    } else if (item.name.trim().length === 0) {
      errors.push(new ValidationError('Item name cannot be empty', 'name', 'EMPTY'));
    } else if (item.name.length > 100) {
      errors.push(new ValidationError('Item name is too long (max 100 characters)', 'name', 'TOO_LONG'));
    }

    // Price validation
    if (item.price === undefined || item.price === null) {
      errors.push(new ValidationError('Price is required', 'price', 'REQUIRED'));
    } else if (typeof item.price !== 'number' || isNaN(item.price)) {
      errors.push(new ValidationError('Price must be a valid number', 'price', 'INVALID_TYPE'));
    } else if (item.price < 0) {
      errors.push(new ValidationError('Price cannot be negative', 'price', 'NEGATIVE'));
    } else if (item.price > 999999.99) {
      errors.push(new ValidationError('Price is too high (max R999,999.99)', 'price', 'TOO_HIGH'));
    }

    // Quantity validation
    if (item.quantity === undefined || item.quantity === null) {
      errors.push(new ValidationError('Quantity is required', 'quantity', 'REQUIRED'));
    } else if (!Number.isInteger(item.quantity)) {
      errors.push(new ValidationError('Quantity must be a whole number', 'quantity', 'NOT_INTEGER'));
    } else if (item.quantity < 0) {
      errors.push(new ValidationError('Quantity cannot be negative', 'quantity', 'NEGATIVE'));
    } else if (item.quantity > 999999) {
      errors.push(new ValidationError('Quantity is too high (max 999,999)', 'quantity', 'TOO_HIGH'));
    }

    // Category validation
    const validCategories = ['Food & Drinks', 'Airtime & Data', 'Cigarettes', 'Household', 'Other'];
    if (item.category && !validCategories.includes(item.category)) {
      errors.push(new ValidationError('Invalid category', 'category', 'INVALID_CATEGORY'));
    }

    // Barcode validation (optional)
    if (item.barcode && typeof item.barcode === 'string') {
      if (item.barcode.length > 50) {
        errors.push(new ValidationError('Barcode is too long (max 50 characters)', 'barcode', 'TOO_LONG'));
      }
      // Basic barcode format validation (numbers only for simplicity)
      if (!/^\d*$/.test(item.barcode)) {
        errors.push(new ValidationError('Barcode must contain only numbers', 'barcode', 'INVALID_FORMAT'));
      }
    }

    return errors;
  }

  // Sale validation
  static validateSale(saleData, inventoryItem) {
    const errors = [];

    // Item validation
    if (!saleData.item_name || typeof saleData.item_name !== 'string') {
      errors.push(new ValidationError('Item name is required', 'item_name', 'REQUIRED'));
    }

    if (!saleData.item_id || !Number.isInteger(saleData.item_id)) {
      errors.push(new ValidationError('Valid item ID is required', 'item_id', 'REQUIRED'));
    }

    // Quantity validation
    if (!saleData.quantity || !Number.isInteger(saleData.quantity)) {
      errors.push(new ValidationError('Valid quantity is required', 'quantity', 'REQUIRED'));
    } else if (saleData.quantity <= 0) {
      errors.push(new ValidationError('Quantity must be greater than 0', 'quantity', 'INVALID_VALUE'));
    } else if (inventoryItem && saleData.quantity > inventoryItem.quantity) {
      errors.push(new ValidationError(
        `Insufficient stock. Available: ${inventoryItem.quantity}`,
        'quantity',
        'INSUFFICIENT_STOCK'
      ));
    }

    // Payment method validation
    const validPaymentMethods = ['cash', 'mobile_money', 'qr_code', 'card'];
    if (!saleData.payment_method || !validPaymentMethods.includes(saleData.payment_method)) {
      errors.push(new ValidationError('Valid payment method is required', 'payment_method', 'INVALID_PAYMENT_METHOD'));
    }

    // Cash payment validation
    if (saleData.payment_method === 'cash') {
      if (saleData.amount_received === undefined || saleData.amount_received === null) {
        errors.push(new ValidationError('Amount received is required for cash payments', 'amount_received', 'REQUIRED'));
      } else if (typeof saleData.amount_received !== 'number' || isNaN(saleData.amount_received)) {
        errors.push(new ValidationError('Amount received must be a valid number', 'amount_received', 'INVALID_TYPE'));
      } else if (saleData.amount_received < 0) {
        errors.push(new ValidationError('Amount received cannot be negative', 'amount_received', 'NEGATIVE'));
      }

      // Calculate expected total and validate sufficient payment
      if (inventoryItem && saleData.quantity && saleData.amount_received !== undefined) {
        const expectedTotal = inventoryItem.price * saleData.quantity;
        if (saleData.amount_received < expectedTotal) {
          errors.push(new ValidationError(
            `Insufficient payment. Required: R${expectedTotal.toFixed(2)}, Received: R${saleData.amount_received.toFixed(2)}`,
            'amount_received',
            'INSUFFICIENT_PAYMENT'
          ));
        }
      }
    }

    return errors;
  }

  // Credit score validation
  static validateCreditScore(creditScore) {
    const errors = [];

    if (creditScore.score !== undefined) {
      if (typeof creditScore.score !== 'number' || isNaN(creditScore.score)) {
        errors.push(new ValidationError('Credit score must be a number', 'score', 'INVALID_TYPE'));
      } else if (creditScore.score < 0 || creditScore.score > 100) {
        errors.push(new ValidationError('Credit score must be between 0 and 100', 'score', 'OUT_OF_RANGE'));
      }
    }

    if (creditScore.total_sales !== undefined) {
      if (typeof creditScore.total_sales !== 'number' || isNaN(creditScore.total_sales)) {
        errors.push(new ValidationError('Total sales must be a number', 'total_sales', 'INVALID_TYPE'));
      } else if (creditScore.total_sales < 0) {
        errors.push(new ValidationError('Total sales cannot be negative', 'total_sales', 'NEGATIVE'));
      }
    }

    if (creditScore.transaction_count !== undefined) {
      if (!Number.isInteger(creditScore.transaction_count)) {
        errors.push(new ValidationError('Transaction count must be an integer', 'transaction_count', 'NOT_INTEGER'));
      } else if (creditScore.transaction_count < 0) {
        errors.push(new ValidationError('Transaction count cannot be negative', 'transaction_count', 'NEGATIVE'));
      }
    }

    return errors;
  }

  // Generic data validation
  static validateRequired(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED');
    }
  }

  static validateString(value, fieldName, minLength = 0, maxLength = Infinity) {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName, 'INVALID_TYPE');
    }
    if (value.length < minLength) {
      throw new ValidationError(`${fieldName} is too short (min ${minLength} characters)`, fieldName, 'TOO_SHORT');
    }
    if (value.length > maxLength) {
      throw new ValidationError(`${fieldName} is too long (max ${maxLength} characters)`, fieldName, 'TOO_LONG');
    }
  }

  static validateNumber(value, fieldName, min = -Infinity, max = Infinity) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName, 'INVALID_TYPE');
    }
    if (value < min) {
      throw new ValidationError(`${fieldName} is too low (min ${min})`, fieldName, 'TOO_LOW');
    }
    if (value > max) {
      throw new ValidationError(`${fieldName} is too high (max ${max})`, fieldName, 'TOO_HIGH');
    }
  }

  static validateInteger(value, fieldName, min = -Infinity, max = Infinity) {
    if (!Number.isInteger(value)) {
      throw new ValidationError(`${fieldName} must be an integer`, fieldName, 'NOT_INTEGER');
    }
    this.validateNumber(value, fieldName, min, max);
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email', 'INVALID_FORMAT');
    }
  }

  static validatePhone(phone) {
    // South African phone number validation
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new ValidationError('Invalid phone number format', 'phone', 'INVALID_FORMAT');
    }
  }

  // Sanitization utilities
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' '); // Remove extra whitespace
  }

  static sanitizeNumber(num) {
    if (typeof num === 'string') {
      const parsed = parseFloat(num);
      return isNaN(parsed) ? null : parsed;
    }
    return typeof num === 'number' && !isNaN(num) ? num : null;
  }

  static sanitizeInteger(num) {
    if (typeof num === 'string') {
      const parsed = parseInt(num, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return Number.isInteger(num) ? num : null;
  }

  // Batch validation
  static validateBatch(items, validator) {
    const results = [];
    
    items.forEach((item, index) => {
      try {
        const errors = validator(item);
        results.push({
          index,
          item,
          valid: errors.length === 0,
          errors
        });
      } catch (error) {
        results.push({
          index,
          item,
          valid: false,
          errors: [error]
        });
      }
    });

    return results;
  }

  // Format validation errors for user display
  static formatErrorsForUser(errors) {
    if (!Array.isArray(errors) || errors.length === 0) {
      return 'Unknown validation error';
    }

    if (errors.length === 1) {
      return errors[0].message;
    }

    return errors.map((error, index) => `${index + 1}. ${error.message}`).join('\n');
  }

  // Check if errors contain specific error codes
  static hasErrorCode(errors, code) {
    return errors.some(error => error.code === code);
  }

  static getErrorsByField(errors, field) {
    return errors.filter(error => error.field === field);
  }
}

export default ValidationUtils;
