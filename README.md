# Modaling

Modaling is a simple and lightweight implementation of pop-ups, written in TypeScript and does not contain external dependencies

## Installation

```
npm install --save modaling
```

```
yarn add modaling
```

## Quick start

Add this HTML on your page

```html
<div class="js-modal"> <!-- whole modal container -->
    <div class="js-overlay"> <!-- overlay --> 
        <div class="modal-container"> !-- modal content --> 
            <button class="js-close"></button> !-- close button -->/ 
        </div>
    </div>
</div>
```

And this HTML for open button

```html
<button class="js-open">Open modal</button>
```

Next import Modaling into your JS file and initialize it

```javascript
import Modaling from './Modaling.js'
const modal = new Modaling({
    standardStyles: true // send this parameter for auto setting styles
})
```

## Usage

### Parameters

All the parameters are includes by default but you can change some of them just send it as an object

#### Options

`standardStyles` **Boolean || [ String ]** 
+ default: `false`
+ rules: If it's true standard styles for all elements will be added by default. It's a good way if you want to build the modal faster
+ **!! attention !!** 
    + you can set standard styles for certain elements if you send an object with the strings of elements you need 
    + Allowed strings:
        + `modal` - the whole modal block
        + `modalContainer` - modal content container
        + `overlay` - overlay of the modal
        + `open` - the opener element
        + `close` - the closer element
        + `activeClass` - include the modal show class

`keys` **[ String ]**
+ default: `['Escape']`
+ rules: the parameter must contain an array with `"key"` or `"code"` properties

`keyClose` **Boolean**
+ default: `true`
+ rules: If it's false, pressing any key will not be trigger close method
+ **!! attention !!** 
    + if you send this parameter as `false`, close by key will not be applied in any ways

`openByMethod` **Boolean**
+ default: `false`
+ rules: If it's true, modal opens only by method `.open()`

`closeByMethod` **Boolean**
+ default: `false`
+ rules: If it's true, modal opens only by method `.close()`

`autoInit` **Boolean**
+ default: `true`
+ rules: If it's false, the instance will be initialized only after `.init()` method

`autoOpen` **Number || Boolean**
+ default: `false`
+ rules: Takes time in ms. After this time the modal will be opened automatically. Send `false` if you want to disable auto open

`autoClose` **Number || Boolean**
+ default: `false`
+ rules: Takes time in ms. After this time the modal will be closed automatically. Send `false` if you want to disable auto close

`scrollLocking` **Boolean**
+ default: `true`
+ rules: If it's false, scroll will not be locked when the modal is opened
+ **!! attention !!** 
    + if you send this parameter as `false`, the scroll lock will not be applied in any ways

#### Elements

`modal` **String**
+ default: `.js-modal`
+ rules: The modal query selector

`modalContainer` **String**
+ default: `.modal-container`
+ rules: The modal window query selector

`opener` **String**
+ default: `.js-open`
+ rules: The open button query selector

`closer` **String**
+ default: `.js-close`
+ rules: The close button query selector
+ **!! attention !!** 
    + do not send modal overlay selector as `closer`. It has it's own parameter

`overlay` **String**
+ default: `.js-overlay`
+ rules: The modal overlay query selector

#### Styles

`activeClass` **String**
+ default: `modal_show`
+ rules: The modal active class

`scrollLockClass` **String || Boolean**
+ default: `false`
+ rules: The scroll locking class. This class will be added to `document.body`
+ **!! attention !!** 
    + If you do not send this parameter, the scroll lock will be applied automatically

`enablePadding` **Boolean**
+ default: `true`
+ rules: If this parameter is `false`, page content will not padding right when modal opens

#### Callbacks

You can send the parameters `initCallback`, `openCallback`, `closeCallback`. Each of them is an object containing two keys `before` and `after`. `before` runs before action, `after` - after. Read more in the Examples section

### Methods

`.on(listener, callback)`
+ Initialize event listener

`.set(prop, value)`
+ Changes parameter. Can change every of accepted parameters included in the `Parameters` block

`.open()`
+ Opens modal. All callbacks runs too. If you don't want to run callbacks send `false` arg

`.close()`
+ Closes modal. All callbacks runs too. If you don't want to run callbacks send `false` arg

`.toggle()`
+ Toggle modal visibility

`.init(parentContainer)`
+ Initialize instance with sended or standard selectors. Places the modal into the `parentContainer` element 

### Properties

`.isOpened`
+ returns: `boolean`

`.hasEventListeners`
+ returns: `boolean`

`.openedPopup`
+ returns: `DOM Node`

`isOverflow`
+ returns: `boolean`

### Event Listeners

You don't have to send a callback as a parameter. You can listen to this event via the `.on()` method. There are many more event listeners than when passed as parameters
if you send a callback as a parameter and listen for exactly the same event, they will both trigger. Firstly will be triggered the parameter then the listener

`'openstart'`
+ triggers before the modal has opened

`'openend'`
+ triggers after the modal has opened

`'closestart'`
+ triggers before the modal has closed

`'closeend'`
+ triggers after the modal has closed

`'resize'`
+ triggers after the window has been resized

## Examples

### Basic usage

```javascript
const modal = new Modaling({
    standardStyles: ['modal'], // standard styles will apply just to 'modal' element
    opener: '[data-open="alert-modal"]',
    scrollLockClass: 'overflow-hidden', // this will be ignored because scrollLocking parameter is sended
    scrollLocking: false,
    modal: '.alert-modal',
    initCallback: {
        before: function() {
            alert('modal is started init')
        }
        after: function() {
            alert('modal inited')
        }
    }
})
```

### Basic methods and properties

```javascript
const modal = new Modaling()
alert(modal.isOpened) // return false
modal.open() 
alert(modal.isOpened) // return true
```
