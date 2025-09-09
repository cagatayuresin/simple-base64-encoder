/**
 * Format Converter Utilities
 * Handles multiple format conversions including Base64, URL-Safe Base64, 
 * Hexadecimal, Binary, URL Encoding, and JSON formatting
 */

const FormatConverter = {
  // Helpers for UTF-8 safe string <-> bytes
  _toBytes: (str) => new TextEncoder().encode(str),
  _fromBytes: (bytes) => new TextDecoder().decode(bytes),

  // Standard Base64 (UTF-8 safe)
  base64: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    },
    decode: (input) => {
      const binary = atob(input);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    },
    name: 'Base64'
  },
  
  // URL-Safe Base64 (UTF-8 safe)
  base64url: {
    encode: (input) => {
      const b64 = FormatConverter.base64.encode(input);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
    },
    decode: (input) => {
      let padded = input.replace(/-/g, '+').replace(/_/g, '/');
      while (padded.length % 4) padded += '=';
      return FormatConverter.base64.decode(padded);
    },
    name: 'URL-Safe Base64'
  },
  
  // Hexadecimal (UTF-8 bytes)
  hex: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    decode: (input) => {
      if (input.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
      }
      const bytePairs = input.match(/.{2}/g) || [];
      const bytes = new Uint8Array(bytePairs.map(h => parseInt(h, 16)));
      return new TextDecoder().decode(bytes);
    },
    name: 'Hexadecimal'
  },
  
  // Binary (UTF-8 bytes, space-separated octets)
  binary: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
    },
    decode: (input) => {
      const bits = input.trim().split(/\s+/).filter(Boolean);
      const bytes = new Uint8Array(bits.map(bin => parseInt(bin, 2)));
      return new TextDecoder().decode(bytes);
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
        console.error('JSON parsing error:', e.message);
        throw new Error('Invalid JSON format: ' + e.message);
      }
    },
    decode: (input) => {
      try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
      } catch (e) {
        console.error('JSON parsing error:', e.message);
        throw new Error('Invalid JSON format: ' + e.message);
      }
    },
    name: 'JSON Formatter'
  }
};
