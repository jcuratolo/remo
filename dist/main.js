/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/events.ts":
/*!***********************!*\
  !*** ./src/events.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nclass Events {\r\n    constructor(registrar) {\r\n        this.registrar = registrar;\r\n    }\r\n    register(id, handler) {\r\n        this.registrar.registerHandler(Events.kind, id, handler);\r\n    }\r\n}\r\nEvents.kind = \"event\";\r\nexports.default = Events;\r\n\n\n//# sourceURL=webpack:///./src/events.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst remo_1 = __webpack_require__(/*! ./remo */ \"./src/remo.ts\");\r\n// @ts-ignore\r\nwindow.Remo = remo_1.default;\r\n\n\n//# sourceURL=webpack:///./src/index.ts?");

/***/ }),

/***/ "./src/registrar.ts":
/*!**************************!*\
  !*** ./src/registrar.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nclass Registrar {\r\n    constructor() {\r\n        this.handlers = new Map();\r\n    }\r\n    registerHandler(kind, id, handler) {\r\n        if (!this.handlers.get(kind)) {\r\n            this.handlers.set(kind, new Map());\r\n        }\r\n        this.handlers.get(kind).set(id, handler);\r\n    }\r\n    getHandler(kind, id) {\r\n        const handler = this.handlers.get(kind).get(id);\r\n        if (!handler) {\r\n            throw new Error(`No handler found for ${kind} ${id}`);\r\n        }\r\n        return handler;\r\n    }\r\n}\r\nexports.Registrar = Registrar;\r\n\n\n//# sourceURL=webpack:///./src/registrar.ts?");

/***/ }),

/***/ "./src/remo.ts":
/*!*********************!*\
  !*** ./src/remo.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst events_1 = __webpack_require__(/*! ./events */ \"./src/events.ts\");\r\nconst registrar_1 = __webpack_require__(/*! ./registrar */ \"./src/registrar.ts\");\r\n// function dispatchFxHandler(\r\n//   store: Remo,\r\n//   { type = \"\", payload = Remo.nullArgs }\r\n// ) {\r\n//   store.dispatch(type, payload);\r\n// }\r\n// function dispatchNFxHandler(\r\n//   store: Remo,\r\n//   effect: Array<{ type: string; payload?: any }> = []\r\n// ) {\r\n//   effect.forEach(({ type, payload }) => store.dispatch(type, payload));\r\n// }\r\nclass Remo {\r\n    constructor(state) {\r\n        this.state = state;\r\n        this.eventQ = [];\r\n        this.preEventCallbacks = [];\r\n        this.postEventCallbacks = [];\r\n        this.processEvents = () => {\r\n            const context = this.eventQ.shift();\r\n            const { event, store } = context;\r\n            const [type, ...args] = event;\r\n            const handler = this.registrar.getHandler(\"event\", type);\r\n            this.processEvent(store, context, type, handler, args);\r\n        };\r\n        this.processEffects = ({ store, effects }) => {\r\n            Object.keys(effects).forEach(effectType => {\r\n                const handler = this.registrar.getHandler(\"effect\", effectType);\r\n                const effect = effects[effectType];\r\n                handler(store, effect);\r\n            });\r\n        };\r\n        this.registrar = new registrar_1.Registrar();\r\n        this.events = new events_1.default(this.registrar);\r\n    }\r\n    on(id, handler) {\r\n        this.events.register(id, ({ store }, ...args) => {\r\n            handler(store.state, ...args);\r\n            return Remo.nullEffectMap;\r\n        });\r\n    }\r\n    fx(id, handler) {\r\n        this.events.register(id, handler);\r\n    }\r\n    dispatch(type, ...args) {\r\n        this.enqueueEvent(type, args);\r\n        setTimeout(this.processEvents);\r\n    }\r\n    dispatchSync(type, args) {\r\n        this.enqueueEvent(type, args);\r\n        this.processEvents();\r\n    }\r\n    registerEffectHandler(type, handler) {\r\n        this.registrar.registerHandler(\"effect\", type, handler);\r\n    }\r\n    enqueueEvent(type, args = Remo.nullArgs) {\r\n        if (!type) {\r\n            console.warn(`Ignoring event with no type and args ${JSON.stringify(args)}`);\r\n        }\r\n        this.eventQ.push({ event: [type, ...args], store: this, effects: {} });\r\n    }\r\n    processEvent(store, context, type, handler, args) {\r\n        this.notifyPreEventCallbacks(context);\r\n        context.effects = handler(context, ...args);\r\n        this.processEffects(context);\r\n        this.notifyPostEventCallbacks(context);\r\n    }\r\n    notifyPostEventCallbacks(context) {\r\n        this.postEventCallbacks.forEach(cb => cb(context));\r\n    }\r\n    notifyPreEventCallbacks(context) {\r\n        this.preEventCallbacks.forEach(cb => cb(context));\r\n    }\r\n    addPreEventCallback(cb) {\r\n        this.preEventCallbacks.push(cb);\r\n        return () => {\r\n            this.preEventCallbacks = this.preEventCallbacks.filter(callback => callback !== cb);\r\n        };\r\n    }\r\n    addPostEventCallback(cb) {\r\n        this.postEventCallbacks.push(cb);\r\n        return () => {\r\n            this.postEventCallbacks = this.postEventCallbacks.filter(callback => callback !== cb);\r\n        };\r\n    }\r\n}\r\nRemo.nullEffectMap = {};\r\nRemo.nullArgs = [];\r\nexports.default = Remo;\r\n\n\n//# sourceURL=webpack:///./src/remo.ts?");

/***/ })

/******/ });