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
    debug?: boolean,

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
    public isInitialized : boolean
    private _styles : {
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
            debug: true,

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
        
        if (!document.querySelector<HTMLElement>(this._config.modal!) && this._config.autoInit) {
            this._throwWarn(`Can not initialize instance automatically because can not find any elements with '${this._config.modal}' selector`)
            return;
        }

        this._styles = {
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
                overflowY: 'auto',
                position: 'absolute',
                width: '500px',
                height: '500px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
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
                border: '1px solid #000000',
                backgroundColor: '#b9b9b9'
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
                border: '1px solid #000000'
            }
        }

        this.isInitialized = false
        this._openstart = null
        this._openend = null
        this._closestart = null
        this._closeend = null
        this._resize = null


        
        if (this._config.autoInit === true && !this.isInitialized) this._init()
    }

    private _throwWarn(message : string) : void {
        if (!this._config.debug || !message) return

        console.warn(message);
    }

    private _init() : void {
        if (typeof this._config?.initCallback?.before === 'function') this._config.initCallback.before()

        for (let prop in this._config) {
            if (prop === 'modal' || prop === 'opener' || prop === 'closer' || prop === 'overlay' || prop === 'modalContainer') {
                if (!document.querySelector(this._config[prop]!)) {
                    this._throwWarn(`There is no element with '${this._config[prop]}' selector`)
                    return
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


        this.isInitialized = true
        if (typeof this._config?.initCallback?.after === 'function') this._config.initCallback.after()
    }

    private _documentClick(e : any) : void {
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

    private _keyDown(e : any) : void {
        if (!this._config.keyClose) {
            return;
        }

        if (!Array.isArray(this._config.keys)) {
            this._throwWarn("The 'keys' parameter is not valid array of keys");
            return;
        }

        if ((this._config.keys.includes(e.key) || this._config.keys.includes(e.code)) && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
        }
    }

    private _mouseDown(e : any) : void {
        if (document.querySelector(this._config.modalContainer)!.contains(e.target) || this._config.closeByMethod) return;
        this._overlayChecker = true;
    }

    private _mouseUp(e : any) : void {
        if (this._overlayChecker && !document.querySelector(this._config.modalContainer)!.contains(e.target) && !this._config.closeByMethod) {
            e.preventDefault();
            !this._overlayChecker;
            this.close();
            return;
        }
        this._overlayChecker = false;
    }

    private _windowResize(e : any) : void {
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
                    for (let styleKey in this._styles[key]) {
                        el.style[styleKey] = this._styles[key][styleKey]
                    }
                } else {
                    this._throwWarn(`Can not find any element with '${selectors[key]}' selector`)
                }
                
            }
        } else if (Array.isArray(this._config.standardStyles)) {
            this._config.standardStyles.forEach(key => {
                const el = document.querySelector(selectors[key])
                if (el) {
                    for (let styleKey in this._styles[key]) {
                        el.style[styleKey] = this._styles[key][styleKey]
                    }
                } else {
                    this._throwWarn(`Can not find any element with '${selectors[key]}' selector`)
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
        if (this.isOpened) {
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
            this._throwWarn(`Can not find any element with '${this._config.modalContainer}' selector.`);
            return false;
        }
        const modalHeight = document.querySelector(this._config.modalContainer)!.clientHeight;
        const clientHeight = window.innerHeight;

        return modalHeight > clientHeight
    } 

    public on(listener : string, callback : Function) : void {
        if (!callback || typeof callback !== 'function') {
            this._throwWarn("Please, send a valid callback");
            return;
        }
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
            this._throwWarn(`Parameter with '${prop}' property doesn't exist`);
            return;
        }
        if (typeof this._config[prop] === typeof value) {
            this._config[prop] = value;
            return;
        }
        this._throwWarn('Please, commit valid value')
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
        if (this._styles?.activeClass) {
            for (let styleKey in this._styles.activeClass) {
                this.openedPopup.style[styleKey] = this._styles.activeClass[styleKey]
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

        if (this._styles?.activeClass) {
            for (let styleKey in this._styles.activeClass) {
                if (+this._styles.activeClass[styleKey]) {
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

    public init(parentContainer : string) : void {
        if (this.isInitialized) {
            this._throwWarn('The instance already has been initialized')
        }
        const parent = document.querySelector(parentContainer)
        if (!parent) {
            this._throwWarn('Can not find any valid elements with this selector!');
            return;
        }

        const modalHTML = `
        <div class="${this._config.modal!.substring(1)}">
            <div class="${this._config.overlay!.substring(1)}">
                <div class="${this._config.modalContainer!.substring(1)}">
                    <div class="${this._config.closer!.substring(1)}"></div>
                </div>
            </div>
        </div>
        `
        parent.innerHTML = modalHTML
        
        this._init()
    }   
}