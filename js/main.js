var Game = (function() {
  var self = this;
  var height, width, fov, aspect, near, far;
  var renderer, scene, camera;
  var animation;
  height = 480;
  width = 640;

  fov = 45;
  aspect = width/height;
  near = 0.1; far = 10000;

  self.renderer = new THREE.WebGLRenderer();
  self.renderer.setSize(width, height);

  self.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  self.camera.position.y = 5;
  self.camera.position.z = 30;
  self.currentCamera = self.camera;

  // Add lighting
  var light = new THREE.DirectionalLight(0xFFFFFF);

  light.position.set(0,100, 40);


  self.scene = new THREE.Scene();
  self.scene.add(this.camera);
  self.scene.add(light);

  document.querySelector('#c').appendChild(this.renderer.domElement)

  return self;
});

Game.prototype.setupKeyboard = function() {
  var self = this;
  self.prevTime = Date.now();
  self.k = new Kibo();
  self.k.down(['w','a', 's', 'd'], self.processKeys);
  // change which camera to use
  self.k.up('y', function() {
    if (game.currentCamera === game.tankCamera)
      game.currentCamera = game.camera;
    else game.currentCamera = game.tankCamera;
  });
}

Game.prototype.processKeys = function() {
  var key = getRoot().k.lastKey();
  switch(key) {
    case 'up':case 'w':
      console.log('move forward');

      break;
    case 'down':case 's':
      console.log('move backward');
      break;
    case 'left':case 'a':
      game.tank.rotation.y += 0.1;
      game.updateBoundingBoxes();
      break;
    case 'right':case 'd':
      game.tank.rotation.y -= 0.1;
      game.updateBoundingBoxes();
      break;
    default:
      break;
  }

  console.log(getRoot().k.lastKey());
}

Game.prototype.render = function(delta) {
  var self = this;
  if ( self.animation ) {

    var time = Date.now();
    self.animation.update(time - self.prevTime );
    self.prevTime = time;
  }

  self.renderer.render(self.scene, self.currentCamera);
}

window.animate = function(delta) {
  requestAnimationFrame(window.animate);
  window.game.render(delta);
}

Game.prototype.loadScene = function() {
  var planeMesh = new THREE.Mesh(
    new THREE.CubeGeometry(100,1,100),
    new THREE.MeshBasicMaterial({color: 0x085A14}),
    0
  )
  planeMesh.scale.set(20,0.01,20)
  planeMesh.position.set(0,0,0)
  this.scene.add(planeMesh)

  this.initModels();
}

Game.prototype.updateBoundingBoxes = function() {
  for (index in game.bboxes) {
    game.bboxes[index].update();
  }
}

Game.prototype.initModels = function() {
  var scope = this;
  // Create bounding box helpers array
  game.bboxes = []

  var loader = new THREE.JSONLoader();
  loader.load('model/tank_distribution.json', function(geometry, material) {
    var texture = THREE.ImageUtils.loadTexture("model/traveller_1.png");
    var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture});
    scope.tank = new THREE.Mesh(geometry, material);
    scope.tank.position.y = 0.4;
    scope.scene.add(scope.tank);

    // hide this object later
    var lookAtHelper = new THREE.Mesh(
      new THREE.CubeGeometry(0.25,0.25,0.25),
      new THREE.MeshBasicMaterial({color: 0xFFFFFF}),
      0
    )
    var tankPos = scope.tank.position;
    lookAtHelper.position.set(tankPos.x + 4, tankPos.y + 1, tankPos.z);
    scope.tank.add(lookAtHelper);

    scope.tankCamera = new THREE.PerspectiveCamera(45, 1.3333, 0.01, 1000);
    scope.tankCamera.position.set(tankPos.x-0.25, tankPos.y + 0.75, tankPos.z);
    scope.tankCamera.lookAt(lookAtHelper.position);
    scope.tank.add(scope.tankCamera);


    var bbox = new THREE.BoundingBoxHelper( scope.tank);
    bbox.update();
    game.bboxes.push(bbox);
    scope.scene.add( bbox );
  });

  loader.load('model/soldier.json', function(geometry, material) {
    var texture = THREE.ImageUtils.loadTexture("model/poss_body.png");
    var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture, morphTargets: true});
    scope.human = new THREE.MorphAnimMesh(geometry, material);
    scope.human.position.y = 0.4;
    scope.human.position.x = 5;
    // Set scale to 5% of original
    scope.human.scale.set(0.05, 0.05, 0.05);
    scope.scene.add(scope.human);

    //scope.animation = new THREE.MorphAnimation( scope.human );
    //scope.animation.play();
  });

  loader.load('model/chaingunner.json', function(geometry, material) {
    var texture = THREE.ImageUtils.loadTexture("model/chaingunner_body.png");
    var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture, morphTargets: true});
    scope.human2 = new THREE.MorphAnimMesh(geometry, material);
    scope.human2.position.y = 0.4;
    scope.human2.position.x = 8;
    // Set scale to 5% of original
    scope.human2.scale.set(0.5, 0.5, 0.5);
    scope.scene.add(scope.human2);

    scope.animation = new THREE.MorphAnimation( scope.human2 );
    scope.animation.play();
  });

  loader.load('model/palm2.json', function(geometry, material) {
    var texture = THREE.ImageUtils.loadTexture("model/canopy.png");
    var material = new THREE.MeshLambertMaterial({color:0xFFFFFF, map:texture});
    scope.palm = new THREE.Mesh(geometry, material);
    scope.palm.position.y = 0.4;
    scope.palm.position.x = -8;
    // Set scale to 5% of original
    scope.palm.scale.set(0.5, 0.5, 0.5);
    scope.scene.add(scope.palm);
  });
}

Game.prototype.placePalms = function() {

}

function getRoot() {
  return game;
}

var game = new Game();
game.loadScene();
game.setupKeyboard();
animate();
