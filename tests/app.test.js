import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { FormatConverter } from "../src/js/converters.js";

const realTimeout = globalThis.setTimeout;
const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../index.html"), "utf8").replace(
  /<script[\s\S]*?<\/script>/g,
  "",
);

function wait(ms) {
  return new Promise((resolve) => realTimeout(resolve, ms));
}

function boot() {
  const dom = new JSDOM(html, {
    url: "https://cagatayuresin.github.io/simple-base64-encoder/",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const media = {
    matches: false,
    listeners: [],
    addEventListener(type, listener) {
      this.listeners.push(listener);
    },
    removeEventListener(type, listener) {
      this.listeners = this.listeners.filter((item) => item !== listener);
    },
  };
  window.matchMedia = () => media;

  let writeText = async () => {};
  const navigator = globalThis.navigator;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: (value) => writeText(value) },
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { register: () => Promise.resolve({ active: true }) },
  });

  const toastTimers = [];
  const clearNative = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, ms, ...args) => {
    if (ms === 3200) {
      toastTimers.push(fn);
      return -toastTimers.length;
    }
    return realTimeout(fn, ms, ...args);
  };
  globalThis.clearTimeout = (id) => {
    if (typeof id === "number" && id < 0) return undefined;
    return clearNative(id);
  };

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.localStorage = window.localStorage;
  globalThis.AbortController = window.AbortController;
  globalThis.File = window.File;
  globalThis.FileReader = window.FileReader;
  globalThis.Blob = window.Blob;
  globalThis.HTMLElement = window.HTMLElement;
  window.setTimeout = globalThis.setTimeout;
  window.clearTimeout = globalThis.clearTimeout;

  return {
    window,
    document: window.document,
    media,
    toastTimers,
    setWriteText(next) {
      writeText = next;
    },
  };
}

const ctx = boot();
const { window, document } = ctx;

function toastText() {
  return [...document.querySelectorAll(".toast span")].map((node) => node.textContent);
}

function rows() {
  return [...document.querySelectorAll(".row")];
}

function field(row, side) {
  return row.querySelector(`[data-side="${side}"]`);
}

function typeInto(textarea, value) {
  textarea.value = value;
  textarea.dispatchEvent(new window.Event("input", { bubbles: true }));
}

function choose(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  input.checked = true;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
  return input;
}

async function until(fn) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (fn()) return;
    await wait(20);
  }
  throw new Error("Timed out waiting for the page to update");
}

function fileOf(name, contents, type) {
  return new window.File([contents], name, { type });
}

function fresh() {
  window.localStorage.removeItem("encoder-state");
  window.localStorage.removeItem("ga_consent_v1");
  ctx.app.startApp();
}

test("starts with three rows and an admin example", async () => {
  const app = await import("../src/js/app.js");
  ctx.app = app;
  assert.equal(rows().length, 3);
  assert.equal(field(rows()[0], "plain").value, "admin");
  assert.equal(field(rows()[0], "encoded").value, FormatConverter.base64.encode("admin"));
  assert.equal(field(rows()[1], "plain").value, "");
  assert.deepEqual(
    rows().map((row) => row.querySelector(".row-index").textContent),
    ["1", "2", "3"],
  );
  assert.equal(document.querySelector('input[value="json"]'), null);
  assert.equal(document.querySelector(".site-footer a").getAttribute("href"), "https://cagatayuresin.com");
  assert.equal(document.querySelectorAll(".site-footer svg").length, 5);
  assert.equal(document.getElementById("analyticsConsent").hidden, false);
  assert.equal(document.getElementById("installBtn").hidden, true);
  assert.equal(document.getElementById("removeRow").disabled, false);
});

