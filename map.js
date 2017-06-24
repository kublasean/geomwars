
function Map () {
  this.segments = [];
}  

Map.prototype.adjustModelVelocity = function(model, x, y) {
  var p = model.position.elements;
  var v = model.velocity.elements;
  
  for (var i=0; i<this.segments.length; i++) {
    if (x == 1 && y == 1) 
      return;
    if (!withinSegment(p, this.segments[i].boundingBox)) 
      continue;
    if (checkBounds(p[0],v[0],this.segments[i].boundingBox[0]))
      x = 1;
    if (checkBounds(p[1],v[1],this.segments[i].boundingBox[1])) 
      y = 1;
  }
 
  v[0] *= x;
  v[1] *= y;
  return;
}

Map.prototype.withinMap = function(model) { 
  for (var i=0; i<this.segments.length; i++) {
    if (withinSegment(model.position.elements, this.segments[i].boundingBox))
      return true;
  }
  return false;
}

Map.prototype.draw = function(proj, view) {
  this.segments.forEach( function(seg, i, arr) { Model.draw(seg, proj, view) });
}
  
function MapSegment (shader) {
  this.shader = shader;
  this.attribs = null;
  this.uniforms = null;
  this.mvMatrix = null;
    
  this.translation = [[0,0,0],[0,0,0]];
  this.rotation = [ [[90,[1,0,0]]], [[0,[0,1,0]]] ];
  this.scale = 2;
  
  
  this.center = [0,0,0,1];
  this.boundingBox = null;
  this.numtri = 6;
  this.init();  
  this.setBoundingBox();
}

MapSegment.prototype.init = function() {
	
	this.verts = [
    25.0, -0.5, 25.0,
    -25.0, -0.5, -25.0,
    -25.0, -0.5, 25.0,

    25.0, -0.5, 25.0,
    25.0, -0.5, -25.0,
    - 25.0, -0.5, -25.0];
				
	var norm = [
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		
		0.0, 1.0, 0.0, 
		0.0, 1.0, 0.0, 
		0.0, 1.0, 0.0];
	
	var tex_coord = [
		25.0, 0.0, 0.0,
		0.0, 25.0, 0.0,
		0.0, 0.0, 0.0,
		
		25.0, 0.0, 0.0,
		25.0, 25.0, 0.0,
		0.0, 25.0, 0.0];
  
  this.attribs = {
    a_position: { buffer: getBuffer(this.verts), numComponents: 3 }
  }
  
  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.0, 0.5, 0.0, 0.5]
  }
}  

MapSegment.prototype.setBoundingBox = function() {
  mvLoadIdentity(this);
  Model.objectTransforms(this);
  
  var bounding = [ [0, 0], [0, 0], [0, 0] ]; 
  
  function setBound(i, v) {
    if (v[i] < bounding[i][0])
      bounding[i][0] = v[i];
    if (v[i] > bounding[i][1])
      bounding[i][1] = v[i];
  }
  for (var i=0; i*3<this.verts.length; i++) {
		var posVec = this.verts.slice(i*3, i*3+4);
		posVec[3] = 1;
		var newVert = this.mvMatrix.multiply(Matrix.create(posVec)).flatten();
    
		if (i==0) {
			bounding[0][0] = newVert[0];
			bounding[0][1] = newVert[0];
			bounding[1][0] = newVert[1];
			bounding[1][1] = newVert[1];
			bounding[2][0] = newVert[2];
			bounding[2][1] = newVert[2];
		}

    setBound(0, newVert);
    setBound(1, newVert);
    setBound(2, newVert);
  }
  this.boundingBox = bounding; 
}

function checkBounds(p, v, bounds) {
  var margin = -2;
  
  if (p < bounds[0]-margin)
    return v > 0;

  if (p > bounds[1]+margin)
    return v < 0;

  return true;
}

function withinSegment(p, b) {
    return p[0] > b[0][0] && p[0] < b[0][1] && p[1] > b[1][0] && p[1] < b[1][1];
}
