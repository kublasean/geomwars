/* globals, GC, init, and the main loop (drawScene) */

var gl = null;
var GC = {};
var keys = [];
var camera = {
  position: [0,0,1],
  target: [0,0,0]
}
var enemies = [];
var bholes = [];
var shader2D;

//graphics context variables
GC.mouseDown = false;
GC.width = null;
GC.height = null;
GC.near = 0.001;
GC.far = 200;
GC.zoom = 0.1;
GC.fps = 30;
GC.oldView = null;
GC.oldProj = null;


function main(glcontext) {
  gl = glcontext;
  //load files/images
  beginDemo();
}

function beginDemo() {
  shader2D  = new Shader("VertexShader2D", "FragmentShader2D");

  GC.level = new Level(1);
	var hero = new Player(shader2D);
  GC.hero = hero;

  GC.map = new Map();
  var main = new MapSegment(shader2D);
  GC.map.segments.push(main);

  spawnGrid();

  //setup event callbacks
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  window.onresize = windowResize;
  setMouseEventCallbacks(gl.canvas);


  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);

  GC.oldProj = makeOrtho(-GC.width/2.0 * GC.zoom, GC.width/2.0 * GC.zoom, -GC.height/2.0 * GC.zoom, GC.height/2.0 * GC.zoom, GC.near, GC.far);
  GC.oldView = makeLookAt(camera.position[0],camera.position[1],camera.position[2],
    camera.target[0],camera.target[1],camera.target[2],
    0,1,0);

  GC.game = setInterval(drawScene, 1000.0 / GC.fps);
}

function drawScene() {
	//scene updates
  canvasResize();
  updateKeys();
  bholes = [];
  var newView = updateCamera(GC.oldView);

  var proj = makeOrtho(-GC.width/2.0 * GC.zoom, GC.width/2.0 * GC.zoom, -GC.height/2.0 * GC.zoom, GC.height/2.0 * GC.zoom, GC.near, GC.far);
  var view = makeLookAt(camera.position[0],camera.position[1],camera.position[2],
    camera.target[0],camera.target[1],camera.target[2],
    0,1,0);

  //model updates
  GC.level.update();
  GC.hero.gun.update(view, GC.map, GC.hero.translation[0]);
	updateEnemies(view, GC.map);
  if(GC.hero.update(view, GC.map))
    clearInterval(GC.game);

  //model draws
  gl.clear(gl.COLOR_BUFFER_BIT);
  //GC.map.draw(proj, view);
  drawGrid(proj, view);
  Model.draw(GC.hero, proj, view);
  GC.hero.gun.draw(proj, view);
  drawEnemies(proj, view);

  GC.oldView = view;
}

function updateEnemies(view, map) {
  for (var i=0; i<enemies.length; i++) {
    if (enemies[i].update(view, map)) {
      enemies.splice(i,1);
      i--;
    }
  }
}

function drawEnemies(proj, view) {
	enemies.forEach(function(E,i,arr) { Model.draw(E, proj, view); });
}

function updateKeys() {

  GC.hero.velocity.setElements([0,0]);
  var v = GC.hero.velocity.elements;

  //left arrow
  if (keys[65]) {
    v[0] = -1;
  }
  //up arrow
  if (keys[87]) {
    v[1] = 1;
  }
  //right arrow
  if (keys[68]) {
    v[0] = 1;
  }
  //down arrow
  if (keys[83]) {
    v[1] = -1;
  }

  if (v[0] && v[1]) {
    v[0] /= 2.0;
    v[1] /= 2.0;
  }

  GC.hero.velocity = GC.hero.velocity.toUnitVector();
}

function updateCamera(view) {
  var margin = 8;
  var player = GC.hero;
  var edge = Vector.create([GC.width/2.0*GC.zoom, GC.height/2.0*GC.zoom]);
  var newView = false;

  if (view == null)
    return;

  var dist = edge.subtract(player.viewPosition.map(Math.abs)).elements;

  function panView(axis) {
    if (dist[axis] < margin) {
      if (player.velocity.elements[axis] * player.viewPosition.elements[axis] > 0) {
        camera.position[axis] += player.velocity.elements[axis] * player.delta;
        camera.target[axis] += player.velocity.elements[axis] * player.delta;
				newView = true;
      }
    }
  }
  panView(0);
  panView(1);

	return newView;
}

/************* EVENT CALLBACKS ******************/

//window resize
windowResize = function() {
  GC.windowX = window.innerWidth;
  GC.windowY = window.innerHeight;
}

setMouseEventCallbacks = function(canvas){
    //-------- set callback functions
    canvas.onmousedown = mouseDown;
    canvas.onmousewheel = mouseWheel;

    document.onmouseup = mouseUp;
    document.onmousemove = mouseMove;
}

//handle mousedown
mouseDown = function(event) {
    GC.mouseDown = true;
    GC.mouseX = event.clientX;
    GC.mouseY = event.clientY;
    GC.hero.gun.updateAngle();
    return false;
}

//handle mouseup
mouseUp = function(event){
    GC.mouseDown = false;
    return false;
}

//handle mouse movement
mouseMove = function(event) {
     GC.mouseX = event.clientX;
     GC.mouseY = event.clientY;

    return false;
}

//handle mouse scroll event
mouseWheel = function(event){
    GC.zoom -= event.wheelDeltaY*0.00005;
    return false;
}


//--------- handle keyboard events
keyDown = function(e){
  keys[e.keyCode] = 1;
}
keyUp = function(e){
  keys[e.keyCode] = 0;

}
