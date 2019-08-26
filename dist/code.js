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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _models__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./models */ "./src/models.tsx");

let currentSelection = figma.currentPage.selection;
figma.showUI(__html__, { width: 450, height: 220 });
figma.loadFontAsync({ family: "Rubik AZ", style: "Regular" });
sendCurrentNode();
// Check if selection has changed and send new selection into ui if needed
setInterval(() => {
    const newSelection = figma.currentPage.selection;
    if (currentSelection[0].id !== newSelection[0].id) {
        currentSelection = newSelection;
        sendCurrentNode();
    }
}, 1000);
function getCurrentNode() {
    return currentSelection.find((node) => node.type === _models__WEBPACK_IMPORTED_MODULE_0__["ENodeType"].TEXT);
}
function sendCurrentNode() {
    const currentNode = getCurrentNode();
    if (currentNode) {
        figma.clientStorage
            .getAsync(_models__WEBPACK_IMPORTED_MODULE_0__["ELocalStorageKey"].LANG)
            .then((lang) => {
            // Parse translation if exist
            const translation = parseJSON(figma.currentPage.getPluginData(currentNode.id));
            // Try to find suggested translation if some of translation is missing
            const suggestedTranslation = !translation || (translation && isSomeTranslationMissing(translation))
                ? findSuggestedTranslation(currentNode.id, currentNode.characters)
                : null;
            // Send information about current node to UI
            postMessage({
                type: _models__WEBPACK_IMPORTED_MODULE_0__["EMessageType"].SEND_CURRENT_NODE,
                currentLang: lang,
                translation,
                suggestedTranslation,
                nodeText: currentNode.characters,
            });
        });
    }
    else {
        postMessage({ type: _models__WEBPACK_IMPORTED_MODULE_0__["EMessageType"].NO_CURRENT_NODE });
    }
}
function postMessage(message) {
    figma.ui.postMessage(message);
}
// Find all text nodes on current page and translate them
function traverse(node, lang) {
    if (node.type === _models__WEBPACK_IMPORTED_MODULE_0__["ENodeType"].TEXT) {
        const translation = parseJSON(figma.currentPage.getPluginData(node.id));
        if (translation && translation[lang].length > 0)
            node.characters = translation[lang];
    }
    if ("children" in node) {
        for (const child of node.children) {
            traverse(child, lang);
        }
    }
}
function findSuggestedTranslation(id, word) {
    const textNodes = figma.currentPage.findAll((node) => node.type === _models__WEBPACK_IMPORTED_MODULE_0__["ENodeType"].TEXT);
    let suggestedTranslation = {
        AZ: null,
        RU: null,
        EN: null
    };
    for (const node of textNodes) {
        if (node.id !== id) {
            const translation = parseJSON(figma.currentPage.getPluginData(node.id));
            if (translation && hasTranslationWord(translation, word)) {
                for (const lang in translation) {
                    if (translation[lang].length > 0 && !suggestedTranslation[lang]) {
                        suggestedTranslation[lang] = translation[lang];
                    }
                }
            }
        }
        if (!isSomeTranslationMissing(suggestedTranslation))
            break;
    }
    return allTranslationsAreMissing(suggestedTranslation) ? null : suggestedTranslation;
}
function parseJSON(object) {
    return object && object.length > 0 ? JSON.parse(object) : null;
}
function hasTranslationWord(translation, word) {
    return Object.keys(_models__WEBPACK_IMPORTED_MODULE_0__["ELang"]).some(lang => translation[lang] === word);
}
function isSomeTranslationMissing(translation) {
    return Object.keys(_models__WEBPACK_IMPORTED_MODULE_0__["ELang"]).some((lang) => !translation[lang]);
}
function allTranslationsAreMissing(translation) {
    return Object.keys(_models__WEBPACK_IMPORTED_MODULE_0__["ELang"]).every((lang) => !translation[lang]);
}
figma.ui.onmessage = (message) => {
    const { type, translation, lang } = message;
    switch (type) {
        case _models__WEBPACK_IMPORTED_MODULE_0__["EMessageType"].PUT_TRANSLATION:
            if (translation) {
                figma.currentPage.setPluginData(getCurrentNode().id, JSON.stringify(translation));
                figma.clientStorage
                    .getAsync(_models__WEBPACK_IMPORTED_MODULE_0__["ELocalStorageKey"].LANG)
                    .then((currentLang) => {
                    figma.currentPage.selection[0].characters = translation[currentLang];
                });
            }
            break;
        case _models__WEBPACK_IMPORTED_MODULE_0__["EMessageType"].SET_CURRENT_LANGUAGE:
            figma.clientStorage
                .setAsync(_models__WEBPACK_IMPORTED_MODULE_0__["ELocalStorageKey"].LANG, lang)
                .then(() => {
                traverse(figma.root, lang);
            });
    }
};


