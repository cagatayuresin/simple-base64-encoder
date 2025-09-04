/**
 * File Handler Utilities
 * Handles file reading operations, file information extraction,
 * and file type detection for binary and text files
 */

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
        for (const byte of uint8Array) {
          binary += String.fromCharCode(byte);
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

    let sizeFormatted;
    if (sizeInBytes < 1024) {
      sizeFormatted = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeFormatted = `${sizeInKB} KB`;
    } else {
      sizeFormatted = `${sizeInMB} MB`;
    }
    
    return {
      name: file.name,
      size: sizeInBytes,
      sizeFormatted: sizeFormatted,
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