test("converts either side and reports invalid input", async () => {
  const row = rows()[0];
  typeInto(field(row, "plain"), "Merhaba");
  assert.equal(field(row, "encoded").value, FormatConverter.base64.encode("Merhaba"));
  assert.equal(row.dataset.source, "plain");

  const second = rows()[1];
  typeInto(field(second, "encoded"), FormatConverter.base64.encode("A"));
  assert.equal(field(second, "plain").value, "A");
  assert.equal(second.dataset.source, "encoded");
  typeInto(field(second, "encoded"), "");
  assert.equal(field(second, "plain").value, "");

  typeInto(field(second, "encoded"), "%%%");
  typeInto(field(second, "encoded"), FormatConverter.base64.encode("A"));
  await wait(400);
  assert.equal(toastText().includes("Invalid Base64"), false);
  assert.equal(field(second, "plain").value, "A");

  typeInto(field(rows()[2], "encoded"), "%%%");
  await wait(400);
  assert.equal(toastText().includes("Invalid Base64"), true);
  assert.equal(field(rows()[2], "plain").value, "");

  const saved = JSON.parse(window.localStorage.getItem("encoder-state"));
  assert.equal(saved.rows[0].source, "plain");
  assert.equal(saved.rows[1].source, "encoded");
  assert.equal(saved.format, "base64");
});

test("adds, removes, deletes, and clears rows", () => {
  document.getElementById("toasts").replaceChildren();
  document.getElementById("addRow").click();
  assert.equal(rows().length, 4);
  assert.equal(rows()[3].querySelector(".row-index").textContent, "4");
  document.getElementById("addRow").click();
  document.getElementById("addRow").click();
  document.getElementById("addRow").click();
  assert.equal(document.querySelectorAll(".toast").length, 3);

  document.getElementById("removeRow").click();
  assert.equal(rows().length, 6);
  assert.equal(toastText().includes("Row deleted."), true);

  while (rows().length > 1) rows()[0].querySelector(".row-delete").click();
  assert.equal(rows().length, 1);
  rows()[0].querySelector(".row-delete").click();
  assert.equal(field(rows()[0], "plain").value, "");
  assert.equal(toastText().includes("Row cleared."), true);

  const remove = document.getElementById("removeRow");
  remove.disabled = false;
  remove.click();
  assert.equal(rows().length, 1);

  document.getElementById("clearAll").click();
  assert.equal(rows().length, 3);
  assert.equal(toastText().includes("Cleared all rows."), true);
});

test("copies text and reports an empty or rejected clipboard", async () => {
  document.getElementById("toasts").replaceChildren();
  const row = rows()[0];
  row.querySelector(".field-copy").click();
  assert.equal(toastText().includes("Nothing to copy."), true);

  typeInto(field(row, "plain"), "Merhaba");
  let copied = "";
  ctx.setWriteText(async (value) => {
    copied = value;
  });
  row.querySelector(".field-plain .field-copy").click();
  await wait(0);
  assert.equal(copied, "Merhaba");
  assert.equal(toastText().includes("Copied."), true);

  ctx.setWriteText(async () => {
    throw new Error("blocked");
  });
  row.querySelector(".field-plain .field-copy").click();
  await wait(0);
  assert.equal(toastText().includes("Copy failed. Select the text and copy it manually."), true);
});

test("reconverted rows follow the selected format", async () => {
  document.getElementById("toasts").replaceChildren();
  const encodedInput = document.querySelector('input[name="format"][value="base64"]');
  encodedInput.checked = false;
  encodedInput.dispatchEvent(new window.Event("change"));

  choose("format", "hex");
  assert.equal(document.getElementById("encodedHead").textContent, "Hex");
  assert.equal(field(rows()[0], "encoded").value, FormatConverter.hex.encode("Merhaba"));
  assert.equal(field(rows()[1], "plain").value, "");

  rows()[1].dataset.source = "encoded";
  field(rows()[1], "encoded").value = "";
  field(rows()[1], "plain").value = "A";
  choose("format", "base64");
  assert.equal(field(rows()[1], "encoded").value, FormatConverter.base64.encode("A"));

  choose("format", "url");
  typeInto(field(rows()[2], "encoded"), "%");
  await wait(400);
  assert.equal(toastText().includes("Invalid URL encoding"), true);
});

