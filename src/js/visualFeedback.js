/**
 * Visual Feedback Utilities
 * Handles UI feedback including progress indicators, notifications,
 * file information display, and character counters
 */

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
