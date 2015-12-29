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

var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var constants = new Constants();
var eventListeners = new EventListeners();
var keys = new Keys(constants);
var player = new Sprite(canvas);
player.properties.FAST_SPEED = 4;
player.properties.NORMAL_SPEED = 4;

var enemies = [];
startNewEnemy();
var Tick = 0

var SpawnEnemiesEvery = 200;
var gameTime = 30;
var timePerEnemy = 3;
var maxEnemies = 12;
var timePerEnemyDropPerLevel = 1;
var pointsPerCollision = 10;
var score = 0;
var maxSpeed = 20;

var startTime = new Date();
var lastDecreaseSpeed = new Date();
setInterval(function ()
{
    Game();

}, 1000 / 30);

function trace(traceDescr)
{
    var traceMax = 999999;
    if (DebugMode)
    {
        console.log(numPad(traceCount, 6) + ": " + traceDescr + "\n");
    }
    traceCount++;
    if (traceCount > traceMax)
    {
        traceCount = 0;
    }
}
function numPad(num, size)
{
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}


function Game()
{
    var curTime = new Date();
    var timeSpent = Math.round((curTime - startTime) / 1000);
    var timeLeft = gameTime - timeSpent;
    if (timeLeft > 0)
    {
        Update();
        Render(timeLeft);
    }
    else
    {
        GameOver();
    }
}

function Update()
{
    addNewEnemies();
    decreaseSpeed();
    var events = keys.GetCurrentAction(eventListeners.getActiveKeys());
    processMove(events, player);
    player.properties.COLLISION = false;
    for (var x = 0; x < enemies.length; x++)
    {
        if (collision(player, enemies[x]))
        {
            player.properties.COLLISION = true;
            var errSound = new Audio("assets/fail-buzzer-02.wav"); // buffers automatically when created
            errSound.play();
            enemies[x].randomizeLocation();
            score += pointsPerCollision;
            gameTime += timePerEnemy;
            increaseSpeed();
        }
    }

}

function processMove(events, obj)
{
    var command = "";
    var eventCommands = [];
    var option = "";
    for (var x = 0; x < events.length; x++)
    {
        if (events[x].indexOf("MOVE_") >= 0)
        {
            eventCommands.push(events[x]);
            command = "MOVE";
        }
        if (events[x].indexOf("FAST") >= 0)
        {
            option = "FAST";
        }


    }
    if (command == "MOVE")
    {
        for (var x = 0; x < eventCommands.length; x++)
        {
            var event = eventCommands[x];
            if (obj)
            {
                obj.move(event, option);
            }
        }
    }
}

var flashFlag = true;

function Render(timeLeft)
{

    var playerProperties = player.properties
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (player.properties.COLLISION)
    {
        if (flashFlag)
        {
            context.fillStyle = "#ff3333";
        }
        else
        {
            context.fillStyle = "#33ffff";
        }
        flashFlag = !flashFlag;
    }
    else
    {
        context.fillStyle = "#000066";
    }
    context.fillRect(playerProperties.X, playerProperties.Y, playerProperties.WIDTH, playerProperties.HEIGHT);
    for (var x = 0; x < enemies.length; x++)
    {
        var enemy = enemies[x];
        context.fillStyle = "#006600";
        context.fillRect(enemy.properties.X, enemy.properties.Y, enemy.properties.WIDTH, enemy.properties.HEIGHT);
    }
    context.fillStyle = "#000";
    context.fillText("Score: " + score, 10, canvas.height - 10);
    context.fillText("Speed: " + player.properties.NORMAL_SPEED, (canvas.width/2)-50, canvas.height - 10);
    context.fillText("Time: " + timeLeft, canvas.width - 100, canvas.height - 10);
}

function GameOver()
{
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillText("Game Over", (canvas.width / 2) - 50, (canvas.height / 2) - 10);
    context.fillText("Score: " + score, 10, canvas.height - 10);
}

function startNewEnemy()
{
    var e = new Sprite(canvas);
    e.randomizeLocation();
    enemies.push(e);

    if (player.properties.NORMAL_SPEED > 1)
    {
        player.properties.FAST_SPEED--;
        player.properties.NORMAL_SPEED--;
    }
    timePerEnemy -= timePerEnemyDropPerLevel;
    if (timePerEnemy == 0)
    {
        timePerEnemy = 1;
    }
}


function random(from, to)
{
    if (from > to)
    {
        var t = from;
        from = to;
        to = t;
    }
    return Math.floor(Math.random() * (to - from + 1) + from);
}

function collision(first, second)
{
    return !(
        first.properties.X > second.properties.X + second.properties.WIDTH ||
        first.properties.X + first.properties.WIDTH < second.properties.X ||
        first.properties.Y > second.properties.Y + second.properties.HEIGHT ||
        first.properties.Y + first.properties.HEIGHT < second.properties.Y
    );
}


function addNewEnemies()
{
    Tick++;
    if ((Tick == SpawnEnemiesEvery) && (enemies.length < maxEnemies))
    {
        startNewEnemy();
        Tick = 0;
    }
}

function increaseSpeed()
{

    player.properties.FAST_SPEED += 2;
    player.properties.NORMAL_SPEED += 2;
    if (player.properties.NORMAL_SPEED > maxSpeed)
    {
        player.properties.FAST_SPEED = 20;
        player.properties.NORMAL_SPEED = 20;
    }
    lastDecreaseSpeed = new Date();
}

function decreaseSpeed()
{
    var curTime = new Date();
    var timeToDrop = 2000;
    if(player.properties.FAST_SPEED> 15)
    {timeToDrop = 250;}
    else if(player.properties.FAST_SPEED> 10)
    {timeToDrop = 750;}
    else if(player.properties.FAST_SPEED> 5)
    {timeToDrop = 1000;}
    if (curTime - lastDecreaseSpeed > timeToDrop)
    {
        lastDecreaseSpeed = curTime;
        if (player.properties.FAST_SPEED > 1)
        {
            player.properties.FAST_SPEED -= 1;
            player.properties.NORMAL_SPEED -= 1;
        }
    }
}