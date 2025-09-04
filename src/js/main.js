/**
 * Main Application Logic
 * Handles core functionality, event listeners, file processing,
 * and application initialization
 */

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
    const confirmed = await ErrorHandler.showConfirm({
      title: 'Delete Row',
      message: 'Are you sure you want to delete this converter row? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      type: 'danger'
    });
    
    if (confirmed) {
      row.remove();
      saveToLocalStorage();
      ErrorHandler.showSuccess('Row deleted successfully');
      
      // If no rows left, create one
      const remainingRows = document.querySelectorAll("[id^=row-]");
      if (remainingRows.length === 0) {
        const newRow = createConverterRow(getNextRowIndex());
        converterRows.appendChild(newRow);
      }
    }
  });

  deleteCol.appendChild(deleteBtn);

  // PLAINTEXT COLUMN
  const plainCol = document.createElement("div");
  plainCol.className = "column";
  const plainControl = document.createElement("div");
  plainControl.className = "control";
  const plainTextarea = document.createElement("textarea");
  plainTextarea.className = "textarea";
  plainTextarea.id = `plain-${index}`;
  plainTextarea.placeholder = "Plain text";
  plainTextarea.rows = 1;
  plainTextarea.value = restoreData?.plain || "";

  // Auto-resize
  plainTextarea.addEventListener("input", () => {
    autoResize(plainTextarea);
    
    // Get selected format
    const formatSelector = document.getElementById('formatSelector');
    const selectedFormat = formatSelector.value;
    const converter = FormatConverter[selectedFormat];
    
    if (converter && plainTextarea.value.trim()) {
      try {
        const base64Textarea = document.getElementById(`base64-${index}`);
        base64Textarea.value = converter.encode(plainTextarea.value);
        autoResize(base64Textarea);
        
        // Add character count
        VisualFeedback.showCharCount(plainTextarea, plainTextarea.value);
        VisualFeedback.showCharCount(base64Textarea, base64Textarea.value);
        
        saveToLocalStorage();
      } catch (error) {
        ErrorHandler.showError(`Encoding failed: ${error.message}`);
      }
    } else if (!plainTextarea.value.trim()) {
      // Clear base64 if plain is empty
      const base64Textarea = document.getElementById(`base64-${index}`);
      base64Textarea.value = "";
      autoResize(base64Textarea);
      saveToLocalStorage();
    }
  });

  plainControl.appendChild(plainTextarea);
  plainCol.appendChild(plainControl);

  // BUTTON COLUMN
  const buttonCol = document.createElement("div");
  buttonCol.className = "column is-narrow";
  const buttonField = document.createElement("div");
  buttonField.className = "field has-addons";

  // Copy button for plain text
  const copyPlainControl = document.createElement("div");
  copyPlainControl.className = "control";
  const copyPlainBtn = document.createElement("button");
  copyPlainBtn.className = "button is-primary is-outlined";
  copyPlainBtn.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
  </svg>`;
  copyPlainBtn.title = "Copy plain text";

  copyPlainBtn.addEventListener("click", async () => {
    const content = plainTextarea.value;
    if (!content.trim()) {
      ErrorHandler.showError('Nothing to copy - plain text field is empty');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      ErrorHandler.showSuccess('Plain text copied to clipboard!');
    } catch (error) {
      console.error('Clipboard API failed:', error);
      ErrorHandler.showError('Failed to copy plain text to clipboard. Your browser may not support this feature or requires HTTPS. Please copy manually.');
    }
  });

  copyPlainControl.appendChild(copyPlainBtn);

  // Clear button for plain text
  const clearPlainControl = document.createElement("div");
  clearPlainControl.className = "control";
  const clearPlainBtn = document.createElement("button");
  clearPlainBtn.className = "button is-warning is-outlined";
  clearPlainBtn.innerHTML = `<svg class="icon icon-tabler icon-tabler-eraser" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"/>
    <path d="M18 13.3l-6.3 -6.3"/>
  </svg>`;
  clearPlainBtn.title = "Clear plain text";

  clearPlainBtn.addEventListener("click", () => {
    plainTextarea.value = "";
    autoResize(plainTextarea);
    
    // Also clear base64
    const base64Textarea = document.getElementById(`base64-${index}`);
    base64Textarea.value = "";
    autoResize(base64Textarea);
    
    saveToLocalStorage();
    ErrorHandler.showSuccess('Plain text cleared');
  });

  clearPlainControl.appendChild(clearPlainBtn);
  buttonField.appendChild(copyPlainControl);
  buttonField.appendChild(clearPlainControl);
  buttonCol.appendChild(buttonField);

  // BASE64 COLUMN
  const base64Col = document.createElement("div");
  base64Col.className = "column";
  const base64Control = document.createElement("div");
  base64Control.className = "control";
  const base64Textarea = document.createElement("textarea");
  base64Textarea.className = "textarea";
  base64Textarea.id = `base64-${index}`;
  
  // Set placeholder based on current format
  const formatSelector = document.getElementById('formatSelector');
  const selectedFormat = formatSelector?.value || 'base64';
  const converter = FormatConverter[selectedFormat];
  base64Textarea.placeholder = converter ? converter.name : "Base64";
  
  base64Textarea.rows = 1;
  base64Textarea.value = restoreData?.base64 || "";

  // Base64 input handler with validation
  let debounceTimer;
  base64Textarea.addEventListener("input", () => {
    autoResize(base64Textarea);
    
    // Clear previous timer
    clearTimeout(debounceTimer);
    
    // Debounce validation to avoid spam
    debounceTimer = setTimeout(() => {
      if (base64Textarea.value.trim()) {
        // Get selected format
        const formatSelector = document.getElementById('formatSelector');
        const selectedFormat = formatSelector.value;
        const converter = FormatConverter[selectedFormat];
        
        if (converter) {
          try {
            const plainTextarea = document.getElementById(`plain-${index}`);
            plainTextarea.value = converter.decode(base64Textarea.value);
            autoResize(plainTextarea);
            
            // Add character count
            VisualFeedback.showCharCount(base64Textarea, base64Textarea.value);
            VisualFeedback.showCharCount(plainTextarea, plainTextarea.value);
            
            // Remove error styling
            base64Textarea.classList.remove('is-danger');
            
            saveToLocalStorage();
          } catch (error) {
            // Add error styling
            base64Textarea.classList.add('is-danger');
            ErrorHandler.showError(`Decoding failed: ${error.message}`);
          }
        }
      } else {
        // Clear plain text if base64 is empty
        const plainTextarea = document.getElementById(`plain-${index}`);
        plainTextarea.value = "";
        autoResize(plainTextarea);
        base64Textarea.classList.remove('is-danger');
        saveToLocalStorage();
      }
    }, 500); // 500ms debounce
  });

  base64Control.appendChild(base64Textarea);
  base64Col.appendChild(base64Control);

  // BUTTON COLUMN 2
  const buttonCol2 = document.createElement("div");
  buttonCol2.className = "column is-narrow";
  const buttonField2 = document.createElement("div");
  buttonField2.className = "field has-addons";

  // Copy button for base64
  const copyBase64Control = document.createElement("div");
  copyBase64Control.className = "control";
  const copyBase64Btn = document.createElement("button");
  copyBase64Btn.className = "button is-primary is-outlined";
  copyBase64Btn.innerHTML = `<svg class="icon icon-tabler icon-tabler-copy" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
    <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
  </svg>`;
  copyBase64Btn.title = `Copy ${converter ? converter.name : 'Base64'}`;

  copyBase64Btn.addEventListener("click", async () => {
    const content = base64Textarea.value;
    if (!content.trim()) {
      ErrorHandler.showError(`Nothing to copy - ${converter ? converter.name : 'Base64'} field is empty`);
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      ErrorHandler.showSuccess(`${converter ? converter.name : 'Base64'} copied to clipboard!`);
    } catch (error) {
      console.error('Clipboard API failed:', error);
      ErrorHandler.showError('Failed to copy to clipboard. Your browser may not support this feature or requires HTTPS. Please copy manually.');
    }
  });

  copyBase64Control.appendChild(copyBase64Btn);

  // Clear button for base64
  const clearBase64Control = document.createElement("div");
  clearBase64Control.className = "control";
  const clearBase64Btn = document.createElement("button");
  clearBase64Btn.className = "button is-warning is-outlined";
  clearBase64Btn.innerHTML = `<svg class="icon icon-tabler icon-tabler-eraser" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 20h-10.5l-4.21 -4.3a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9.2 9.3"/>
    <path d="M18 13.3l-6.3 -6.3"/>
  </svg>`;
  clearBase64Btn.title = `Clear ${converter ? converter.name : 'Base64'}`;

  clearBase64Btn.addEventListener("click", () => {
    base64Textarea.value = "";
    autoResize(base64Textarea);
    
    // Also clear plain text
    const plainTextarea = document.getElementById(`plain-${index}`);
    plainTextarea.value = "";
    autoResize(plainTextarea);
    
    saveToLocalStorage();
    ErrorHandler.showSuccess(`${converter ? converter.name : 'Base64'} cleared`);
  });

  clearBase64Control.appendChild(clearBase64Btn);
  buttonField2.appendChild(copyBase64Control);
  buttonField2.appendChild(clearBase64Control);
  buttonCol2.appendChild(buttonField2);

  // Assemble the row
  row.appendChild(deleteCol);
  row.appendChild(plainCol);
  row.appendChild(buttonCol);
  row.appendChild(base64Col);
  row.appendChild(buttonCol2);

  // Auto-resize on load if there's content
  setTimeout(() => {
    if (plainTextarea.value) autoResize(plainTextarea);
    if (base64Textarea.value) autoResize(base64Textarea);
  }, 10);

  return row;
}

// Get next available row index
function getNextRowIndex() {
  const existingRows = document.querySelectorAll("[id^=row-]");
  let maxIndex = 0;
  existingRows.forEach(row => {
    const index = parseInt(row.id.split("-")[1]);
    if (index > maxIndex) maxIndex = index;
  });
  return maxIndex + 1;
}

// Load data from localStorage and create rows
function loadFromLocalStorage() {
  try {
    const jsonData = ErrorHandler.safeLocalStorageGet("converterData");
    if (jsonData) {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!Array.isArray(data)) {
        console.warn('Invalid data structure in localStorage');
        return false;
      }
      
      data.forEach((rowData, index) => {
        if (rowData && typeof rowData === 'object') {
          const row = createConverterRow(index + 1, rowData);
          converterRows.appendChild(row);
        }
      });
      
      return data.length > 0;
    }
  } catch (e) {
    console.error('Failed to load data from localStorage:', e);
    ErrorHandler.showError('Failed to load saved data. Starting with fresh state.');
  }
  return false;
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
            <svg width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"/>
              <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"/>
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
      console.error('Copy to clipboard failed:', error);
      ErrorHandler.showError(`Failed to copy to clipboard: ${error.message}`);
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

// Global variables
let converterRows;

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  converterRows = document.getElementById("converterRows");
  
  // Initialize format selector
  initializeFormatSelector();
  
  // Clear results button
  const clearResultsBtn = document.getElementById('clearResults');
  if (clearResultsBtn) {
    clearResultsBtn.addEventListener('click', clearFileResults);
  }
  
  // Load saved data or create initial rows
  const hasLoadedData = loadFromLocalStorage();
  if (!hasLoadedData) {
    // Create 5 initial rows
    for (let i = 1; i <= 5; i++) {
      const initialRow = createConverterRow(i);
      converterRows.appendChild(initialRow);
    }
  }

  // Add row button
  const addBtn = document.getElementById("addRowButton");
  addBtn.addEventListener("click", () => {
    const newRow = createConverterRow(getNextRowIndex());
    converterRows.appendChild(newRow);
    saveToLocalStorage();
    ErrorHandler.showSuccess('New row added!');
  });

  // Clear all button
  const clearBtn = document.getElementById("clearAllButton");
  clearBtn.addEventListener("click", async () => {
    const confirmed = await ErrorHandler.showConfirm({
      title: 'Clear All Rows',
      message: 'Are you sure you want to clear all converter rows? This will permanently delete all your current data.',
      confirmText: 'Clear All',
      cancelText: 'Keep Data',
      type: 'danger'
    });
    
    if (confirmed) {
      converterRows.innerHTML = "";
      // Create 5 fresh rows after clearing
      for (let i = 1; i <= 5; i++) {
        const newRow = createConverterRow(i);
        converterRows.appendChild(newRow);
      }
      saveToLocalStorage();
      ErrorHandler.showSuccess('All rows cleared! 5 fresh rows have been created.');
    }
  });

  // Theme toggle button
  const themeBtn = document.getElementById("themeToggle");
  const currentTheme = ErrorHandler.safeLocalStorageGet("theme", "light");
  document.documentElement.setAttribute("data-theme", currentTheme);

  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    ErrorHandler.safeLocalStorageSet("theme", newTheme);
    ErrorHandler.showSuccess(`Switched to ${newTheme} theme`);
  });

  // File upload functionality
  const fileInput = document.getElementById('fileInput');
  const fileUpload = document.getElementById('fileUploadArea');
  
  if (!fileUpload) {
    console.error('File upload area not found');
    return;
  }
  
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  });

  // Drag and drop functionality
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    fileUpload.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    fileUpload.addEventListener(eventName, unhighlight, false);
  });

  fileUpload.addEventListener('drop', handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    fileUpload.classList.add('is-active');
  }

  function unhighlight() {
    fileUpload.classList.remove('is-active');
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    
    if (files.length > 0) {
      processFiles(files);
    }
  }

  // Global error handlers
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    ErrorHandler.showError('An unexpected error occurred. Please refresh the page if the problem persists.');
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    ErrorHandler.showError('An error occurred during processing. Please try again.');
  });
});
