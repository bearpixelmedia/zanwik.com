import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Enhanced utility functions
export const utils = {
  // Formatting utilities
  formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },

  formatNumber: (number, locale = 'en-US', options = {}) => {
    return new Intl.NumberFormat(locale, options).format(number);
  },

  formatPercentage: (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  formatFileSize: bytes => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  },

  // Date utilities
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(
      new Date(date)
    );
  },

  formatRelativeTime: date => {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now - target) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  },

  getDaysBetween: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  },

  // Validation utilities
  isValidEmail: email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: password => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  },

  isValidUrl: url => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // String utilities
  capitalize: str => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str, length = 50, suffix = '...') => {
    return str.length > length ? str.substring(0, length) + suffix : str;
  },

  slugify: str => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  generateId: (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Array utilities
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  unique: (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = key ? item[key] : item;
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  // Object utilities
  deepClone: obj => {
    return JSON.parse(JSON.stringify(obj));
  },

  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit: (obj, keys) => {
    return Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  },

  // Color utilities
  hexToRgb: hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  },

  rgbToHex: (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Storage utilities
  storage: {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: key => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },

    clear: () => {
      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    },
  },

  // Debounce and throttle
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle: (func, limit) => {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Copy to clipboard
  copyToClipboard: async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  },

  // Download file
  downloadFile: (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Performance utilities
  measureTime: async (fn, _name = 'Function') => {
    const _start = performance.now();
    const result = await fn();
    const _end = performance.now();
    return result;
  },

  // Random utilities
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomChoice: array => {
    return array[Math.floor(Math.random() * array.length)];
  },

  randomString: (length = 8) => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // URL utilities
  getQueryParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  setQueryParams: params => {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState({}, '', url);
  },

  // Device utilities
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Browser utilities
  isChrome: () => {
    return (
      /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent)
    );
  },

  isFirefox: () => {
    return /Firefox/.test(navigator.userAgent);
  },

  isSafari: () => {
    return (
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    );
  },

  isEdge: () => {
    return /Edge/.test(navigator.userAgent);
  },
};

// Export individual functions for convenience
export const {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDate,
  formatRelativeTime,
  getDaysBetween,
  isValidEmail,
  isValidPassword,
  isValidUrl,
  capitalize,
  truncate,
  slugify,
  generateId,
  chunk,
  groupBy,
  unique,
  deepClone,
  pick,
  omit,
  hexToRgb,
  rgbToHex,
  debounce,
  throttle,
  copyToClipboard,
  downloadFile,
  measureTime,
  randomInt,
  randomChoice,
  randomString,
  getQueryParams,
  setQueryParams,
  isMobile,
  isTouchDevice,
  isChrome,
  isFirefox,
  isSafari,
  isEdge,
} = utils;