/***/ }),

/***/ "./src/models.tsx":
/*!************************!*\
  !*** ./src/models.tsx ***!
  \************************/
/*! exports provided: EMessageType, ELocalStorageKey, ELang, ENodeType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EMessageType", function() { return EMessageType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ELocalStorageKey", function() { return ELocalStorageKey; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ELang", function() { return ELang; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ENodeType", function() { return ENodeType; });
var EMessageType;
(function (EMessageType) {
    EMessageType["SET_CURRENT_LANGUAGE"] = "SET_CURRENT_LANGUAGE";
    EMessageType["PUT_TRANSLATION"] = "PUT_TRANSLATION";
    EMessageType["SEND_CURRENT_LANGUAGE"] = "SEND_CURRENT_LANGUAGE";
    EMessageType["NO_CURRENT_NODE"] = "NO_CURRENT_NODE";
    EMessageType["SEND_CURRENT_NODE"] = "SEND_CURRENT_NODE";
})(EMessageType || (EMessageType = {}));
var ELocalStorageKey;
(function (ELocalStorageKey) {
    ELocalStorageKey["LANG"] = "LANG";
})(ELocalStorageKey || (ELocalStorageKey = {}));
var ELang;
(function (ELang) {
    ELang["AZ"] = "AZ";
    ELang["RU"] = "RU";
    ELang["EN"] = "EN";
})(ELang || (ELang = {}));
var ENodeType;
(function (ENodeType) {
    ENodeType["TEXT"] = "TEXT";
})(ENodeType || (ENodeType = {}));


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZGVscy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQTRFO0FBQzVFO0FBQ0Esd0JBQXdCLDBCQUEwQjtBQUNsRCxxQkFBcUIsdUNBQXVDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSx5REFBeUQsaURBQVM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQix3REFBZ0I7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLG9EQUFZO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0EscUJBQXFCLE9BQU8sb0RBQVksa0JBQWtCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlEQUFTO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0UsaURBQVM7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsNkNBQUs7QUFDNUI7QUFDQTtBQUNBLHVCQUF1Qiw2Q0FBSztBQUM1QjtBQUNBO0FBQ0EsdUJBQXVCLDZDQUFLO0FBQzVCO0FBQ0E7QUFDQSxXQUFXLDBCQUEwQjtBQUNyQztBQUNBLGFBQWEsb0RBQVk7QUFDekI7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLHdEQUFnQjtBQUM5QztBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxhQUFhLG9EQUFZO0FBQ3pCO0FBQ0EsMEJBQTBCLHdEQUFnQjtBQUMxQztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNqSEE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxvQ0FBb0M7QUFDOUI7QUFDUDtBQUNBO0FBQ0EsQ0FBQyw0Q0FBNEM7QUFDdEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsc0JBQXNCO0FBQ2hCO0FBQ1A7QUFDQTtBQUNBLENBQUMsOEJBQThCIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiaW1wb3J0IHsgRUxhbmcsIEVMb2NhbFN0b3JhZ2VLZXksIEVNZXNzYWdlVHlwZSwgRU5vZGVUeXBlIH0gZnJvbSAnLi9tb2RlbHMnO1xubGV0IGN1cnJlbnRTZWxlY3Rpb24gPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG5maWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IDQ1MCwgaGVpZ2h0OiAyMjAgfSk7XG5maWdtYS5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIlJ1YmlrIEFaXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KTtcbnNlbmRDdXJyZW50Tm9kZSgpO1xuLy8gQ2hlY2sgaWYgc2VsZWN0aW9uIGhhcyBjaGFuZ2VkIGFuZCBzZW5kIG5ldyBzZWxlY3Rpb24gaW50byB1aSBpZiBuZWVkZWRcbnNldEludGVydmFsKCgpID0+IHtcbiAgICBjb25zdCBuZXdTZWxlY3Rpb24gPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgaWYgKGN1cnJlbnRTZWxlY3Rpb25bMF0uaWQgIT09IG5ld1NlbGVjdGlvblswXS5pZCkge1xuICAgICAgICBjdXJyZW50U2VsZWN0aW9uID0gbmV3U2VsZWN0aW9uO1xuICAgICAgICBzZW5kQ3VycmVudE5vZGUoKTtcbiAgICB9XG59LCAxMDAwKTtcbmZ1bmN0aW9uIGdldEN1cnJlbnROb2RlKCkge1xuICAgIHJldHVybiBjdXJyZW50U2VsZWN0aW9uLmZpbmQoKG5vZGUpID0+IG5vZGUudHlwZSA9PT0gRU5vZGVUeXBlLlRFWFQpO1xufVxuZnVuY3Rpb24gc2VuZEN1cnJlbnROb2RlKCkge1xuICAgIGNvbnN0IGN1cnJlbnROb2RlID0gZ2V0Q3VycmVudE5vZGUoKTtcbiAgICBpZiAoY3VycmVudE5vZGUpIHtcbiAgICAgICAgZmlnbWEuY2xpZW50U3RvcmFnZVxuICAgICAgICAgICAgLmdldEFzeW5jKEVMb2NhbFN0b3JhZ2VLZXkuTEFORylcbiAgICAgICAgICAgIC50aGVuKChsYW5nKSA9PiB7XG4gICAgICAgICAgICAvLyBQYXJzZSB0cmFuc2xhdGlvbiBpZiBleGlzdFxuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBwYXJzZUpTT04oZmlnbWEuY3VycmVudFBhZ2UuZ2V0UGx1Z2luRGF0YShjdXJyZW50Tm9kZS5pZCkpO1xuICAgICAgICAgICAgLy8gVHJ5IHRvIGZpbmQgc3VnZ2VzdGVkIHRyYW5zbGF0aW9uIGlmIHNvbWUgb2YgdHJhbnNsYXRpb24gaXMgbWlzc2luZ1xuICAgICAgICAgICAgY29uc3Qgc3VnZ2VzdGVkVHJhbnNsYXRpb24gPSAhdHJhbnNsYXRpb24gfHwgKHRyYW5zbGF0aW9uICYmIGlzU29tZVRyYW5zbGF0aW9uTWlzc2luZyh0cmFuc2xhdGlvbikpXG4gICAgICAgICAgICAgICAgPyBmaW5kU3VnZ2VzdGVkVHJhbnNsYXRpb24oY3VycmVudE5vZGUuaWQsIGN1cnJlbnROb2RlLmNoYXJhY3RlcnMpXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgLy8gU2VuZCBpbmZvcm1hdGlvbiBhYm91dCBjdXJyZW50IG5vZGUgdG8gVUlcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFTWVzc2FnZVR5cGUuU0VORF9DVVJSRU5UX05PREUsXG4gICAgICAgICAgICAgICAgY3VycmVudExhbmc6IGxhbmcsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGVkVHJhbnNsYXRpb24sXG4gICAgICAgICAgICAgICAgbm9kZVRleHQ6IGN1cnJlbnROb2RlLmNoYXJhY3RlcnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwb3N0TWVzc2FnZSh7IHR5cGU6IEVNZXNzYWdlVHlwZS5OT19DVVJSRU5UX05PREUgfSk7XG4gICAgfVxufVxuZnVuY3Rpb24gcG9zdE1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xufVxuLy8gRmluZCBhbGwgdGV4dCBub2RlcyBvbiBjdXJyZW50IHBhZ2UgYW5kIHRyYW5zbGF0ZSB0aGVtXG5mdW5jdGlvbiB0cmF2ZXJzZShub2RlLCBsYW5nKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gRU5vZGVUeXBlLlRFWFQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBwYXJzZUpTT04oZmlnbWEuY3VycmVudFBhZ2UuZ2V0UGx1Z2luRGF0YShub2RlLmlkKSk7XG4gICAgICAgIGlmICh0cmFuc2xhdGlvbiAmJiB0cmFuc2xhdGlvbltsYW5nXS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgbm9kZS5jaGFyYWN0ZXJzID0gdHJhbnNsYXRpb25bbGFuZ107XG4gICAgfVxuICAgIGlmIChcImNoaWxkcmVuXCIgaW4gbm9kZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIHRyYXZlcnNlKGNoaWxkLCBsYW5nKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGZpbmRTdWdnZXN0ZWRUcmFuc2xhdGlvbihpZCwgd29yZCkge1xuICAgIGNvbnN0IHRleHROb2RlcyA9IGZpZ21hLmN1cnJlbnRQYWdlLmZpbmRBbGwoKG5vZGUpID0+IG5vZGUudHlwZSA9PT0gRU5vZGVUeXBlLlRFWFQpO1xuICAgIGxldCBzdWdnZXN0ZWRUcmFuc2xhdGlvbiA9IHtcbiAgICAgICAgQVo6IG51bGwsXG4gICAgICAgIFJVOiBudWxsLFxuICAgICAgICBFTjogbnVsbFxuICAgIH07XG4gICAgZm9yIChjb25zdCBub2RlIG9mIHRleHROb2Rlcykge1xuICAgICAgICBpZiAobm9kZS5pZCAhPT0gaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gcGFyc2VKU09OKGZpZ21hLmN1cnJlbnRQYWdlLmdldFBsdWdpbkRhdGEobm9kZS5pZCkpO1xuICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uICYmIGhhc1RyYW5zbGF0aW9uV29yZCh0cmFuc2xhdGlvbiwgd29yZCkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxhbmcgaW4gdHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uW2xhbmddLmxlbmd0aCA+IDAgJiYgIXN1Z2dlc3RlZFRyYW5zbGF0aW9uW2xhbmddKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWdnZXN0ZWRUcmFuc2xhdGlvbltsYW5nXSA9IHRyYW5zbGF0aW9uW2xhbmddO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaXNTb21lVHJhbnNsYXRpb25NaXNzaW5nKHN1Z2dlc3RlZFRyYW5zbGF0aW9uKSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gYWxsVHJhbnNsYXRpb25zQXJlTWlzc2luZyhzdWdnZXN0ZWRUcmFuc2xhdGlvbikgPyBudWxsIDogc3VnZ2VzdGVkVHJhbnNsYXRpb247XG59XG5mdW5jdGlvbiBwYXJzZUpTT04ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCAmJiBvYmplY3QubGVuZ3RoID4gMCA/IEpTT04ucGFyc2Uob2JqZWN0KSA6IG51bGw7XG59XG5mdW5jdGlvbiBoYXNUcmFuc2xhdGlvbldvcmQodHJhbnNsYXRpb24sIHdvcmQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoRUxhbmcpLnNvbWUobGFuZyA9PiB0cmFuc2xhdGlvbltsYW5nXSA9PT0gd29yZCk7XG59XG5mdW5jdGlvbiBpc1NvbWVUcmFuc2xhdGlvbk1pc3NpbmcodHJhbnNsYXRpb24pIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoRUxhbmcpLnNvbWUoKGxhbmcpID0+ICF0cmFuc2xhdGlvbltsYW5nXSk7XG59XG5mdW5jdGlvbiBhbGxUcmFuc2xhdGlvbnNBcmVNaXNzaW5nKHRyYW5zbGF0aW9uKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKEVMYW5nKS5ldmVyeSgobGFuZykgPT4gIXRyYW5zbGF0aW9uW2xhbmddKTtcbn1cbmZpZ21hLnVpLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgY29uc3QgeyB0eXBlLCB0cmFuc2xhdGlvbiwgbGFuZyB9ID0gbWVzc2FnZTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBFTWVzc2FnZVR5cGUuUFVUX1RSQU5TTEFUSU9OOlxuICAgICAgICAgICAgaWYgKHRyYW5zbGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEuY3VycmVudFBhZ2Uuc2V0UGx1Z2luRGF0YShnZXRDdXJyZW50Tm9kZSgpLmlkLCBKU09OLnN0cmluZ2lmeSh0cmFuc2xhdGlvbikpO1xuICAgICAgICAgICAgICAgIGZpZ21hLmNsaWVudFN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgLmdldEFzeW5jKEVMb2NhbFN0b3JhZ2VLZXkuTEFORylcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGN1cnJlbnRMYW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvblswXS5jaGFyYWN0ZXJzID0gdHJhbnNsYXRpb25bY3VycmVudExhbmddO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRU1lc3NhZ2VUeXBlLlNFVF9DVVJSRU5UX0xBTkdVQUdFOlxuICAgICAgICAgICAgZmlnbWEuY2xpZW50U3RvcmFnZVxuICAgICAgICAgICAgICAgIC5zZXRBc3luYyhFTG9jYWxTdG9yYWdlS2V5LkxBTkcsIGxhbmcpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYXZlcnNlKGZpZ21hLnJvb3QsIGxhbmcpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufTtcbiIsImV4cG9ydCB2YXIgRU1lc3NhZ2VUeXBlO1xuKGZ1bmN0aW9uIChFTWVzc2FnZVR5cGUpIHtcbiAgICBFTWVzc2FnZVR5cGVbXCJTRVRfQ1VSUkVOVF9MQU5HVUFHRVwiXSA9IFwiU0VUX0NVUlJFTlRfTEFOR1VBR0VcIjtcbiAgICBFTWVzc2FnZVR5cGVbXCJQVVRfVFJBTlNMQVRJT05cIl0gPSBcIlBVVF9UUkFOU0xBVElPTlwiO1xuICAgIEVNZXNzYWdlVHlwZVtcIlNFTkRfQ1VSUkVOVF9MQU5HVUFHRVwiXSA9IFwiU0VORF9DVVJSRU5UX0xBTkdVQUdFXCI7XG4gICAgRU1lc3NhZ2VUeXBlW1wiTk9fQ1VSUkVOVF9OT0RFXCJdID0gXCJOT19DVVJSRU5UX05PREVcIjtcbiAgICBFTWVzc2FnZVR5cGVbXCJTRU5EX0NVUlJFTlRfTk9ERVwiXSA9IFwiU0VORF9DVVJSRU5UX05PREVcIjtcbn0pKEVNZXNzYWdlVHlwZSB8fCAoRU1lc3NhZ2VUeXBlID0ge30pKTtcbmV4cG9ydCB2YXIgRUxvY2FsU3RvcmFnZUtleTtcbihmdW5jdGlvbiAoRUxvY2FsU3RvcmFnZUtleSkge1xuICAgIEVMb2NhbFN0b3JhZ2VLZXlbXCJMQU5HXCJdID0gXCJMQU5HXCI7XG59KShFTG9jYWxTdG9yYWdlS2V5IHx8IChFTG9jYWxTdG9yYWdlS2V5ID0ge30pKTtcbmV4cG9ydCB2YXIgRUxhbmc7XG4oZnVuY3Rpb24gKEVMYW5nKSB7XG4gICAgRUxhbmdbXCJBWlwiXSA9IFwiQVpcIjtcbiAgICBFTGFuZ1tcIlJVXCJdID0gXCJSVVwiO1xuICAgIEVMYW5nW1wiRU5cIl0gPSBcIkVOXCI7XG59KShFTGFuZyB8fCAoRUxhbmcgPSB7fSkpO1xuZXhwb3J0IHZhciBFTm9kZVR5cGU7XG4oZnVuY3Rpb24gKEVOb2RlVHlwZSkge1xuICAgIEVOb2RlVHlwZVtcIlRFWFRcIl0gPSBcIlRFWFRcIjtcbn0pKEVOb2RlVHlwZSB8fCAoRU5vZGVUeXBlID0ge30pKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=