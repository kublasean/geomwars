/*------ PLAYER ----------*/
function Player (shader) {
  this.shader =       shader;
  this.attribs =      null;
  this.uniforms =     null;
  this.mvMatrix =     null;

  this.lives =        2;

  this.translation =  [[0,0,0],[0,0,0]];
  this.rotation =     [ [[0,[0,0,1]]], [[0,[0,0,1]]] ];
  this.scale =        1;

  this.velocity =     Vector.create([0,0]);
  this.acceleration = Vector.create([0,0]);
  this.position =     Vector.create([0,0]);
  this.viewPosition = Vector.create([0,0]);

  this.radius =       1;
  this.center =       [0,0,0,1];
  this.numtri =       3;
  this.delta =        0.7;


  this.gun =          new Gun(shader);
  this.updateList =   [actions.living];

  var verts = [
    -1, -1, 0,
    0, 1, 0,
    1, -1, 0];

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [0.0, 0.0, 1.0, 1.0]
  }
}

Player.prototype.update = function(view, map) {

  Model.updateActions(this);

  if (this.lives <= 0)
    return true;

  // determine orientation of the ship
  if (this.velocity.elements[0] != 0 || this.velocity.elements[1] != 0) {
    var angle = 180.0 / Math.PI * Math.atan2(this.velocity.elements[1],this.velocity.elements[0]) + -90;
    this.rotation[0][0][0] = angle;
  }

  // prevent exit from map
  var worldPosition = Model.updateWorldPosition(this);
  this.viewPosition = Vector.create(view.multiply(worldPosition).flatten().slice(0,2));
  map.adjustModelVelocity(this,0,0);


  for (var i=0; i<bholes.length; i++) {
    if (bholes[i].gravity <= 0.0) {
      continue;
    }
    var dir = bholes[i].position.subtract(this.position).toUnitVector();
    var dist = bholes[i].position.distanceFrom(this.position);
    if (dist < this.radius*this.scale + bholes[i].radius*bholes[i].scale) {
      this.lives -= 1;
      GC.level.spawnPatterns.unshift(new clearScreen());
      break;
    }

    var factor = bholes[i].gravityRadius / (dist * 5) * bholes[i].gravity;
    if (factor > 0.7) {
      factor = 0.7;
    }
    this.velocity = this.velocity.add(dir.multiply(factor));
  }

 Model.updateTranslation(this);

  // check if touching enemy
  for (var i=0; i<enemies.length; i++) {
    if (Model.touching(this, enemies[i]) && enemies[i].alive) {
      this.lives -= 1;
      GC.level.spawnPatterns.unshift(new clearScreen());
      break;
    }
  }



  return false;
}

/* ---- PLAYER'S GUN ------------------*/
function Gun(shader) {
  this.bullets = [];
  this.firing = false;
  this.firingCounter = -1;
  this.angle = 0;
  this.shader = shader;
}

Gun.prototype.draw = function(proj, view) {
  this.bullets.forEach( function(B,i,arr) { Model.draw(B, proj, view); });
}

Gun.prototype.update = function(view, map, translation) {
  this.firing = GC.mouseDown;
  this.updateAngle();

  if (this.firing) {
    this.firingCounter += 1;
    this.firingCounter %= 2;
    if (this.firingCounter == 0) {
      var B = new Bullet(this.shader, translation, this.angle);
      this.bullets.push(B);
    }
  }
  else {
    this.firingCounter = -1;
  }
  for (var i=0; i<this.bullets.length; i++) {
    if(this.bullets[i].update(view,map)) {
      this.bullets.splice(i,1);
      i--;
    }
  }
}

Gun.prototype.updateAngle = function() {
  var x = GC.mouseX;
  var y = GC.mouseY;

  x = x*GC.zoom - GC.width/2.0*GC.zoom;
  y = -1*(y*GC.zoom - GC.height/2.0*GC.zoom);

  var source = GC.hero.viewPosition;
  var dest = Vector.create([x,y]);
  this.angle = getAngle(dest.subtract(source).toUnitVector().elements);
}

/*--------- PLAYER'S GUN'S BULLETS ---------*/
function Bullet(shader, translation, angle) {
  this.shader = shader;

  this.translation = [ [], [0,0,0] ];
  this.translation[0] = translation.slice();
  this.rotation = [ [[0,[0,0,1]], [270,[0,0,1]]], [[0,[0,1,0]]] ];
  this.scale = 0.5;
  this.radius = 1;

  this.position = null;
  this.delta = GC.hero.delta * 2.3;
  this.velocity = Vector.create([0,0]);

  this.numtri = 3;

  this.dir = angle;
  this.center = [0,0,0,1];

  var verts = [
    -1, -1, 0,
    0, 1, 0,
    1, -1, 0];

  this.attribs = {
    a_position: { buffer: getBuffer(verts), numComponents: 3 }
  }

  this.uniforms = {
    u_projection: null,
    u_model: null,
    u_color: [1.0, 1.0, 1.0, 1.0]
  }
}

Bullet.prototype.update = function(view, map) {
  Model.updateWorldPosition(this);

  this.velocity.elements[0] = Math.cos(this.dir * Math.PI / 180.0);
  this.velocity.elements[1] = Math.sin(this.dir * Math.PI / 180.0);
  this.rotation[0][0][0] = this.dir;

  Model.updateTranslation(this);

  for (var i=0; i<enemies.length; i++) {
    if (Model.touching(this, enemies[i])) {
      if (enemies[i].alive) {
        GC.score += 1.0 * GC.mult;
      }
      enemies[i].alive = false;

      return true;
    }
  }
  for (var i=0; i<bholes.length; i++) {
    if (Model.touching(this, bholes[i])) {
      bholes[i].alive = false;
      return true;
    }
  }

  if (!map.withinMap(this))
    return true;

  return false;
}
