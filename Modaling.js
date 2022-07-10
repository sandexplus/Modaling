"use strict";
var Modaling = (function () {
    function Modaling(params) {
        this._defaultConfig = {
            standardStyles: false,
            scrollLocking: true,
            keys: ['Escape'],
            keyClose: true,
            openByMethod: false,
            closeByMethod: false,
            autoInit: true,
            autoOpen: false,
            autoClose: false,
            modal: '.js-modal',
            opener: '.js-open',
            closer: '.js-close',
            overlay: '.js-overlay',
            modalContainer: '.modal-container',
            activeClass: 'modal_show',
            scrollLockClass: 'overflow-hidden',
            enablePadding: true,
            initCallback: null,
            openCallback: null,
            closeCallback: null,
        };
        this._config = Object.assign(this._defaultConfig, params);
        if (!document.querySelector(this._config.modal))
            return;
        this.standardStyles = {
            modal: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                pointerEvents: 'none',
                transition: '.3s all'
            },
            modalContainer: {
                maxHeight: '100vh',
                overflowY: 'auto'
            },
            overlay: {
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,.5)'
            },
            close: {
                position: 'absolute',
                right: '15px',
                top: '15px',
                padding: '8px 20px',
                borderRadius: '5px',
                display: 'flex',
                maxWidth: '200px',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid _000'
            },
            activeClass: {
                opacity: 1,
                pointerEvents: 'all'
            },
            open: {
                padding: '8px 20px',
                borderRadius: '5px',
                display: 'flex',
                maxWidth: '200px',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid _000'
            }
        };
        this._openstart = null;
        this._openend = null;
        this._closestart = null;
        this._closeend = null;
        this._resize = null;
        if (this._config.autoInit)
            this._init();
    }
    Modaling.prototype._init = function () {
        var _this = this;
        var _a, _b, _c, _d;
        if (typeof ((_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.initCallback) === null || _b === void 0 ? void 0 : _b.before) === 'function')
            this._config.initCallback.before();
        for (var prop in this._config) {
            if (!this._config[prop]) {
                throw new Error("Can not get ".concat(prop, " value. Check out your commit"));
            }
            if (prop === 'modal' || prop === 'opener' || prop === 'closer' || prop === 'overlay' || prop === 'modalContainer') {
                if (!document.querySelector(this._config[prop])) {
                    throw new Error("There is no element with '".concat(this._config[prop], "' selector"));
                }
            }
        }
        this.isOpened = false;
        this.hasEventListeners = false;
        this.openedPopup = false;
        this.isOverflow = this._checkOverflow();
        this._overlayChecker = false;
        if (this._config.standardStyles)
            this._setStandardStyles();
        this._eventsFeeler();
        if (typeof this._config.autoOpen === 'number') {
            setTimeout(function () {
                _this.open();
            }, this._config.autoOpen);
        }
        if (typeof this._config.autoClose === 'number') {
            setTimeout(function () {
                _this.close();
            }, this._config.autoClose);
        }
        if (typeof ((_d = (_c = this._config) === null || _c === void 0 ? void 0 : _c.initCallback) === null || _d === void 0 ? void 0 : _d.after) === 'function')
            this._config.initCallback.after();
    };
    Modaling.prototype._documentClick = function (e) {
        var clickedLink = e.target.closest(this._config.opener);
        if (!this.isOpened && !this._config.openByMethod) {
            if (clickedLink) {
                e.preventDefault();
                this.open();
                return;
            }
        }
        if (!this._config.closeByMethod) {
            if (e.target.closest(this._config.closer)) {
                this.close();
                return;
            }
        }
    };
    Modaling.prototype._keyDown = function (e) {
        if (!Array.isArray(this._config.keys) || !this._config.keyClose)
            return;
        if ((this._config.keys.includes(e.key) || this._config.keys.includes(e.code)) && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
        }
    };
    Modaling.prototype._mouseDown = function (e) {
        if (document.querySelector(this._config.modalContainer).contains(e.target) || this._config.closeByMethod)
            return;
        this._overlayChecker = true;
    };
    Modaling.prototype._mouseUp = function (e) {
        if (this._overlayChecker && !document.querySelector(this._config.modalContainer).contains(e.target) && !this._config.closeByMethod) {
            e.preventDefault();
            !this._overlayChecker;
            this.close();
            return;
        }
        this._overlayChecker = false;
    };
    Modaling.prototype._windowResize = function (e) {
        if (typeof this._resize === 'function')
            this._resize();
        this.isOverflow = this._checkOverflow();
    };
    Modaling.prototype._setStandardStyles = function () {
        var _this = this;
        var selectors = {
            modal: this._config.modal,
            overlay: this._config.overlay,
            open: this._config.opener,
            close: this._config.closer,
            activeClass: this._config.activeClass,
            modalContainer: this._config.modalContainer
        };
        if (this._config.standardStyles === true) {
            for (var key in selectors) {
                var el = document.querySelector(selectors[key]);
                if (el) {
                    for (var styleKey in this.standardStyles[key]) {
                        el.style[styleKey] = this.standardStyles[key][styleKey];
                    }
                }
            }
        }
        else if (Array.isArray(this._config.standardStyles)) {
            this._config.standardStyles.forEach(function (key) {
                var el = document.querySelector(selectors[key]);
                if (el) {
                    console.log(_this.standardStyles[key]);
                    for (var styleKey in _this.standardStyles[key]) {
                        el.style[styleKey] = _this.standardStyles[key][styleKey];
                    }
                }
            });
        }
    };
    Modaling.prototype._eventsFeeler = function () {
        var _this = this;
        document.addEventListener("click", function (e) { return _this._documentClick(e); });
        window.addEventListener("keydown", function (e) { return _this._keyDown(e); });
        document.addEventListener('mousedown', function (e) { return _this._mouseDown(e); });
        document.addEventListener('mouseup', function (e) { return _this._mouseUp(e); });
        window.addEventListener('resize', function (e) { return _this._windowResize(e); });
    };
    Modaling.prototype._bodyScrollControl = function () {
        if (!this._config.scrollLocking) {
            return;
        }
        if (this._config.enablePadding) {
            var marginSize = window.innerWidth - document.body.clientWidth;
            if (marginSize) {
                document.body.style.paddingRight = marginSize + "px";
            }
        }
        if (this.isOpened === true) {
            if (this._config.scrollLockClass)
                document.body.classList.add(this._config.scrollLockClass);
            else {
                document.body.style.overflow = 'hidden';
            }
            return;
        }
        document.body.style.paddingRight = "";
        document.body.classList.remove(this._config.scrollLockClass);
    };
    Modaling.prototype._checkOverflow = function () {
        if (!document.querySelector(this._config.modalContainer)) {
            throw new Error("Can not find any element with '".concat(this._config.modalContainer, "' selector."));
        }
        var modalHeight = document.querySelector(this._config.modalContainer).clientHeight;
        var clientHeight = window.innerHeight;
        return modalHeight > clientHeight;
    };
    Modaling.prototype.on = function (listener, callback) {
        if (!callback || typeof callback !== 'function')
            throw new Error("Please, send a valid callback");
        if (listener === 'openstart') {
            this._openstart = callback;
            this.hasEventListeners = true;
        }
        if (listener === 'openend') {
            this._openend = callback;
            this.hasEventListeners = true;
        }
        if (listener === 'closestart') {
            this._closestart = callback;
            this.hasEventListeners = true;
        }
        if (listener === 'closeend') {
            this._closeend = callback;
            this.hasEventListeners = true;
        }
        if (listener === 'resize') {
            this._resize = callback;
            this.hasEventListeners = true;
        }
    };
    Modaling.prototype.set = function (prop, value) {
        if (!this._config[prop]) {
            throw new Error("Parameter with '".concat(prop, "' property doesn't exist"));
        }
        if (typeof this._config[prop] === typeof value) {
            this._config[prop] = value;
            return;
        }
        throw new Error('Please, commit valid value');
    };
    Modaling.prototype.open = function () {
        var _a, _b, _c, _d, _e;
        if (this.isOpened) {
            return;
        }
        if (typeof ((_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.openCallback) === null || _b === void 0 ? void 0 : _b.before) === 'function')
            this._config.openCallback.before();
        if (typeof this._openstart === 'function')
            this._openstart();
        this.openedPopup = document.querySelector(this._config.modal);
        this.openedPopup.classList.add(this._config.activeClass);
        this.openedPopup.setAttribute('aria-hidden', 'false');
        if ((_c = this.standardStyles) === null || _c === void 0 ? void 0 : _c.activeClass) {
            for (var styleKey in this.standardStyles.activeClass) {
                this.openedPopup.style[styleKey] = this.standardStyles.activeClass[styleKey];
            }
        }
        this.isOpened = true;
        this._bodyScrollControl();
        if (typeof ((_e = (_d = this._config) === null || _d === void 0 ? void 0 : _d.openCallback) === null || _e === void 0 ? void 0 : _e.after) === 'function')
            this._config.openCallback.after();
        if (typeof this._openend === 'function')
            this._openend();
    };
    Modaling.prototype.close = function () {
        var _a, _b, _c, _d, _e;
        if (!this.isOpened) {
            return;
        }
        if (typeof this.openedPopup === 'boolean') {
            throw new Error("".concat(this.openedPopup, " is not valid element"));
        }
        if (typeof ((_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.closeCallback) === null || _b === void 0 ? void 0 : _b.before) === 'function')
            this._config.closeCallback.before();
        if (typeof this._closestart === 'function')
            this._closestart();
        this.openedPopup.classList.remove(this._config.activeClass);
        this.openedPopup.setAttribute('aria-hidden', 'true');
        if ((_c = this.standardStyles) === null || _c === void 0 ? void 0 : _c.activeClass) {
            for (var styleKey in this.standardStyles.activeClass) {
                if (+this.standardStyles.activeClass[styleKey]) {
                    this.openedPopup.style[styleKey] = 0;
                }
                else {
                    this.openedPopup.style[styleKey] = 'none';
                }
            }
        }
        this.isOpened = false;
        this._bodyScrollControl();
        if (typeof ((_e = (_d = this._config) === null || _d === void 0 ? void 0 : _d.closeCallback) === null || _e === void 0 ? void 0 : _e.after) === 'function')
            this._config.closeCallback.after();
        if (typeof this._closeend === 'function')
            this._closeend();
    };
    Modaling.prototype.toggle = function () {
        if (this.isOpened)
            this.close();
        else
            this.open();
    };
    Modaling.prototype.init = function (parentContainer) {
        var parent = document.querySelector(parentContainer);
        if (!parent)
            throw new SyntaxError('Can not find any valid elements with this selector!');
        var modalHTML = "\n        <div class=\"".concat(this._config.modal.substring(1), "\">\n            <div class=\"").concat(this._config.overlay.substring(1), "\">\n                <div class=\"").concat(this._config.modalContainer.substring(1), "\">\n                    <div class=\"").concat(this._config.closer.substring(1), "\"></div>\n                </div>\n            </div>\n        </div>\n        ");
        parent.innerHTML = modalHTML;
        this._init();
    };
    return Modaling;
}());
//# sourceMappingURL=Modaling.js.map