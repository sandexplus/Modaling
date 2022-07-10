declare type conf = {
    standardStyles?: boolean;
    scrollLocking?: boolean;
    keys?: string[];
    keyClose?: boolean;
    openByMethod?: boolean;
    closeByMethod?: boolean;
    autoInit?: boolean;
    autoOpen?: boolean | number;
    autoClose?: boolean | number;
    modal?: string;
    opener?: string;
    closer?: string;
    overlay?: string;
    modalContainer: string;
    activeClass?: string;
    scrollLockClass?: string;
    enablePadding?: boolean;
    initCallback?: null | {
        before?: Function;
        after?: Function;
    };
    openCallback?: null | {
        before?: Function;
        after?: Function;
    };
    closeCallback?: null | {
        before?: Function;
        after?: Function;
    };
};
declare class Modaling {
    isOpened: boolean;
    hasEventListeners: boolean;
    openedPopup: HTMLElement | boolean;
    isOverflow: boolean;
    standardStyles: {
        modal: {};
        modalContainer: {};
        overlay: {};
        close: {};
        activeClass: {};
        open: {};
    };
    private _defaultConfig;
    private _config;
    private _overlayChecker;
    private _openstart;
    private _openend;
    private _closestart;
    private _closeend;
    private _resize;
    constructor(params?: {});
    private _init;
    private _documentClick;
    private _keyDown;
    private _mouseDown;
    private _mouseUp;
    private _windowResize;
    private _setStandardStyles;
    private _eventsFeeler;
    private _bodyScrollControl;
    private _checkOverflow;
    on(listener: string, callback: Function): void;
    set(prop: string, value: any): void;
    open(): void;
    close(): void;
    toggle(): void;
    init(parentContainer: any): void;
}
