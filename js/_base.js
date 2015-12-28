/**********************************************
 * _base.js
 * Invokes all the other scripts and starts the program(s)
 *
 *
 * Changes
 * Version  Who            When        What
 * 1.0      James Todd    12/27/2015   Initial version
 **********************************************/

"use strict";
var DebugMode = true;

var traceCount = 0;
function trace(traceDescr) {
    var traceMax = 999999;
    if (DebugMode) {
        console.log(numPad(traceCount, 6) + ": " + traceDescr + "\n");
    }
    traceCount++;
    if(traceCount>traceMax)
    {traceCount = 0;}
}
function numPad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var constants = new Constants();
var eventListeners = new EventListeners();
var keys = new Keys(constants);
setInterval(function(){
   Game()
}, 1000);

function Game()
{
    Update();
    Render();
}

function Update()
{
    keys.GetCurrentAction(eventListeners.getActiveKeys());
}

function Render()
{}
