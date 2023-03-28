/*
Improvements To Do
Bind all the enemy stuff to the player, use the collision object do determine whicht objects to destroy
Make Better Enemie Ausweichfunktion (Line 325)
*/


// SOME GAME VARIABLES
var cols = ["#AAA", "#888","#CCC","#DDD"];
var score = 0;
var time = 0;
var mobile = false;
var enemyTrigger;


// SOUND STUFF
const URL = 'assets/copycat.mp3';  
const context = new AudioContext();
let billieBuffer;

window.fetch(URL)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => context.decodeAudioData(arrayBuffer, audioBuffer => {
    billieBuffer = audioBuffer;
  }, error => console.error(error)))


  function play(audioBuffer) {
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
  }
// END SOUND STUFF

//START CRAFTY STUFF
Crafty.init(640,640, document.getElementById('game'));

let billie;

// LOAD ALL THE NICE STUFF
var assetsObj = {
  /* MP3 CAN NOT BE PLAYED ON SAFARI PLAY IT DIFFERENTLY
  "audio": {
    "soundtrack": ["assets/copycat.mp3"]
  },
  */
  "sprites": {
      // This spritesheet has 16 images, in a 2 by 8 grid
      // The dimensions are 832x228
      "assets/sprite2.png": {
          // This is the width of each image in pixels
          tile: 64,
          // The height of each image
          tileh: 64,
          // We give names to three individual images
          map: {
              walker_start: [0, 10],
              walker_middle: [4, 10],
              walker_end: [8, 10]
          }
      },
      "assets/enemysprite.png": {
        // This is the width of each image in pixels
        tile: 64,
        // The height of each image
        tileh: 64,
        // We give names to three individual images
        map: {
            enemy_start: [0, 10],
            enemy_middle: [4, 10],
            enemy_end: [8, 10]
        }
    },
    "assets/bubbles.png": {
      tile: 64,
      tileh: 64,
      map: {
        bubble_1: [0,0],
        pow: [0,1]
      }
    }
  }
};

// ---------- FUNCTIONS & COMPONENTS ----------

// Mobile Buttons
Crafty.c("MobileLeft", {
    init: function(){
      this.addComponent("2D, Canvas, Color, Mouse")
      this.x = 30
      this.y = 540
      this.z = 1
      this.w = 64
      this.h = 64
      this.color("#F0F")
      this.bind("MouseDown", function(){
        billie.state.left = billie.state.right = billie.slay = false;
        billie.state.left = true;
        billie._speed = ({x: -1, y:0})
        billie._direction = ({x:180, y:0})
      })
      this.bind("MouseUp", function(){
        billie.state.left = billie.state.right = billie.slay = false;
        billie._speed = ({x: 0, y:0})
        billie._direction = ({x:180, y:0})
      })
    }
})
Crafty.c("MobileRight", {
  init: function(){
    this.addComponent("2D, Canvas, Color, Mouse")
    this.x = 500
    this.y = 540
    this.z = 1
    this.w = 64
    this.h = 64
    this.color("#F0F")
    this.bind("MouseDown", function(){
      billie.state.left = billie.state.right = billie.slay = false;
      billie.state.right = true;
      billie._speed = ({x: 1, y:0})
      billie._direction = ({x:180, y:0})
    })
    this.bind("MouseUp", function(){
      billie.state.left = billie.state.right = billie.slay = false;
      billie._speed = ({x: 0, y:0})
      billie._direction = ({x:180, y:0})
    })
  }
})
Crafty.c("MobileSlay", {
  init: function(){
    this.addComponent("2D, Canvas, Color, Mouse")
    this.x = 280
    this.y = 540
    this.z = 1
    this.w = 64
    this.h = 64
    this.color("#F0F")
    this.bind("MouseDown", function(){
      billie.state.left = billie.state.right = billie.slay = false;
      billie.state.slay = true;
      billie.slayCounter = 1;
    })
    this.bind("MouseUp", function(){
      billie.state.left = billie.state.right = billie.slay = false;
      billie._speed = ({x: 0, y:0})
    })
  }
})

// Components
/**
* Adds scrolling behaviour to entity
*/
//OK THIS IS SOME SPAGHETTI CODE SHIT, SCROLLING GENERATES LINES
// I MIGHT WANNA CHANGE THIS (OR NOT)
Crafty.c("Scrolling", {

  Scrolling: function(){ //take a as true/false
  
  this.bind("UpdateFrame", function(eventData){
    if (this.y < -122 ) {
      if (this.x == 0) { // weird way to only make one new line and not 10
        makeNewLine()}
      this.destroy()
    }
    this.y = this.y - eventData.dt * this.scrollSpeed/10  
  });
  return this;
  }
})

