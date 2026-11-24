/**
 * File reading and a small text-versus-binary heuristic.
 */

export const FileHandler = {
  readAsText: (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    }),

  getFileInfo: (file) => {
    const sizeInBytes = file.size;
    let sizeFormatted;
    if (sizeInBytes < 1024) {
      sizeFormatted = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeFormatted = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      sizeFormatted = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    return {
      name: file.name,
      size: sizeInBytes,
      sizeFormatted,
      type: file.type || "Unknown",
      lastModified: new Date(file.lastModified).toLocaleString(),
    };
  },

  isBinaryFile: (file) => {
    const type = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();
    const textTypes = [
      "text/",
      "application/json",
      "application/xml",
      "application/javascript",
      "application/xhtml+xml",
      "image/svg+xml",
    ];
    if (type && textTypes.some((prefix) => type.startsWith(prefix))) return false;

    const binaryTypes = [
      "image/",
      "audio/",
      "video/",
      "font/",
      "application/pdf",
      "application/zip",
      "application/gzip",
      "application/octet-stream",
      "application/wasm",
    ];
    if (type && binaryTypes.some((prefix) => type.startsWith(prefix))) return true;

    const textExtensions = [
      ".txt",
      ".md",
      ".csv",
      ".tsv",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".js",
      ".ts",
      ".css",
      ".html",
      ".htm",
      ".svg",
    ];
    if (textExtensions.some((extension) => name.endsWith(extension))) return false;

    const binaryExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".webp",
      ".pdf",
      ".zip",
      ".gz",
      ".wasm",
      ".woff",
      ".woff2",
      ".ico",
      ".mp3",
      ".mp4",
    ];
    if (binaryExtensions.some((extension) => name.endsWith(extension))) return true;

    if (!type && file.size <= 64 * 1024) return false;
    return true;
  },
};
