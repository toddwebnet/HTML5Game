

var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var keys = [];

window.addEventListener("keydown", function(e){
    keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function(e){
    keys[e.keyCode] = false;
    delete keys[e.keyCode];
}, false);

/*
up    - 38
down  - 40
left  - 37
right - 39
 */


function game()
{
    update();
    render();
}

function update()
{
    if(keys[38])
    {console.log("Up");}
    if(keys[40])
    {console.log("Down");}
    if(keys[37])
    {console.log("Left");}
    if(keys[39])
    {console.log("Right");}

}

function render()
{
    context.fillRect(player.x, player.y, player.height, player.width);
}

setInterval(function(){
    game();
}, 1000/30);
if (keys[38]){alert('hi');}