import assert from "node:assert/strict";
import { test } from "node:test";
import { applyTheme, readPreference, resolveTheme, savePreference, watchSystemTheme } from "../src/js/theme.js";

function installEnvironment({ stored, matches = false, meta = true } = {}) {
  const store = new Map();
  if (stored !== undefined) store.set("theme", stored);
  let read = (key) => (store.has(key) ? store.get(key) : null);
  globalThis.localStorage = {
    getItem: (key) => read(key),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
  const root = {
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
  };
  const themeMeta = meta ? { content: "", setAttribute(name, value) { this[name] = value; } } : null;
  globalThis.document = {
    documentElement: root,
    querySelector: (selector) => (selector === 'meta[name="theme-color"]' ? themeMeta : null),
  };
  const media = {
    matches,
    listeners: [],
    addEventListener(type, listener) {
      this.listeners.push(listener);
    },
    removeEventListener(type, listener) {
      this.listeners = this.listeners.filter((item) => item !== listener);
    },
  };
  globalThis.window = {
    matchMedia: () => media,
  };
  return {
    store,
    root,
    themeMeta,
    media,
    blockReads() {
      read = () => {
        throw new Error("blocked");
      };
    },
    blockWrites() {
      globalThis.localStorage.setItem = () => {
        throw new Error("blocked");
      };
    },
  };
}

test("readPreference keeps a stored choice and falls back to system", () => {
  installEnvironment({ stored: "dark" });
  assert.equal(readPreference(), "dark");
  installEnvironment({ stored: "light" });
  assert.equal(readPreference(), "light");
  installEnvironment({ stored: "system" });
  assert.equal(readPreference(), "system");
  installEnvironment({ stored: "blue" });
  assert.equal(readPreference(), "system");
  installEnvironment();
  assert.equal(readPreference(), "system");

  const env = installEnvironment({ stored: "dark" });
  env.blockReads();
  assert.equal(readPreference(), "system");
});

test("resolveTheme follows an explicit choice or the system scheme", () => {
  installEnvironment({ matches: true });
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("system"), "dark");
  installEnvironment({ matches: false });
  assert.equal(resolveTheme("system"), "light");
});

test("applyTheme writes the resolved theme and the theme color", () => {
  const env = installEnvironment({ matches: false });
  assert.equal(applyTheme("dark"), "dark");
  assert.equal(env.root.attrs["data-theme"], "dark");
  assert.equal(env.root.attrs["data-theme-preference"], "dark");
  assert.equal(env.themeMeta.content, "#252A34");

  applyTheme("system");
  assert.equal(env.root.attrs["data-theme"], "light");
  assert.equal(env.themeMeta.content, "#EAEAEA");

  const bare = installEnvironment({ matches: true, meta: false });
  assert.equal(applyTheme("system"), "dark");
  assert.equal(bare.root.attrs["data-theme"], "dark");
});

test("savePreference stores the choice and ignores blocked storage", () => {
  const env = installEnvironment();
  savePreference("light");
  assert.equal(env.store.get("theme"), "light");
  env.blockWrites();
  assert.doesNotThrow(() => savePreference("dark"));
});

test("watchSystemTheme reacts only while the preference is system", () => {
  const env = installEnvironment({ matches: false });
  let preference = "light";
  const stop = watchSystemTheme(() => preference);
  env.media.matches = true;
  env.media.listeners[0]();
  assert.equal(env.root.attrs["data-theme"], undefined);

  preference = "system";
  env.media.listeners[0]();
  assert.equal(env.root.attrs["data-theme"], "dark");

  stop();
  assert.equal(env.media.listeners.length, 0);
});
