function Level(levelNumber) {

  this.spawnPatterns = [];

  this.update = function() {
    if (this.spawnPatterns.length == 0)
      return;
    if (this.spawnPatterns[0].update())
      this.spawnPatterns.shift();
  }

  switch(levelNumber) {
    case 1:
      this.levelOne();
      break;
    default:
      this.levelOne();
  }
}

Level.prototype.levelOne = function() {
  var test = new inLineOverInterval([0,10], [10,10], 60, 12, 1, 4);
  var test1 = new inLine([0,-10], [0,10], 5, 1);
  var test2 = new random(20, [[-50,50],[-50,50]],2);
  var test3 = new randomOverInterval(5, [[-50,50],[-50,50]], 20, 3);
  var wait1 = new waitUntilDead();
  var wait2 = new waitFrames(60);
  var rect = new rectangle([0,0], [10,10], 1);
  this.spawnPatterns.push(test, test1, test2);
}

function inLineOverInterval(startpoint, endpoint, endCount, freq, numPerSpawn, type) {
  var currentCount = 0;
  var a = Vector.create(startpoint);
  var b = Vector.create(endpoint);
  var dir = b.subtract(a).toUnitVector();
  var dist = b.distanceFrom(a);

  this.update = function() {
    var step = currentCount / endCount;
    if (step >= 1)
      return true;
    var spawnPoint = a.add(dir.multiply(dist*step)).elements;
    if (currentCount % freq == 0) {
      for (var i=0; i<numPerSpawn; i++) {
        spawnEnemy(spawnPoint, type)
      }
    }
    currentCount += 1;
    return false;
  }
}

function inLine(startpoint, endpoint, number, type) {
  var a = Vector.create(startpoint);
  var b = Vector.create(endpoint);
  var dir = b.subtract(a).toUnitVector();
  var dist = b.distanceFrom(a);
  var count = 0;

  function spawn() {
    step = count / number;
    var spawnPoint = a.add(dir.multiply(dist*step)).elements;
    spawnEnemy(spawnPoint, type)
    count++;
    if (count > number)
      return false;
    return true;
  }

  this.update = function() {
    while(spawn()) {}
    return true;
  }
}

function random(number, bounds, type) {
  this.update = function() {
    for (var i=0; i<number; i++) {
      var pos = [getRandomArbitrary(bounds[0][0], bounds[0][1]), getRandomArbitrary(bounds[1][0], bounds[1][1])];
      spawnEnemy(pos, type);
    }
    return true;
  }
}

function randomOverInterval(number, bounds, freq, type) {
  var startcount = 0;
  var spawned = 0;

  this.update = function() {
    startcount += 1;
    if (startcount % freq == 0) {
      var pos = [getRandomArbitrary(bounds[0][0], bounds[0][1]), getRandomArbitrary(bounds[1][0], bounds[1][1])];
      spawnEnemy(pos, type);
      spawned++;
    }
    if (spawned == number)
      return true;
    return false;
  }
}

function spotOverInterval(number, spawnPoint, freq, type) {
  var startcount = 0;
  var spawned = 0;

  this.update = function() {
    startcount += 1;
    if (startcount % freq == 0) {
      spawnEnemy(spawnPoint, type);
      spawned++;
    }
    if (spawned == number)
      return true;
    return false;
  }
}

function waitUntilDead() {
  this.update = function() {
    return enemies.length == 0;
  }
}

function waitFrames(endcount) {
  var startcount = 0;
  this.update = function() {
    startcount++;
    return startcount == endcount;
  }
}

function rectangle(topleft, bottomright, type) {
  var topright = [bottomright[0], topleft[1]];
  var bottomleft = [topleft[0], bottomright[1]];
  var updateMe = [];
  updateMe[0] = new inLine(topleft, topright, Math.round((topright[0]-topleft[0])/2), type);
  updateMe[1] = new inLine(topright, bottomright, Math.round((bottomright[1]-topright[1])/2), type);
  updateMe[2] = new inLine(bottomright, bottomleft, Math.round((bottomright[0]-bottomleft[0])/2), type);
  updateMe[3] = new inLine(bottomleft, topleft, Math.round((bottomleft[1]-topleft[1])/2), type);

  this.update = function() {
    for (var i=0; i<updateMe.length; i++) {
      updateMe[i].update();
    }
    return true;
  }

}


function spawnEnemy(spawnPoint, type) {
  var E = new Enemy(type);
  if (spawnPoint.length == 2) {
    spawnPoint.push(0);
  }
  E.translation[0] = spawnPoint;
  enemies.push(E);
}
