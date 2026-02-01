var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/betterdiscord/webpack/filter.ts
var filter_exports = {};
__export(filter_exports, {
  byDisplayName: () => byDisplayName,
  byKeys: () => byKeys,
  byPrototypeKeys: () => byPrototypeKeys,
  byRegex: () => byRegex,
  bySource: () => bySource,
  byStoreName: () => byStoreName,
  byStrings: () => byStrings,
  combine: () => combine,
  not: () => not
});

// src/common/logger.ts
var LogTypes = {
  /** Alias for error */
  err: "error",
  error: "error",
  /** Alias for debug */
  dbg: "debug",
  debug: "debug",
  log: "log",
  warn: "warn",
  info: "info"
};
var Logger = class _Logger {
  /**
   * Logs an error using a collapsed error group with stacktrace.
   *
   * @param {string} module - Name of the calling module.
   * @param {string} message - Message or error to have logged.
   * @param {any} error - Error object to log with the message.
   */
  static stacktrace(module, message, error) {
    console.error(`%c[${module}]%c ${message}

%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);
  }
  /**
   * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
   *
   * @param {string} module - Name of the calling module.
   * @param {any[]} message - Messages to have logged.
   */
  static err(module, ...message) {
    _Logger._log(module, message, "error");
  }
  /**
   * Alias for "err"
   * @param {string} module NAme of the calling module
   * @param  {...any} message Messages to have logged.
   */
  static error(module, ...message) {
    _Logger._log(module, message, "error");
  }
  /**
   * Logs a warning message.
   *
   * @param {string} module - Name of the calling module.
   * @param {...any} message - Messages to have logged.
   */
  static warn(module, ...message) {
    _Logger._log(module, message, "warn");
  }
  /**
   * Logs an informational message.
   *
   * @param {string} module - Name of the calling module.
   * @param {...any} message - Messages to have logged.
   */
  static info(module, ...message) {
    _Logger._log(module, message, "info");
  }
  /**
   * Logs used for debugging purposes.
   *
   * @param {string} module - Name of the calling module.
   * @param {...any} message - Messages to have logged.
   */
  static debug(module, ...message) {
    _Logger._log(module, message, "debug");
  }
  /**
   * Logs used for basic loggin.
   *
   * @param {string} module - Name of the calling module.
   * @param {...any} message - Messages to have logged.
   */
  static log(module, ...message) {
    _Logger._log(module, message);
  }
  /**
   * Logs strings using different console levels and a module label.
   *
   * @param {string} module - Name of the calling module.
   * @param {any|Array<any>} message - Messages to have logged.
   * @param {module:Logger.LogTypes} type - Type of log to use in console.
   */
  static _log(module, message, type = "log") {
    const parsedType = _Logger.parseType(type);
    if (!Array.isArray(message)) message = [message];
    console[parsedType](`%c[BetterDiscord]%c [${module}]%c`, "color: #3E82E5; font-weight: 700;", "color: #3a71c1;", "", ...message);
  }
  static parseType(type) {
    return LogTypes[type] || "log";
  }
};

// src/betterdiscord/webpack/require.ts
var webpackRequire;
var lazyListeners = /* @__PURE__ */ new Set();
var __ORIGINAL_PUSH__ = window.webpackChunkdiscord_app.push;
Object.defineProperty(window.webpackChunkdiscord_app, "push", {
  configurable: true,
  get: () => handlePush,
  set: (newPush) => {
    __ORIGINAL_PUSH__ = newPush;
    Object.defineProperty(window.webpackChunkdiscord_app, "push", {
      value: handlePush,
      configurable: true,
      writable: true
    });
  }
});
function listenToModules(modules2) {
  for (const moduleId in modules2) {
    const originalModule = modules2[moduleId];
    modules2[moduleId] = (module, exports, require2) => {
      try {
        Reflect.apply(originalModule, null, [module, exports, require2]);
        const listeners = [...lazyListeners];
        for (let i = 0; i < listeners.length; i++) {
          try {
            listeners[i](exports, module, module.id);
          } catch (error) {
            Logger.stacktrace("WebpackModules", "Could not fire callback listener:", error);
          }
        }
      } catch (error) {
        Logger.stacktrace("WebpackModules", "Could not patch pushed module", error);
      } finally {
        require2.m[moduleId] = originalModule;
      }
    };
    Object.assign(modules2[moduleId], originalModule, {
      toString: () => originalModule.toString()
    });
  }
}
function handlePush(chunk) {
  const [, modules2] = chunk;
  listenToModules(modules2);
  return Reflect.apply(__ORIGINAL_PUSH__, window.webpackChunkdiscord_app, [chunk]);
}
window.webpackChunkdiscord_app.push([
  [Symbol("BetterDiscord")],
  {},
  (__webpack_require__) => {
    if ("b" in __webpack_require__) {
      webpackRequire = __webpack_require__;
      listenToModules(__webpack_require__.m);
    }
  }
]);
var modules = new Proxy({}, {
  ownKeys() {
    return Object.keys(webpackRequire.m);
  },
  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true
      // Not actually
    };
  },
  get(_, k) {
    return webpackRequire.m[k];
  },
  set() {
    throw new Error("[WebpackModules~modules] Setting modules is not allowed.");
  }
});

// src/betterdiscord/webpack/filter.ts
function assign(filter, args) {
  return Object.assign(filter, {
    [Symbol.for("BetterDiscord.Filter")]: args
  });
}
function byKeys(props, filter = (m) => m) {
  return assign((module) => {
    if (!module) return false;
    if (typeof module !== "object" && typeof module !== "function") return false;
    const component = filter(module);
    if (!component) return false;
    for (let p = 0; p < props.length; p++) {
      if (!(props[p] in component)) return false;
    }
    return true;
  }, {
    props,
    filter
  });
}
function byPrototypeKeys(fields, filter = (m) => m) {
  return assign((module) => {
    if (!module) return false;
    if (typeof module !== "object" && typeof module !== "function") return false;
    const component = filter(module);
    if (!component) return false;
    if (!component.prototype) return false;
    for (let f = 0; f < fields.length; f++) {
      if (!(fields[f] in component.prototype)) return false;
    }
    return true;
  }, {
    fields,
    filter
  });
}
function byRegex(search, filter = (m) => m) {
  return assign((module) => {
    const method = filter(module);
    if (!method) return false;
    let methodString = "";
    try {
      methodString = method.toString([]);
    } catch {
      methodString = method.toString();
    }
    return methodString.search(search) !== -1;
  }, {
    search,
    filter
  });
}
function bySource(...searches) {
  const moduleCache = webpackRequire.m;
  return assign((_, module) => {
    const id = module?.id;
    if (!id) return false;
    let source;
    try {
      source = moduleCache[id].toString();
    } catch {
      return false;
    }
    if (!source) return false;
    for (let i = 0; i < searches.length; i++) {
      const search = searches[i];
      if (typeof search === "string") {
        if (!source.includes(search)) return false;
      } else {
        if (!search.test(source)) return false;
      }
    }
    return true;
  }, {
    searches
  });
}
function byStrings(...strings) {
  return assign((module) => {
    if (typeof module !== "function") return false;
    try {
      const str = String(module);
      for (const s of strings) {
        if (!str.includes(s)) return false;
      }
      return true;
    } catch {
      return false;
    }
  }, {
    strings
  });
}
function byDisplayName(name) {
  return assign((module) => {
    return module && module.displayName === name;
  }, {
    name
  });
}
function byStoreName(name) {
  return assign((module) => {
    return module?._dispatchToken && module?.getName?.() === name;
  }, {
    name
  });
}
function combine(...filters) {
  return assign((exports, module, id) => {
    return filters.every((filter) => filter(exports, module, id));
  }, {
    filters
  });
}
function not(filter) {
  return assign((exports, module, id) => !filter(exports, module, id), {
    filter
  });
}

// src/betterdiscord/webpack/shared.ts
var hasThrown = /* @__PURE__ */ new WeakSet();
var wrapFilter = (filter) => Object.assign((exports, module, moduleId) => {
  try {
    if (exports instanceof Window) return false;
    if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort) return false;
    if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort) return false;
    if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken) return false;
    if (exports.getToken || exports.getEmail || exports.showToken) return false;
    return filter(exports, module, moduleId);
  } catch (error) {
    if (!hasThrown.has(filter)) Logger.warn("WebpackModules~getModule", "Module filter threw an exception.", error, { filter, module });
    hasThrown.add(filter);
    return false;
  }
}, {
  __originalFilter: filter
});
var TypedArray = Object.getPrototypeOf(Uint8Array);
function shouldSkipModule(exports) {
  if (!(typeof exports === "object" || typeof exports === "function")) return true;
  if (!exports) return true;
  if (exports.TypedArray) return true;
  if (exports === window) return true;
  if (exports === document.documentElement) return true;
  if (exports[Symbol.toStringTag] === "DOMTokenList") return true;
  if (exports === Symbol) return true;
  if (exports instanceof Window) return true;
  if (exports instanceof TypedArray) return true;
  if (exports.$$loader && exports.$$baseObject || exports.Z?.$$loader && exports.Z?.$$baseObject) return true;
  return false;
}
function getDefaultKey(module) {
  if ("A" in module.exports) return "A";
  if ("Ay" in module.exports) return "Ay";
  if (module.exports.__esModule && "default" in module.exports) return "default";
}
var makeException = () => new Error("Module search failed!");

// src/betterdiscord/webpack/searching.ts
function getModule(filter, options = {}) {
  const { defaultExport = true, searchExports = false, searchDefault = true, raw = false, fatal = false } = options;
  filter = wrapFilter(filter);
  const webpackModules = Object.values(webpackRequire.c);
  for (let i = 0; i < webpackModules.length; i++) {
    const module = webpackModules[i];
    if (shouldSkipModule(module.exports)) continue;
    if (filter(module.exports, module, module.id)) {
      return raw ? module : module.exports;
    }
    if (!searchExports && !searchDefault) continue;
    let defaultKey;
    const searchKeys = [];
    if (searchExports) searchKeys.push(...Object.keys(module.exports));
    else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);
    for (let j = 0; j < searchKeys.length; j++) {
      const key = searchKeys[j];
      const exported = module.exports[key];
      if (shouldSkipModule(exported)) continue;
      if (filter(exported, module, module.id)) {
        if (!defaultExport && defaultKey === key) {
          return module.exports;
        }
        if (raw) return module;
        return exported;
      }
    }
  }
  if (fatal) throw makeException();
  return void 0;
}
function getAllModules(filter, options = {}) {
  const { defaultExport = true, searchExports = false, searchDefault = true, raw = false, fatal = false } = options;
  filter = wrapFilter(filter);
  const modules2 = [];
  const webpackModules = Object.values(webpackRequire.c);
  for (let i = 0; i < webpackModules.length; i++) {
    const module = webpackModules[i];
    if (shouldSkipModule(module.exports)) continue;
    if (filter(module.exports, module, module.id)) {
      modules2.push(raw ? module : module.exports);
    }
    if (!searchExports && !searchDefault) continue;
    let defaultKey;
    const searchKeys = [];
    if (searchExports) searchKeys.push(...Object.keys(module.exports));
    else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);
    for (let j = 0; j < searchKeys.length; j++) {
      const key = searchKeys[j];
      const exported = module.exports[key];
      if (shouldSkipModule(exported)) continue;
      if (filter(exported, module, module.id)) {
        if (!defaultExport && defaultKey === key) {
          modules2.push(module.exports);
          continue;
        }
        modules2.push(raw ? module : exported);
      }
    }
  }
  if (fatal && modules2.length === 0) throw makeException();
  return modules2;
}

// src/betterdiscord/webpack/lazy.ts
var ChunkIdRegex = /n\.e\("(\d+)"\)/g;
var FinalModuleIdRegex = /n\.bind\(n,\s*(\d+)\s*\)/g;
var CreatePromiseId = /createPromise:\s*\(\)\s*=>\s*([^}]+)\.then\(n\.bind\(n,\s*(\d+)\)\)/g;
function getLazy(filter, options = {}) {
  const { signal: abortSignal, defaultExport = true, searchDefault = true, searchExports = false, raw = false, fatal = false } = options;
  if (abortSignal?.aborted) {
    if (fatal) return Promise.reject(makeException());
    return Promise.resolve(void 0);
  }
  const cached = getModule(filter, options);
  if (cached) return Promise.resolve(cached);
  filter = wrapFilter(filter);
  return new Promise((resolve, reject) => {
    const cancel = () => void lazyListeners.delete(listener);
    const listener = (_, module) => {
      if (shouldSkipModule(module.exports)) return;
      if (filter(module.exports, module, module.id)) {
        resolve(raw ? module : module.exports);
        cancel();
        return;
      }
      if (!searchExports && !searchDefault) return;
      let defaultKey;
      const searchKeys = [];
      if (searchExports) searchKeys.push(...Object.keys(module.exports));
      else if (searchDefault && (defaultKey = getDefaultKey(module))) searchKeys.push(defaultKey);
      for (let i = 0; i < searchKeys.length; i++) {
        const key = searchKeys[i];
        const exported = module.exports[key];
        if (shouldSkipModule(exported)) continue;
        if (filter(exported, module, module.id)) {
          if (!defaultExport && defaultKey === key) {
            resolve(raw ? module : module.exports);
            cancel();
            return;
          }
          resolve(raw ? module : exported);
          cancel();
        }
      }
    };
    lazyListeners.add(listener);
    abortSignal?.addEventListener("abort", () => {
      cancel();
      if (fatal) reject(makeException());
      else resolve(void 0);
    });
  });
}
async function forceLoad(id) {
  if (typeof webpackRequire.m[id] === "undefined") {
    return [];
  }
  const text = String(webpackRequire.m[id]);
  const loadedModules = [];
  let match;
  while ((match = CreatePromiseId.exec(text)) !== null) {
    const promiseBody = match[1];
    const bindId = match[2];
    const chunkIds2 = [];
    const chunkMatches = promiseBody.matchAll(ChunkIdRegex);
    for (const chunkMatch2 of chunkMatches) {
      chunkIds2.push(chunkMatch2[1]);
    }
    const finalId = parseInt(bindId, 10);
    await Promise.all(chunkIds2.map((cid) => webpackRequire.e(cid)));
    const loadedModule = webpackRequire(finalId);
    loadedModules.push(loadedModule);
  }
  const chunkIds = [];
  let chunkMatch;
  while ((chunkMatch = ChunkIdRegex.exec(text)) !== null) {
    chunkIds.push(chunkMatch[1]);
  }
  const bindMatches = text.matchAll(FinalModuleIdRegex);
  for (const bindMatch of bindMatches) {
    await Promise.all(chunkIds.map((cid) => webpackRequire.e(cid)));
    const loadedModule = webpackRequire(bindMatch[1]);
    loadedModules.push(loadedModule);
  }
  return loadedModules;
}

// src/betterdiscord/webpack/utilities.ts
function* getWithKey(filter, { target = null, ...rest } = {}) {
  yield target ?? (target = getModule(
    (exports) => Object.values(exports).some(filter),
    rest
  ));
  yield target && Object.keys(target).find((k) => filter(target[k]));
}
function getById(id, options = {}) {
  const { raw, fatal } = options;
  const module = webpackRequire.c[id];
  if (!shouldSkipModule(module?.exports)) {
    return raw ? module : module.exports;
  }
  if (fatal) {
    throw makeException();
  }
  return void 0;
}
function mapObject(module, mappers) {
  const mapped = {};
  const moduleKeys = Object.keys(module);
  const mapperKeys = Object.keys(mappers);
  for (let i = 0; i < moduleKeys.length; i++) {
    const searchKey = moduleKeys[i];
    if (!Object.prototype.hasOwnProperty.call(module, searchKey)) continue;
    for (let j = 0; j < mapperKeys.length; j++) {
      const key = mapperKeys[j];
      if (!Object.prototype.hasOwnProperty.call(mappers, key)) continue;
      if (Object.prototype.hasOwnProperty.call(mapped, key)) continue;
      if (mappers[key](module[searchKey])) {
        Object.defineProperty(mapped, key, {
          get() {
            return module[searchKey];
          },
          set(value) {
            module[searchKey] = value;
          },
          enumerable: true,
          configurable: false
        });
      }
    }
  }
  for (let i = 0; i < mapperKeys.length; i++) {
    const key = mapperKeys[i];
    if (!Object.prototype.hasOwnProperty.call(mapped, key)) {
      Object.defineProperty(mapped, key, {
        value: void 0,
        enumerable: true,
        configurable: false
      });
    }
  }
  Object.defineProperty(mapped, Symbol("betterdiscord.getMangled"), {
    value: module,
    configurable: false
  });
  return mapped;
}
function getMangled(filter, mappers, options = {}) {
  const { raw = false, ...rest } = options;
  if (typeof filter === "string" || filter instanceof RegExp) {
    filter = bySource(filter);
  }
  let module = typeof filter === "number" ? getById(filter) : getModule(filter, { raw, ...rest });
  if (!module) return {};
  if (raw) module = module.exports;
  return mapObject(module, mappers);
}
function getBulk(...queries) {
  const returnedModules = Array(queries.length);
  queries = queries.map((query) => ({
    ...query,
    filter: wrapFilter(query.filter)
  }));
  const shouldExitEarly = queries.every((m) => !m.all);
  const shouldExit = () => shouldExitEarly && queries.every((query, index) => !query.all && index in returnedModules);
  if (queries.length === 0) return returnedModules;
  const webpackModules = Object.values(webpackRequire.c);
  webpack: for (let i = 0; i < webpackModules.length; i++) {
    const module = webpackModules[i];
    if (shouldSkipModule(module.exports)) continue;
    queries: for (let index = 0; index < queries.length; index++) {
      const { filter, all = false, defaultExport = true, searchExports = false, searchDefault = true, raw = false, map } = queries[index];
      if (!all && index in returnedModules) {
        continue;
      }
      if (filter(module.exports, module, module.id)) {
        const trueItem = map ? mapObject(module.exports, map) : raw ? module : module.exports;
        if (!all) {
          returnedModules[index] = trueItem;
          if (shouldExit()) break webpack;
          continue;
        }
        returnedModules[index] ?? (returnedModules[index] = []);
        returnedModules[index].push(trueItem);
      }
      let defaultKey;
      const exportKeys = [];
      if (searchExports) exportKeys.push(...Object.keys(module.exports));
      else if (searchDefault && (defaultKey = getDefaultKey(module))) exportKeys.push(defaultKey);
      for (const key of exportKeys) {
        const exported = module.exports[key];
        if (shouldSkipModule(exported)) continue;
        if (filter(exported, module, module.id)) {
          let value;
          if (!defaultExport && defaultKey === key) {
            value = map ? mapObject(module.exports, map) : raw ? module : module.exports;
          } else {
            value = map ? mapObject(raw ? module.exports : exported, map) : raw ? module : exported;
          }
          if (!all) {
            returnedModules[index] = value;
            if (shouldExit()) break webpack;
            continue queries;
          }
          returnedModules[index] ?? (returnedModules[index] = []);
          returnedModules[index].push(value);
        }
      }
    }
  }
  for (let index = 0; index < queries.length; index++) {
    const query = queries[index];
    const exists = index in returnedModules;
    if (query.fatal) {
      if (query.all && (!Array.isArray(returnedModules[index]) || returnedModules[index].length === 0)) {
        throw makeException();
      }
      if (!exists) throw makeException();
    }
    if (query.map && !exists) {
      returnedModules[index] = {};
    }
  }
  return returnedModules;
}
function getBulkKeyed(queries) {
  const modules2 = getBulk(...Object.values(queries));
  return Object.fromEntries(
    Object.keys(queries).map((key, index) => [key, modules2[index]])
  );
}

// src/betterdiscord/webpack/webpack.ts
function getByKeys(keys, options = {}) {
  return getModule(byKeys(keys), options);
}
function getAllByKeys(keys, options = {}) {
  return getAllModules(byKeys(keys), options);
}
function getLazyByKeys(keys, options = {}) {
  return getLazy(byKeys(keys), options);
}
function getByPrototypes(prototypes, options = {}) {
  return getModule(byPrototypeKeys(prototypes), options);
}
function getAllByPrototypes(prototypes, options = {}) {
  return getAllModules(byPrototypeKeys(prototypes), options);
}
function getLazyByPrototypes(prototypes, options = {}) {
  return getLazy(byPrototypeKeys(prototypes), options);
}
function getByStrings(strings, options = {}) {
  return getModule(byStrings(...strings), options);
}
function getAllByStrings(strings, options = {}) {
  return getAllModules(byStrings(...strings), options);
}
function getLazyByStrings(strings, options = {}) {
  return getLazy(byStrings(...strings), options);
}
function getByRegex(regex, options = {}) {
  return getModule(byRegex(regex), options);
}
function getAllByRegex(regex, options = {}) {
  return getAllModules(byRegex(regex), options);
}
function getLazyByRegex(regex, options = {}) {
  return getLazy(byRegex(regex), options);
}
function getBySource(sources, options = {}) {
  return getModule(bySource(...sources), options);
}
function getAllBySource(sources, options = {}) {
  return getAllModules(bySource(...sources), options);
}
function getLazyBySource(sources, options = {}) {
  return getLazy(bySource(...sources), options);
}
function getByDisplayName(name, options = {}) {
  return getModule(byDisplayName(name), options);
}
function getAllByDisplayName(name, options = {}) {
  return getAllModules(byDisplayName(name), options);
}
function getLazyByDisplayName(name, options = {}) {
  return getLazy(byDisplayName(name), options);
}

// src/betterdiscord/webpack/stores.ts
var Flux;
function getStore(name) {
  if (!Flux) Flux = getModule((m) => m.Store?.getAll);
  if (!Flux) return getModule(filter_exports.byStoreName(name));
  return Flux.Store.getAll().find((store) => store.getName() === name);
}
var Stores = new Proxy({}, {
  ownKeys() {
    if (!Flux) Flux = getModule((m) => m.Store?.getAll);
    if (!Flux) return [];
    return [...new Set(Flux.Store.getAll().map((store) => store.getName()).filter((m) => m.length > 3))];
  },
  getOwnPropertyDescriptor() {
    return {
      enumerable: true,
      configurable: true
      // Not actually
    };
  },
  get(target, key) {
    if (typeof target[key] === "undefined") return target[key] = getStore(key);
    return target[key];
  },
  set() {
    throw new Error("[WebpackModules~Stores] Setting stores is not allowed.");
  }
});
Object.entries(Stores);
export {
  filter_exports as Filters,
  Stores,
  forceLoad,
  getAllByDisplayName,
  getAllByKeys,
  getAllByPrototypes,
  getAllByRegex,
  getAllBySource,
  getAllByStrings,
  getAllModules,
  getBulk,
  getBulkKeyed,
  getByDisplayName,
  getById,
  getByKeys,
  getByPrototypes,
  getByRegex,
  getBySource,
  getByStrings,
  getLazy,
  getLazyByDisplayName,
  getLazyByKeys,
  getLazyByPrototypes,
  getLazyByRegex,
  getLazyBySource,
  getLazyByStrings,
  getMangled,
  getModule,
  getStore,
  getWithKey,
  lazyListeners,
  modules,
  webpackRequire
};
//# sourceMappingURL=webpackmodules.js.map
