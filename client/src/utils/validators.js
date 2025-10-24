const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,}$/;

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return '';
};

export const validateItemForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  if (!formData.type) {
    errors.type = 'Type is required';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  if (!formData.location?.trim()) {
    errors.location = 'Location is required';
  }

  if (!formData.date) {
    errors.date = 'Date is required';
  }

  return errors;
};

export const validateClaimForm = (formData) => {
  const errors = {};

  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  } else if (formData.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return errors;
};

export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

export const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};