Crafty.c("Score", {
  init: function(){
    this.addComponent("2D, Canvas, Text");
    this.x = 10,
    this.y = 10,
    this.z = 2,
    this.bind("EnterFrame", function(){
      this.text("Score: " + score + "  Time: " + time)
    })
  }
})

Crafty.c("Bubble", {
  init: function(){
    startTime = 1000 + Math.random()*3000
    spriteNumber = Math.floor(Math.random()*7) //xPos Bubble Spritesheet
    this.attach(Crafty.e("2D, Canvas, bubble_1, SpriteAnimation, Scrolling, Enemy, Collision, selfDestroy")
      .attr({x: this.x, y: this.y-64, z:1, w:64, h:64})
      .reel("none", 1000, 6,0,1) //empty sprite
      .reel("catcall", 1000, spriteNumber, 0, 1)
      .reel("0", 1000, 0, 2, 1)
      .reel("1", 1000, 1, 2, 1)
      .reel("2", 1000, 2, 2, 1)
      .reel("3", 1000, 3, 2, 1)
      .reel("4", 1000, 4, 2, 1)
      .reel("5", 1000, 5, 2, 1)
      .bind("EnterFrame", function(){
        setTimeout(()=>this.animate("catcall"),startTime)
        if ( this._parent.pushed > 15 ) {this.animate("5");console.log("ACHIEVEMENT: MALE TEARS")}
        else if ( this._parent.pushed > 12 ) this.animate("4")
        else if ( this._parent.pushed > 9 ) this.animate("3")
        else if ( this._parent.pushed > 6 ) this.animate("2")
        else if ( this._parent.pushed > 3 ) this.animate("1")
        else if ( this._parent.pushed > 0 ) this.animate("0")
      })
    )
  }
})
// Functions
/**
 * Returns Billie
 */
function makeBillie(){
billie = Crafty.e('2D, Canvas, walker_start, SpriteAnimation, Twoway, Collision, Player')
.attr({
  x: 320, y:100, z:1,
  w:64, h:64, 
  state: {left: false, right: false, slay: false}, 
  slayCounter: 0
})
.twoway(200)
.collision(26,16,26,48,48,48,48,16) 
.reel("walk", 1000, 0, 10, 8)
.reel("walkLeft", 1000, 0, 9, 8)
.reel("walkRight", 1000, 0, 11, 8)
.reel("slay", 1000, 0, 14, 6)
.reel("slayRight", 1000, 0, 15, 6)
.reel("slayLeft", 1000, 0, 13, 6)
.bind('KeyDown', function(e) {
  if(e.key == Crafty.keys.LEFT_ARROW) {
    this.state.left = this.state.right = false;
    this.state.left = true;
  } else if (e.key == Crafty.keys.RIGHT_ARROW) {
    this.state.left = this.state.right = false;
    this.state.right = true;
  } else if (e.key == Crafty.keys.SPACE) {
    //this.state.left = this.state.right = this.slay = false;
    //this.state.slay = true;
    this.slayCounter = 1
  }
})
.bind('KeyUp', function(){
  if (!Crafty.s('Keyboard').isKeyDown('LEFT_ARROW') 
    && !Crafty.s('Keyboard').isKeyDown('RIGHT_ARROW') 
    && !Crafty.s('Keyboard').isKeyDown('SPACE') ) {
    this.state.left = this.state.right = this.state.slay = false;
  }
  }
)
.bind('EnterFrame', function(){
  this.animationSpeed = 1;
  
  // IS BILLIE CURRENTLY SLAYING??
  if (this.slayCounter > 0 ) {
    this.animationSpeed = 4
    this.state.slay = true;

    //play proper animation depending on if walking left, right or straight
    if (this.state.left) {
      if (!this.isPlaying("slayLeft")) this.animate("slayLeft",-1)
      else if (this.isPlaying("slayLeft")) this.resumeAnimation("slayLeft",-1)
    } else if (this.state.right){
      if (!this.isPlaying("slayRight")) this.animate("slayRight",-1)
      else if (this.isPlaying("slayRight")) this.resumeAnimation("slayRight",-1)
    } else {
      if (!this.isPlaying("slay")) this.animate("slay",-1)
      else if (this.isPlaying("slay")) this.resumeAnimation("slay",-1)
    }
    
    if (this.slayCounter < 18) {
      this.slayCounter +=1
    } else {
      this.slayCounter = 0;
      this.state.slay = false;
    }
  } else {
    if (this.state.left && !this.isPlaying("walkLeft")) this.animate("walkLeft",-1)
    else if (this.state.left  && this.isPlaying("walkLeft")) this.resumeAnimation("walkLeft", -1)
    else if (this.state.right && !this.isPlaying("walkRight")) this.animate("walkRight", -1)
    else if (this.state.right  && this.isPlaying("walkRight")) this.resumeAnimation ("walkRight", -1)
    else if (this.isPlaying("walk")) this.resumeAnimation("walk", -1)
    else this.animate("walk",-1)
  }
  

})
.bind('Move', function(evt) { // after player moved
  var hitDatas, hitData;
  if ((hitDatas = this.hit('Solid'))) { // check for collision with walls
    hitData = hitDatas[0]; // resolving collision for just one collider
    if (hitData.type === 'SAT') { // SAT, advanced collision resolution
      // move player back by amount of overlap
      this.x -= hitData.overlap * hitData.nx;
    } else { // MBR, simple collision resolution
      // move player to previous position
      this.x = evt._x;
    }
  }
})
}