test("loads text and binary files and skips files it cannot encode", async () => {
  fresh();
  choose("format", "base64");
  const input = document.getElementById("fileInput");
  input.dispatchEvent(new window.Event("change"));

  const note = fileOf("note.txt", "Merhaba", "text/plain");
  Object.defineProperty(input, "files", { configurable: true, value: [note] });
  input.dispatchEvent(new window.Event("change"));
  await until(() => rows().some((row) => field(row, "plain").value === "Merhaba"));
  const loadedNote = rows().find((row) => field(row, "plain").value === "Merhaba");
  assert.equal(field(loadedNote, "encoded").value, FormatConverter.base64.encode("Merhaba"));
  assert.equal(toastText().includes("Loaded note.txt."), true);

  document.getElementById("toasts").replaceChildren();
  const second = fileOf("other.txt", "A", "text/plain");
  Object.defineProperty(input, "files", { configurable: true, value: [note, second] });
  input.dispatchEvent(new window.Event("change"));
  await until(() => toastText().includes("Loaded 2 files."));

  document.getElementById("toasts").replaceChildren();
  const image = fileOf("pixel.png", new Uint8Array([0xff]), "image/png");
  Object.defineProperty(input, "files", { configurable: true, value: [image] });
  input.dispatchEvent(new window.Event("change"));
  await until(() => toastText().includes("Loaded pixel.png."));
  const binaryRow = rows().find((row) => field(row, "encoded").value === "/w==");
  assert.ok(binaryRow);
  assert.equal(field(binaryRow, "plain").value, "");

  document.getElementById("toasts").replaceChildren();
  choose("format", "url");
  Object.defineProperty(input, "files", { configurable: true, value: [image] });
  input.dispatchEvent(new window.Event("change"));
  await wait(0);
  assert.equal(toastText().includes("Binary files can be encoded as Base64, Base64 URL, Hex, or Binary."), true);

  const big = fileOf("big.txt", "x", "text/plain");
  Object.defineProperty(big, "size", { value: 5 * 1024 * 1024 + 1 });
  Object.defineProperty(input, "files", { configurable: true, value: [big] });
  input.dispatchEvent(new window.Event("change"));
  await wait(0);
  assert.equal(toastText().includes("big.txt is larger than 5 MB and was skipped."), true);

  const originalReader = window.FileReader;
  window.FileReader = class {
    readAsText() {
      this.onerror();
    }
  };
  globalThis.FileReader = window.FileReader;
  const broken = fileOf("bad.txt", "x", "text/plain");
  Object.defineProperty(input, "files", { configurable: true, value: [broken] });
  input.dispatchEvent(new window.Event("change"));
  await wait(0);
  assert.equal(toastText().includes("bad.txt could not be read."), true);
  window.FileReader = originalReader;
  globalThis.FileReader = originalReader;

  Object.defineProperty(input, "files", { configurable: true, get: () => undefined });
  input.dispatchEvent(new window.Event("change"));
});

test("accepts dropped files and tracks drag depth", async () => {
  fresh();
  choose("format", "base64");
  const sheet = document.getElementById("sheet");
  sheet.dispatchEvent(new window.Event("dragenter", { bubbles: true, cancelable: true }));
  sheet.dispatchEvent(new window.Event("dragenter", { bubbles: true, cancelable: true }));
  assert.equal(sheet.classList.contains("is-dragover"), true);
  sheet.dispatchEvent(new window.Event("dragleave"));
  assert.equal(sheet.classList.contains("is-dragover"), true);
  sheet.dispatchEvent(new window.Event("dragleave"));
  assert.equal(sheet.classList.contains("is-dragover"), false);
  sheet.dispatchEvent(new window.Event("dragleave"));

  const over = new window.Event("dragover", { cancelable: true });
  window.dispatchEvent(over);
  assert.equal(over.defaultPrevented, true);
  sheet.dispatchEvent(new window.Event("dragover", { cancelable: true }));

  const outside = new window.Event("drop", { cancelable: true });
  window.dispatchEvent(outside);

  const empty = new window.Event("drop", { bubbles: true, cancelable: true });
  empty.dataTransfer = { files: [] };
  sheet.dispatchEvent(empty);
  assert.equal(sheet.classList.contains("is-dragover"), false);

  const dropped = fileOf("drop.txt", "Hi", "text/plain");
  const sheetDrop = new window.Event("drop", { bubbles: true, cancelable: true });
  sheetDrop.dataTransfer = { files: [dropped] };
  document.getElementById("toasts").replaceChildren();
  sheet.dispatchEvent(sheetDrop);
  await until(() => rows().some((row) => field(row, "plain").value === "Hi"));
  assert.equal(toastText().filter((text) => text.startsWith("Loaded")).length, 1);

  const outsideFile = fileOf("window.txt", "Out", "text/plain");
  const windowDrop = new window.Event("drop", { cancelable: true });
  windowDrop.dataTransfer = { files: [outsideFile] };
  window.dispatchEvent(windowDrop);
  await until(() => [...document.querySelectorAll('[data-side="plain"]')].some((node) => node.value === "Out"));
});

