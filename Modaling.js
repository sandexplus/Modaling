export default class Modaling {
    #overlayChecker
    #beforedestroy
    #afterdestroy 
    #openstart 
    #openend 
    #closestart 
    #closeend 
    #config
    #resize

    constructor(params) {
        let defaultConfig = {
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
            scrollLockClass: null,
            enablePadding: true,

            //callbacks
            initCallback: null,
            openCallback: null,
            closeCallback: null,
            // destroyCallback: null
        }

        this.#config = Object.assign(defaultConfig, params)
        if (!document.querySelector(this.#config.modal)) return
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
                border: '1px solid #000'
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
                border: '1px solid #000'
            }
        }

        // this.#beforedestroy = null
        // this.#afterdestroy = null
        this.#openstart = null
        this.#openend = null
        this.#closestart = null
        this.#closeend = null
        this.#resize = null

        
        if (this.#config.autoInit) this.#init()
    }

    // Private

    #init() {
        if (typeof this.#config?.initCallback?.before === 'function') this.#config.initCallback.before()

        // Properties
        this.isOpened = false;
        this.hasEventListeners = false;
        this.openedPopup = false;
        this.isOverflow = this.#checkOverflow()

        this.#overlayChecker = false;

        if (this.#config.standardStyles) this.#setStandardStyles()
        this.#eventsFeeler();

        if (+this.#config.autoOpen) {
            setTimeout(() => {
                this.open()
            }, this.#config.autoOpen)
        }
        if (+this.#config.autoClose) {
            setTimeout(() => {
                this.close()
            }, this.#config.autoClose)
        }


        if (typeof this.#config?.initCallback?.after === 'function') this.#config.initCallback.after()
    }

    #documentClick(e) {
        const clickedLink = e.target.closest(this.#config.opener);
        if (!this.isOpened && !this.#config.openByMethod) {
            if (clickedLink) { 
                e.preventDefault();
                this.open();
                return;
            }
        } 
        if (!this.#config.closeByMethod) {
            if (e.target.closest(this.#config.closer)) {
                this.close();
                return;
            }
        }
    }

    #keyDown(e) {
        if (!Array.isArray(this.#config.keys) || !this.#config.keyClose) return
        if ((this.#config.keys.includes(e.key) || this.#config.keys.includes(e.code)) && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
        }
    }

    #mouseDown(e) {
        if (document.querySelector(this.#config.modalContainer).contains(e.target) || this.#config.closeByMethod) return;
        this.#overlayChecker = true;
    }

    #mouseUp(e) {
        if (this.#overlayChecker && !document.querySelector(this.#config.modalContainer).contains(e.target) && !this.#config.closeByMethod) {
            e.preventDefault();
            !this.#overlayChecker;
            this.close();
            return;
        }
        this.#overlayChecker = false;
    }

    #windowResize(e) {
        this.isOverflow = this.#checkOverflow()
    }

    #setStandardStyles() {
        let selectors = {
            modal: this.#config.modal,
            overlay: this.#config.overlay,
            open: this.#config.opener,
            close: this.#config.closer,
            activeClass: this.#config.activeClass,
            modalContainer: this.#config.modalContainer
        }
        if (this.#config.standardStyles === true) {
            for (let key in selectors) {
                const el = document.querySelector(selectors[key])
                if (el) {
                    for (let styleKey in this.standardStyles[key]) {
                        el.style[styleKey] = this.standardStyles[key][styleKey]
                    }
                }
                
            }
        } else if (Array.isArray(this.#config.standardStyles)) {
            this.#config.standardStyles.forEach(key => {
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

    #eventsFeeler() {

        document.addEventListener("click", (e) => this.#documentClick(e));

        window.addEventListener("keydown", (e) => this.#keyDown(e));

        document.addEventListener('mousedown', (e) => this.#mouseDown(e));
        
        document.addEventListener('mouseup', (e) => this.#mouseUp(e));

        window.addEventListener('resize', (e) => this.#windowResize(e))

    }

    #bodyScrollControl() {
        if (!this.#config.scrollLocking) {
            return
        }
        if (this.#config.enablePadding) {
            let marginSize = window.innerWidth - document.body.clientWidth;
            if (marginSize) {
                document.body.style.paddingRight = marginSize + "px";
            } 
        }
        if (this.isOpened === true) {
            if (this.#config.scrollLockClass) document.body.classList.add(this.#config.scrollLockClass);
            else {
                document.body.style.overflow = 'hidden';
            }
            return;
        }
        document.body.style.paddingRight = "";
        document.body.classList.remove(this.#config.scrollLockClass);
        
    }

    #checkOverflow() {
        if (!document.querySelector(this.#config.modalContainer)) return
        const modalHeight = document.querySelector(this.#config.modalContainer).clientHeight;
        const clientHeight = window.innerHeight;

        return modalHeight > clientHeight
    }

    // Listeners

    on(listener, callback) {
        if (!callback || typeof callback !== 'function') return
        if (listener === 'beforedestroy') {this.#beforedestroy = callback; this.hasEventListeners = true}
        if (listener === 'afterdestroy') {this.#afterdestroy = callback; this.hasEventListeners = true}
        if (listener === 'openstart') {this.#openstart = callback; this.hasEventListeners = true}
        if (listener === 'openend') {this.#openend = callback; this.hasEventListeners = true}
        if (listener === 'closestart') {this.#closestart = callback; this.hasEventListeners = true}
        if (listener === 'closeend') {this.#closeend = callback; this.hasEventListeners = true}
    }

    set(prop, value) {
        this.#config[prop] = value
    }

    // Methods

    open() {
        if (this.isOpened) {
            return;
        }
        if (typeof this.#config?.openCallback?.before === 'function') this.#config.openCallback.before()
        if (typeof this.#openstart === 'function') this.#openstart()
        

        this.openedPopup = document.querySelector(this.#config.modal);

        this.openedPopup.classList.add(this.#config.activeClass);
        this.openedPopup.setAttribute('aria-hidden', 'false');
        if (this.standardStyles?.activeClass) {
            for (let styleKey in this.standardStyles.activeClass) {
                this.openedPopup.style[styleKey] = this.standardStyles.activeClass[styleKey]
            }
        }

        this.isOpened = true;
        this.#bodyScrollControl();


        if (typeof this.#config?.openCallback?.after === 'function') this.#config.openCallback.after()
        if (typeof this.#openend === 'function') this.#openend()
    }

    close() {
        if (!this.isOpened) {
            return;
        }
        if (typeof this.#config?.closeCallback?.before === 'function') this.#config.closeCallback.before()
        if (typeof this.#closestart === 'function') this.#closestart()

        this.openedPopup.classList.remove(this.#config.activeClass);
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
        this.#bodyScrollControl();

        if (typeof this.#config?.closeCallback?.after === 'function') this.#config.closeCallback.after()
        if (typeof this.#closeend === 'function') this.#closeend()
    }

    toggle() {
        if (this.isOpened) this.close()
        else this.open()
    }

    init(parentContainer) {
        const parent = document.querySelector(parentContainer)
        if (!parent) throw new SyntaxError('Can not find any valid elements with this selector!')

        const modalHTML = `
        <div class="${this.#config.modal.substring(1)}">
            <div class="${this.#config.overlay.substring(1)}">
                <div class="${this.#config.modalContainer.substring(1)}">
                    <div class="${this.#config.closer.substring(1)}"></div>
                </div>
            </div>
        </div>
        `
        parent.innerHTML = modalHTML

        this.#init()
    }   
}