/**
 * Creates a Death Animation for a killed enemy 
 * The Animation Entity self destroys after playing the animation once
 *
 * @param {number} x the x position of the animation
 * @param {number} y the y position of the animation
 */
function deathAnimation(x,y){
  Crafty.e("2D, Canvas, SpriteAnimation, pow")
    .attr({x:x, y: y, z: 1, w: 64, h: 64})
    .reel("pow", 1000, 0, 1, 5)
    .animate("pow")
    .bind("EnterFrame", function(){
      this.animationSpeed = 3
      if (!this.isPlaying("pow")) this.destroy()
    })
}

/**
 * Returns a enemy at a random position between 1 and 9
 */
function makeEnemy(){
  
  xPos = Math.floor(Math.random() * 8 ) + 1
  a = Math.floor(Math.random() * 5 ) //xPos Enemy Spritesheet
  b = Math.floor(Math.random() * 10 ) + 5 //yPos Enemy Spritesheet
  
  enemy = Crafty.e("2D, Canvas, enemy_start, Bubble, SpriteAnimation, Scrolling, Tween, Enemy, Collision")
  .attr({x: xPos*64, y: 11*64, z:1, scrollSpeed: 1, pushed: 0})
  .reel("walk", 1000, a, b, 1)
  .animate("walk")
  .collision(26,16,26,48,48,48,48,16)
  .onHit("Player", function(evt, first){ //first is true if this is the first collision
    if (billie.state.slay && first) {
      this.timeout(function() {
        deathAnimation(this._x, this._y);
        this.destroy()
      }, 100);
    score+=1
    } else this.tween({y: this.y+40}, 100);this.pushed +=1;
  })
  .Scrolling()
}

function makeBoss(){
  billie.twoway(1)
  setTimeout(()=>billie.twoway(200), 9000)

  clearInterval(enemyTrigger)
  boss = Crafty.e("2D, Canvas, Color, Collision, Tween, Solid, Boss, Scrolling")
  .attr(({x: 510, y: 11*64, w:64, h:128, z:1, health: 10, dead: false, scrollSpeed: 1}))
  .Scrolling()
  .color("#FF0")
  .bind("EnterFrame", function(){
    if (this.y == billie.y-100) {
      this.scrollSpeed = 0;
      this.tween({x: 505, y:billie.y}, 2000) // auf höhe Billie bewegen
    } else if (this.x < 506) {  // wenn bei 505 heranfahren
      this.tween({x: Math.max(billie.x+48, 128)}, 400)
    }
  })
  /*.onHit("Player", function(evt, first){
    console.log("boss hit billie")
    if (billie.state.slay && first) {
      if (this.health > 0){
        this.health -= 1
      } else if (!this.dead){
        this.timeout(function() {
        deathAnimation(this._x, this._y);
        this.destroy()
        }, 100);
        this.dead = true;
        bossLevel = false;
        score +=100;
        enemyTrigger = setInterval(makeEnemy,700 + Math.floor(Math.random() * 500 ) )
      }
    }
  }) // END ONHIT*/
  
  Crafty.e("2D, Canvas, Color")
    .attr({x:boss.x, y: boss.y, z: 2, w: boss.health, h: 5})
    .color("#F00")
    .bind("EnterFrame", function(){this.w = 10*boss.health, this.x = boss.x, this.y=boss.y})
}

