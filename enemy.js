//BASE ENEMY FUNCTIONS
function Enemy (type) {
  this.shader = null;
  this.attribs = null;
  this.uniforms = null;
  this.mvMatrix = null;

  this.radius = null;
  this.numtri = null;
  this.delta = null;
  this.scale = null;

  this.translation = [[10,10,0],[0,0,0]];
  this.rotation = [ [[0,[0,0,1]]], [[0,[0,0,1]]] ];

  this.velocity =       Vector.create([0,0]);
  this.acceleration =   Vector.create([0,0]);
  this.position =       Vector.create([0,0]);
  this.center = [0,0,0,1];

  this.updateList = [];

  this.spawning = true;
  this.alive = false;
  this.dead = false;

  switch (type) {
    case 0:
      this.initBhole();
      break;
    case 1:
      this.initShuriken();
      break;
    case 2:
      this.initDiamond();
      break;
    case 3:
      this.initSquare();
      break;
    case 4:
      this.initMotherfucker();
      break;
    default:
      this.initShuriken();
  }

  Model.updateWorldPosition(this);
}

Enemy.prototype.update = function(view, map) {
  this.map = map;
  //console.log(this);
  if (this.spawning) {
    actions.spawn(this);
    return false;
  }

  Model.updateActions(this);

  for (var i=0; i<bholes.length; i++) {
    if (bholes[i].gravity <= 0.0) {
      continue;
    }
    var dir = bholes[i].position.subtract(this.position).toUnitVector();
    var dist = bholes[i].position.distanceFrom(this.position);
    if (dist < this.radius*this.scale + bholes[i].radius*bholes[i].scale) {
      bholes[i].scale += 0.1;
      bholes[i].scale = Math.min(bholes[i].scale, 5.0);
      bholes[i].gravity += 0.1;
      bholes[i].gravityRadius += 1.0;
      return true;
    }

    var factor = bholes[i].gravityRadius / (dist*3) * bholes[i].gravity;
    if (factor > 4.5) {
      factor = 4.5;
    }
    this.velocity = this.velocity.add(dir.multiply(factor));
  }

  if (this.dead) {
    return true;
  }

  Model.updateWorldPosition(this);
  Model.updateTranslation(this);

  return false;
}

//SPECIFIC ENEMY FUNCTIONS
Enemy.prototype.initBhole = function() {
  var verts = [
     -1, -1, 0,
     -1, 1, 0,
 		1, 1, 0,

 		-1, -1, 0,
 		1, 1, 0,
     1, -1, 0];

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [1.0, 0.0, 0.0, 0.0]
  }

  this.update = function(view, map) {
    this.map = map;
    if (this.spawning) {
      actions.spawn(this);
      return false;
    }
    Model.updateActions(this);
    if (this.dead) {
      return true;
    }
    Model.updateWorldPosition(this);
    Model.updateTranslation(this);
    return false;
  }

  this.radius = 1;
  this.gravityRadius = 10.0;
  this.maxHealth = 100.0;
  this.health = 100.0;
  this.gravity = 0.0;
  this.spawnCount = 0;
  this.numtri = verts.length / 3;
  this.delta = 0.1 * GC.hero.delta;
  this.scale = 1;
  this.scale_arr = [1,1,1];
  this.shader = shader2D;

  this.updateList.push(actions.dormant);
  this.velocity.setElements([0, 0]);
}

Enemy.prototype.initShuriken = function() {
  var verts = [
    0, 0, 0,
    0, 1, 0,
		1, 1, 0,

		0, 0, 0,
		1, 0, 0,
    1, -1, 0,

    0, 0, 0,
    0, -1, 0,
    -1, -1, 0,

    0, 0, 0,
    -1, 0, 0,
    -1, 1, 0
    ];

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.7, 0.0, 0.0, 0.0]
  }

  this.spawnCount = 0;
  this.moveCount = -1;
  this.radius = 1;
  this.numtri = verts.length / 3;
  this.delta = 0.3 * GC.hero.delta;
  this.scale = 1;
  this.scale_arr = [1,1,1];
  this.shader = shader2D;
	this.updateList.push(actions.living, actions.ricochet, actions.spin);

  this.velocity.setElements([getRandomArbitrary(-1, 1), getRandomArbitrary(-1,1)]);
}

Enemy.prototype.initDiamond = function() {
  var verts = [
    0, -1, 0,
    0, 1, 0,
		1, 0, 0,

		0, -1, 0,
		-1, 0, 0,
    0, 1, 0,

    ];

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.0, 0.7, 0.0, 0.0]
  }

  this.spawnCount = 0;
  this.moveCount = -1;
  this.flexCount = 0;
  this.flexToggle = 1;

  this.radius = 1;
  this.numtri = verts.length / 3;
  this.delta = 0.3 * GC.hero.delta;
  this.scale = 1.5;
  this.scale_arr = [1,1,1];
  this.shader = shader2D;
	this.updateList.push(actions.living, actions.seek, actions.jitter, actions.flex, actions.stayinmap);

  this.velocity.setElements([0,0]);
}

Enemy.prototype.initSquare = function() {
 var verts = [
    -1, -1, 0,
    -1, 1, 0,
		1, 1, 0,

		-1, -1, 0,
		1, 1, 0,
    1, -1, 0];


  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.5, 0.1, 0.1, 0.0]
  }

  this.spawnCount = 0;
  this.moveCount = -1;
  this.rockCount = 0;
  this.rockToggle = 1;

  this.radius = 1;
  this.numtri = verts.length / 3;
  this.delta = 0.8 * GC.hero.delta;
  this.scale = 1;
  this.scale_arr = [1,1,1];
  this.shader = shader2D;
	this.updateList.push(actions.rebirth, actions.seek, actions.rock, actions.stayinmap);

  this.velocity.setElements([0,0]);
}

Enemy.prototype.initMotherfucker = function() {
   var verts = [
    -1, -1, 0,
    -1, 1, 0,
		1, 1, 0,

		-1, -1, 0,
		1, 1, 0,
    1, -1, 0];


  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.1, 0.5, 0.1, 0.0]
  }

  this.spawnCount = 0;
  this.moveCount = -1;
  this.rockCount = 0;
  this.rockToggle = 1;

  this.radius = 1;
  this.numtri = verts.length / 3;
  this.delta = 0.8 * GC.hero.delta;
  this.scale = 1;
  this.scale_arr = [1,1,1];
  this.shader = shader2D;
	this.updateList.push(actions.living, actions.seek, actions.spin, actions.evade, actions.stayinmap);

  this.velocity.setElements([0,0]);
}
