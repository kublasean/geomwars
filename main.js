/* globals, GC, init, and the main loop (drawScene) */

var gl = null;
var GC = {};
var keys = [];
var camera = {
  position: [0,0,1],
  target: [0,0,0]
}
var shader2D;
var masterCount = 0.0;
//graphics context variables
GC.mouseDown = false;
GC.width = null;
GC.height = null;
//GC.near = 0.001;
//GC.far = 200;
//GC.zoom = 0.1;
GC.fps = 30;



function main(glcontext) {
  gl = glcontext;
  //load files/images
  beginDemo();
}

function beginDemo() {
  shader2D  = new Shader("VertexShader2D", "FragmentShader2D");

  //setup event callbacks
  window.onresize = windowResize;
  setMouseEventCallbacks(gl.canvas);


  gl.clearColor(1, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);

  GC.game = setInterval(drawScene, 1000.0 / GC.fps);

  var grid = {};
  grid.uniforms = {};
  grid.attributes = {};
  GC.grid = grid;
}

function drawScene() {
	//scene updates
  canvasResize();

  var numVerts = 1000;
  var verts = [];
  for (var i=0; i<numVerts; i++) {
    verts[i] = i;
  }



  GC.grid.attributes.vertexId = { buffer: getBuffer(verts), numComponents: 1}
  GC.grid.uniforms.resolution = [GC.width, GC.height];
  GC.grid.uniforms.mouse = [GC.mouseX, GC.mouseY];
  GC.grid.uniforms.vertexCount = numVerts;
  GC.grid.uniforms.time = masterCount;
  setUniforms(shader2D.uniformSetters, GC.grid.uniforms);
  setAttributes(shader2D.attribSetters, GC.grid.attributes);

  gl.useProgram(shader2D.program);
  gl.drawArrays(gl.POINTS, 0, numVerts);
  //var proj = makeOrtho(-GC.width/2.0 * GC.zoom, GC.width/2.0 * GC.zoom, -GC.height/2.0 * GC.zoom, GC.height/2.0 * GC.zoom, GC.near, GC.far);
  //var view = makeLookAt(camera.position[0],camera.position[1],camera.position[2],
  //  camera.target[0],camera.target[1],camera.target[2],
  //  0,1,0);
  masterCount += 0.01;
}


/************* EVENT CALLBACKS ******************/

//window resize
windowResize = function() {
  GC.windowX = window.innerWidth;
  GC.windowY = window.innerHeight;
  //console.log(GC.windowX, GC.windowY);
}

setMouseEventCallbacks = function(canvas){
    //-------- set callback functions
    canvas.onmousedown = mouseDown;
    document.onmouseup = mouseUp;
    document.onmousemove = mouseMove;
}

//handle mousedown
mouseDown = function(event){
    GC.mouseDown = true;
    GC.mouseX = event.clientX;
    GC.mouseY = event.clientY;
    return false;
}

//handle mouseup
mouseUp = function(event){
    GC.mouseDown = false;
    return false;
}

//handle mouse movement
mouseMove = function(event){
    //if(GC.mouseDown == true){
       GC.mouseX = event.clientX;
       GC.mouseY = event.clientY;
    //}
    return false;
}
