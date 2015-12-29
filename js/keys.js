/***********************************************************
 * keys.js
 * Determine Keys to Key Events
 *
 *
 * Changes
 * Version  Who            When        What
 * 1.0      James Todd    12/27/2015   Initial version
 ***********************************************************/

function Keys(constants)
{
    trace("Keys Defined");
    this.initialize(constants);
}

Keys.prototype.initialize = function (constants)
{
    this.constants = constants;
    this.keyActions = {
        "MOVE_UP": [constants.keyCode.UP, constants.keyCode.W],
        "MOVE_LEFT": [constants.keyCode.LEFT, constants.keyCode.A],
        "MOVE_DOWN": [constants.keyCode.DOWN, constants.keyCode.S],
        "MOVE_RIGHT": [constants.keyCode.RIGHT, constants.keyCode.D],
        "FAST_SPEED": [constants.keyCode.SHIFT]
    };
}

Keys.prototype.GetCurrentAction = function (activeKeys)
{
    var actions = [];
    for (activeKey in activeKeys)
    {
        if (activeKeys[activeKey])
        {
            for (keyName in this.keyActions)
            {
                keyValues = this.keyActions[keyName];
                for (keyValueIndex in keyValues)
                {
                    keyValue = keyValues[keyValueIndex];
                    if (keyValue == activeKey)
                    {
                        actions.push(keyName);
                    }
                }
            }
        }
    }
    return actions;
}