/*!
 * @license Urpflanze SVGExporter v"0.0.5"
 * urpflanze-svg-exporter.js
 *
 * Github: https://github.com/urpflanze-org/svg-exporter
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SVGExporter"] = factory();
	else
		root["SVGExporter"] = factory();
})(window, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(1), exports);
__exportStar(__webpack_require__(2), exports);
//# sourceMappingURL=index.js.map

/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SVGExporter = void 0;
const color_1 = __webpack_require__(3);
class SVGExporter {
    static parse(scene, settings = {}) {
        const bindedSettings = {
            ...SVGExporter.defaults,
            ...settings,
        };
        return SVGExporter.generate(scene, bindedSettings);
    }
    /**
     * Get drawer prop
     *
     * @param key name of the property (fill, stroke, lineWidth)
     * @param propArguments currentIndexing propArguments
     * @param defaultValue
     *
     * @returns string | number
     */
    static getSVGProp(key, propArguments, defaultValue) {
        let attribute = propArguments.shape.drawer[key];
        if (typeof attribute === 'function') {
            attribute = attribute(propArguments);
        }
        return attribute !== null && attribute !== void 0 ? attribute : defaultValue;
    }
    /**
     *
     * @param type fill | stroke
     * @param color string
     * @param attriburesPtr list of attributes to apply
     * @param stylePtr Array of string to put in style attr
     *
     * @returns
     */
    static bindColorAttribute(type, color, attriburesPtr, stylePtr) {
        if (typeof color === 'undefined')
            return;
        if (color === 'none') {
            attriburesPtr.push(`${type}="none"`);
        }
        else {
            const parsed = color_1.parseColorAndConvert(color);
            if (parsed) {
                if (parsed.alpha !== 1) {
                    stylePtr.push(`${type}-opacity: ${parsed.alpha}`);
                }
                attriburesPtr.push(`${type}="${color_1.rgbToHex(parsed.r, parsed.g, parsed.b)}"`);
            }
        }
    }
    /**
     * Generate SVG from scene and settings
     *
     * @param scene
     * @param settings
     * @returns
     */
    static generate(scene, settings) {
        const paths = SVGExporter.generatePaths(scene, settings);
        let background;
        if (settings.background) {
            const attributes = [];
            const styles = [];
            SVGExporter.bindColorAttribute('fill', scene.background, attributes, styles);
            styles.length > 0 && attributes.push(`styles="${styles.join('; ')}"`);
            background = `<rect width="${scene.width}" height="${scene.height}" ${attributes.length ? attributes.join(' ') + ' ' : ''}/>`;
        }
        return (`<svg viewBox="0 0 ${scene.width} ${scene.height}">` +
            `\n\t<!-- Create with Urpflanze <https://docs.urpflanze.org> -->` +
            (background ? `\n\t${background}` : '') +
            `\n\t${paths.join('\n\t')}` +
            `\n</svg>`);
    }
    /**
     * Convert shapes to paths
     *
     * @param scene
     * @param settings
     * @returns
     */
    static generatePaths(scene, settings) {
        const paths = [];
        const sceneChilds = scene.getChildren();
        for (let i = 0, len = sceneChilds.length; i < len; i++) {
            sceneChilds[i].generate(0, true);
            const childBuffer = sceneChilds[i].getBuffer() || [];
            const childIndexedBuffer = sceneChilds[i].getIndexedBuffer() || [];
            let childVertexIndex = 0;
            for (let currentBufferIndex = 0, len = childIndexedBuffer.length; currentBufferIndex < len; currentBufferIndex++) {
                const currentIndexing = childIndexedBuffer[currentBufferIndex];
                // Store points
                const points = [];
                for (let len = childVertexIndex + currentIndexing.frameLength; childVertexIndex < len; childVertexIndex += 2) {
                    points.push(childBuffer[childVertexIndex].toFixed(settings.decimals) +
                        ' ' +
                        childBuffer[childVertexIndex + 1].toFixed(settings.decimals));
                }
                // get styles and bind attributes
                const propArguments = {
                    shape: currentIndexing.shape,
                    repetition: currentIndexing.repetition,
                    parent: currentIndexing.parent,
                };
                const attributes = [];
                const styles = [];
                const fill = SVGExporter.getSVGProp('fill', propArguments);
                SVGExporter.bindColorAttribute('fill', fill || 'none', attributes, styles);
                const stroke = SVGExporter.getSVGProp('stroke', propArguments, typeof fill === 'undefined' ? scene.color : undefined);
                SVGExporter.bindColorAttribute('stroke', stroke, attributes, styles);
                const lineWidth = SVGExporter.getSVGProp('lineWidth', propArguments, 1);
                if (stroke)
                    attributes.push(`stroke-width="${lineWidth || 1}"`);
                // move style to attributes
                styles.length > 0 && attributes.push(`style="${styles.join('; ')}"`);
                // build path
                const d = `M${points.join(' L')} ${currentIndexing.shape.isClosed() ? 'Z' : ''}`;
                const path = `<path d="${d}" ${attributes.length ? attributes.join(' ') + ' ' : ''}/>`;
                paths.push(path);
            }
        }
        return paths;
    }
}
exports.SVGExporter = SVGExporter;
SVGExporter.defaults = {
    decimals: 3,
    background: true,
};
//# sourceMappingURL=SVGExporter.js.map

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(4), exports);
__exportStar(__webpack_require__(5), exports);
__exportStar(__webpack_require__(6), exports);
//# sourceMappingURL=index.js.map

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rgbToHsl = exports.hslToRgb = exports.rgbToHex = void 0;
/**
 * Convert rgb to hex
 *
 * @param r number between 0 - 255
 * @param g number between 0 - 255
 * @param b number between 0 - 255
 * @returns #ffffff
 */
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
exports.rgbToHex = rgbToHex;
/**
 * Convert hsl (0-360, 0-100, 0-100) color to rgb(0-255, 0-255, 0-255)
 *
 * @param {number} h number between 0 - 360
 * @param {number} s number between 0 - 100
 * @param {number} l number between 0 - 100
 * @returns {[number, number, number]} [0-255, 0-255, 0-255]
 */
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        const hue2rgb = (p, q, t) => {
            t += t < 0 ? 1 : t > 1 ? -1 : 0;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [(0.5 + r * 255) << 0, (0.5 + g * 255) << 0, (0.5 + b * 255) << 0];
}
exports.hslToRgb = hslToRgb;
/**
 * Convert rbg (0-255, 0-255, 0-255) to hsl (0-360, 0-100, 0-100)
 *
 * @param {number} r number between 0 - 255
 * @param {number} g number between 0 - 255
 * @param {number} b number between 0 - 255
 * @returns {[number, number, number]} (0-360, 0-100, 0-100)
 */
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h, s;
    if (max === min) {
        h = s = 0;
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = h / 6;
    }
    return [(0.5 + h * 360) << 0, (0.5 + s * 100) << 0, (0.5 + l * 100) << 0];
}
exports.rgbToHsl = rgbToHsl;
//# sourceMappingURL=conversions.js.map

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseColor = exports.parseColorAndConvert = void 0;
const conversions_1 = __webpack_require__(5);
/**
 * Convert color to IConvertedColor
 * Supported format: 'hsla?' 'rgba?' 'hex{3,8}' number (0xFFFFFF[FF])
 * hsla format: hsla(360, 100%, 100%, 1)
 * rgba format: rgb(255, 255, 255, 1)
 *
 * @param {(string | number)} color
 * @returns {(IConvertedColor | undefined)}
 */