test("theme controls follow the selected and system preference", () => {
  const light = document.querySelector('input[name="theme"][value="light"]');
  light.dispatchEvent(new window.Event("change"));
  choose("theme", "dark");
  assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
  assert.equal(window.localStorage.getItem("theme"), "dark");

  ctx.media.matches = false;
  ctx.media.listeners.at(-1)();
  assert.equal(document.documentElement.getAttribute("data-theme"), "dark");

  choose("theme", "system");
  ctx.media.matches = true;
  ctx.media.listeners.at(-1)();
  assert.equal(document.documentElement.getAttribute("data-theme"), "dark");
  ctx.media.matches = false;
  ctx.media.listeners.at(-1)();
  assert.equal(document.documentElement.getAttribute("data-theme"), "light");
  choose("theme", "light");
});

test("restores saved rows and ignores broken state", () => {
  window.localStorage.setItem(
    "encoder-state",
    JSON.stringify({
      format: "hex",
      rows: [
        { encoded: "41", plain: "A", source: "encoded" },
        { encoded: "", plain: "", source: "plain" },
        { encoded: 5, plain: false, source: "nope" },
      ],
    }),
  );
  ctx.app.startApp();
  assert.equal(document.querySelector('input[name="format"]:checked').value, "hex");
  assert.equal(rows().length, 3);
  assert.equal(rows()[0].dataset.source, "encoded");
  assert.equal(field(rows()[0], "plain").value, "A");
  assert.equal(field(rows()[2], "encoded").value, "");
  assert.equal(rows()[2].dataset.source, "plain");

  window.localStorage.setItem("encoder-state", "{");
  ctx.app.startApp();
  assert.equal(rows().length, 3);

  window.localStorage.setItem("encoder-state", "null");
  ctx.app.startApp();
  assert.equal(rows().length, 3);

  window.localStorage.setItem("encoder-state", JSON.stringify({ format: "url" }));
  ctx.app.startApp();
  assert.equal(rows().length, 3);

  window.localStorage.setItem(
    "encoder-state",
    JSON.stringify({ format: "json", rows: [{ encoded: "x", plain: "y", source: "plain" }] }),
  );
  ctx.app.startApp();
  assert.equal(field(rows()[0], "plain").value, "y");
  assert.equal(document.querySelector('input[value="json"]'), null);

  window.localStorage.removeItem("encoder-state");
  ctx.app.startApp();
  assert.equal(rows().length, 3);
});

test("consent and analytics events honor the saved choice", () => {
  const calls = [];
  globalThis.gtag = (...args) => calls.push(args);
  const banner = document.getElementById("analyticsConsent");

  window.localStorage.setItem("ga_consent_v1", "accepted");
  ctx.app.startApp();
  assert.equal(calls.some((args) => args[0] === "consent" && args[2].analytics_storage === "granted"), true);

  window.localStorage.setItem("ga_consent_v1", "declined");
  banner.hidden = true;
  ctx.app.startApp();
  assert.equal(banner.hidden, true);

  window.localStorage.removeItem("ga_consent_v1");
  banner.hidden = true;
  ctx.app.startApp();
  assert.equal(banner.hidden, false);

  document.getElementById("gaAccept").click();
  assert.equal(window.localStorage.getItem("ga_consent_v1"), "accepted");
  assert.equal(banner.hidden, true);
  assert.equal(toastText().includes("Analytics enabled."), true);

  delete globalThis.gtag;
  window.localStorage.removeItem("ga_consent_v1");
  ctx.app.startApp();
  document.getElementById("gaDecline").click();
  assert.equal(window.localStorage.getItem("ga_consent_v1"), "declined");
  assert.equal(toastText().includes("Analytics disabled."), true);

  window.localStorage.setItem("ga_consent_v1", "accepted");
  ctx.app.startApp();
});

