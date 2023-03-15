
  'use strict';
  const URL = 'copycat.mp3';
    
  const context = new AudioContext();
  const playButton = document.querySelector('#play');
  
  let yodelBuffer;

  window.fetch(URL)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      playButton.disabled = false;
      yodelBuffer = audioBuffer;
    });
    
    playButton.onclick = () => play(yodelBuffer);

  function play(audioBuffer) {
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
  }


Crafty.init(640,640, document.getElementById('game'));

Crafty.scene("main", function(){

  Crafty.e("2D, Canvas, Text, Mouse").text("Bikini Sound Test").attr({x: 300, y: 300})
  .bind("MouseDown", () => play(yodelBuffer))


})

Crafty.scene("main");