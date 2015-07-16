'use strict';

var famous = require('famous');

var Camera = famous.components.Camera;

var math = famous.math;
var physics = famous.physics;
var PhysicsEngine = famous.physics.PhysicsEngine;
var Box = physics.Box;
var Vec3 = math.Vec3;
var Size = famous.components.Size;
var Position = famous.components.Position;
var MountPoint = famous.components.MountPoint;
var Gravity1D = physics.Gravity1D;
var Collision = physics.Collision;
var Distance = physics.Distance;
var Wall = physics.Wall;


var DOMElement = famous.domRenderables.DOMElement;
var FamousEngine = famous.core.FamousEngine;

//Physics engine test
function Game() {

  //create scene graph
  this.scene = FamousEngine.createScene('body');

  this.camera = new Camera(this.scene);
  // this.camera.setDepth(1000);

  this.simulation = new PhysicsEngine();

  this.node = this.scene.addChild();
  this.node
      .setSizeMode('absolute', 'absolute', 'absolute')
      .setAbsoluteSize(50, 200)
      .setPosition(0, 0, 0)
      .setMountPoint(0.5, 1);

  this.line = this.node.addChild();
  this.line
      .setAbsoluteSize(50,10)
      .setSizeMode(1,1,1)
      .setAlign(0.0, 0.5); //need to make function to radomize this
  var mark = new DOMElement(this.line, {
    properties:{
        'background-color': '#FF0000'
    }
  });
   

  var position = new Position(this.node);
  this.myBox = createBox.call(this, this.node, position);
  this.node.myBox = this.myBox;
  console.log('this.myBox', this.myBox);
  console.log(window.innerHeight);

    this.node.addUIEvent('click');
    this.node.onReceive = function(event,payload){
        if(event==='click'){
            var itemPosition = this.myBox.getPosition();
            // var bp = this.myBox.getPosition();
            console.log(itemPosition.y - 100);
        }
    }


  FamousEngine.requestUpdateOnNextTick(this);
  console.log(this);
}

Game.prototype.onUpdate = function(time){
    this.simulation.update(time);

    var itemPosition = this.myBox.getPosition();
  
    // console.log(itemPosition);
    //console.log(itemPosition.x, itemPosition.y, itemPosition.z);
    this.node.setPosition(itemPosition.x,itemPosition.y,itemPosition.z);
    FamousEngine.requestUpdateOnNextTick(this);
};

//add node - this node will be static
//create box
function createBox(node, position) {
  //attach a DOM element component to the staticNode
  this.blueDIV = new DOMElement(node, { 
    properties:{
      'background-color':'#49afeb'
    } 
  });

  var mb = new Box({
    mass: 10,
    size: [50, 200, 10],
    position: new Vec3(window.innerWidth / 2, 0, 0)
  });

  this.gravity = new Gravity1D(mb, {direction: Gravity1D.DOWN, strength: 500});

  this.floor = new Wall({direction: Wall.UP, friction: 0});
  this.floor.setPosition(0, window.innerHeight, 0);

  this.collision = new Collision([mb, this.floor]);
  this.distance = new Distance(mb,this.floor);

  this.simulation.add([mb, this.gravity, this.collision]);
  console.log("hey");

  return mb;
}

FamousEngine.init();

var test = new Game();