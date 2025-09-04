// Format converter utilities
const FormatConverter = {
  // Standard Base64
  base64: {
    encode: (input) => btoa(input),
    decode: (input) => atob(input),
    name: 'Base64'
  },
  
  // URL-Safe Base64
  base64url: {
    encode: (input) => {
      return btoa(input)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },
    decode: (input) => {
      // Add padding back
      let padded = input;
      while (padded.length % 4) {
        padded += '=';
      }
      // Replace URL-safe characters
      padded = padded.replace(/-/g, '+').replace(/_/g, '/');
      return atob(padded);
    },
    name: 'URL-Safe Base64'
  },
  
  // Hexadecimal
  hex: {
    encode: (input) => {
      return Array.from(input)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    },
    decode: (input) => {
      if (input.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
      }
      return input.match(/.{2}/g)
        .map(hex => String.fromCharCode(parseInt(hex, 16)))
        .join('');
    },
    name: 'Hexadecimal'
  },
  
  // Binary
  binary: {
    encode: (input) => {
      return Array.from(input)
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    },
    decode: (input) => {
      return input.split(' ')
        .filter(bin => bin.length > 0)
        .map(bin => String.fromCharCode(parseInt(bin, 2)))
        .join('');
    },
    name: 'Binary'
  },
  
  // URL Encoding
  url: {
    encode: (input) => encodeURIComponent(input),
    decode: (input) => decodeURIComponent(input),
    name: 'URL Encoding'
  },
  
  // JSON Formatter
  json: {
    encode: (input) => {
      try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    },
    decode: (input) => {
      try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }
    },
    name: 'JSON Formatter'
  }
};

// File handling utilities
const FileHandler = {
  // Read file as text
  readAsText: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },
  
  // Read file as binary (for images, etc.)
  readAsBinary: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        resolve(binary);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  },
  
  // Get file info
  getFileInfo: (file) => {
    const sizeInBytes = file.size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    
    return {
      name: file.name,
      size: sizeInBytes,
      sizeFormatted: sizeInBytes < 1024 ? `${sizeInBytes} B` :
                     sizeInBytes < 1024 * 1024 ? `${sizeInKB} KB` :
                     `${sizeInMB} MB`,
      type: file.type || 'Unknown',
      lastModified: new Date(file.lastModified).toLocaleString()
    };
  },
  
  // Check if file is binary
  isBinaryFile: (file) => {
    const textTypes = ['text/', 'application/json', 'application/xml', 'application/javascript'];
    return !textTypes.some(type => file.type.startsWith(type));
  }
};

