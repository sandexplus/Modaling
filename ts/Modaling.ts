type conf = {
    // options
    standardStyles?: boolean,
    scrollLocking?: boolean,
    keys?: string[],
    keyClose?: boolean,
    openByMethod?: boolean,
    closeByMethod?: boolean,
    autoInit?: boolean,
    autoOpen?: boolean | number,
    autoClose?: boolean | number,

    //elems
    modal?: string,
    opener?: string,
    closer?: string,
    overlay?: string,
    modalContainer: string,

    //styles
    activeClass?: string,
    scrollLockClass?: string,
    enablePadding?: boolean,

    //callbacks
    initCallback?: null | {
        before?: Function,
        after?: Function
    },
    openCallback?: null | {
        before?: Function,
        after?: Function
    },
    closeCallback?: null | {
        before?: Function,
        after?: Function
    },
    // destroyCallback: null
}

export default class Modaling {
    public isOpened : boolean
    public hasEventListeners : boolean
    public openedPopup : HTMLElement | boolean
    public isOverflow : boolean
    public standardStyles : {
        modal: {},
        modalContainer: {},
        overlay: {},
        close: {},
        activeClass: {},
        open: {}
    }

    private _defaultConfig: conf
    private _config : conf
    private _overlayChecker : boolean
    // private _beforedestroy : null | Function
    // private _afterdestroy : null | Function
    private _openstart  : null | Function
    private _openend  : null | Function
    private _closestart  : null | Function
    private _closeend : null | Function
    private _resize : null | Function

    constructor(params ?: {}) {
        this._defaultConfig = {
            // options
            standardStyles: false,
            scrollLocking: true,
            keys: ['Escape'],
            keyClose: true,
            openByMethod: false,
            closeByMethod: false,
            autoInit: true,
            autoOpen: false,
            autoClose: false,

            //elems
            modal: '.js-modal',
            opener: '.js-open',
            closer: '.js-close',
            overlay: '.js-overlay',
            modalContainer: '.modal-container',

            //styles
            activeClass: 'modal_show',
            scrollLockClass: 'overflow-hidden',
            enablePadding: true,

            //callbacks
            initCallback: null,
            openCallback: null,
            closeCallback: null,
            // destroyCallback: null
        }

        this._config = Object.assign(this._defaultConfig, params)
        if (!document.querySelector<HTMLElement>(this._config.modal!)) return

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
        }

        this._openstart = null
        this._openend = null
        this._closestart = null
        this._closeend = null
        this._resize = null

