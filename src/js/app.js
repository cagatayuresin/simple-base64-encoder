import { FormatConverter, encodeBytes } from "./converters.js";
import { FileHandler } from "./fileHandler.js";
import { applyTheme, readPreference, savePreference, watchSystemTheme } from "./theme.js";

const STATE_KEY = "encoder-state";
const CONSENT_KEY = "ga_consent_v1";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const PERSIST_LIMIT = 100000;
const DEFAULT_ROWS = 3;

const LABELS = {
  base64: ["Base64", "Text"],
  base64url: ["Base64 URL", "Text"],
  hex: ["Hex", "Text"],
  binary: ["Binary", "Text"],
  url: ["URL encoded", "Text"],
  json: ["Pretty JSON", "JSON"],
};

const ICONS = {
  copy: '<path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path>',
  trash:
    '<path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>',
  alert: '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
  check: '<path d="M5 12l5 5l10 -10"></path>',
};

const rowsEl = document.getElementById("rows");
const sheetEl = document.getElementById("sheet");
const toastsEl = document.getElementById("toasts");
const removeRowButton = document.getElementById("removeRow");

let nextId = 1;
const errorTimers = new Map();

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function track(name, params) {
  if (typeof gtag === "function") gtag("event", name, params);
}

function selectedFormat() {
  const checked = document.querySelector('input[name="format"]:checked');
  return checked ? checked.value : "base64";
}

