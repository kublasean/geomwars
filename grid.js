function spawnGrid() {
  var grid = {};
  grid.uniforms = {};
  grid.attribs = {};
  var verts = [];
  var numVerts = 1000;
  verts[0] = 0;
  var j = 1;
  for (var i=1; i<numVerts; i++) {
    //verts[i*2-1] = i;
    //verts[i*2] = i;
    verts[i] = i;
  }
  grid.center = [0,0,0];
  grid.translation =  [[0,0,0],[0,0,0]];
  grid.rotation =     [ [[0,[0,0,1]]], [[0,[0,0,1]]] ];
  grid.scale =        1;
  grid.points = 1;
  grid.numtri = numVerts;
  grid.uniforms.vertexCount = numVerts;
  grid.attribs.vertexId = { buffer: getBuffer(verts), numComponents: 1}
  grid.shader = new Shader("gridVert", "gridFrag");
  var pp = [];
  for (var i=0; i<3*16; i++) {
    pp[i] = 0;
  }
  pp[2] = -1;
  grid.uniforms.push_points = pp;
  GC.grid = grid;

}

function drawGrid(proj, view) {
  var bb = GC.map.segments[0].boundingBox;

  GC.grid.uniforms.resolution = [bb[0][1]-bb[1][0], bb[1][1]-bb[1][0]];
  GC.grid.uniforms.mouse = [GC.mouseX, GC.mouseY];
	GC.grid.uniforms.mouse = GC.hero.position.elements;
  GC.grid.uniforms.u_bounds = [bb[0][0],bb[0][1],bb[1][0],bb[1][1]];

  var i = 0;
  for (var j=0; j<bholes.length && i<16; j++,i++) {
    var pos = bholes[j].position.elements;
    GC.grid.uniforms.push_points[i*3] = pos[0];
    GC.grid.uniforms.push_points[i*3+1] = pos[1];
    GC.grid.uniforms.push_points[i*3+2] = bholes[j].gravity*-1;
  }
  for (var j=GC.hero.gun.bullets.length-1; j>=0 && i<16; i++, j--) {
    var pos = GC.hero.gun.bullets[j].position.elements;
    GC.grid.uniforms.push_points[i*3] = pos[0];
    GC.grid.uniforms.push_points[i*3+1] = pos[1];
    GC.grid.uniforms.push_points[i*3+2] = 0.5;//5 / (i+0.5);
  }
  for (;i<16; i++) {
    var val = GC.grid.uniforms.push_points[i*3+2];
    GC.grid.uniforms.push_points[i*3+2] += (0.0 - val)/3.0;
  }

  Model.draw(GC.grid, proj, view);
  GC.grid.rotation[0][0][0] = 90;
  Model.draw(GC.grid, proj, view);
  GC.grid.rotation[0][0][0] = 0;
}
