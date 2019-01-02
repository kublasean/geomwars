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
	
	var rotationSpeed = getRandomArbitrary(0.01, 0.1);

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
	
	this.update = function() {
		//this.rotation[0][0][0]  += rotationSpeed;
		//this.rotation[0][0][0] %= 360;
	}
}


/*----IMPACT SPARKS-----------*/

function Spark (shader, position) {
  this.shader =       shader;
  this.attribs =      null;
  this.uniforms =     null;
  this.mvMatrix =     null;

  this.translation =  [[position[0],position[1],0],[0,0,0]];
  this.rotation =     [ [[0,[0,0,1]]], [[0,[0,0,1]]] ];
  this.scale =        1;

  this.center =       [0,0,0,1];
  this.numtri =       0;

  this.actuallyPoints = true;
	this.time = 0;
	this.endtime = 15.;

	
	function getXcoord(theta, u, radius) {
		return Math.sqrt( Math.pow(radius, 2) - Math.pow(u, 2)) * Math.cos(theta);
	}
	function getYcoord(theta, u, radius) {
		return Math.sqrt( Math.pow(radius, 2) - Math.pow(u, 2)) * Math.sin(theta);
	}
	function getZcoord(u) {
		return u;
	}
	
	verts = [];
	var u;
	var angle = 0;
	
	/*
	for (u=-1.0; u<1.0; u+=0.1) {
		angle += 3;
		var stop = angle + 360;
		for (; angle < stop; angle += 10) {
			var theta = Math.PI / 180. * (angle % 360);
			verts.push(u);
			verts.push(theta);
		}
	}*/
	
	
	for (var i=0; i<100; i++) {
		verts.push(getRandomArbitrary(-1.0, 1.0));
		verts.push(getRandomArbitrary(0, 360) * (Math.PI / 180.));
	}
	
	
	
	//console.log(verts);
	
  this.numtri = verts.length / 2;

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 2 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [1.0, 1.0, 1.0, 1.0],
		u_time: 0,
		u_radius: 1.0
  }
	
	this.update = function() {
		this.time++;
		this.uniforms.u_radius+= 0.15;
		this.uniforms.u_time = this.time / this.endtime;
		
		return this.time == this.endtime;
	}
}

