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

//create scene graph
var scene = FamousEngine.createScene('body');
var camera = new Camera(scene);
camera.setDepth(1000);

//Physics engine test
function Game(sceneNode) {
   this.node = sceneNode.addChild();
  this.node
    .setSizeMode('absolute', 'absolute', 'absolute')
    .setAbsoluteSize(50, 200)
    .setPosition(window.innerWidth / 2, window.innerHeight, 0)
    .setMountPoint(0.5, 1);

    this.blueDIV = new DOMElement(this.node, { 
    properties:{
      'background-color':'#49afeb'
    } 
  });
 var gameNode=this.node;


  this.line = this.node.addChild();

  this.line
    .setAbsoluteSize(50, 3)
    .setSizeMode(1, 1, 1)
    .setAlign(0.0, (randomAlign.call()/8)); //need to make function to radomize this
  var mark = new DOMElement(this.line, {
    properties: {
      'background-color': '#FF0000'
    }
  });

//Character that cuts the box
  this.cutter = sceneNode.addChild();
  this.cutter 
      .setSizeMode(1, 1, 1)
      .setAbsoluteSize(100, 3)
      .setPosition(window.innerWidth / 2, window.innerHeight/3, -10)
      .setMountPoint(1,1);

      this.cutProp = new DOMElement(this.cutter, {
        properties:{
            'background-color' : '#009933'
        }
      });

    this.uMark = this.node.addChild();
    this.uMark
        .setSizeMode(1,1,1)
        .setAbsoluteSize(50, 3)
        .setPosition(0, 150);


    var position = new Position(this.node);
    position.node = this.node;
    position.uMark = this.uMark;
    position.game = this;
    position.set(window.innerWidth / 2,0,0, {duration:5000},
        dropBox);

    function dropBox() {
        console.log('check');
        var game=position.game;
        var uMark = position.uMark;
        var lposition = new Position(game.line);
        game.simulation = new PhysicsEngine();
        console.log(game.simulation);
        game.myBox = createBox.call(game, game.node, position);

        console.log('game.myBox', game.myBox);

        //This event needs to return the location of the box
        var element = new DOMElement(sceneNode);
        sceneNode.addUIEvent('click');
        sceneNode.onReceive = function(event, payload) {
            if (event === 'click') {
              //gets the position of the original mark
              var boxPosition = game.myBox.getPosition();
              //console.log('window.innerHeight/3='+window.innerHeight/3)
              //console.log('boxPosition='+boxPosition.y);
              console.log(boxPosition.y - (((8 - game.line.getAlign()[1] * 8) / 8) * 200)); // gotta find the reciprocal 
              
              //change the position of mark 
              //var cH = window.innerHeight / 3; //y position of the cutter
              //var markPosition = (boxPosition.y - cH) - 20
              console.log('here '+game.line.getAlign()[1])
              var heightOfBox = 200;
              var cutterPosY = window.innerHeight/3;
              var redLine = heightOfBox - game.line.getAlign()[1]*heightOfBox;
              console.log("redLine="+redLine);
              var clickPosition = game.myBox.getPosition();
              var clickPositionY = clickPosition.y;
              console.log('clickPositionY='+clickPositionY)
              var diff = cutterPosY-clickPositionY;
              console.log('diff='+diff)
              if((-200<diff)&&cutterPosY<clickPositionY){
                    console.log('hi');
                  uMark.setPosition(0, heightOfBox + diff);
                  var test = new DOMElement(uMark, {
                    properties: {
                        'background-color' : '#009933'
                    }
                  });
               }
              var accuracy = uMark.getPosition()[1] - ((game.line.getAlign()[1] * 200));
              console.log('accuracy='+ accuracy);
            }
        }.bind(game);

        FamousEngine.requestUpdateOnNextTick(game);
        console.log(game);    

    }

  
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
  

  var mb = new Box({
    mass: 10,
    size: [50, 200, 10],
    position: new Vec3(window.innerWidth / 2, 0, 0)
  });

  this.gravity = new Gravity1D(mb, {direction: Gravity1D.DOWN, strength: 250});

  this.floor = new Wall({direction: Wall.UP, friction: 0});
  this.floor.setPosition(0, window.innerHeight, 0);

  this.collision = new Collision([mb, this.floor]);
  this.distance = new Distance(mb,this.floor);

  this.simulation.add([mb, this.gravity, this.collision]);

  return mb;
}


// randomAlign() produces a number between 1 and 7
function randomAlign(){
    var rand = (Math.ceil((Math.random()*7)));
    console.log(rand);
 return rand;
}

FamousEngine.init();
var root = scene.addChild()
var test = new Game(root);