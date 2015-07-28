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

function Game(sceneNode) {
    //Create node to represent box w/ marked line
    this.node = sceneNode.addChild();
    this.node
        .setSizeMode('absolute', 'absolute', 'absolute')
        .setAbsoluteSize(50, 200)
        .setPosition(window.innerWidth / 2, window.innerHeight, 0)
        .setMountPoint(0.5, 1);

    this.blueBox = new DOMElement(this.node, { 
        properties:{
          'background-color':'#49afeb'
        } 
    });
    var gameNode=this.node;


    this.line = this.node.addChild();

    this.line
        .setAbsoluteSize(50, 5)
        .setSizeMode(1, 1, 1)
        .setAlign(0.0, (randomAlign.call()/8)); //need to make function to radomize this
    var targetLine = new DOMElement(this.line, {
      properties: {
        'background-color': '#FF0000'
      }
    });

// Just a rope to 'pull' up the box. Has no real function.
    this.rope = this.node.addChild();
    this.rope
            .setSizeMode(1, 1, 1)
            .setAbsoluteSize(3,window.innerHeight)
            .setPosition(25, 0 - window.innerHeight);
    var ropeProp = new DOMElement(this.rope, {
      properties: {
        'background-color': '#D1D1D1'
      }
    });


//Character that cuts the box
    this.cutter = sceneNode.addChild();
    this.cutter 
        .setSizeMode(1, 1, 1)
        .setAbsoluteSize(90, 3)
        .setPosition(window.innerWidth / 2 - 25, window.innerHeight/3, 0)
        .setMountPoint(1,1);

    this.cutProp = new DOMElement(this.cutter, {
      properties:{
          'background-color' : '#009933'
      }
    });

    this.cutLine= this.node.addChild();
    this.cutLine
        .setSizeMode(1,1,1)
        .setAbsoluteSize(50, 3)
        .setPosition(0, 150);


    var position = new Position(this.node);
    position.node = this.node;
    position.rope = this.rope;
    position.cutLine = this.cutLine;
    position.game = this;
    position.set(window.innerWidth / 2,0,0, {duration:5000}, dropBox);
    function dropBox() {
        position.node.removeChild(position.rope);
        console.log('check');
        var game=position.game;
        var cutLine = position.cutLine;
        var lposition = new Position(game.line);
        var hasClicked = false;
       
        game.simulation = new PhysicsEngine();
        console.log(game.simulation);
        game.myBox = createBox.call(game, game.node, position);
        console.log('game.myBox', game.myBox);

        //This event needs to return the location of the box
        var element = new DOMElement(sceneNode);
        sceneNode.addUIEvent('click');
        sceneNode.onReceive = function(event, payload) {
            if (event === 'click' && !hasClicked) {
               
              hasClicked = true; // the user has clicked and is only given one opportunity
              //gets the position of the original target line
              var boxPosition = game.myBox.getPosition();  
              var heightOfBox = 200;
              var cutterPosY = window.innerHeight/3;
              var redLine = heightOfBox - game.line.getAlign()[1]*heightOfBox;
              var clickPosition = game.myBox.getPosition();
              var clickPositionY = clickPosition.y;
              var diff = cutterPosY-clickPositionY;
              var cutPosition = heightOfBox + diff;

              console.log('clickPositionY='+clickPositionY)
              console.log("redLine="+redLine);     
              console.log('here '+game.line.getAlign()[1])
              console.log('diff='+diff)
              if((-200 < diff) && cutterPosY < clickPositionY){
                  cutLine.setPosition(0, cutPosition);
                  var test = new DOMElement(cutLine, {
                    properties: {
                        'background-color' : '#009933'
                    }
                  });

                split.call(game, game.node, game.myBox, cutPosition);
               }
              var accuracy = cutLine.getPosition()[1] - ((game.line.getAlign()[1] * 200)); //Distance from target line and cut line
              console.log('accuracy='+ accuracy);

            }
        }.bind(game);

        FamousEngine.requestUpdateOnNextTick(game);
        console.log(game);    
    }

    var resetButton = sceneNode.addChild();
        resetButton 
              .setSizeMode(1,1,1)
              .setAbsoluteSize(50,50)
              .setAlign(0.9,0.1)
              .setMountPoint(0.5, 0.5)
              .addUIEvent('click');
    var resetProp = new DOMElement(resetButton, {
        properties:{
          'background-color': '#660066'
        }
    });

    resetButton.onReceive = function(event, payload){
      if(event === 'click'){
        console.log(payload);
        restartGame();
        
      }
    }

}

