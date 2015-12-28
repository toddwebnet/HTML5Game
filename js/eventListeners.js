/***********************************************************
 * eventListeners.js
 * Defines Event Listener Functions
 *
 *
 * Changes
 * Version  Who            When        What
 * 1.0      James Todd    12/27/2015   Initial version
 ***********************************************************/

"use strict";

function EventListeners()
{
    trace("Event Listeners Defined");
    this.initialize();
}
EventListeners.prototype.initialize = function ()
{
    trace("Event Listeners Initialized()");

    this.keys = [];
    var keys = this.keys;

    window.addEventListener("keydown", function (e)
    {
        keys[e.keyCode] = true;
    }, false);

    window.addEventListener("keyup", function (e)
    {
        //this.keys[e.keyCode] = false;
        delete keys[e.keyCode];
    }, false);


}
EventListeners.prototype.getActiveKeys = function ()
{
    return this.keys;
}


