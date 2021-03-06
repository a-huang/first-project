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
    // if(replays >= 5){
    //   alert("Game Over")
    //   var again = confirm("Play Again?");
    //   if(again){
    //     points = 0;
    //     replays = 0;
    //   }
    //   //Needs condition if player says no to playing again.
    // }

    hasClicked = false;
    this.scene = sceneNode;
    this.node = sceneNode.addChild();
    this.node
        .setSizeMode('absolute', 'absolute', 'absolute')
        .setAbsoluteSize(50, 200)
        .setPosition(window.innerWidth / 2, window.innerHeight, 0)
        .setMountPoint(0.5, 1);

    this.blueBox = new DOMElement(this.node, { 
        properties:{
          'background-image':'url(images/log.png)',
                  'border-radius': '10px',

        }});
    var gameNode=this.node;

    this.line = this.node.addChild();

    this.line
        .setAbsoluteSize(50, 6)
        .setSizeMode(1, 1, 1)
        .setAlign(0.0, (randomAlign.call()/8)); //need to make function to radomize this
    var targetLine = new DOMElement(this.line, {
      properties: {
        'background-color': '#FF0000'
      },
      content: ' '
    });
    this.score = sceneNode.addChild();
    this.score.setPosition(10,10)
            .setSizeMode(1,1,1)
            .setAbsoluteSize(110,110);    
    this.el = new DOMElement(this.score,{
      properties: {
        'color':'red',
        'fontFamily': 'Lucida Console',
        'fontSize': '30pt',
      },
      content: ''
    });

    //el.setContent('TEST');

    /*
    var pd = new DOMElement(this.score, {
      properties: {
        //content: points,
        content: 'points',
        font:    'Helvetica',
        fontSize: '30pt',
        color: "red", 
        }
    });*/

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
        var game=position.game;
        var cutLine = position.cutLine;
        var lposition = new Position(game.line);
       
        game.simulation = new PhysicsEngine();
        game.myBox = createBox.call(game, game.node, position);

        //This event needs to return the location of the box
        var element = new DOMElement(sceneNode);
        sceneNode.addUIEvent('mousedown');
        sceneNode.onReceive = function(event, payload) {
            if (event === 'mousedown' && !hasClicked) {
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
              var accuracy = cutPosition - ((game.line.getAlign()[1] * 200)); //Distance from target line and cut line
              console.log('accuracy='+ accuracy);
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

                split.call(game, game.node, game.myBox, cutPosition, accuracy);
              }

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
        },
        content: 'Reset'
    });

    resetButton.onReceive = function(event, payload){
      if(event === 'click' && hasClicked){
        replays ++;
        console.log('points: ' + points);
        restartGame();       
      }
    }

}

Game.prototype.onUpdate = function(time){
    this.simulation.update(time);
    this.el.setContent(points);
    var itemPosition = this.myBox.getPosition();
    var topPosition;
    var botPosition;
    this.node.setPosition(itemPosition.x,itemPosition.y, 0);
    if(this.topBox != null){
        topPosition = this.topBox.getPosition();
        botPosition = this.botBox.getPosition(); 
        this.topHalf.setPosition(topPosition.x, topPosition.y, 0);
        this.botHalf.setPosition(botPosition.x, botPosition.y, 0);
    }
    FamousEngine.requestUpdateOnNextTick(this);
};

//create box
function createBox() {
    //attach a DOM element component to the staticNode
    var mb = new Box({
      mass: 10,
      size: [50, 200, 10],
      position: new Vec3(window.innerWidth / 2, 0, 0)
    });

    this.gravity = new Gravity1D(mb, {direction: Gravity1D.DOWN, strength: 500});

    //Create constraints 
    this.floor = new Wall({direction: Wall.UP, friction: 50});
    this.floor.setPosition(0, window.innerHeight, 0);

    this.rightWall = new Wall({direction: Wall.RIGHT, friction: 0});
    this.rightWall.setPosition(0,0,0);
    this.leftWall = new Wall({direction: Wall.LEFT, friction: 0});
    this.leftWall.setPosition(window.innerWidth, 0, 0);

    this.collision = new Collision([mb, this.floor, this.leftWall, this.rightWall]);

    this.simulation.add([mb, this.gravity, this.collision]);

    return mb;
}

function createLine(node, position) {
  this.line = node.addChild();

  this.line
      .setAbsoluteSize(50, 5)
      .setSizeMode(1, 1, 1)
      .setPosition(0, position)
  var targetLine = new DOMElement(this.line, {
    properties: {
      'background-color': '#FF0000'
    }
  });
}

