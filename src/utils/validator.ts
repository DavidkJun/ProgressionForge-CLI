export const validateNonEmptyString = (
  input: string | undefined
): boolean | string => {
  if (input && input.trim().length > 0) {
    return true;
  }
  return 'Name cannot be empty.';
};

export const validatePositiveNumber = (
  input: number | undefined
): boolean | string => {
  if (input !== undefined && input > 0) {
    return true;
  }
  return 'Must be a positive number.';
};

export const validatePositiveInteger = (
  input: number | undefined
): boolean | string => {
  if (input !== undefined && Number.isInteger(input) && input > 0) {
    return true;
  }
  return 'Must be an integer > 0.';
};

export const validateFloat = (input: string): boolean | string => {
  const num = parseFloat(input);
  if (!isNaN(num) && num > 0) {
    return true;
  }
  return 'Must be a positive number.';
};

export const validateDuration = (
  input: number | undefined
): boolean | string => {
  if (input !== undefined && input >= 1) {
    return true;
  }
  return 'Duration must be at least 1 week.';
};
