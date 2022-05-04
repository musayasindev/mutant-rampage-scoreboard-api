// the current script folder path
const PATH = document.currentScript.src.split('?')[0].split('/').slice(0, -1).join('/') + '/';

// game audio library
var audioContext, loadSound, playSound, playMusic, stopSound, setSoundVolume;
if(window.location.protocol=='file:'){
  loadSound = (src) => {
    const s = new Audio(src);
    return s;
  }
  playSound = (s) => {s.loop=false; s.play();};
  playMusic = (s) => {s.loop=true; s.play();};
  stopSound = (s) => {if(s.currentTime == 0) return; s.pause(); s.currentTime = 0;};
  setSoundVolume = (s, volume) => {s.volume = volume;};
}
else {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loadSound = (filename) => {
    var sound = {volume: 1, audioBuffer: null};
    var ajax = new XMLHttpRequest();
    ajax.open("GET", filename, true);
    ajax.responseType = "arraybuffer";
    ajax.onload = function(){
      audioContext.decodeAudioData(ajax.response, function(buffer) {sound.audioBuffer = buffer},function(error) {debugger});
    }
    ajax.onerror = function() {debugger};
    ajax.send();
    Sound_arr.push(sound);
    return sound;
  };
  playSound = (sound) => {
    if(!sound.audioBuffer) return false;

    var source = audioContext.createBufferSource();
    if(!source) return false;

    source.buffer = sound.audioBuffer;
    if(!source.start) source.start = source.noteOn;

    if(!source.start) return false;
    var gainNode = audioContext.createGain();
    gainNode.gain.value = sound.volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.loop=false;
    source.start(0);

    sound.gainNode = gainNode;
    return true;
  };
  playMusic = (sound) => {
    if(!sound.audioBuffer) return false;

    var source = audioContext.createBufferSource();
    if(!source) return false;

    source.buffer = sound.audioBuffer;
    if(!source.start) source.start = source.noteOn;
    if(!source.start) return false;
    var gainNode = audioContext.createGain();
    gainNode.gain.value = sound.volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.loop=true;
    source.start(0);

    sound.gainNode = gainNode;
    return true;
  };
  stopSound = (sound) => {
    if(sound.gainNode) sound.gainNode.gain.value = 0;
  };
  setSoundVolume = (sound, volume) => {
    sound.volume = volume;
    if(sound.gainNode) sound.gainNode.gain.value = volume;
  };
  // active the sound after first click, this step necessary for play audio in safari
  canvas.addEventListener("mousedown", firstClick);
  canvas.addEventListener("touchstart", firstClick);
  function firstClick() {
    for (var i = 0; i < Sound_arr.length; i++) {
      var s = Sound_arr[i];
      playSound(s);
      stopSound(s);
      s.src = s.src_name;
    }
    can.removeEventListener("mousedown", firstClick);
    can.removeEventListener("touchstart", firstClick);
  }
}

// craete new image function
function newImage(src) {
  var m = new Image(); // craete image object
  m.src=PATH+src; // load image from the source
  Img_arr.push(m); // put the Img in Img_arr, Img_arr will be used later to check if all images inside it are full loaded from the giving source.
  return m; // return the image
}

function newImage_array(src,len) {
  var m = [];
  for (var i = 0; i < len; i++) {
    m[i] = new Image();
    m[i].src=PATH+src+i+".png";
    Img_arr.push(m[i]);
  }
  return m;
}

