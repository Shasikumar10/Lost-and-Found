export const validateEmail = (email) => {
  const regex = /^[\w-\.]+@klh\.edu\.in$/;
  return regex.test(email);
};

export const validateItemForm = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.location = 'Location is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  if (!data.type) {
    errors.type = 'Type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateClaimForm = (data) => {
  const errors = {};

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

export const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};