/* globals, GC, init, and the main loop (drawScene) */

var gl = null;
var GC = {};
var UI = {};

var keys = [];
var camera = {
  position: [0,0,1],
  target: [0,0,0]
}
var enemies = [];
var bholes = [];
var sparks = [];

//shaders
var shader2D;
var spark3D_bullet;
var spark3D_hero;

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

//UI variables
UI.score = null;
UI.mult = null;
UI.bombs = null;


function main(glcontext) {
  gl = glcontext;
  //load files/images
  beginDemo();
}

function beginDemo() {
  shader2D  = new Shader("VertexShader2D", "FragmentShader2D");
  star2D    = new Shader("VertexShader2D_STAR", "FragmentShader2D_STAR");
	spark3D_bullet = new Shader("VertexShader3D_Spark_bullet", "FragmentShader3D_Spark");
	spark3D_hero = new Shader("VertexShader3D_Spark_hero", "FragmentShader3D_Spark");



	var hero = new Player(shader2D);
  GC.hero = hero;

  GC.level = new Level(1);

  GC.map = new Map();
  var main = new MapSegment(shader2D);
  GC.map.segments.push(main);

  canvasResize();
  GC.stars1 = new Stars(star2D, -1, [0.3, 3.0], 0.01);
  //GC.stars1.uniforms.u_color[0] = 0.0;
  GC.stars2 = new Stars(star2D, -1, [3.1, 5.0], 0.05);
  //GC.stars1.uniforms.u_color[1] = 0.0;
  GC.stars3 = new Stars(star2D, -1, [5.1, 8.0], 0.08);
  //GC.stars1.uniforms.u_color[2] = 0.0;
		
  GC.score = 0; GC.mult = 1; GC.lives = 1; GC.bombs = 0;

  spawnGrid();

  //setup event callbacks
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;
  window.onresize = windowResize;
  setMouseEventCallbacks(gl.canvas);
  UI.score = document.getElementById("score");
  UI.mult = document.getElementById("mult");
  UI.lives = document.getElementById("lives");
  UI.bombs = document.getElementById("bombs");


  gl.clearColor(27/255.0, 39/255.0, 53/255.0, 1.0);
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
  updateUI();
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
  updateBholes(view, GC.map);

  //model draws
  gl.clear(gl.COLOR_BUFFER_BIT);
  //GC.map.draw(proj, view);

	//sparks
	updateSparks();
	drawSparks(proj, view);
	
  drawGrid(proj, view);
  Model.draw(GC.hero, proj, view);
  GC.hero.gun.draw(proj, view);
  drawEnemies(proj, view);

	//stars
	updateStars();
  //Model.draw(GC.stars1, proj, view);
  //Model.draw(GC.stars2, proj, view);
  //Model.draw(GC.stars3, proj, view);
	
	

  GC.oldView = view;
}

function updateBholes(view, map) {
  for (var i=0; i<bholes.length; i++) {
    if (bholes[i].update(view, map)) {
      bholes.splice(i,1);
      i--;
    }
  }
}
function updateEnemies(view, map) {
  for (var i=0; i<enemies.length; i++) {
    if (enemies[i].update(view, map)) {
      enemies.splice(i,1);
      i--;
    }
  }
}
function updateStars() {
	GC.stars1.update();
	GC.stars2.update();
	GC.stars2.update();
}
function drawSparks(proj, view) {
	sparks.forEach(function(E,i,arr) { Model.draw(E, proj, view); });
}
function updateSparks() {
	for (var i=0; i<sparks.length; i++) {
		if (sparks[i].update()) {
			sparks.splice(i,1);
			i--;
		}
	}
}

function drawEnemies(proj, view) {
	enemies.forEach(function(E,i,arr) { Model.draw(E, proj, view); });
  bholes.forEach(function(E,i,arr) { Model.draw(E, proj, view); });
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
  var margin = 100;
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
        GC.stars1.translation[0][axis] += player.velocity.elements[axis] * GC.stars1.factor;
        GC.stars2.translation[0][axis] += player.velocity.elements[axis] * GC.stars2.factor;
        GC.stars3.translation[0][axis] += player.velocity.elements[axis] * GC.stars3.factor;
				newView = true;
      }
    }
  }
  panView(0);
  panView(1);

	return newView;
}

function updateUI() {
  UI.score.innerText = GC.score;
  UI.mult.innerText = GC.mult;
  UI.lives.innerText = GC.hero.lives;
  UI.bombs.innerText = GC.bombs;
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