function setChecked(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function labelsFor(format) {
  return LABELS[format] || LABELS.base64;
}

function pushToast(message, type) {
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.innerHTML = icon(type === "error" ? "alert" : "check");
  const text = document.createElement("span");
  text.textContent = message;
  item.append(text);
  toastsEl.append(item);
  while (toastsEl.children.length > 3) toastsEl.firstElementChild.remove();
  setTimeout(() => item.remove(), 3200);
}

function showError(message) {
  pushToast(message, "error");
}

function showSuccess(message) {
  pushToast(message, "success");
}

function autoResize(textarea) {
  const max = 144;
  textarea.style.height = "auto";
  const next = Math.min(textarea.scrollHeight, max);
  textarea.style.height = `${next}px`;
  textarea.style.overflowY = textarea.scrollHeight > max ? "auto" : "hidden";
}

function updateLabels() {
  const [encoded, plain] = labelsFor(selectedFormat());
  document.getElementById("encodedHead").textContent = encoded;
  document.getElementById("plainHead").textContent = plain;
  rowsEl.querySelectorAll(".row").forEach((row) => {
    row.querySelector(".field-encoded .field-label").textContent = encoded;
    row.querySelector(".field-plain .field-label").textContent = plain;
    row.querySelector('[data-side="encoded"]').placeholder = encoded;
    row.querySelector('[data-side="plain"]').placeholder = plain;
    row.querySelector(".field-encoded .field-copy").setAttribute("aria-label", `Copy ${encoded}`);
    row.querySelector(".field-plain .field-copy").setAttribute("aria-label", `Copy ${plain}`);
  });
}

function renumber() {
  const rows = [...rowsEl.children];
  rows.forEach((row, index) => {
    row.querySelector(".row-index").textContent = String(index + 1);
  });
  removeRowButton.disabled = rows.length <= 1;
}

function scheduleError(row, message) {
  clearTimeout(errorTimers.get(row));
  errorTimers.set(
    row,
    setTimeout(() => showError(message), 350),
  );
}

function clearPendingError(row) {
  clearTimeout(errorTimers.get(row));
  errorTimers.delete(row);
}

function convertRow(row, source) {
  const format = selectedFormat();
  const converter = FormatConverter[format];
  const encoded = row.querySelector('[data-side="encoded"]');
  const plain = row.querySelector('[data-side="plain"]');
  const from = source === "encoded" ? encoded : plain;
  const to = source === "encoded" ? plain : encoded;
  row.dataset.source = source;

  if (!from.value) {
    to.value = "";
    autoResize(from);
    autoResize(to);
    clearPendingError(row);
    return;
  }

  try {
    to.value = source === "encoded" ? converter.decode(from.value) : converter.encode(from.value);
    autoResize(from);
    autoResize(to);
    clearPendingError(row);
  } catch (error) {
    autoResize(from);
    scheduleError(row, error.message || "Conversion failed.");
  }
}

function persist() {
  const rows = [...rowsEl.querySelectorAll(".row")].map((row) => {
    const encoded = row.querySelector('[data-side="encoded"]').value;
    const plain = row.querySelector('[data-side="plain"]').value;
    return {
      encoded: encoded.length <= PERSIST_LIMIT ? encoded : "",
      plain: plain.length <= PERSIST_LIMIT ? plain : "",
      source: row.dataset.source === "encoded" ? "encoded" : "plain",
    };
  });
  storageSet(STATE_KEY, JSON.stringify({ format: selectedFormat(), rows }));
}

function bindField(row, textarea, source) {
  textarea.addEventListener("input", () => {
    convertRow(row, source);
    persist();
  });
}

function createRow(data = { encoded: "", plain: "", source: "plain" }) {
  const id = nextId;
  nextId += 1;
  const [encodedLabel, plainLabel] = labelsFor(selectedFormat());
  const row = document.createElement("article");
  row.className = "row";
  row.dataset.source = data.source === "encoded" ? "encoded" : "plain";

  const index = document.createElement("span");
  index.className = "row-index";
  index.textContent = "1";

  const encodedField = buildField({
    id: `encoded-${id}`,
    side: "encoded",
    label: encodedLabel,
    value: data.encoded || "",
    fieldClass: "field-encoded",
  });
  const plainField = buildField({
    id: `plain-${id}`,
    side: "plain",
    label: plainLabel,
    value: data.plain || "",
    fieldClass: "field-plain",
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button icon-button-danger row-delete";
  remove.setAttribute("aria-label", "Delete row");
  remove.innerHTML = icon("trash");
  remove.addEventListener("click", () => deleteRow(row));

  row.append(index, encodedField, plainField, remove);
  rowsEl.append(row);

  const encodedInput = encodedField.querySelector("textarea");
  const plainInput = plainField.querySelector("textarea");
  bindField(row, encodedInput, "encoded");
  bindField(row, plainInput, "plain");
  encodedField.querySelector(".field-copy").addEventListener("click", () => copyText(encodedInput.value));
  plainField.querySelector(".field-copy").addEventListener("click", () => copyText(plainInput.value));
  autoResize(encodedInput);
  autoResize(plainInput);
  renumber();
  return row;
}

function buildField({ id, side, label, value, fieldClass }) {
  const field = document.createElement("div");
  field.className = `field ${fieldClass}`;

  const fieldLabel = document.createElement("label");
  fieldLabel.className = "field-label";
  fieldLabel.htmlFor = id;
  fieldLabel.textContent = label;

  const box = document.createElement("div");
  box.className = "field-box";

  const textarea = document.createElement("textarea");
  textarea.id = id;
  textarea.className = "editor";
  textarea.dataset.side = side;
  textarea.rows = 1;
  textarea.spellcheck = false;
  textarea.autocomplete = "off";
  textarea.autocapitalize = "off";
  textarea.placeholder = label;
  textarea.value = value;

  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "icon-button field-copy";
  copy.setAttribute("aria-label", `Copy ${label}`);
  copy.innerHTML = icon("copy");

  box.append(textarea, copy);
  field.append(fieldLabel, box);
  return field;
}

function deleteRow(row) {
  clearPendingError(row);
  if (rowsEl.children.length <= 1) {
    row.querySelectorAll("textarea").forEach((textarea) => {
      textarea.value = "";
      autoResize(textarea);
    });
    persist();
    showSuccess("Row cleared.");
    return;
  }
  row.remove();
  renumber();
  persist();
  showSuccess("Row deleted.");
}

function addRow() {
  const row = createRow();
  persist();
  row.querySelector('[data-side="encoded"]').focus();
  showSuccess("Row added.");
}

function removeLastRow() {
  const last = rowsEl.lastElementChild;
  if (!last || rowsEl.children.length <= 1) return;
  deleteRow(last);
}

function clearAll() {
  errorTimers.forEach((timer) => clearTimeout(timer));
  errorTimers.clear();
  rowsEl.replaceChildren();
  for (let index = 0; index < DEFAULT_ROWS; index += 1) createRow();
  persist();
  showSuccess("Cleared all rows.");
}

async function copyText(value) {
  if (!value) {
    showError("Nothing to copy.");
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    showSuccess("Copied.");
    track("copy_content", { format: selectedFormat() });
  } catch {
    showError("Copy failed. Select the text and copy it manually.");
  }
}

function emptyRow() {
  return [...rowsEl.children].find((row) => {
    const encoded = row.querySelector('[data-side="encoded"]').value;
    const plain = row.querySelector('[data-side="plain"]').value;
    return !encoded && !plain;
  });
}

async function loadFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;
  const format = selectedFormat();
  let loaded = 0;

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      showError(`${file.name} is larger than 5 MB and was skipped.`);
      continue;
    }

    try {
      const row = emptyRow() || createRow();
      if (FileHandler.isBinaryFile(file)) {
        if (format === "url" || format === "json") {
          showError("Binary files can be encoded as Base64, Base64 URL, Hex, or Binary.");
          continue;
        }
        const bytes = new Uint8Array(await file.arrayBuffer());
        const encoded = row.querySelector('[data-side="encoded"]');
        const plain = row.querySelector('[data-side="plain"]');
        encoded.value = encodeBytes(format, bytes);
        plain.value = "";
        row.dataset.source = "encoded";
        autoResize(encoded);
        autoResize(plain);
      } else {
        row.querySelector('[data-side="plain"]').value = await FileHandler.readAsText(file);
        convertRow(row, "plain");
      }
      loaded += 1;
    } catch {
      showError(`${file.name} could not be read.`);
    }
  }

  if (loaded) {
    persist();
    showSuccess(loaded === 1 ? `Loaded ${files[0].name}.` : `Loaded ${loaded} files.`);
    track("file_open", { count: loaded });
  }
}

