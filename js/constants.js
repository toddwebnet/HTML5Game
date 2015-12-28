/***********************************************************
 * constants.js
 * Defines constants for keypress events
 *
 *
 * Changes
 * Version  Who            When        What
 * 1.0      James Todd    12/27/2015   Initial version
 ***********************************************************/

"use strict";

function Constants() {
    trace("Constants Defined ");
    this.initialize();
}

Constants.prototype.initialize = function () {
    trace("Constants Initialize");

    /* define constants */
    this.keyCode = {
        UP: 38,
        DOWN: 40,
        RIGHT: 39,
        LEFT: 37,
        W: 87,
        A: 65,
        S: 83,
        D: 68
    };
}