Game.prototype.onUpdate = function(time){
    this.simulation.update(time);

    var itemPosition = this.myBox.getPosition();
    var topPosition;
    var botPosition;
    this.node.setPosition(itemPosition.x,itemPosition.y,itemPosition.z);
    if(this.topBox != null){
        topPosition = this.topBox.getPosition();
        botPosition = this.botBox.getPosition();
        this.topHalf.setPosition(topPosition.x, topPosition.y, topPosition.z);
        this.botHalf.setPosition(botPosition.x, botPosition.y, botPosition.z);
    }
    FamousEngine.requestUpdateOnNextTick(this);
};

//create box
function createBox(node, position) {
    //attach a DOM element component to the staticNode
    var mb = new Box({
      mass: 10,
      size: [50, 200, 10],
      position: new Vec3(window.innerWidth / 2, 0, 0)
    });

    this.gravity = new Gravity1D(mb, {direction: Gravity1D.DOWN, strength: 500});

    this.floor = new Wall({direction: Wall.UP, friction: 0});
    this.floor.setPosition(0, window.innerHeight, 0);

    this.collision = new Collision([mb, this.floor]);

    this.simulation.add([mb, this.gravity, this.collision]);

    return mb;
}

function split(node, myBox, position){
    console.log('split');
    console.log(this.simulation);
    console.log(node);
    console.log('split position: ' + position);
    var bp = myBox.position;
    console.log(bp);
    var bhp = 200 - position; // position of bottom half

    this.topHalf = node.addChild();
    this.topHalf
              .setSizeMode(1, 1, 1)
              .setAbsoluteSize(50, position)
              .setPosition(0,0,0);

    var th = new DOMElement(this.topHalf, {
      properties:{
        'background-color': '#FF6600'
      }
    });

    this.botHalf = node.addChild();
    this.botHalf
              .setSizeMode(1, 1, 1)
              .setAbsoluteSize(50, bhp)
              .setPosition(0, position, 0);
    var bh = new DOMElement(this.botHalf, {
      properties:{
        'background-color': '#666666'      
      }
    });

    this.topBox = new Box({
      mass: 10,
      size: [50,position, 10],
      position: new Vec3(0, 0, 0)
    });

    this.botBox = new Box({
      mass: 10,
      size: [50, bhp],
      position: new Vec3 (0,position + 1, 0)
    });


    var topbot =  new Collision([this.topBox, this.botBox]);
    this.gravity.addTarget(this.topBox);
    this.gravity.addTarget(this.botBox);
    // this.collision.removeTarget(this.collision.targets[0]); //test removing original myBox
    //test to see if adding new constaraint,'nfloor', will resolve the issue of the box falling through
    var nfloor = new Wall({direction: Wall.UP, friction: 0});
    nfloor.setPosition(0, window.innerHeight, 0);

    this.collision.addTarget(this.topBox);
    this.collision.addTarget(this.botBox);
    this.collision.addTarget(nfloor);
    console.log('here:' );
    console.log(this.collision);
    this.simulation.add([this.topBox, this.botBox,nfloor]);
}

// randomAlign() produces a number between 1 and 7
function randomAlign(){
    var rand = (Math.ceil((Math.random()*7)));
    console.log(rand);
    return rand;
}

// restartGame() removes the previous game and starts a comepletely new one
function restartGame(){
  scene.removeChild(root);
  root = scene.addChild()
  var bg = new DOMElement(root,{
    properties: {
      'background-color': "#000000"
    }
  });
  game = new Game(root);  
}

FamousEngine.init();
var root = scene.addChild()
var bg = new DOMElement(root,{
  properties: {
    'background-color': "#000000"
  }
});
var game = new Game(root);