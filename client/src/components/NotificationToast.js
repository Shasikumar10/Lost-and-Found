import React from 'react';
import toast from 'react-hot-toast';

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    style: {
      background: '#10b981',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: '#fff',
    },
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    duration: 3000,
    icon: 'ℹ️',
    style: {
      background: '#3b82f6',
      color: '#fff',
    },
  });
};

export const showLoadingToast = (message) => {
  return toast.loading(message);
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};