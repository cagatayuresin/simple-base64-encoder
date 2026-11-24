import assert from "node:assert/strict";
import { test } from "node:test";
import { FormatConverter, encodeBytes } from "../src/js/converters.js";
import { FileHandler } from "../src/js/fileHandler.js";

const sample = "Çağatay Üresin — 64";
const textFormats = ["base64", "base64url", "hex", "binary", "url"];

textFormats.forEach((format) => {
  test(`${format} round-trips UTF-8 text`, () => {
    const encoded = FormatConverter[format].encode(sample);
    assert.equal(FormatConverter[format].decode(encoded), sample);
  });
});

test("base64url strips padding", () => {
  const encoded = FormatConverter.base64url.encode("any");
  assert.equal(encoded.includes("="), false);
  assert.equal(FormatConverter.base64url.decode(encoded), "any");
});

test("invalid base64 and url encoding throw plain errors", () => {
  assert.throws(() => FormatConverter.base64.decode("Çağatay"), /Invalid Base64/);
  assert.throws(() => FormatConverter.url.decode("%"), /Invalid URL encoding/);
});

test("invalid hex length throws", () => {
  assert.throws(() => FormatConverter.hex.decode("abc"), /Invalid hex string length/);
});

test("json pretty-prints and minifies", () => {
  const pretty = FormatConverter.json.encode('{"a":1}');
  assert.match(pretty, /\n/);
  assert.equal(FormatConverter.json.decode(pretty), '{"a":1}');
});

test("empty text round-trips", () => {
  assert.equal(FormatConverter.base64.encode(""), "");
  assert.equal(FormatConverter.base64.decode(""), "");
  assert.equal(FormatConverter.hex.encode(""), "");
  assert.equal(FormatConverter.url.encode(""), "");
});

test("file heuristic treats images as binary and notes as text", () => {
  const image = new File([new Uint8Array([1, 2, 3])], "pixel.png", { type: "image/png" });
  const note = new File(["hello"], "note.txt", { type: "text/plain" });
  assert.equal(FileHandler.isBinaryFile(image), true);
  assert.equal(FileHandler.isBinaryFile(note), false);
});

test("encodeBytes encodes raw bytes and rejects text-only formats", () => {
  const bytes = new Uint8Array([0xff]);
  assert.equal(encodeBytes("hex", bytes), "ff");
  assert.equal(encodeBytes("base64", bytes), "/w==");
  assert.equal(encodeBytes("base64url", bytes), "_w");
  assert.equal(encodeBytes("binary", bytes), "11111111");
  assert.throws(() => encodeBytes("url", bytes), /Binary files/);
  assert.throws(() => encodeBytes("json", bytes), /Binary files/);
});
