/**
 * Format Converter Utilities
 * Handles multiple format conversions including Base64, URL-Safe Base64, 
 * Hexadecimal, Binary, URL Encoding, and JSON formatting
 */

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
