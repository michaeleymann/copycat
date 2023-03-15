// https://craftyjs.com/documentation/components.html


// SOME GAME VARIABLES
scrollSpeed = 1;
cols = ["#AAA", "#888","#CCC","#DDD"];
score = 0;
time = 0;


Crafty.init(640,640, document.getElementById('game'));

let billie;

var assetsObj = {
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
        console.log("clicked")
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
      console.log("clicked")
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
      console.log("clicked")
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
/**
* Adds scrolling behaviour to entity
*/
Crafty.c("Scrolling", {

  Scrolling: function(){
  this.bind("UpdateFrame", function(eventData){
    if (this.y < -122 ) {
      if (this.x == 0) { // weird way to onlie make one new line and not 10
        makeNewLine()}
      this.destroy()
    }
    this.y = this.y - eventData.dt * scrollSpeed/10  
  });
  return this;
  }
  }
)

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
.bind('KeyDown', function(e) {
  if(e.key == Crafty.keys.LEFT_ARROW) {
    this.state.left = this.state.right = this.slay = false;
    this.state.left = true;
  } else if (e.key == Crafty.keys.RIGHT_ARROW) {
    this.state.left = this.state.right = this.slay = false;
    this.state.right = true;
  } else if (e.key == Crafty.keys.SPACE) {
    this.state.left = this.state.right = this.slay = false;
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
  
  if (this.slayCounter > 0 ) {
    this.animationSpeed = 4
    this.state.slay = true;
    if (!this.isPlaying("slay")) this.animate("slay",-1)
    else if (this.isPlaying("slay")) this.resumeAnimation("slay",-1)
    if (this.slayCounter < 18) {
      this.slayCounter +=1
    } else {
      this.slayCounter = 0;
      this.state.slay = false;
    }
  }

  if (this.state.left && !this.isPlaying("walkLeft")) this.animate("walkLeft",-1)
  else if (this.state.left  && this.isPlaying("walkLeft")) this.resumeAnimation("walkLeft", -1)
  else if (this.state.right && !this.isPlaying("walkRight")) this.animate("walkRight", -1)
  else if (this.state.right  && this.isPlaying("walkRight")) this.resumeAnimation ("walkRight", -1)
  else if (this.isPlaying("walk")) this.resumeAnimation("walk", -1)
  else if (!this.state.slay) this.animate("walk",-1)
})
.onHit("RightHouse", function() {
  x = this.x;
  this.x -= 4;
})
.onHit("LeftHouse", function() {
  x = this.x;
  this.x += 4;
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
  console.log(score)
}

/**
 * Returns a enemy at a random position between 1 and 9
 */
function makeEnemy(){
  
  xPos = Math.floor(Math.random() * 8 ) + 1
  a = Math.floor(Math.random() * 5 ) //xPos Enemy Spritesheet
  b = Math.floor(Math.random() * 10 ) + 5 //yPos Enemy Spritesheet
  c = Math.floor(Math.random()*7) //xPos Bubble Spritesheet
  enemy = Crafty.e("2D, Canvas, enemy_start, SpriteAnimation, Scrolling, Enemy, Collision")
  .attr({x: xPos*64, y: 11*64, z:1, dead: false})
  .reel("walk", 1000, a, b, 1)
  .animate("walk")
  .collision(26,16,26,48,48,48,48,16)
  .onHit("Player", function(){
    if (billie.state.slay) {
      if (!this.dead) {
        this.timeout(function() {
          deathAnimation(this._x, this._y);
          this.destroy()
        }, 100);
      this.dead = true;
      score +=1;
      }
      
      
    }
    else (this.y += 40)
  })
  .Scrolling()
  .attach(Crafty.e("2D, Canvas, bubble_1, SpriteAnimation, Scrolling, Enemy, Collision")
  .attr({x: xPos*64, y: 10*64, z:1, w:64, h:64})
  .reel("1", 1000, c, 0, 1)
  .animate("1"))

  /*
  b = Math.floor(Math.random()*7)
  bubble = Crafty.e("2D, Canvas, bubble_1, SpriteAnimation, Scrolling, Enemy, Collision")
  .attr({x: xPos*64, y: 10*64, z:1, w:64, h:64})
  .reel("1", 1000, b, 0, 1)
  .animate("1")
  .Scrolling();
  */
}
/**
 * Returns a "LeftHouse" Entity
 *
 * @param {number} i the x position factor
 * @param {number} j the y position factor
 */
function makeLeftHouse(i,j){
  colNum = ( Math.floor(Math.random() * 2) )
  Crafty.e("2D, Canvas, Color, LeftHouse, Scrolling")
      .attr({x: i*64, y: j*64, w:64, h:64}).color(cols[colNum])
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
  Crafty.e("2D, Canvas, Color, RightHouse, Scrolling")
    .attr({x: i*64, y: j*64, w:64, h:64}).color(cols[colNum])
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
    .attr({x: i*64, y: j*64, w:64, h:64})
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

// ---------- SCENES ----------

// Loading Scene
Crafty.scene("loading", function() {
  Crafty.load(assetsObj, function() {
    Crafty.scene("title"); 
  });
});

Crafty.scene("title", function(){
  Crafty.e("2D, Canvas, Image, Mouse").image("assets/title.png")
  .bind('KeyDown', function(e) {
    if(e.key == Crafty.keys.SPACE) {
      Crafty.scene("main")
    }
  } )
  .bind("MouseDown", function(){
    Crafty.scene("main")
  })
})

// Main Scene --- MAIN SCENE!!! ---
Crafty.scene("main", function(){
  if (window.innerWidth < 640 ) {
    mySize = window.innerWidth;
    document.getElementById("wrapper").style.height = mySize + "px"
    document.getElementById("wrapper").style.width = mySize + "px"
    Crafty.viewport.init(mySize,mySize, document.getElementById("game"))
    Crafty.viewport.scale(mySize/640);
  }
 
    

    generateWorld();
    makeBillie();
    Crafty.e("Score")
    Crafty.e("MobileLeft")
    Crafty.e("MobileRight")
    Crafty.e("MobileSlay")
    setInterval(function(){makeEnemy()},700 + Math.floor(Math.random() * 500 ) )

    //timer just for development, delete later
    setInterval(function(){time +=1}, 1000)
}); // END MAIN SCENE

/* COPY OF MAIN SCENE DURING MOBILE INTERFACE DEVELOPMENT
// Main Scene --- MAIN SCENE!!! ---
Crafty.scene("main", function(){
  generateWorld();
  makeBillie();
  Crafty.e("Score")
  setInterval(function(){makeEnemy()},700 + Math.floor(Math.random() * 500 ) )

  //timer just for development, delete later
  setInterval(function(){time +=1}, 1000)
}); // END MAIN SCENE
*/


// START THE GAAAAAAME
Crafty.scene("loading");