// Mouse //
// Mouse //
const Mouse = {
  X: 0, Y: 0, Left: -1, Right: -1
  , MouseMove(e) {
    // Get x and y of Mouse on the canvas
    Mouse.GetXandY(e.clientX,e.clientY);
  }
  , TouchMove(e){
    // Get x and y of Touch on the canvas
    if (e.type == "touchstart" || e.type == "touchend"){
      Mouse.GetXandY(e.changedTouches[0].pageX,e.changedTouches[0].pageY);
    }
    else if (e.type == "touchmove"){
      Mouse.GetXandY(e.targetTouches[0].pageX,e.targetTouches[0].pageY);
    }
  }
  , GetXandY(mx,my){
    // Get x and y of mouse/touch on the canvas
    var s = can.getBoundingClientRect(),X,Y;//,cw=W,ch=H;
    if (!sys.IsFullscreen()) { // if canvas not in full screen
      X = Math.floor((mx - s.left) * cw / s.width);
      Y = Math.floor((my - s.top) * ch / s.height);
    }
    else { // if canvas in full screen
      var w = s.width / cw, h = s.height / ch;
      if (h > w) {
        X = Math.floor(cw / s.width * mx);
        Y = Math.floor((my - (s.height - (ch * w)) / 2) / w);
      } else {
        X = Math.floor((mx - (s.width - (cw * h)) / 2) / h);
        Y = Math.floor(ch / s.height * my);
      }
    }

    // Update Mouse X and Y
    if (X != null && Y != null) { this.X = X-cx; this.Y = Y-cy; } // in case values is null from touch, we not going update Mouse X and Y
  }
  , Down(key) { return this[key] == 1;} // Check if mouse-click down
  , Up(key) { return this[key] == 0;} // Check if mouse-click up
  , Press(key) { return this[key] > 0;} // Check if mouse-click press
  , Update() {
    // Update mouse left and right click (1- mean not clicked, 0 mean key is 'up', 1 mean key is 'down' also 'press', 2 mean key is 'press')
    if (this.Left > 0) this.Left = 2; else this.Left = -1;
    if (this.Right > 0) this.Right = 2; else this.Right = -1;
  }
  , MouseClick(e) {
    // Update Mouse-key when it is clicked
    // Get the clicked key
    var s;
    switch (e.which) {
      case 1: s = "Left"; break;
      case 3: s = "Right"; break;
      default: return;
    }
    this[s] = e.type == 'mousedown' ? 1 : 0; // If mouse Event is 'mousedown' set the key to 1, else it should be 0 for 'mouseup'
  }
  /* Touches */, TouchClick() { if (event.type == "touchstart") this.Left = 1; }
  // Check if mouse coordinates x and y is on the given Square x,y,w,h
  , Square(x, y, w, h) { return this.X >= x && this.X < x + w && this.Y >= y && this.Y < y + h }
};
// Touch //
let TouchEvent = {
  lines:[{x:0,y:0,key:-1},{x:0,y:0,key:-1},{x:0,y:0,key:-1}],isLoaded:false
  ,Left:-1, Right:-1, Z:-1, X:-1, a:['Left','Right','Up','Down']
  ,Draw(){
    var T = TouchEvent,a = Key_a.a;
    for(var i=0; i < 4; i++){
      if(T[a[i]] == 0) T[a[i]] = -1;
    };
    if(DrawTouch(5,H-95,img['btn_left'],"Press")) T.Left=1; else if(T.Left==1) T.Left=0;
    if(DrawTouch(110,H-95,img['btn_right'],"Press")) T.Right=1; else if(T.Right==1) T.Right=0;

    if(DrawTouch(W-95,H-95-110,img['btn_z'],"Press")) T.Up=1; else if(T.Up==1) T.Up=0;
    if(DrawTouch(W-95,H-95,img['btn_x'],"Press")) T.Down=1; else if(T.Down==1) T.Down=0;

    if(T.Left==1) Key.InDown('Left'); if(T.Left==0) Key.InUp('Left');
    if(T.Right==1) Key.InDown('Right'); if(T.Right==0) Key.InUp('Right');
    if(T.Down==1) Key.InDown('Down'); if(T.Down==0) Key.InUp('Down');
    if(T.Up==1) Key.InDown('Up'); if(T.Up==0) Key.InUp('Up');
  }
  ,Load(){
    TouchEvent.isLoaded = true;
  }
  ,SquareClick(a,b,c,d,type){
    for(var i=0; i < 3; i++){
      if(this.Square2(this.lines[i].x, this.lines[i].y ,a, b, c, d) && this[type](this.lines[i].key)) return true;
    }
    return false;
  }
  ,Down(i){ return i == 1;}
  ,Up(i){ return i == 0;}
  ,Press(i){ return i > 0;}
  ,Square2(X, Y, a, b, c, d) { return X >= a && X < a + c && Y >= b && Y < b + d }
  ,GetPosition(x,y,i){
    var s = sys.canvasDraw.getBoundingClientRect(), mx = x, my = y;

    mx -= window.pageXOffset; my -= window.pageYOffset;
    if (!sys.IsFullscreen()) {
      x = Math.floor((mx - s.left) * W / s.width);
      y = Math.floor((my - s.top) * H / s.height);
    } else {
      var w = s.width / W, h = s.height / H;
      if (h > w) {
        x = Math.floor(W / s.width * mx);
        y = Math.floor((my - (s.height - (H * w)) / 2) / w);
      } else {
        x = Math.floor((mx - (s.width - (W * h)) / 2) / h);
        y = Math.floor(H / s.height * my);
      }
    }

    TouchEvent.lines[i].x = x-cx; TouchEvent.lines[i].y = y-cy;
  }
  ,TouchStart(event){
    for(var i=0,len=event.changedTouches.length; i < len; i++){
      var touch  = event.changedTouches[i];
      var id     = touch.identifier;
      if(id > 2) continue;
      var target = TouchEvent.lines[id];
      TouchEvent.GetPosition(touch.pageX,touch.pageY,id)
      if(target.key <= 0) target.key = 1;
    }
    event.preventDefault();
  }
  ,TouchEnd(event){
    for(var i=0,len=event.changedTouches.length; i < len; i++){
      var touch  = event.changedTouches[i];
      var id     = touch.identifier;
      if(id > 2) continue;
      var target = TouchEvent.lines[id];
      TouchEvent.GetPosition(touch.pageX,touch.pageY,id)
      target.key = 0;
    }
    event.preventDefault();
  }
  ,EndUpdate(){
    for(var i=0; i < 3; i++){
      var L = this.lines[i];
      if(L.key == 1) L.key = 2;
      else if(L.key == 0) L.key = -1;
    }
  }
};

