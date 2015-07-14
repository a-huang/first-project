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


var DOMElement = famous.domRenderables.DOMElement;
var FamousEngine = famous.core.FamousEngine;

//Physics engine test
function Test() {

    //create scene graph
    this.scene = FamousEngine.createScene('body');

    this.camera = new Camera(this.scene);
    this.camera.setDepth(1000);

    this.simulation = new PhysicsEngine();
    var node = this.scene.addChild();
    var size = new Size(node).setMode(1,1);
    var position = new Position(node);
    this.myBox = createBox.call(this, node, size, position);
   
    FamousEngine.requestUpdateOnNextTick(this);
    console.log('test')
}

Test.prototype.OnUpdate = function(time){
    this.simulation.update(time);
    var itemPosition = this.simulation.getTransform(myBox).position;
    console.log(itemPosition[0] + " "  + itemPosition[1]);
    mb.set(itemPosition[0],itemPosition[1],itemPosition[2]);
    FamousEngine.requestUpdateOnNextTick(this);
};

//add node - this node will be static
//create box
function createBox(node, size, position) {
    size.setAbsolute(50,50);
    var mp = new MountPoint(node).set(0.5,0.5);
    //attach a DOM element component to the staticNode
    var blueDIV = new DOMElement(node, { 
      properties:{
        'background-color':'#49afeb'
      } 
    });
    var mb = new Box({
        mass: 10,
        size: [100,100,100],
        position: new Vec3(window.innerWidth / 2, window.innerHeight / 2, 5)
    });
     this.gravity = new Gravity1D(mb, {direction: Gravity1D.DOWN, strength: 300});
    this.simulation.add(mb, this.gravity)
    console.log("hey");
}

FamousEngine.init();

var test = new Test();