import Dexie from "dexie";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { IDBKeyRange, indexedDB } from "fake-indexeddb";

GlobalRegistrator.register({
  url: "http://localhost/"
});

Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

Object.assign(globalThis, {
  indexedDB,
  IDBKeyRange
});

Object.assign(window, {
  indexedDB,
  IDBKeyRange
});

Object.assign(globalThis.self ?? globalThis, {
  indexedDB,
  IDBKeyRange
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    }
  })
});

Object.assign(globalThis, {
  scrollTo() {},
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
});

Object.assign(URL, {
  createObjectURL() {
    return "blob:test";
  },
  revokeObjectURL() {}
});