/* Keyboard */
const Keyboard = {
  Keys: [], CK: []
  ,NK(vC) {
    var V = { C: vC, S: -1, Press: this.ifPress, Down: this.ifDown, Up: this.ifUp };
    this.Keys.push(V);
    return V;
  }
  ,ifPress: function () { return this.S > 0; }
  ,ifDown: function () { return this.S == 1; }
  ,ifUp: function () { return this.S == 0; }
  ,SetKeyDown(C){
    for (var i = 0, l = this.Keys.length; i < l; i++){
      if (C == this.Keys[i].C && this.Keys[i].S != 2){
        this.Keys[i].S = 1;
        this.CK.push(this.Keys[i]);
        return;
      }
    }
  }
  ,SetKeyUp(C){
    for(var i = 0, l = this.Keys.length; i < l; i++){
      if (C == this.Keys[i].C){
        this.Keys[i].S = 0;
        this.CK.push(this.Keys[i]);
        return;
      }
    }
  }
  ,funcKeyPress(){
    while (this.CK.length != 0) {this.CK[0].S = this.CK[0].S >= 1 ? 2 : -1; this.CK.shift();}
  }
};
Keyboard['Left'] = Keyboard.NK(37);
Keyboard['Up'] = Keyboard.NK(38);
Keyboard['Right'] = Keyboard.NK(39);
Keyboard['Down'] = Keyboard.NK(40);
Keyboard['X'] = Keyboard.NK(88);

function irandom(a) { return Math.round(Math.random() * a) }
const choose = (a)=>{ return a[Math.round(Math.random() * a.length) % a.length] }
function point_direction(a, b, c, d) { return 180 * Math.atan2(d - b, c - a) / Math.PI }
function point_distance(a, b, c, d) { var e = a - c, f = b - d; return Math.sqrt(e * e + f * f) }
function ImageMeetImage(x1,y1,w1,h1,x2,y2,w2,h2){
  var x, y, w, h, i, j;
  if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2) return true;
  return false;
};
function DrawBtn(x,y,w,h,m){
  var r = Mouse.Square(x-w/2,y,w,h);
  ctx.globalAlpha = r?1:0.9;
  ctx.drawImage(m,x-w/2,y,w,h);
  ctx.globalAlpha = 1;
  return r;
}
Number.prototype.pad = function(n) {
  if(this.toString().length>=n) return this;
    return new Array(n).join('0').slice((n || 2) * -1) + this;
}

const ValidateName=t=>t.split(" ").length-1<=2&&/^[a-zA-Z ()'.,\-]+$/.test(t),
ValidateEmail=w=>/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(w);


const sys = {
  // Open Fullscreen
  openFullscreen() { var a = can; a.requestFullscreen ? a.requestFullscreen() : a.mozRequestFullScreen ? a.mozRequestFullScreen() : a.webkitRequestFullscreen ? a.webkitRequestFullscreen() : a.msRequestFullscreen && a.msRequestFullscreen(); }
  // Close Fullscreen
  , closeFullscreen() { var a = document; a.exitFullscreen ? a.exitFullscreen() : a.mozCancelFullScreen ? a.mozCancelFullScreen() : a.webkitExitFullscreen ? a.webkitExitFullscreen() : a.msExitFullscreen && a.msExitFullscreen(); }
  // Switch Fullscreen, if is in Fullscreen then close Fullscreen, else open Fullscreen
  , swithFullscreen() { sys.IsFullscreen() ? sys.closeFullscreen() : sys.openFullscreen() }
  // check if game in Fullscreen or not
  , IsFullscreen() {
    if(sys.IsMobile) return document.webkitCurrentFullScreenElement != null;
    return window.fullScreen || (window.innerHeight == screen.height);
  }
  // if the game is in mobile device
  ,IsMobile:typeof window.orientation !== 'undefined' ? true : false
}