        if (this._config.autoInit) this._init()
    }

    private _init() : void {
        if (typeof this._config?.initCallback?.before === 'function') this._config.initCallback.before()

        for (let prop in this._config) {
            // if (!this._config[prop]) {
            //     throw new Error(`Can not get ${prop} value. Check out your commit`);
            // }
            if (prop === 'modal' || prop === 'opener' || prop === 'closer' || prop === 'overlay' || prop === 'modalContainer') {
                if (!document.querySelector(this._config[prop]!)) {
                    throw new Error(`There is no element with '${this._config[prop]}' selector`);
                }
            }
        }

        // Properties
        this.isOpened = false;
        this.hasEventListeners = false;
        this.openedPopup = false;
        this.isOverflow = this._checkOverflow()

        this._overlayChecker = false;

        if (this._config.standardStyles) this._setStandardStyles()
        this._eventsFeeler();

        if (typeof this._config.autoOpen === 'number') {
            setTimeout(() => {
                this.open()
            }, this._config.autoOpen)
        }
        if (typeof this._config.autoClose === 'number') {
            setTimeout(() => {
                this.close()
            }, this._config.autoClose)
        }


        if (typeof this._config?.initCallback?.after === 'function') this._config.initCallback.after()
    }

    private _documentClick(e) : void {
        const clickedLink = e.target.closest(this._config.opener);
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
    }

    private _keyDown(e) : void {
        if (!Array.isArray(this._config.keys) || !this._config.keyClose) return
        if ((this._config.keys.includes(e.key) || this._config.keys.includes(e.code)) && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
        }
    }

    private _mouseDown(e) : void {
        if (document.querySelector(this._config.modalContainer)!.contains(e.target) || this._config.closeByMethod) return;
        this._overlayChecker = true;
    }

    private _mouseUp(e) : void {
        if (this._overlayChecker && !document.querySelector(this._config.modalContainer)!.contains(e.target) && !this._config.closeByMethod) {
            e.preventDefault();
            !this._overlayChecker;
            this.close();
            return;
        }
        this._overlayChecker = false;
    }

    private _windowResize(e) : void {
        if (typeof this._resize === 'function') this._resize()
        this.isOverflow = this._checkOverflow()
    }

    private _setStandardStyles() : void {
        let selectors = {
            modal: this._config.modal,
            overlay: this._config.overlay,
            open: this._config.opener,
            close: this._config.closer,
            activeClass: this._config.activeClass,
            modalContainer: this._config.modalContainer
        }
        if (this._config.standardStyles === true) {
            for (let key in selectors) {
                const el = document.querySelector(selectors[key])
                if (el) {
                    for (let styleKey in this.standardStyles[key]) {
                        el.style[styleKey] = this.standardStyles[key][styleKey]
                    }
                }
                
            }
        } else if (Array.isArray(this._config.standardStyles)) {
            this._config.standardStyles.forEach(key => {
                const el = document.querySelector(selectors[key])
                if (el) {
                    console.log(this.standardStyles[key]);
                    for (let styleKey in this.standardStyles[key]) {
                        el.style[styleKey] = this.standardStyles[key][styleKey]
                    }
                }
            })
        }
    }

    private _eventsFeeler() : void {

        document.addEventListener("click", (e) => this._documentClick(e));

        window.addEventListener("keydown", (e) => this._keyDown(e));

        document.addEventListener('mousedown', (e) => this._mouseDown(e));
        
        document.addEventListener('mouseup', (e) => this._mouseUp(e));

        window.addEventListener('resize', (e) => this._windowResize(e))

    }

    private _bodyScrollControl() : void {
        if (!this._config.scrollLocking) {
            return
        }
        if (this._config.enablePadding) {
            let marginSize = window.innerWidth - document.body.clientWidth;
            if (marginSize) {
                document.body.style.paddingRight = marginSize + "px";
            } 
        }
        if (this.isOpened === true) {
            if (this._config.scrollLockClass) document.body.classList.add(this._config.scrollLockClass);
            else {
                document.body.style.overflow = 'hidden';
            }
            return;
        }
        document.body.style.paddingRight = "";
        document.body.classList.remove(this._config.scrollLockClass!);
        
    }

    private _checkOverflow() : boolean {
        if (!document.querySelector(this._config.modalContainer)) {
            throw new Error(`Can not find any element with '${this._config.modalContainer}' selector.`);
            
        }
        const modalHeight = document.querySelector(this._config.modalContainer)!.clientHeight;
        const clientHeight = window.innerHeight;

        return modalHeight > clientHeight
    } 

    public on(listener : string, callback : Function) : void {
        if (!callback || typeof callback !== 'function') throw new Error("Please, send a valid callback");
        
        // if (listener === 'beforedestroy') {this._beforedestroy = callback; this.hasEventListeners = true}
        // if (listener === 'afterdestroy') {this._afterdestroy = callback; this.hasEventListeners = true}
        if (listener === 'openstart') {this._openstart = callback; this.hasEventListeners = true}
        if (listener === 'openend') {this._openend = callback; this.hasEventListeners = true}
        if (listener === 'closestart') {this._closestart = callback; this.hasEventListeners = true}
        if (listener === 'closeend') {this._closeend = callback; this.hasEventListeners = true}
        if (listener === 'resize') {this._resize = callback; this.hasEventListeners = true}
    }

    public set(prop : string, value : any) : void {
        if (!this._config[prop]) {
            throw new Error(`Parameter with '${prop}' property doesn't exist`);
        }
        if (typeof this._config[prop] === typeof value) {
            this._config[prop] = value;
            return;
        }
        throw new Error('Please, commit valid value')
    }

    public open() : void {
        if (this.isOpened) {
            return;
        }
        if (typeof this._config?.openCallback?.before === 'function') this._config.openCallback.before()
        if (typeof this._openstart === 'function') this._openstart()
        

        this.openedPopup = document.querySelector(this._config.modal!) as HTMLElement;

        this.openedPopup.classList.add(this._config.activeClass!);
        this.openedPopup.setAttribute('aria-hidden', 'false');
        if (this.standardStyles?.activeClass) {
            for (let styleKey in this.standardStyles.activeClass) {
                this.openedPopup.style[styleKey] = this.standardStyles.activeClass[styleKey]
            }
        }

        this.isOpened = true;
        this._bodyScrollControl();


        if (typeof this._config?.openCallback?.after === 'function') this._config.openCallback.after()
        if (typeof this._openend === 'function') this._openend()
    }

    public close() : void {
        if (!this.isOpened) {
            return;
        }
        if (typeof this.openedPopup === 'boolean') {
            throw new Error(`${this.openedPopup} is not valid element`);
        }
        if (typeof this._config?.closeCallback?.before === 'function') this._config.closeCallback.before()
        if (typeof this._closestart === 'function') this._closestart()

        this.openedPopup.classList.remove(this._config.activeClass!);
        this.openedPopup.setAttribute('aria-hidden', 'true');

        if (this.standardStyles?.activeClass) {
            for (let styleKey in this.standardStyles.activeClass) {
                if (+this.standardStyles.activeClass[styleKey]) {
                    this.openedPopup.style[styleKey] = 0
                } else {
                    this.openedPopup.style[styleKey] = 'none'
                }
            }
        }

        this.isOpened = false;
        this._bodyScrollControl();

        if (typeof this._config?.closeCallback?.after === 'function') this._config.closeCallback.after()
        if (typeof this._closeend === 'function') this._closeend()
    }

    public toggle() : void {
        if (this.isOpened) this.close()
        else this.open()
    }

    public init(parentContainer) : void {
        const parent = document.querySelector(parentContainer)
        if (!parent) throw new SyntaxError('Can not find any valid elements with this selector!')

        const modalHTML = `
        <div class="${this._config.modal!.substring(1)}">
            <div class="${this._config.overlay!.substring(1)}">
                <div class="${this._config.modalContainer.substring(1)}">
                    <div class="${this._config.closer!.substring(1)}"></div>
                </div>
            </div>
        </div>
        `
        parent.innerHTML = modalHTML

        this._init()
    }   
}