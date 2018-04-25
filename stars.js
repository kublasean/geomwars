/*----PARALLAX STARS-----------*/
function Stars (shader, depth, range, factor) {
  this.shader =       shader;
  this.attribs =      null;
  this.uniforms =     null;
  this.mvMatrix =     null;

  this.translation =  [[0,0,0],[0,0,0]];
  this.rotation =     [ [[0,[0,0,1]]], [[0,[0,0,1]]] ];
  this.scale =        1;

  this.radius =       1;
  this.center =       [0,0,0,1];
  this.numtri =       0;

  this.actuallyPoints = true;

  this.factor = factor;

  verts = [];
  sizes = [];
  colors = [];

  var scale_factor = 4;
  for (var i=0; i<1008; i++) {
    verts.push(getRandomArbitrary(-GC.width/2.0*GC.zoom*scale_factor, GC.width/2.0*GC.zoom*scale_factor));
    verts.push(getRandomArbitrary(-GC.height/2.0*GC.zoom*scale_factor, GC.height/2.0*GC.zoom*scale_factor));
    verts.push(depth);
    sizes.push(getRandomArbitrary(range[0], range[1]));
    colors.push(getRandomArbitrary(0.3, 0.7));
  }

  this.numtri = verts.length / 3;

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 },
    a_size: { buffer: getBuffer(sizes), numComponents: 1 },
    a_color: { buffer: getBuffer(colors), numComponents: 1}
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.53, 0.64, 0.76, 1.0]
    //u_color: [0., 0.0, 0.0, 0.1]
  }
}
