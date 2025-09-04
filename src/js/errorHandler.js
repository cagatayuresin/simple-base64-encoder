/**
 * Error Handler Utilities
 * Handles error notifications, success messages, custom modal dialogs,
 * and safe operations for Base64 encoding/decoding and localStorage
 */

const ErrorHandler = {
  // Show error notification
  showError: function(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification is-danger error-notification';
    notification.innerHTML = `
      <button class="delete" onclick="this.parentElement.remove()"></button>
      <strong>Error:</strong> ${message}
    `;
    
    // Position at top of page
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  },

  // Show success notification
  showSuccess: function(message, duration = 2000) {
    const notification = document.createElement('div');
    notification.className = 'notification is-success success-notification';
    notification.innerHTML = `
      <button class="delete" onclick="this.parentElement.remove()"></button>
      ${message}
    `;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '400px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  },

  // Custom confirm dialog
  showConfirm: function(options) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'custom-modal';
      
      const iconType = options.type || 'warning';
      const iconMap = {
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 9v2m0 4v.01"/>
          <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/>
        </svg>`,
        danger: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
          <path d="M10 10l4 4m0 -4l-4 4"/>
        </svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
          <path d="M12 8l.01 0"/>
          <path d="M11 12l1 0l0 4l1 0"/>
        </svg>`
      };
      
      modal.innerHTML = `
        <div class="custom-modal-content">
          <div class="custom-modal-header">
            <div class="custom-modal-icon is-${iconType}">
              ${iconMap[iconType]}
            </div>
            <h3 class="custom-modal-title">${options.title || 'Confirmation'}</h3>
          </div>
          <div class="custom-modal-message">
            ${options.message || 'Are you sure you want to continue?'}
          </div>
          <div class="custom-modal-footer">
            <button class="button is-light modal-cancel">
              ${options.cancelText || 'Cancel'}
            </button>
            <button class="button is-${iconType === 'danger' ? 'danger' : 'primary'} modal-confirm">
              ${options.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add click handlers
      const cancelBtn = modal.querySelector('.modal-cancel');
      const confirmBtn = modal.querySelector('.modal-confirm');
      
      const closeModal = (result) => {
        modal.classList.remove('is-active');
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
        resolve(result);
      };
      
      cancelBtn.addEventListener('click', () => closeModal(false));
      confirmBtn.addEventListener('click', () => closeModal(true));
      
      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(false);
        }
      });
      
      // Close on Escape key
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escapeHandler);
          closeModal(false);
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      // Show modal
      setTimeout(() => {
        modal.classList.add('is-active');
      }, 10);
      
      // Focus confirm button
      setTimeout(() => {
        confirmBtn.focus();
      }, 350);
    });
  },

  // Validate Base64 string
  isValidBase64: function(str) {
    if (!str || str.trim() === '') return true; // Empty is valid
    try {
      // Check if it's valid base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) return false;
      
      // Try to decode
      atob(str);
      return true;
    } catch (e) {
      console.error('Base64 validation failed:', e);
      return false;
    }
  },

  // Safe Base64 encoding
  safeEncode: function(str) {
    try {
      return btoa(str);
    } catch (e) {
      console.error('Base64 encoding failed:', e);
      throw new Error('Cannot encode text: Contains invalid characters for Base64 encoding');
    }
  },

  // Safe Base64 decoding
  safeDecode: function(str) {
    if (!str || str.trim() === '') return '';
    
    try {
      if (!this.isValidBase64(str)) {
        throw new Error('Invalid Base64 format');
      }
      return atob(str);
    } catch (e) {
      console.error('Base64 decoding failed:', e);
      throw new Error('Cannot decode Base64: Invalid format or corrupted data');
    }
  },

  // Safe localStorage operations
  safeLocalStorageSet: function(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('LocalStorage save failed:', e);
      this.showError('Failed to save data. Your browser may have exceeded storage limits.');
      return false;
    }
  },

  safeLocalStorageGet: function(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.error('LocalStorage read failed:', e);
      this.showError('Failed to load saved data.');
      return defaultValue;
    }
  }
};