// Visual feedback utilities
const VisualFeedback = {
  // Show processing notification
  showProcessing: (message = 'Processing...') => {
    const info = document.getElementById('processingInfo');
    const text = document.getElementById('processingText');
    const progress = document.getElementById('progressBar');
    
    text.textContent = message;
    progress.removeAttribute('value');
    info.classList.remove('is-hidden');
  },
  
  // Update progress
  updateProgress: (percent, message) => {
    const text = document.getElementById('processingText');
    const progress = document.getElementById('progressBar');
    
    if (message) text.textContent = message;
    progress.value = percent;
    progress.max = 100;
  },
  
  // Hide processing
  hideProcessing: () => {
    const info = document.getElementById('processingInfo');
    info.classList.add('is-hidden');
  },
  
  // Show file info
  showFileInfo: (files) => {
    const fileInfo = document.getElementById('fileInfo');
    const fileDetails = document.getElementById('fileDetails');
    
    fileDetails.innerHTML = '';
    
    files.forEach(file => {
      const info = FileHandler.getFileInfo(file);
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${info.name}</strong> - ${info.sizeFormatted} 
        <span class="tag is-small">${info.type}</span>
        <br><small>Modified: ${info.lastModified}</small>
      `;
      fileDetails.appendChild(li);
    });
    
    fileInfo.classList.remove('is-hidden');
  },
  
  // Hide file info
  hideFileInfo: () => {
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.classList.add('is-hidden');
  },
  
  // Show character count
  showCharCount: (element, text) => {
    const count = text.length;
    const bytes = new Blob([text]).size;
    
    if (!element.nextElementSibling || !element.nextElementSibling.classList.contains('char-count')) {
      const countDiv = document.createElement('div');
      countDiv.className = 'char-count has-text-grey-light is-size-7';
      element.parentNode.insertBefore(countDiv, element.nextSibling);
    }
    
    const countDiv = element.nextElementSibling;
    countDiv.textContent = `${count} chars, ${bytes} bytes`;
  }
};

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
    
    // Get selected format
    const formatSelector = document.getElementById('formatSelector');
    const selectedFormat = formatSelector ? formatSelector.value : 'base64';
    const converter = FormatConverter[selectedFormat];
    
    try {
      plainInput.value = converter.decode(base64Input.value);
      autoResize(plainInput);
      
      // Show character count
      VisualFeedback.showCharCount(base64Input, base64Input.value);
      VisualFeedback.showCharCount(plainInput, plainInput.value);
      
    } catch (error) {
      plainInput.value = '';
      base64Input.classList.add('is-danger');
      base64Input.title = error.message;
      
      // Don't show error for every character typed, only when user pauses
      clearTimeout(base64Input.errorTimeout);
      base64Input.errorTimeout = setTimeout(() => {
        if (base64Input.value.trim() !== '') {
          ErrorHandler.showError(`Invalid ${converter.name} format: ${error.message}`);
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
    
    // Get selected format
    const formatSelector = document.getElementById('formatSelector');
    const selectedFormat = formatSelector ? formatSelector.value : 'base64';
    const converter = FormatConverter[selectedFormat];
    
    try {
      base64Input.value = converter.encode(plainInput.value);
      autoResize(base64Input);
      
      // Show character count
      VisualFeedback.showCharCount(plainInput, plainInput.value);
      VisualFeedback.showCharCount(base64Input, base64Input.value);
      
    } catch (error) {
      base64Input.value = '';
      plainInput.classList.add('is-danger');
      plainInput.title = error.message;
      
      // Show error for encoding issues
      ErrorHandler.showError(`Cannot encode to ${converter.name}: ${error.message}`);
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
  // Initialize file upload functionality
  initializeFileUpload();
  
  // Initialize format selector
  initializeFormatSelector();
  
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

// Initialize file upload functionality
function initializeFileUpload() {
  const fileInput = document.getElementById('fileInput');
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileName = document.getElementById('fileName');
  
  // File input change handler
  fileInput.addEventListener('change', handleFileSelection);
  
  // Drag and drop handlers
  fileUploadArea.addEventListener('dragover', handleDragOver);
  fileUploadArea.addEventListener('dragleave', handleDragLeave);
  fileUploadArea.addEventListener('drop', handleFileDrop);
}

// Handle file selection
async function handleFileSelection(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  await processFiles(files);
}

// Handle drag over
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('is-active');
}

// Handle drag leave
function handleDragLeave(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('is-active');
}

// Handle file drop
async function handleFileDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('is-active');
  
  const files = Array.from(event.dataTransfer.files);
  if (files.length === 0) return;
  
  await processFiles(files);
}

// Process uploaded files
async function processFiles(files) {
  try {
    VisualFeedback.showProcessing('Reading files...');
    VisualFeedback.showFileInfo(files);
    
    const formatSelector = document.getElementById('formatSelector');
    const selectedFormat = formatSelector.value;
    const converter = FormatConverter[selectedFormat];
    
    // Clear previous results
    clearFileResults();
    
    // Show results section
    const fileResults = document.getElementById('fileResults');
    fileResults.classList.remove('is-hidden');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      VisualFeedback.updateProgress((i / files.length) * 100, `Processing ${file.name}...`);
      
      try {
        let content;
        if (FileHandler.isBinaryFile(file)) {
          content = await FileHandler.readAsBinary(file);
        } else {
          content = await FileHandler.readAsText(file);
        }
        
        // Convert content based on selected format
        try {
          const convertedContent = converter.encode(content);
          addFileResult(file, content, convertedContent, selectedFormat);
        } catch (error) {
          ErrorHandler.showError(`Failed to convert ${file.name}: ${error.message}`);
        }
        
      } catch (error) {
        ErrorHandler.showError(`Failed to read ${file.name}: ${error.message}`);
      }
    }
    
    VisualFeedback.hideProcessing();
    ErrorHandler.showSuccess(`Successfully processed ${files.length} file(s)!`);
    
    // Update file name display
    const fileName = document.getElementById('fileName');
    if (files.length === 1) {
      fileName.textContent = files[0].name;
    } else {
      fileName.textContent = `${files.length} files selected`;
    }
    
  } catch (error) {
    VisualFeedback.hideProcessing();
    ErrorHandler.showError('Failed to process files: ' + error.message);
  }
}

// Add file result to results container
function addFileResult(file, originalContent, convertedContent, format) {
  const fileResultsContainer = document.getElementById('fileResultsContainer');
  const fileInfo = FileHandler.getFileInfo(file);
  const converter = FormatConverter[format];
  
  const resultItem = document.createElement('div');
  resultItem.className = 'file-result-item';
  
  // Get file type icon
  const fileIcon = getFileTypeIcon(file.type);
  
  resultItem.innerHTML = `
    <div class="file-result-header">
      <div class="file-result-info">
        <div class="file-result-icon">
          ${fileIcon}
        </div>
        <div class="file-result-details">
          <h4>${fileInfo.name}</h4>
          <p>${fileInfo.sizeFormatted} • ${fileInfo.type}</p>
        </div>
        <div class="file-result-format">
          <svg width="12" height="12" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 12l2 2l4 -4"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
          ${converter.name}
        </div>
      </div>
      <div class="file-result-actions">
        <button class="button is-small is-info copy-result" data-content="${convertedContent}">
          <span class="icon">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M8 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
              <path d="M16 8m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"/>
              <path d="M9 15l6 0"/>
              <path d="M12 12l3 0"/>
            </svg>
          </span>
          <span>Copy</span>
        </button>
        <button class="button is-small is-light remove-result">
          <span class="icon">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M18 6l-12 12"/>
              <path d="M6 6l12 12"/>
            </svg>
          </span>
        </button>
      </div>
    </div>
    <div class="file-result-output">
      <textarea class="file-result-textarea" readonly>${convertedContent}</textarea>
      <div class="file-result-stats">
        <span>Original: ${originalContent.length} chars</span>
        <span>Converted: ${convertedContent.length} chars</span>
        <span>${new Blob([convertedContent]).size} bytes</span>
      </div>
    </div>
  `;
  
  fileResultsContainer.appendChild(resultItem);
  
  // Add event listeners
  const copyBtn = resultItem.querySelector('.copy-result');
  const removeBtn = resultItem.querySelector('.remove-result');
  
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(convertedContent);
      copyBtn.classList.add('is-success');
      copyBtn.querySelector('span:last-child').textContent = 'Copied!';
      
      setTimeout(() => {
        copyBtn.classList.remove('is-success');
        copyBtn.querySelector('span:last-child').textContent = 'Copy';
      }, 2000);
      
      ErrorHandler.showSuccess('Converted content copied to clipboard!');
    } catch (error) {
      ErrorHandler.showError('Failed to copy to clipboard');
    }
  });
  
  removeBtn.addEventListener('click', () => {
    resultItem.remove();
    
    // Hide results section if no more results
    if (fileResultsContainer.children.length === 0) {
      document.getElementById('fileResults').classList.add('is-hidden');
    }
  });
}

// Get file type icon
function getFileTypeIcon(mimeType) {
  if (mimeType.startsWith('image/')) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M15 8h.01"/>
      <rect x="4" y="4" width="16" height="16" rx="3"/>
      <path d="M4 15l4 -4a3 5 0 0 1 3 0l5 5"/>
      <path d="M14 14l1 -1a3 5 0 0 1 3 0l2 2"/>
    </svg>`;
  } else if (mimeType.startsWith('text/') || mimeType.includes('json')) {
    return `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
      <path d="M9 9l1 0"/>
      <path d="M9 13l6 0"/>
      <path d="M9 17l6 0"/>
    </svg>`;
  } else {
    return `<svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
    </svg>`;
  }
}

// Clear file results
function clearFileResults() {
  const fileResultsContainer = document.getElementById('fileResultsContainer');
  fileResultsContainer.innerHTML = '';
  
  const fileResults = document.getElementById('fileResults');
  fileResults.classList.add('is-hidden');
}

// Initialize clear results button
document.addEventListener('DOMContentLoaded', () => {
  const clearResultsBtn = document.getElementById('clearResults');
  if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', clearFileResults);
  }
});

// Initialize format selector
function initializeFormatSelector() {
  const formatSelector = document.getElementById('formatSelector');
  
  formatSelector.addEventListener('change', (event) => {
    const selectedFormat = event.target.value;
    const converter = FormatConverter[selectedFormat];
    
    if (converter) {
      ErrorHandler.showSuccess(`Switched to ${converter.name} format`);
      
      // Update placeholders in existing rows
      updateRowPlaceholders(selectedFormat);
    }
  });
}

// Update placeholders based on selected format
function updateRowPlaceholders(format) {
  const converter = FormatConverter[format];
  const base64Inputs = document.querySelectorAll('[id^="base64-"]');
  const plainInputs = document.querySelectorAll('[id^="plain-"]');
  
  base64Inputs.forEach(input => {
    input.placeholder = converter.name;
  });
  
  plainInputs.forEach(input => {
    input.placeholder = 'Plain text';
  });
}