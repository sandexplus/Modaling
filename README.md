# Modaling

Modaling is a simple and lightweight implementation of pop-ups, written in pure JavaScript and does not contain external dependencies

## Installation

```
npm install --save modaling
```

```
yarn add modaling
```

## Tutorial

### Parameters

All the parameters are includes by default but you can change some of them just send it as an object

#### Options

`standardStyles`
+ default: `false`
+ rules: `the parameter must contain a boolean. If it's true standard styles for all elements will be added by default. It's a good way if you want to build the modal faster`
**!! attention !!** 
    + you can set standard styles for certain elements if you send an object with the elements you need

`keys`
+ default: `['Escape']`
+ rules: `the parameter must contain an array with "key" or "code" properties`

#### Elements

Every key you send can be as an array contains query selectors of elements 

`modal`
+ default: `.js-modal`
+ rules: `the parameter must contain a string with a modal query selector`

`opener`
+ default: `.js-open`
+ rules: `the parameter must contain a string with an open button query selector`

`closer`
+ default: `.js-close`
+ rules: `the parameter must contain a string with a close button query selector`
**!! attention !!** 
    + do not send modal overlay selector as `closeClass`. It has it's own parameter

`overlay`
+ default: `js-overlay`
+ rules: `the parameter must contain a string with an modal overlay class`

#### Styles

`activeClass`
+ default: `modal_show`
+ rules: `the parameter must contain a string with an modal active class`

`scrollLockClass`
+ default: `null`
+ rules: `the parameter must contain a string with a scroll locking class. This class will be added to document.body`
**!! attention !!** 
    + if you do not send this parameter, the scroll lock will be applied automatically

`scrollLocking`
+ default: `true`
+ rules: `the parameter must contain a boolean. If it's false, scroll will not be locked when the modal is opened`
**!! attention !!** 
    + if you send this parameter as `false`, the scroll lock will not be applied in any ways

#### Callbacks

You can send the parameters `openCallback` and `closeCallback`. Each of them is an object containing two keys `before` and `after`. `before` runs before the modal opens, `after` - after. Read more in the Examples section

### Methods

`.open()`
+ opens modal. All callbacks runs too. If you don't want to run callbacks send `false` arg

`.close()`
+ closes modal. All callbacks runs too. If you don't want to run callbacks send `false` arg

`.destroy()`
+ destroys Modaling instance

### Properties

`.isOpened`
+ returns: `boolean`

`.hasEventListeners`
+ returns: `boolean`

### Event Listeners

You don't have to send a callback as a parameter. You can listen to this event via the `.on()` method. There are many more event listeners than when passed as parameters
if you send a callback as a parameter and listen for exactly the same event, they will both trigger. Firstly will be triggered the parameter then the listener

`.on()`
+ init event listener. Takes two parameters: listener and callback

`'beforeinit'`
+ triggers before the modal has been initialized

`'afterinit'`
+ triggers after the modal has been initialized

`'beforedestroy'`
+ triggers before the modal has been destroyed

`'afterdestroy'`
+ triggers after the modal has been destroyed

`'openstart'`
+ triggers before the modal has opened

`'openend'`
+ triggers after the modal has opened

`'closestart'`
+ triggers before the modal has closed

`'closeend'`
+ triggers after the modal has closed

## Examples

### Basic usage

```javascript
const modal = new Modaling({
    standardStyles: ['.alert-modal'], // standard styles will apply just to '.alert-modal' selector
    opener: '[data-open="alert-modal"]',
    scrollLockClass: 'overflow-hidden', // this will be ignored because scrollLocking parameter is sended
    scrollLocking: false,
    modal: ['.alert-modal', '.another-modal'], // you can send an array of selectors
    openCallback: {
        before: function() {
            alert('modal is starting to open')
        }
        after: function() {
            alert('modal opened')
        }
    },
    closeCallback: {
        before: function() {
            alert('modal is starting to close')
        }
        after: function() {
            alert('modal closed')
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

modal.destroy()
```