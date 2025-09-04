// Error handling utilities
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

// Helper: automatically resize textarea height based on content
function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
}

// Save all row data to localStorage
function saveToLocalStorage() {
  try {
    const data = [];
    document.querySelectorAll("[id^=row-]").forEach((rowEl) => {
      const base64El = rowEl.querySelector("[id^=base64-]");
      const plainEl = rowEl.querySelector("[id^=plain-]");
      if (base64El && plainEl) {
        data.push({
          base64: base64El.value,
          plain: plainEl.value,
        });
      }
    });
    
    const jsonData = JSON.stringify(data);
    if (!ErrorHandler.safeLocalStorageSet("converterData", jsonData)) {
      // LocalStorage failed, show warning but don't break functionality
      console.warn('Data could not be saved to localStorage');
    }
  } catch (e) {
    console.error('Failed to save converter data:', e);
    ErrorHandler.showError('Failed to save your data. Changes may be lost on page refresh.');
  }
}

// Create a new converter row
function createConverterRow(index, restoreData = null) {
  const row = document.createElement("div");
  row.className = "columns is-vcentered";
  row.id = `row-${index}`;

  // DELETE BUTTON COLUMN
  const deleteCol = document.createElement("div");
  deleteCol.className = "column is-narrow";
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "button is-danger is-outlined";
  deleteBtn.innerHTML = `<svg class="icon icon-tabler icon-tabler-trash" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 7l16 0"/>
    <path d="M10 11l0 6"/>
    <path d="M14 11l0 6"/>
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
  </svg>`;
  deleteBtn.title = "Delete this row";
  deleteBtn.addEventListener("click", async () => {
    if (document.querySelectorAll("[id^=row-]").length > 1) {
      const confirmed = await ErrorHandler.showConfirm({
        title: 'Delete Row',
        message: 'Are you sure you want to delete this row? This action cannot be undone.',
        type: 'warning',
        confirmText: 'Delete',
        cancelText: 'Keep'
      });
      
      if (confirmed) {
        row.remove();
        saveToLocalStorage();
        ErrorHandler.showSuccess('Row deleted successfully!');
      }
    } else {
      ErrorHandler.showConfirm({
        title: 'Cannot Delete',
        message: 'At least one row must remain in the converter. Add more rows before deleting this one.',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel'
      });
    }
  });
  deleteCol.appendChild(deleteBtn);

  // LEFT COL
  const leftCol = document.createElement("div");
  leftCol.className = "column is-half";
  const leftField = document.createElement("div");
  leftField.className = "field has-addons";

  const base64Control = document.createElement("div");
  base64Control.className = "control is-expanded";
  const base64Input = document.createElement("textarea");
  base64Input.className = "textarea single-line";
  base64Input.placeholder = "Base64";
  base64Input.id = `base64-${index}`;
  base64Input.setAttribute("rows", "1");
  base64Input.addEventListener("input", () => {
    autoResize(base64Input);
    
    // Clear any previous error styling
    base64Input.classList.remove('is-danger');
    plainInput.classList.remove('is-danger');
    
    if (base64Input.value.trim() === '') {
      plainInput.value = '';
      autoResize(plainInput);
      saveToLocalStorage();
      return;
    }
    
    try {
      plainInput.value = ErrorHandler.safeDecode(base64Input.value);
      autoResize(plainInput);
    } catch (error) {
      plainInput.value = '';
      base64Input.classList.add('is-danger');
      base64Input.title = error.message;
      
      // Don't show error for every character typed, only when user pauses
      clearTimeout(base64Input.errorTimeout);
      base64Input.errorTimeout = setTimeout(() => {
        if (base64Input.value.trim() !== '' && !ErrorHandler.isValidBase64(base64Input.value)) {
          ErrorHandler.showError('Invalid Base64 format. Please check your input.');
        }
      }, 1000);
    }
    
    saveToLocalStorage();
  });
  base64Control.appendChild(base64Input);
  leftField.appendChild(base64Control);

  const copyBtnLeft = document.createElement("button");
  copyBtnLeft.className = "button is-info";
  copyBtnLeft.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M16 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M9 15l6 0"/>
    <path d="M12 12l3 0"/>
  </svg>`;
  copyBtnLeft.addEventListener("click", async () => {
    try {
      if (!base64Input.value.trim()) {
        ErrorHandler.showError('Nothing to copy - field is empty');
        return;
      }
      
      await navigator.clipboard.writeText(base64Input.value);
      copyBtnLeft.title = "Copied!";
      copyBtnLeft.classList.add('is-success');
      
      ErrorHandler.showSuccess('Base64 text copied to clipboard!');
      
      setTimeout(() => {
        copyBtnLeft.title = "";
        copyBtnLeft.classList.remove('is-success');
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      ErrorHandler.showError('Failed to copy to clipboard. Your browser may not support this feature.');
      
      // Fallback: select text for manual copy
      base64Input.select();
      base64Input.setSelectionRange(0, 99999); // For mobile devices
    }
  });

  const clearBtnLeft = document.createElement("button");
  clearBtnLeft.className = "button is-light";
  clearBtnLeft.innerHTML = `<svg class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 6l-12 12"/>
    <path d="M6 6l12 12"/>
  </svg>`;
  clearBtnLeft.addEventListener("click", () => {
    base64Input.value = "";
    plainInput.value = "";
    autoResize(base64Input);
    autoResize(plainInput);
    saveToLocalStorage();
  });

  const btnGroupLeft = document.createElement("div");
  btnGroupLeft.className = "control buttons";
  btnGroupLeft.appendChild(copyBtnLeft);
  btnGroupLeft.appendChild(clearBtnLeft);
  leftField.appendChild(btnGroupLeft);
  leftCol.appendChild(leftField);

  // RIGHT COL
  const rightCol = document.createElement("div");
  rightCol.className = "column is-half";
  const rightField = document.createElement("div");
  rightField.className = "field has-addons";

  const plainControl = document.createElement("div");
  plainControl.className = "control is-expanded";
  const plainInput = document.createElement("textarea");
  plainInput.className = "textarea single-line";
  plainInput.placeholder = "Plain text";
  plainInput.id = `plain-${index}`;
  plainInput.setAttribute("rows", "1");
  plainInput.addEventListener("input", () => {
    autoResize(plainInput);
    
    // Clear any previous error styling
    plainInput.classList.remove('is-danger');
    base64Input.classList.remove('is-danger');
    
    if (plainInput.value === '') {
      base64Input.value = '';
      autoResize(base64Input);
      saveToLocalStorage();
      return;
    }
    
    try {
      base64Input.value = ErrorHandler.safeEncode(plainInput.value);
      autoResize(base64Input);
    } catch (error) {
      base64Input.value = '';
      plainInput.classList.add('is-danger');
      plainInput.title = error.message;
      
      // Show error for encoding issues
      ErrorHandler.showError('Cannot encode text: ' + error.message);
    }
    
    saveToLocalStorage();
  });
  plainControl.appendChild(plainInput);
  rightField.appendChild(plainControl);

  const copyBtnRight = document.createElement("button");
  copyBtnRight.className = "button is-info";
  copyBtnRight.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M16 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
    <path d="M9 15l6 0"/>
    <path d="M12 12l3 0"/>
  </svg>`;
  copyBtnRight.addEventListener("click", async () => {
    try {
      if (!plainInput.value.trim()) {
        ErrorHandler.showError('Nothing to copy - field is empty');
        return;
      }
      
      await navigator.clipboard.writeText(plainInput.value);
      copyBtnRight.title = "Copied!";
      copyBtnRight.classList.add('is-success');
      
      ErrorHandler.showSuccess('Plain text copied to clipboard!');
      
      setTimeout(() => {
        copyBtnRight.title = "";
        copyBtnRight.classList.remove('is-success');
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      ErrorHandler.showError('Failed to copy to clipboard. Your browser may not support this feature.');
      
      // Fallback: select text for manual copy
      plainInput.select();
      plainInput.setSelectionRange(0, 99999); // For mobile devices
    }
  });

  const clearBtnRight = document.createElement("button");
  clearBtnRight.className = "button is-light";
  clearBtnRight.innerHTML = `<svg class="icon icon-tabler icon-tabler-x" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 6l-12 12"/>
    <path d="M6 6l12 12"/>
  </svg>`;
  clearBtnRight.addEventListener("click", () => {
    plainInput.value = "";
    base64Input.value = "";
    autoResize(plainInput);
    autoResize(base64Input);
    saveToLocalStorage();
  });

  const btnGroupRight = document.createElement("div");
  btnGroupRight.className = "control buttons";
  btnGroupRight.appendChild(copyBtnRight);
  btnGroupRight.appendChild(clearBtnRight);
  rightField.appendChild(btnGroupRight);
  rightCol.appendChild(rightField);

  row.appendChild(deleteCol);
  row.appendChild(leftCol);
  row.appendChild(rightCol);

  if (restoreData) {
    base64Input.value = restoreData.base64;
    plainInput.value = restoreData.plain;
  }
  // Delay resize after DOM attach
  setTimeout(() => {
    autoResize(base64Input);
    autoResize(plainInput);
  }, 0);

  return row;
}

let rowCount = 0;
const converterRows = document.getElementById("converterRows");

// Function to get next available row index
function getNextRowIndex() {
  return Date.now(); // Use timestamp to ensure unique IDs
}

// Load from localStorage if available
let savedData = [];
try {
  const savedDataString = ErrorHandler.safeLocalStorageGet("converterData", "[]");
  savedData = JSON.parse(savedDataString);
  
  // Validate saved data structure
  if (!Array.isArray(savedData)) {
    throw new Error('Invalid saved data format');
  }
  
  // Validate each item in saved data
  savedData = savedData.filter(item => {
    return item && 
           typeof item === 'object' && 
           typeof item.base64 === 'string' && 
           typeof item.plain === 'string';
  });
  
} catch (error) {
  console.error('Failed to load saved data:', error);
  ErrorHandler.showError('Failed to load previously saved data. Starting with default configuration.');
  savedData = [];
}

if (savedData.length > 0) {
  savedData.forEach((data) => {
    try {
      const row = createConverterRow(getNextRowIndex(), data);
      converterRows.appendChild(row);
    } catch (error) {
      console.error('Failed to create row from saved data:', error);
      // Continue with other rows even if one fails
    }
  });
  
  // If no rows were created successfully, create default rows
  if (converterRows.children.length === 0) {
    for (let i = 0; i < 7; i++) {
      const row = createConverterRow(getNextRowIndex());
      converterRows.appendChild(row);
    }
  }
} else {
  for (let i = 0; i < 7; i++) {
    const row = createConverterRow(getNextRowIndex());
    converterRows.appendChild(row);
  }
}

// Add new row
document.getElementById("addRowButton").addEventListener("click", () => {
  const newRow = createConverterRow(getNextRowIndex());
  converterRows.appendChild(newRow);
  saveToLocalStorage();
});

// Clear all
document.getElementById("clearAllButton").addEventListener("click", async () => {
  try {
    const confirmed = await ErrorHandler.showConfirm({
      title: 'Clear All Rows',
      message: 'Are you sure you want to clear all rows? This will permanently delete all your data and cannot be undone.',
      type: 'danger',
      confirmText: 'Clear All',
      cancelText: 'Keep Data'
    });
    
    if (!confirmed) {
      return;
    }
    
    // Clear localStorage
    try {
      localStorage.removeItem("converterData");
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    // Clear UI
    converterRows.innerHTML = "";
    
    // Create default rows
    for (let i = 0; i < 7; i++) {
      const row = createConverterRow(getNextRowIndex());
      converterRows.appendChild(row);
    }
    
    ErrorHandler.showSuccess('All rows cleared successfully!');
    
  } catch (error) {
    console.error('Failed to clear rows:', error);
    ErrorHandler.showError('Failed to clear all rows. Please refresh the page and try again.');
  }
});

// Theme toggle (with icon change)
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeToggleIcon");

function updateThemeIcon() {
  if (document.body.classList.contains("dark-mode")) {
    themeIcon.innerHTML = `<svg class="icon icon-tabler icon-tabler-sun" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>
    </svg>`;
  } else {
    themeIcon.innerHTML = `<svg class="icon icon-tabler icon-tabler-moon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>
    </svg>`;
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );
  document
    .getElementById("logo")
    .setAttribute(
      "src",
      localStorage.getItem("darkMode") === "true"
        ? "src/img/cagatayuresin-logo-w.png"
        : "src/img/cagatayuresin-logo.png"
    );
  updateThemeIcon();
});

function setLogo() {
  const imagePlaceholder = document.getElementById("imagePlaceholder");

  const imgElement = document.createElement("img");
  imgElement.id = "logo"; // ID ekliyoruz
  imgElement.src =
    localStorage.getItem("darkMode") === "true"
      ? "src/img/cagatayuresin-logo-w.png"
      : "src/img/cagatayuresin-logo.png";
  imgElement.alt = "Logo"; 
  imgElement.style.maxWidth = "60px"; 

  // Yeni resmi hedef bölgeye ekliyoruz
  imagePlaceholder.appendChild(imgElement);
}

// Apply saved theme
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}
updateThemeIcon();
setLogo();

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  ErrorHandler.showError('An unexpected error occurred. Please refresh the page if problems persist.');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  ErrorHandler.showError('An operation failed. Please try again.');
  event.preventDefault(); // Prevent default browser error handling
});

// Check browser compatibility on load
document.addEventListener('DOMContentLoaded', async () => {
  // Check for required APIs
  const missingFeatures = [];
  
  if (!window.atob || !window.btoa) {
    missingFeatures.push('Base64 encoding/decoding');
  }
  
  if (!navigator.clipboard) {
    console.warn('Clipboard API not available - copy features may be limited');
  }
  
  if (!window.localStorage) {
    missingFeatures.push('Local storage');
    
    await ErrorHandler.showConfirm({
      title: 'Browser Compatibility Warning',
      message: 'Your browser doesn\'t support data persistence. Your work will be lost when you refresh or close the page. Consider updating your browser for the best experience.',
      type: 'warning',
      confirmText: 'Continue Anyway',
      cancelText: 'Learn More'
    });
  }
  
  if (missingFeatures.length > 0) {
    await ErrorHandler.showConfirm({
      title: 'Compatibility Issues Detected',
      message: `Your browser doesn't support: ${missingFeatures.join(', ')}. Some features may not work properly. Please consider updating your browser.`,
      type: 'warning',
      confirmText: 'Continue',
      cancelText: 'Cancel'
    });
  }
});