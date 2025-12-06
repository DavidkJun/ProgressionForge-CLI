import {
  validateNonEmptyString,
  validatePositiveNumber,
  validatePositiveInteger,
  validateFloat,
  validateDuration,
} from './validators.js';

describe('Validators Unit Tests', () => {
  describe('validateNonEmptyString', () => {
    it('should return true for valid string', () => {
      expect(validateNonEmptyString('My Plan')).toBe(true);
    });

    it('should return error message for empty string', () => {
      expect(validateNonEmptyString('')).toBe('Name cannot be empty.');
    });

    it('should return error message for string with only spaces', () => {
      expect(validateNonEmptyString('   ')).toBe('Name cannot be empty.');
    });

    it('should return error message for undefined', () => {
      expect(validateNonEmptyString(undefined)).toBe('Name cannot be empty.');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should return true for positive number', () => {
      expect(validatePositiveNumber(10)).toBe(true);
      expect(validatePositiveNumber(0.5)).toBe(true);
    });

    it('should return error for zero or negative', () => {
      expect(validatePositiveNumber(0)).toBe('Must be a positive number.');
      expect(validatePositiveNumber(-5)).toBe('Must be a positive number.');
    });

    it('should return error for undefined', () => {
      expect(validatePositiveNumber(undefined)).toBe(
        'Must be a positive number.'
      );
    });
  });

  describe('validatePositiveInteger', () => {
    it('should return true for positive integer', () => {
      expect(validatePositiveInteger(5)).toBe(true);
    });

    it('should return error for float', () => {
      expect(validatePositiveInteger(5.5)).toBe('Must be an integer > 0.');
    });

    it('should return error for negative', () => {
      expect(validatePositiveInteger(-1)).toBe('Must be an integer > 0.');
    });
  });

  describe('validateFloat', () => {
    it('should return true for valid float string', () => {
      expect(validateFloat('10.5')).toBe(true);
      expect(validateFloat('100')).toBe(true);
    });

    it('should return error for non-numeric string', () => {
      expect(validateFloat('abc')).toBe('Must be a positive number.');
    });

    it('should return error for negative number string', () => {
      expect(validateFloat('-10')).toBe('Must be a positive number.');
    });
  });

  describe('validateDuration', () => {
    it('should return true for 1 or more', () => {
      expect(validateDuration(1)).toBe(true);
      expect(validateDuration(5)).toBe(true);
    });

    it('should return error for less than 1', () => {
      expect(validateDuration(0)).toBe('Duration must be at least 1 week.');
    });
  });
});