test("install prompt and service worker registration are optional", async () => {
  const installBtn = document.getElementById("installBtn");
  installBtn.hidden = false;
  installBtn.click();
  assert.equal(installBtn.hidden, false);

  const calls = [];
  globalThis.gtag = (...args) => calls.push(args);
  let prompted = false;
  const prompt = new window.Event("beforeinstallprompt", { cancelable: true });
  prompt.prompt = () => {
    prompted = true;
  };
  prompt.userChoice = Promise.resolve({ outcome: "accepted" });
  window.dispatchEvent(prompt);
  assert.equal(prompt.defaultPrevented, true);
  assert.equal(installBtn.hidden, false);
  installBtn.click();
  await wait(0);
  assert.equal(prompted, true);
  assert.equal(installBtn.hidden, true);
  assert.equal(calls.some((args) => args[0] === "event" && args[1] === "pwa_install"), true);

  installBtn.hidden = false;
  window.dispatchEvent(new window.Event("appinstalled"));
  assert.equal(installBtn.hidden, true);

  const navigator = globalThis.navigator;
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
  delete navigator.serviceWorker;
  ctx.app.startApp();
  Object.defineProperty(navigator, "serviceWorker", descriptor);

  navigator.serviceWorker.register = () => Promise.reject(new Error("offline"));
  ctx.app.startApp();
  await wait(0);
  navigator.serviceWorker.register = () => Promise.resolve({ active: true });
  ctx.app.startApp();
  await wait(0);
});

test("keeps long values out of storage and grows a tall field", () => {
  window.localStorage.removeItem("encoder-state");
  window.localStorage.removeItem("ga_consent_v1");
  ctx.app.startApp();
  const area = field(rows()[0], "plain");
  Object.defineProperty(area, "scrollHeight", { configurable: true, get: () => 400 });
  typeInto(area, "A");
  assert.equal(area.style.overflowY, "auto");

  const long = "a".repeat(100001);
  typeInto(area, long);
  const saved = JSON.parse(window.localStorage.getItem("encoder-state"));
  assert.equal(saved.rows[0].plain, "");
  assert.equal(saved.rows[0].encoded, "");

  document.querySelectorAll('input[name="format"]').forEach((input) => {
    input.checked = false;
  });
  typeInto(field(rows()[1], "plain"), "A");
  assert.equal(field(rows()[1], "encoded").value, FormatConverter.base64.encode("A"));

  const extra = document.createElement("input");
  extra.type = "radio";
  extra.name = "format";
  extra.value = "nope";
  document.querySelector(".format-switch").append(extra);
  ctx.app.startApp();
  extra.checked = true;
  extra.dispatchEvent(new window.Event("change"));
  assert.equal(document.getElementById("encodedHead").textContent, "Base64");

  document.getElementById("rows").replaceChildren();
  const remove = document.getElementById("removeRow");
  remove.disabled = false;
  remove.click();
  assert.equal(document.getElementById("rows").children.length, 0);

  const proto = Object.getPrototypeOf(window.localStorage);
  const setItem = proto.setItem;
  const getItem = proto.getItem;
  try {
    proto.setItem = () => {
      throw new Error("blocked");
    };
    ctx.app.startApp();
    typeInto(field(rows()[0], "plain"), "A");
    choose("theme", "dark");
    proto.getItem = () => {
      throw new Error("blocked");
    };
    assert.doesNotThrow(() => ctx.app.startApp());
  } finally {
    proto.setItem = setItem;
    proto.getItem = getItem;
  }

  ctx.toastTimers.splice(0).forEach((fn) => fn());
});
