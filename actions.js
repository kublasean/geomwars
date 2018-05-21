var actions = {

dying: function(model) {
  model.dieCount += 1;
  var step = model.dieCount / 6.0;
  model.uniforms.u_color[3] = 1.0 - step;
	model.scale = 1.0 - step;
  if (step >= 1.0) {
    model.dead = true;
    return true;
  }
  return false;
},

living: function(model) {
  if (model.alive) {
    return false;
  }
  else {
    model.dieCount = 0;
    model.updateList.push(actions.dying);
    model.velocity.setElements([0,0]);
    return true;
  }
},

stayinmap: function(model) {
  model.map.adjustModelVelocity(model, 0, 0);
  return false;
},

ricochet: function(model) {
  if (!model.alive)
    return true;

  GC.map.adjustModelVelocity(model, -1, -1);
  model.velocity = model.velocity.toUnitVector();
  return false;
},

spin: function(model) {
  if (!model.alive)
    return true;

  model.rotation[0][0][0] += 5;
  model.rotation[0][0][0] %= 361;

  return false;
},

seek: function(model) {
  if (!model.alive)
    return true;

  var target = GC.hero;
  model.moveCount += 1;
  model.moveCount %= 1;

  if (model.moveCount == 0) {
    var dir = target.position.subtract(model.position).toUnitVector();
    model.velocity.setElements(dir);
  }
  return false;

},

rock: function(model) {
  if (!model.alive)
    return true;

  var angle = 0;//getAngle(model.velocity.elements);
  var arc = 50;
  var period = 20;

  model.rockCount += model.rockToggle;
  angle += model.rockCount / period * arc - arc / 2.0;
  model.rotation[0][0][0] = angle;

  if (model.rockCount == 0 || model.rockCount == period) {
    model.rockToggle *= -1;
  }

  return false;
},

rebirth: function(model) {
  if (model.alive)
    return false;
  model.alive = true;
  model.scale = 0.50;
  model.delta = 0.1;
  model.rockToggle = 0;
  model.rotation[1][0][0] = getRandomArbitrary(0, 20);
  model.updateList.push(actions.living, actions.orbit, actions.stayinmap);
  return true;
},

orbit: function(model) {
  if (!model.alive)
    return true;

  model.translation[1][0] = 5;
  model.rotation[1][0][0] += 10;
  model.rotation[1][0][0] %= 361;
},


flex: function(model) {
  if (!model.alive)
    return true;
  var period = 30;
  model.flexCount += model.flexToggle;

  model.scale_arr[0] = model.flexCount / period * 0.40 + 0.60;
  model.scale_arr[1] = model.flexCount / period * 0.20 + 0.80;

  if (model.flexCount == 0 || model.flexCount == period) {
    model.flexToggle *= -1;
  }
  return false;
},

evade: function(model) {
  if (!model.alive)
    return true;

  if (GC.hero.gun.firing == false)
    return;

  var angle = GC.hero.gun.angle * Math.PI / 180.0;
  var dir = Vector.create([Math.cos(angle), Math.sin(angle)]).elements;

  var m1 = dir[1] / dir[0];
  var m2 = dir[0] / - dir[1];
  var b1 = GC.hero.position.elements[1] - m1 * GC.hero.position.elements[0];
  var b2 = model.position.elements[1] - m2 * model.position.elements[0];
  var x = (b2 - b1) / (m1 - m2);
  var y = m1 * x + b1;

  var intersection = Vector.create([x,y]);
  var dist = model.position.distanceFrom(intersection);
  var perp = model.position.subtract(intersection).toUnitVector();
  var newDir = intersection.subtract(GC.hero.position).toUnitVector();

  if (newDir.eql(dir)) {
    var jerk = 1;
    var factor = 1.0 - dist / 20.0;
    if (factor < 0)
      factor = 0;

    jerk = factor * 3.0;

    if (factor > 0.5)
      model.velocity = model.velocity.multiply(-1);
    model.velocity = model.velocity.add(perp.multiply(jerk));

  }

  return false;
},

dormant: function(model) {
  if (model.alive)
    return false;
  model.alive = true;
  model.uniforms.u_color = [0,0,0,1];
  model.gravity = 1.0;
  model.updateList.push(actions.health);
  return true;
},

health: function(model) {
  //console.log(model.gravity, model.gravityRadius);
  if (model.alive) {
    if (model.scale < 1.0) {
      model.scale += (1.0 - model.scale) / 30.0;
    }
    return false;
  }
  if (model.scale <= 0.5) {
    model.dieCount = 0;
    model.updateList.push(actions.dying);
    return true;
  }
  model.alive = true;
  model.scale -= 0.1;
  model.gravity -= 0.1;
  model.gravity = Math.max(0.5, model.gravity);
  model.gravityRadius -= 1.0;
  model.gravityRadius = Math.max(10.0, model.gravityRadius);
  return false;
},

jitter: function(model) {
  if (!model.alive)
    return true;

  var xmov = getRandomArbitrary(-0.1, 0.1);
  var ymov = getRandomArbitrary(-0.1, 0.1);
  model.velocity = model.velocity.add(Vector.create([xmov, ymov]));
},

spawn: function(model) {
  model.spawnCount += 1;

  var step = model.spawnCount / 20.0;
  model.uniforms.u_color[3] = step;
  model.rotation[0][0][0] = step * 360;
  if (step >= 1.0) {
    model.spawning = false;
    model.alive = true;
    return true;
  }
  return false;
}

}