function restore() {
  const raw = storageGet(STATE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.rows) || !data.rows.length) return false;
    if (LABELS[data.format]) setChecked("format", data.format);
    data.rows.forEach((row) => {
      createRow({
        encoded: typeof row.encoded === "string" ? row.encoded : "",
        plain: typeof row.plain === "string" ? row.plain : "",
        source: row.source,
      });
    });
    return true;
  } catch {
    return false;
  }
}

function reconvertAll() {
  updateLabels();
  rowsEl.querySelectorAll(".row").forEach((row) => {
    const source = row.dataset.source === "encoded" ? "encoded" : "plain";
    const encoded = row.querySelector('[data-side="encoded"]').value;
    const plain = row.querySelector('[data-side="plain"]').value;
    if (!encoded && !plain) {
      updateLabels();
      return;
    }
    convertRow(row, source === "encoded" && encoded ? "encoded" : "plain");
  });
  persist();
}

function initTheme() {
  const preference = readPreference();
  applyTheme(preference);
  setChecked("theme", preference);
  document.querySelectorAll('input[name="theme"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      savePreference(input.value);
      applyTheme(input.value);
      track("theme_select", { theme: input.value });
    });
  });
  watchSystemTheme(readPreference);
}

function initConsent() {
  const banner = document.getElementById("analyticsConsent");
  const saved = storageGet(CONSENT_KEY);
  if (saved === "accepted" && typeof gtag === "function") {
    gtag("consent", "update", { analytics_storage: "granted" });
  }
  if (saved !== "accepted" && saved !== "declined") banner.hidden = false;

  document.getElementById("gaAccept").addEventListener("click", () => {
    if (typeof gtag === "function") gtag("consent", "update", { analytics_storage: "granted" });
    storageSet(CONSENT_KEY, "accepted");
    banner.hidden = true;
    showSuccess("Analytics enabled.");
  });

  document.getElementById("gaDecline").addEventListener("click", () => {
    if (typeof gtag === "function") gtag("consent", "update", { analytics_storage: "denied" });
    storageSet(CONSENT_KEY, "declined");
    banner.hidden = true;
    showSuccess("Analytics disabled.");
  });
}

function initInstall() {
  let deferredPrompt = null;
  const installBtn = document.getElementById("installBtn");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    track("pwa_install", { outcome: choice.outcome });
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installBtn.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* Offline support is optional if registration fails. */
    });
  }
}

function initDragAndDrop() {
  let dragDepth = 0;

  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => {
    event.preventDefault();
    if (sheetEl.contains(event.target)) return;
    if (event.dataTransfer?.files?.length) loadFiles(event.dataTransfer.files);
  });

  sheetEl.addEventListener("dragenter", (event) => {
    event.preventDefault();
    dragDepth += 1;
    sheetEl.classList.add("is-dragover");
  });
  sheetEl.addEventListener("dragover", (event) => event.preventDefault());
  sheetEl.addEventListener("dragleave", () => {
    dragDepth -= 1;
    if (dragDepth <= 0) {
      dragDepth = 0;
      sheetEl.classList.remove("is-dragover");
    }
  });
  sheetEl.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth = 0;
    sheetEl.classList.remove("is-dragover");
    if (event.dataTransfer?.files?.length) loadFiles(event.dataTransfer.files);
  });
}

document.querySelectorAll('input[name="format"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    reconvertAll();
    track("format_change", { format: input.value });
  });
});

document.getElementById("addRow").addEventListener("click", addRow);
removeRowButton.addEventListener("click", removeLastRow);
document.getElementById("clearAll").addEventListener("click", clearAll);
document.getElementById("fileInput").addEventListener("change", (event) => {
  const { files } = event.target;
  if (files?.length) loadFiles(files);
  event.target.value = "";
});

initTheme();
initConsent();
initInstall();
initDragAndDrop();
if (!restore()) {
  for (let index = 0; index < DEFAULT_ROWS; index += 1) createRow();
}
updateLabels();
