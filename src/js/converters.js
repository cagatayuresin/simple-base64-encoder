/**
 * Format conversions for text and raw bytes.
 * String encode/decode stays UTF-8 safe and matches the previous rules.
 */

function toBase64Url(encoded) {
  const translated = encoded.replace(/\+/g, "-").replace(/\//g, "_");
  let end = translated.length;
  while (end > 0 && translated.charCodeAt(end - 1) === 61) end -= 1;
  return translated.slice(0, end);
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x2000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export function encodeBytes(format, bytes) {
  const list = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (format === "base64") return bytesToBase64(list);
  if (format === "base64url") {
    return toBase64Url(bytesToBase64(list));
  }
  if (format === "hex") {
    return Array.from(list, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  if (format === "binary") {
    return Array.from(list, (byte) => byte.toString(2).padStart(8, "0")).join(" ");
  }
  throw new Error("Binary files can be encoded as Base64, Base64 URL, Hex, or Binary.");
}

export const FormatConverter = {
  base64: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      let binary = "";
      for (let index = 0; index < bytes.length; index += 1) {
        binary += String.fromCharCode(bytes[index]);
      }
      return btoa(binary);
    },
    decode: (input) => {
      let binary;
      try {
        binary = atob(input);
      } catch {
        throw new Error("Invalid Base64");
      }
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      return new TextDecoder().decode(bytes);
    },
    name: "Base64",
  },

  base64url: {
    encode: (input) => {
      const encoded = FormatConverter.base64.encode(input);
      return toBase64Url(encoded);
    },
    decode: (input) => {
      let padded = input.replace(/-/g, "+").replace(/_/g, "/");
      while (padded.length % 4) padded += "=";
      return FormatConverter.base64.decode(padded);
    },
    name: "URL-Safe Base64",
  },

  hex: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    },
    decode: (input) => {
      if (input.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
      }
      const bytePairs = input.match(/.{2}/g) || [];
      const bytes = new Uint8Array(bytePairs.map((pair) => Number.parseInt(pair, 16)));
      return new TextDecoder().decode(bytes);
    },
    name: "Hexadecimal",
  },

  binary: {
    encode: (input) => {
      const bytes = new TextEncoder().encode(input);
      return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(" ");
    },
    decode: (input) => {
      const bits = input.trim().split(/\s+/).filter(Boolean);
      const bytes = new Uint8Array(bits.map((bin) => Number.parseInt(bin, 2)));
      return new TextDecoder().decode(bytes);
    },
    name: "Binary",
  },

  url: {
    encode: (input) => encodeURIComponent(input),
    decode: (input) => {
      try {
        return decodeURIComponent(input);
      } catch {
        throw new Error("Invalid URL encoding");
      }
    },
    name: "URL Encoding",
  },
};