/**
 * Returns a "LeftHouse" Entity
 *
 * @param {number} i the x position factor
 * @param {number} j the y position factor
 */
function makeLeftHouse(i,j){
  colNum = ( Math.floor(Math.random() * 2) )
  Crafty.e("2D, Canvas, Color, Solid, Scrolling")
      .attr({x: i*64, y: j*64, w:64, h:64, scrollSpeed: 1}).color(cols[colNum])
      .Scrolling()
}

/**
 * Returns a "RightHouse" Entity
 *
 * @param {number} i the x position factor
 * @param {number} j the y position factor
 */
function makeRightHouse(i,j){
  colNum = ( Math.floor(Math.random() * 2) )
  Crafty.e("2D, Canvas, Color,  Solid, Scrolling")
    .attr({x: i*64, y: j*64, w:64, h:64, scrollSpeed: 1}).color(cols[colNum])
    .Scrolling();
}

/**
 * Returns a "Street" Entity
 *
 * @param {number} i the x position factor
 * @param {number} j the y position factor
 */
function makeStreet(i,j){
  colNum = ( Math.floor(Math.random() * 2) + 2)
  Crafty.e("2D, Canvas, Color, Street, Scrolling")
    .attr({x: i*64, y: j*64, w:64, h:64, scrollSpeed: 1})
    .color(cols[colNum])
    .Scrolling();
}

/**
* Makes a Line of Background Objects
*/
function makeNewLine () {
  for (i = 0; i < 10; i++){
    if ( i == 0 ) makeLeftHouse(i,10);
    else if ( i == 9 ) makeRightHouse(i,10);
    else makeStreet(i,10);
  }
}

/**
* Generates the first set of 10x11 Background Objects
*/
function generateWorld(){
  // Generate Street & Bulidings
  for (i = 0; i < 10; i++){
    for (j = 0; j < 12; j++ ) {
      if ( i == 0 ) makeLeftHouse(i,j);
      else if ( i == 9 ) makeRightHouse(i,j);
      else makeStreet(i,j);   
    }
  }
}

function scaleIfDisplayIsSmall() {
  if (window.innerWidth < 640 ) {
    mySize = window.innerWidth;
    document.getElementById("wrapper").style.height = mySize + "px"
    document.getElementById("wrapper").style.width = mySize + "px"
    Crafty.viewport.init(mySize,mySize, document.getElementById("game"))
    Crafty.viewport.scale(mySize/640);
  }
};
 

// ---------- SCENES ----------

// Loading Scene
Crafty.scene("loading", function() {
  Crafty.e("2D, Canvas, Text").text(". . . L O A D I N G . . .")
  .textFont({ family: 'Arial', size:"16px"})
  .textAlign("center")
  .attr({x: 320, y: 300})
  Crafty.load(assetsObj, function() {
    Crafty.scene("title");
  });
});

// Title Scene
Crafty.scene("title", function(){
  scaleIfDisplayIsSmall()
  Crafty.e("2D, Canvas, Image, Mouse").image("assets/title.png")
  Crafty.e("2D, Canvas, Image, Mouse")
  .image("assets/phone.png")
  .attr({x: 470, y: 490})
  .bind("MouseDown", function(){
    play(billieBuffer);
    mobile = true;
    Crafty.scene("main")
  })
  Crafty.e("2D, Canvas, Image, Mouse")
  .image("assets/computer.png")
  .attr({x: 75, y: 480})
  .bind("MouseDown", function(){
    play(billieBuffer);
    Crafty.scene("main")
  })
})

// Main Scene --- MAIN SCENE!!! ---
Crafty.scene("main", function(){
  scaleIfDisplayIsSmall()
 
    
    //Crafty.audio.play("soundtrack")
    generateWorld();
    makeBillie();
    Crafty.e("Score")
    if (mobile) {
    Crafty.e("MobileLeft")
    Crafty.e("MobileRight")
    Crafty.e("MobileSlay")
    }

    //setTimeout(makeBoss, 0)
    // MAKE ENEMIES
    enemyTrigger = setInterval(makeEnemy,700 + Math.floor(Math.random() * 500 ) )
    
    //setTimeout(makeBoss(), 30000)
    //timer just for development, delete later
    setInterval(function(){time +=1}, 1000)

}); // END MAIN SCENE

// START THE GAAAAAAME
Crafty.scene("loading");
