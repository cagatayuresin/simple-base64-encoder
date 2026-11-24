import assert from "node:assert/strict";
import { test } from "node:test";
import { FileHandler } from "../src/js/fileHandler.js";

test("getFileInfo formats bytes, kilobytes, megabytes, and unknown types", () => {
  const bytes = FileHandler.getFileInfo({ name: "note.txt", size: 12, type: "", lastModified: 0 });
  const kilobytes = FileHandler.getFileInfo({
    name: "note.txt",
    size: 1536,
    type: "text/plain",
    lastModified: 0,
  });
  const megabytes = FileHandler.getFileInfo({
    name: "note.txt",
    size: 2 * 1024 * 1024,
    type: "text/plain",
    lastModified: 0,
  });

  assert.equal(bytes.sizeFormatted, "12 B");
  assert.equal(bytes.type, "Unknown");
  assert.equal(bytes.size, 12);
  assert.equal(kilobytes.sizeFormatted, "1.50 KB");
  assert.equal(kilobytes.type, "text/plain");
  assert.equal(megabytes.sizeFormatted, "2.00 MB");
  assert.equal(typeof bytes.lastModified, "string");
});

test("isBinaryFile classifies text, binary, extensions, and unknown files", () => {
  const cases = [
    [{ type: "TEXT/PLAIN", name: "NOTE.TXT", size: 4 }, false],
    [{ type: "application/json", name: "data.json", size: 4 }, false],
    [{ type: "application/xml", name: "data.xml", size: 4 }, false],
    [{ type: "application/javascript", name: "app.js", size: 4 }, false],
    [{ type: "application/xhtml+xml", name: "page.html", size: 4 }, false],
    [{ type: "image/svg+xml", name: "icon.svg", size: 4 }, false],
    [{ type: "image/png", name: "pixel.png", size: 4 }, true],
    [{ type: "audio/mpeg", name: "song.mp3", size: 4 }, true],
    [{ type: "video/mp4", name: "clip.mp4", size: 4 }, true],
    [{ type: "font/woff", name: "face.woff", size: 4 }, true],
    [{ type: "application/pdf", name: "doc.pdf", size: 4 }, true],
    [{ type: "application/zip", name: "pack.zip", size: 4 }, true],
    [{ type: "application/gzip", name: "pack.gz", size: 4 }, true],
    [{ type: "application/octet-stream", name: "data.bin", size: 4 }, true],
    [{ type: "application/wasm", name: "app.wasm", size: 4 }, true],
    [{ type: "", name: "notes.svg", size: 4 }, false],
    [{ type: "", name: "clip.mp4", size: 4 }, true],
    [{ type: "", name: "archive.gz", size: 20 }, true],
    [{ type: "", name: "readme.md", size: 20 }, false],
    [{ type: "", name: "table.csv", size: 20 }, false],
    [{ type: "", name: "page.htm", size: 20 }, false],
    [{ type: "", name: "photo.jpeg", size: 20 }, true],
    [{ type: "", name: "photo.webp", size: 20 }, true],
    [{ type: "", name: "icon.ico", size: 20 }, true],
    [{ type: "", name: "font.woff2", size: 20 }, true],
    [{ name: "scratch", size: 32 }, false],
    [{ size: 8 }, false],
    [{ type: "image/png", size: 8 }, true],
    [{ name: "scratch", size: 64 * 1024 }, false],
    [{ name: "scratch", size: 64 * 1024 + 1 }, true],
    [{ type: "application/x-custom", name: "blob", size: 8 }, true],
  ];

  cases.forEach(([file, binary]) => {
    assert.equal(FileHandler.isBinaryFile(file), binary, `${file.name} ${file.type}`);
  });
});

test("readAsText resolves text and rejects a reader error", async () => {
  const file = new File(["Merhaba"], "note.txt", { type: "text/plain" });
  assert.equal(await FileHandler.readAsText(file), "Merhaba");
  await assert.rejects(
    FileHandler.readAsText({ text: () => Promise.reject(new Error("nope")) }),
    /Failed to read file/,
  );
});