function parseColorAndConvert(color) {
    const parsed = parseColor(color);
    if (parsed) {
        if (parsed.type === 'hsl') {
            const [r, g, b] = conversions_1.hslToRgb(parsed.a, parsed.b, parsed.c);
            return {
                r,
                g,
                b,
                h: parsed.a,
                s: parsed.b,
                l: parsed.c,
                alpha: parsed.alpha,
            };
        }
        else {
            const [h, s, l] = conversions_1.rgbToHsl(parsed.a, parsed.b, parsed.c);
            return {
                h,
                s,
                l,
                r: parsed.a,
                g: parsed.b,
                b: parsed.c,
                alpha: parsed.alpha,
            };
        }
    }
}
exports.parseColorAndConvert = parseColorAndConvert;
/**
 * Convert color to IColor
 * Supported format: 'hsla?' 'rgba?' 'hex{3,8}' number (0xFFFFFF[FF])
 * hsla format: hsla(360, 100%, 100%, 1)
 * rgba format: rgb(255, 255, 255, 1)
 *
 * @param {(string | number)} color
 * @returns {(IColor | undefined)}
 */
function parseColor(color) {
    if (typeof color === 'number') {
        if (color > 0xffffff) {
            return {
                type: 'rgb',
                a: (color >> 24) & 255,
                b: (color >> 16) & 255,
                c: (color >> 8) & 255,
                alpha: (color & 255) / 255,
            };
        }
        else {
            return { type: 'rgb', a: (color >> 16) & 255, b: (color >> 8) & 255, c: color & 255, alpha: 1 };
        }
    }
    color = color.replace(/\s/g, '');
    let match = /^#([0-9a-f]{3,8})$/i.exec(color);
    if (match) {
        const hex = match[1];
        if (hex.length === 3) {
            return {
                type: 'rgb',
                a: parseInt(hex[0] + hex[0], 16),
                b: parseInt(hex[1] + hex[1], 16),
                c: parseInt(hex[2] + hex[2], 16),
                alpha: 1,
            };
        }
        else {
            return {
                type: 'rgb',
                a: parseInt(hex[0] + hex[1], 16),
                b: parseInt(hex[2] + hex[3], 16),
                c: parseInt(hex[4] + hex[5], 16),
                alpha: hex.length > 6 ? parseInt(hex.substring(6), 16) / 255 : 1,
            };
        }
    }
    match = /^((hsl|rgb)a?)\((\d+),(\d+)%?,(\d+)%?,?(.+)?\)$/i.exec(color);
    if (match) {
        const [, , type, a, b, c, alpha] = match;
        return {
            type: type,
            a: +a,
            b: +b,
            c: +c,
            alpha: alpha ? +alpha : 1,
        };
    }
}
exports.parseColor = parseColor;
//# sourceMappingURL=parsing.js.map

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=urpflanze-svg-exporter.js.map