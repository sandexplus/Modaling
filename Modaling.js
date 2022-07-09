export default class Modaling {
    #modalBlock
    #nextPopup
    #scrollPosition
    #overlayChecker

    constructor(params) {
        let defaultConfig = {
            // options
            standardStyles: false,
            scrollLocking: true,
            keys: ['Escape'],

            //elems
            modal: '.js-modal',
            opener: '.js-open',
            closer: '.js-close',
            overlay: 'js-overlay',

            //styles
            activeClass: 'modal_show',
            scrollLockClass: null,

            //callbacks
            openCallback: null,
            closeCallback: null,
        }

        this.config = Object.assign(defaultConfig, params)

        this.beforeinit = null
        this.afterinit = null
        this.beforedestroy = null
        this.afterdestroy = null
        this.openstart = null
        this.openend = null
        this.closestart = null
        this.closeend = null

        this.#init()
    }

    #init() {
        if (this.beforeinit) this.beforeinit()

        // Properties
        this.isOpened = false;
        this.hasEventListeners = false;
        // this.openedPopup = false;
        this.#overlayChecker = false;


        this.#eventsFeeler();


        if (this.afterinit) this.afterinit()
    }

    on(listener, callback) {
        if (!callback || typeof callback !== 'function') return
        if (listener === 'beforeinit') {this.beforeinit = callback; this.hasEventListeners = true}
        if (listener === 'afterinit') {this.afterinit = callback; this.hasEventListeners = true}
        if (listener === 'beforedestroy') {this.beforedestroy = callback; this.hasEventListeners = true}
        if (listener === 'afterdestroy') {this.afterdestroy = callback; this.hasEventListeners = true}
        if (listener === 'openstart') {this.openstart = callback; this.hasEventListeners = true}
        if (listener === 'openend') {this.openend = callback; this.hasEventListeners = true}
        if (listener === 'closestart') {this.closestart = callback; this.hasEventListeners = true}
        if (listener === 'closeend') {this.closeend = callback; this.hasEventListeners = true}
    }

    #documentClick(e) {
        const clickedLink = e.target.closest(this.config.opener);
         

        if (clickedLink) { 
            e.preventDefault();
            this.open();
            return;
        }

        if (e.target.closest(this.config.closer)) {
            this.close();
            return;
        }
    }

    #keyDown(e) {
        if ((this.config.keys.includes(e.key) || this.config.keys.includes(e.code)) && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
        }
    }

    #mouseDown(e) {
        if (!e.target.classList.contains(this.config.overlay)) return;
        this.#overlayChecker = true;
    }

    #mouseUp(e) {
        if (this.#overlayChecker && e.target.classList.contains(this.config.overlay)) {
            e.preventDefault();
            !this.#overlayChecker;
            this.close();
            return;
        }
        this.#overlayChecker = false;
    }

    #eventsFeeler(){

        document.addEventListener("click", (e) => this.#documentClick(e));

        window.addEventListener("keydown", (e) => this.#keyDown(e));

        document.addEventListener('mousedown', (e) => this.#mouseDown(e));
        
        document.addEventListener('mouseup', (e) => this.#mouseUp(e));

    }

    destroy() {
        if (this.beforedestroy) this.beforedestroy()

        document.removeEventListener("click", (e) => this.#documentClick(e));

        window.removeEventListener("keydown", (e) => this.#keyDown(e));

        document.removeEventListener('mousedown', (e) => this.#mouseDown(e));
        
        document.removeEventListener('mouseup', (e) => this.#mouseUp(e));

        if (this.afterdestroy) this.afterdestroy()
    }

    open(){
        if (this.isOpened) {
            return;
        }

        if (this.config.openCallback?.before && typeof this.config.openCallback?.before === 'function') this.config.openCallback.before()
        if (this.openstart) this.openstart()


        this.openedPopup = document.querySelector(this.config.modal);

        this.openedPopup.classList.add(this.config.activeClass);
        this.openedPopup.setAttribute('aria-hidden', 'false');

        this.isOpened = true;
        this.#bodyScrollControl();


        
        if (this.config.openCallback?.after && typeof this.config.openCallback?.after === 'function') this.config.openCallback.after()
        if (this.openend) this.openend()
    }

    close(){
        if (!this.isOpened) {
            return;
        }

        if (this.config.closeCallback?.before && typeof this.config.closeCallback?.before === 'function') this.config.closeCallback.before()
        if (this.closestart) this.closestart()

        this.openedPopup.classList.remove(this.config.activeClass);
        this.openedPopup.setAttribute('aria-hidden', 'true');

        this.isOpened = false;
        this.#bodyScrollControl();

        
        if (this.config.closeCallback?.after && typeof this.config.closeCallback?.after === 'function') this.config.closeCallback.after()
        if (this.closeend) this.closeend()
    }

    #bodyScrollControl(){
        if (!this.config.scrollLocking) {
            return
        }
        let marginSize = window.innerWidth - document.body.clientWidth;
        if (marginSize) {
            document.body.style.paddingRight = marginSize + "px";
        } 
        if (this.isOpened === true) {
            document.body.classList.add(this.config.scrollLock);
            return;
        }
        document.body.style.paddingRight = "";
        document.body.classList.remove(this.config.scrollLock);
        
    }
}