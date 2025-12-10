export const validateNonEmptyString = (input) => {
    if (input && input.trim().length > 0) {
        return true;
    }
    return 'Name cannot be empty.';
};
export const validatePositiveNumber = (input) => {
    if (input !== undefined && input > 0) {
        return true;
    }
    return 'Must be a positive number.';
};
export const validatePositiveInteger = (input) => {
    if (input !== undefined && Number.isInteger(input) && input > 0) {
        return true;
    }
    return 'Must be an integer > 0.';
};
export const validateFloat = (input) => {
    const num = parseFloat(input);
    if (!isNaN(num) && num > 0) {
        return true;
    }
    return 'Must be a positive number.';
};
export const validateDuration = (input) => {
    if (input !== undefined && input >= 1) {
        return true;
    }
    return 'Duration must be at least 1 week.';
};
//# sourceMappingURL=validators.js.map