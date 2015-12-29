/***********************************************************
 * sprite.js
 * a sprite object
 *
 *
 * Changes
 * Version  Who            When        What
 * 1.0      James Todd    12/27/2015   Initial version
 ***********************************************************/


"use strict";

function Sprite(canvas)
{
    trace("Sprite Defined");
    this.initialize(canvas);
}

Sprite.prototype.initialize = function (canvas)
{
    this.properties = {
        X: 10,
        Y: 10,
        WIDTH: 20,
        HEIGHT: 20,
        NORMAL_SPEED: 2,
        FAST_SPEED: 8,
        MAX_X: canvas.width,
        MAX_Y: canvas.height,
        COLLISION: false

    }
}

Sprite.prototype.move = function (dir, speedOpt)
{
    var speed = this.properties.NORMAL_SPEED;
    if (speedOpt == "FAST")
    {
        speed = this.properties.FAST_SPEED;
    }
    switch (dir)
    {
        case "MOVE_LEFT":
            this.properties.X -= speed;
            break;
        case "MOVE_RIGHT":
            this.properties.X += speed;
            break;
        case "MOVE_UP":
            this.properties.Y -= speed;
            break;
        case "MOVE_DOWN":
            this.properties.Y += speed;
            break;
    }

    if (this.properties.X < 0)
    {
        this.properties.X = 0;
    }
    if (this.properties.Y < 0)
    {
        this.properties.Y = 0;
    }
    if (this.properties.X > this.properties.MAX_X - this.properties.WIDTH)
    {
        this.properties.X = this.properties.MAX_X - this.properties.WIDTH;
    }
    if (this.properties.Y > this.properties.MAX_Y - this.properties.HEIGHT)
    {
        this.properties.Y = this.properties.MAX_Y - this.properties.HEIGHT;
    }


}

Sprite.prototype.randomizeLocation = function()
{
    this.properties.X = Math.random() * (this.properties.MAX_X - this.properties.WIDTH);
    this.properties.Y = Math.random() * (this.properties.MAX_Y - this.properties.HEIGHT);
}