function split(node, myBox, position, accuracy){
    var bp = myBox.position;
    console.log(bp);
    var bhp = 200 - position; // position of bottom half
    var boxPosition = this.myBox.getPosition();
    this.topHalf = this.scene.addChild();
    this.topHalf
              .setSizeMode(1, 1, 1)
              .setAbsoluteSize(50, position)
              .setMountPoint(0.5, 1)
              // .setPosition(window.innerWidth / 2, boxPosition.y - 200, 0);

    var th = new DOMElement(this.topHalf, {
      properties:{
        'background-color': '#FF6600',
        'background-image':'url(images/log.png)',
        'border-top-right-radius': '5px',
        'border-top-left-radius': '5px'
      }
    });

    this.botHalf = this.scene.addChild();
    this.botHalf
              .setSizeMode(1, 1, 1)
              .setAbsoluteSize(50, bhp)
              .setMountPoint(0.5, 1)
              // .setPosition(window.innerWidth / 2, boxPosition.y - position, 0);
    var bh = new DOMElement(this.botHalf, {
      properties:{
        'background-color': '#666666',
        'background-image':'url(images/log.png)',
        'background-position-y':'bottom',
        'border-bottom-right-radius': '5px',
        'border-bottom-left-radius': '5px'
      }
    });

    this.topBox = new Box({
      mass: 10,
      size: [50,position, 10],
      velocity: this.myBox.velocity,
      position: new Vec3(window.innerWidth / 2, boxPosition.y - 160, 0)
    });

    this.botBox = new Box({
      mass: 10,
      size: [50, bhp, 10],
      velocity: this.myBox.velocity,
      position: new Vec3 (window.innerWidth / 2, boxPosition.y - position + 41, 0)
    });

    if(accuracy > 0){
      var pos1 = position - accuracy;
      createLine.call(this, this.topHalf, pos1);
    }
    else{
      var pos = 0 - accuracy;
      createLine.call(this, this.botHalf, pos);
    }
    updatePoints(accuracy);
    this.gravity.removeTarget(this.myBox);
    this.collision.removeTarget(this.myBox);
    this.scene.removeChild(this.node);

    this.gravity.addTarget(this.topBox);
    this.gravity.addTarget(this.botBox);

    this.collision.addTarget(this.topBox);
    this.collision.addTarget(this.botBox);
    this.simulation.add([this.topBox, this.botBox]);
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
      'background-color': "#00CCFF"
    }
  });
  game = new Game(root);  
}

function updatePoints(accuracy){
  accuracy = Math.round(accuracy);
  console.log('accuracy: ' + accuracy);
  if((-3 <= accuracy) && (accuracy <= 3)){
    points += 250;
  }
  else if(accuracy < (-50)){ // what if the user doesnt click at all, hasclicked cannot be used since clicking on the screen counts.
    points -= 200;
  }
  else if(accuracy < -3){ // if the player waited too long to click
    points += accuracy;
  }
  else{
    if((40 < accuracy) && (accuracy <= 50)){
      points += 20;
    }
    else if((30 < accuracy) && (accuracy <= 40)){
      points += 40;
    }
    else if((20 < accuracy) && (accuracy <= 30)){
      points += 60;
    }
    else if((10 < accuracy) && (accuracy <= 20)){
      points += 80;
    }
    else if((3 < accuracy) && (accuracy < 10)){
      points += 100;
    }
    else{
      points -= 100;
    }
  }
}

function startScreen(){
  var start = root.addChild();
  var startEl = new DOMElement(start, {
    properties: {
      'background-color': '#000000'
    }
  });
  var startButton = start.addChild();
      startButton.setSizeMode(1,1,1)
                  .setAbsoluteSize(200,100)
                  .setAlign(0.5, 0.75)
                  .setMountPoint(0.5,0.5)
                  .addUIEvent('click');
  var sbEl = new DOMElement(startButton, {
      properties: {
        'background-color': '#FFFFFF',
        'fontSize': '30pt',
        'textAlign': 'center'
      },
      content: 'Start'
  });



  startButton.onReceive = function(event,payload){
    if(event==='click'){

        root.removeChild(start);
        restartGame();
    }
  }
}

FamousEngine.init();
var points = 0;
var hasClicked = false;
var replays = 0; //number of times the game has restarted
var root = scene.addChild()
/*
var pDisplay = root.addChild()
    pDisplay.setPosition(0,100)
            .setSizeMode(1,1,1)
            .setAbsoluteSize(110,110);
*/
var bg = new DOMElement(root,{
  properties: {
    'background-color': "#00CCFF"
  }
});

var game;

startScreen();