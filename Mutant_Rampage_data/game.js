const can = canvas;
const mctx = can.getContext("2d");
const W=960;
const H=540;
var cw=W, ch=H, cx, cy;
const can2 = document.createElement("canvas");
can2.width = W; can2.height = H;
const ctx = can2.getContext("2d");
const can_e = document.createElement("canvas"), ctx_e = can_e.getContext("2d");; can_e.width = can_e.height = 120; ctx_e.scale(-1, 1);

can.addEventListener("mousemove", function () { Mouse.MouseMove(event, false) }, !1);
can.addEventListener("mousedown", function () { Mouse.MouseClick(event) }, !1);
can.addEventListener("mouseup", function () { Mouse.MouseClick(event) }, !1);
/* Touches */can.addEventListener("touchmove", function () { Mouse.TouchMove(event, true); if (!sys.MScolling) event.preventDefault();}, !1);
/* Touches */can.addEventListener("touchstart", function () { Mouse.TouchMove(event,true); Mouse.TouchClick(); event.preventDefault(); }, !1);
/* Touches */can.addEventListener("touchend", function () { if (Mouse.Left != 0 && Mouse.Left != 1) { Mouse.Left = 0;} event.preventDefault(); }, !1);
can.tabIndex = 1;
/* Keyboard */can.onkeyup = function (e) { Keyboard.SetKeyUp(e.keyCode); e.preventDefault(); };
/* Keyboard */can.onkeydown = function (e) {  Keyboard.SetKeyDown(e.keyCode); e.preventDefault(); };
/* Touch */can.addEventListener('touchstart', TouchEvent.TouchStart, false);
/* Touch */can.addEventListener('touchmove', TouchEvent.TouchStart, false);
/* Touch */can.addEventListener('touchend', TouchEvent.TouchEnd, false);

function resizeCan(){G.needResize=true;}
window.onresize = resizeCan;

const view = {x:0,x1:0,y:0};
var tx_sp = {bg:0}, texture, bg_x=0, user={name:'', email:''};
var tiles_m, hero, hero_i=0, enemy=[], coins=[], damages=[], effects=[], score=0; street=[], run_speed=8, life_chance=0, enemy_chance=0, ds_x=1;
const G = {
  isReady:false, state:"main", state2:"game", sound:true, lvl_i:0, needResize:true, wait:false
  ,newGame(){
    enemy=[]; coins=[]; damages=[], effects=[]; score=0; run_speed=8; life_chance=enemy_chance=0; ds_x=1;
    view.x=view.x1=0; view.y=30;
    S.reset();
    S.add_level(Levels[0]);
    S.add_level(Levels[5]);
    S.add_random_level();
    //S.add_random_level();

    var hx=40, hy=300;
    hero = new Hero_class(hx,hy);
    G.state=G.state2='game';
    if(G.sound){ stopSound(sound.music1); playMusic(sound.music1);}
  }
  ,check_if_all_loaded(){
    for(var i=0, len=Img_arr.length ;i<len; i++){
      if(!(Img_arr[i].complete && Img_arr[i].naturalHeight !== 0)) return;
    }
    G.isReady=true;
    texture = ctx.createPattern(img.bg, 'repeat-x');
    TouchEvent.Load();
    S.check_all_levels();
    //G.newGame();
  }
  ,loop(){
    G.resizeCan();
    Key.CheckKeys();

    G.drawBG();
    if(G.state == 'game'){ G.draw_game(); Key.Update(); if(sys.IsMobile)TouchEvent.Draw();}
    else if(G.state == 'main') G.draw_main();
    else if(G.state == 'end') G.draw_end();
    // top right buttons
    if((DrawBtn(W-28, 5, 40, 40, img.btn_fs) && Mouse.Down('Left'))) sys.swithFullscreen();
    if((DrawBtn(W-74, 5, 40, 40, G.sound?img.btn_sound_on:img.btn_sound_off) && Mouse.Down('Left'))){
      G.sound=!G.sound;
      if(G.sound){ stopSound(sound.music1); playMusic(sound.music1);}
      else stopSound(sound.music1);
    }

    mctx.drawImage(can2,cx,cy);
  }
  ,draw_main(){
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "30px font1"; ctx.fillStyle = "#fff";
    ctx.drawImage(img.logo, (W-500)/2, 40);
    if((DrawBtn(W/2, 350, 300, 100, img.btn_play) && Mouse.Down('Left'))) G.newGame();

    G.draw_scoreboard(650,250);
  }
  ,draw_end(){
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "60px font1"; ctx.fillStyle = "#fff";
    var t = G.time;
    if(t<=20) ctx.globalAlpha=0;
    else if(t<=40) ctx.globalAlpha=(t-20)/20;
    ctx.drawImage(img.game_over, (W-700)/2, 40);
    ctx.fillText('SCORE : '+Math.floor(score),W/2,200);
    ctx.globalAlpha=1;

    if(!G.wait){
      G.draw_scoreboard(650,250);
      if((DrawBtn(W/2, 350, 300, 100, img.btn_replay) && Mouse.Down('Left'))) G.newGame();
    }
    bg_x=(bg_x+1)%W;
    G.time++;
  }
  ,draw_game(){
    ctx.font = "28px font1";
    var x=view.x, y=view.y, hsy=S.start_y;
    for(var i = 0, l=S.lvl, len=l.length, w=0, h=0; i < len; i++) {
      if(w-x>W) break;
      var h2 =(hsy-l[i].lvl.d.start_y)*64;
      ctx.drawImage(l[i].lvl.m, x-w, y-h-h2, W, H, 0,0,W,H);
      var hh=l[i].dh-(y-h)+h2;
      if(hh<H) do {ctx.drawImage(l[i].lvl.m, x-w, l[i].dh-64, W, 64, 0,hh,W,64);hh+=64;} while (hh<H);
      h-=(l[i].y)*64;
      w+=l[i].lvl.w*64;
    }
    for(var i = 0, c=coins, len=c.length; i < len; i++){ /* coin */
      c[i].update(); c[i].draw();
      if(c[i].dead || c[i].x-x<-100){c.splice(i,1);i--;len--;}
    }
    for(var i = 0, c=enemy, len=c.length; i < len; i++){ /* enemy */
      c[i].update(); c[i].draw();
      if(c[i].dead || c[i].x-x<-100){c.splice(i,1);i--;len--;}
    }

    if(G.state2=='game'){
      hero.update(); hero.draw();
      G.update_view();
      //alert(hero.x-x)
      if(hero.x-x<-50 || hero.y-y>H+100) G.set_end_game();
      if(l[0].lvl.w*64-x<0){
        S.remove_first_level();
        S.add_random_level();
        if(run_speed<10) run_speed+=.5;
        else if(run_speed<13) run_speed+=.25;
        else if(run_speed<16) run_speed+=.05;
        else if(run_speed<18) run_speed+=.025;
      }
    }
    else if(G.state2=='end'){
       hero.draw_dead();
       var time=G.time; G.time++;
       if(time>=30){
         view.y-=50;
         if(view.y<=-1000) G.switch_end_game();
       }

    }
    G.draw_pop_up_text();
    G.draw_effect();
    ctx.font = "28px font1"; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle='orange';
    ctx.fillText('SCORE : '+Math.floor(score),16,4);
    for (var i = 0, len=hero.life; i < len; i++) ctx.drawImage(img.life,16+32*i,34,32,32)
    //G.switch_end_game();
  }
  ,drawBG(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,W,-view.y);
    var x=bg_x, w=16*60, h=16*32;

    ctx.translate(-x,0);
    ctx.fillStyle = texture;
    ctx.fillRect(x,0,W,H);
    ctx.resetTransform();
  }
  ,drawTexture(m,x,sp){
    x=(x)%W;
    ctx.translate(x,0);
    ctx.fillStyle = texture[m];
    ctx.fillRect(-x,0,W,H);
    ctx.resetTransform();
  }
  ,drawTexture2(m,x,sp){
    x=(x-tx_sp[m])%W;
    ctx.translate(x,0);
    ctx.fillStyle = texture[m];
    ctx.fillRect(-x,0,W,H);
    ctx.resetTransform();
    tx_sp[m]+=sp;
  }
  ,draw_scoreboard(x,y){
    if(scoreboard==undefined) return;
    var s=scoreboard, i, len=s.length;
    if(len>10)len=10;
    ctx.textBaseline = "middle"; ctx.font = "18px font1";
    ctx.drawImage(img.scoreboard,x,y);
    ctx.textAlign = "left"; ctx.fillStyle='black';
    for(i = 0; i < len; i++){ctx.fillText(s[i].name,x+5,y+41+22*i);}
    ctx.textAlign = "right"; ctx.fillStyle='blue';
    for(i = 0; i < len; i++){ctx.fillText(s[i].score,x+245,y+41+22*i);}
  }
  ,PlaySound(s){
    if(G.sound){
      stopSound(s);
      playSound(s);
    }
  }
  ,create_tile(l,ts){
    if(l.isload) return;
    var m = img['tileset_1'], pw=ts.w, ph=ts.h, t=l.tab, x, y, vx=view.x, vy=view.y;
    var cn = document.createElement("canvas"), cx = cn.getContext("2d");
    cn.width = view.w = l.w*pw; cn.height = view.h = l.h*ph;
    for(y = 0; y < l.h; y++){
      for(x = 0; x < l.w; x++){
        var tt = t[y][x];
        if(tt==null) continue;
        for(var i = 0, len=tt.length; i < len; i+=2) cx.drawImage(m, tt[i]*pw, tt[i+1]*ph, pw, ph, x*pw, y*ph, pw, ph);
        //cx.drawImage(m, x*pw, y*ph, pw, ph, tt[0]*pw, tt[1]*ph, pw, ph);
      }
    }
    l.m=cn;
    //tiles_m=cn;
    l.isload=true;
  }
  ,update_view(){
    var {w,h} = S;
    var v = view, x=hero.x+25-W/2, y=hero.y+25-H/2, fx=v.x;
    if(x<0)x=0;
    if(y>v.h-h) y=v.h-h;
    var dir = point_direction(0,v.y,0,y), dis= point_distance(0,v.y,0,y)/6;
    //v.x     = Math.floor(v.x + dis * Math.cos(Math.PI/180 * dir));
    v.y     = Math.floor(v.y + dis * Math.sin(Math.PI/180 * dir));
    v.x1+=run_speed;
    v.x=Math.floor(v.x1);
    score+=run_speed/100;
    bg_x =(bg_x+run_speed/2)%W;
  }
  ,add_pop_up_text(x,y,txt,color){
    damages.push({x:x, y:y, txt:txt, color:color, i:0})
  }
  ,draw_pop_up_text(){
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "24px font1";
    var d=damages, i, len=d.length, {x,y}=view;
    for(i = 0; i < len; i++) {
      var b=d[i];
      ctx.globalAlpha = (30-b.i)/30;
      ctx.font = (34+b.i/2)+"px font1";
      ctx.fillStyle = "white"; ctx.fillText(b.txt,b.x-x,b.y-y-b.i+1);
      ctx.fillStyle = b.color; ctx.fillText(b.txt,b.x-x,b.y-y-b.i);
      if(++b.i>=30){
        d.splice(i,1);
        i--;len--;
      }
    }
    ctx.globalAlpha=1;
  }
  ,draw_effect(){
    var d=effects, i, len=d.length;
    for(i = 0; i < len; i++) {
      d[i].draw();
      if(d[i].dead){
        d.splice(i,1);
        i--;len--;
      }
    }
  }
  ,set_end_game(){
    G.state2='end';
    G.time=0;
    Sprite.change_state(hero.s,'fall'); Sprite.change_index(hero.s,0);
  }
  ,switch_end_game(){
    G.state='end';
    G.time=0;
    var o={score:Math.floor(score), name:user.name, email:user.email};
    local.game_end(o);
  }
  ,resizeCan(){
    if(G.needResize){
      var w = window.innerWidth;
      var h = window.innerHeight;
      if(w/h>W/H){
        var wh = (w/h) / (W/H);
        can.height = H;
        can.width = Math.floor(W*wh);
      }
      else {
        var wh = (h/w) / (H/W);
        can.width = W;
        can.height = Math.floor(H*wh);
      }
      cx=Math.floor((can.width-W)/2); //alert(cx);
      cy=Math.floor((can.height-H)/2);
      cw=can.width; ch=can.height;
      G.needResize = false;
    }
  }
  ,PlaySound(s){
    if(G.sound){
      stopSound(s);
      playSound(s);
    }
  }
  ,Submit_user_info(){
    var name=_input_name.value.trim(), email=_input_email.value.trim();
    if(!ValidateName(name)){_errorMsg.innerHTML='Please enter the correct name.'; return;}
    if(!ValidateEmail(email)){_errorMsg.innerHTML='Please enter the correct email.'; return;}
    user.name=name;
    user.email=email;
    myNav.style.display='none';
  }
};
const S = {
  lvl:[], w:0, h:0, start_y:0
  ,reset(){
    S.lvl=[]; S.w=S.h=0;
    S.h=20;
  }
  ,add_random_level(){
    S.add_level(Levels[1+irandom(Levels.length-2)]);
  }
  ,add_level(lv){
    var yy=0;
    if(S.lvl.length>0){
      var l=S.lvl[S.lvl.length-1].lvl;
      yy=S.start_y-lv.d.start_y;
      //alert(yy)
    }
    G.create_tile(lv,TileSet);
    S.w+=lv.w;

    S.lvl.push({lvl:lv, w:lv.w, y:(lv.d.start_y-lv.d.end_y), yy:yy, dw:lv.w*64, dh:lv.h*64});
    //S.lvl.push({lvl:lv, w:lv.w, y:(lv.d.start_y-lv.d.end_y)+yy, dw:lv.w*64, dh:lv.h*64});

    S.start_y=S.lvl[0].lvl.d.start_y;
    ///////
    var lo=lv.obj, ts=TileSet, o, i, len, {x,y}=S.get_position(S.lvl.length-1);
    //alert(y)
    for(i=0, len=lo.length; i<len; i++){
      o=lo[i];
      switch (o.name){
        case 'coin1': coins.push(new Coin_class(o.x*ts.w+x, o.y*ts.h+y)); break;
        case 'life': if(life_chance>irandom(100)){
          if(irandom(1)==1) coins.push(new Life_class(o.x*ts.w+x, o.y*ts.h+y));
          else coins.push(new Boost_class(o.x*ts.w+x, o.y*ts.h+y));
          life_chance=0;
        } break;
        case 'enemy1': if(enemy_chance>irandom(100)){enemy.push(new Enemy1_class(o.x*ts.w+x, o.y*ts.h+y)); if(enemy_chance>=50) enemy_chance-=50; else enemy_chance=0;} break;
        case 'enemy2': if(enemy_chance>irandom(100)){enemy.push(new Enemy2_class(o.x*ts.w+x, o.y*ts.h+y)); if(enemy_chance>=50) enemy_chance-=50; else enemy_chance=0;} break;
      }
    }
    life_chance+=15;
    enemy_chance+=33;
  }
  ,remove_first_level(){
    var w=S.lvl[0].w, vw=w*TileSet.w;
    var vh=(S.lvl[1].lvl.d.start_y-S.lvl[0].lvl.d.end_y)*TileSet.w;
    S.lvl.shift();
    view.x-=vw; view.x1-=vw;
    view.y+=vh;
    hero.x-=vw;
    hero.y+=vh;
    for (var itm of coins) {itm.x-=vw;itm.y+=vh;}
    for (var itm of enemy) {itm.x-=vw;itm.y+=vh;}
    for (var itm of damages) {itm.x-=vw;itm.y+=vh;}
    S.w-=w;
    //for(var y = 0; y < S.h; y++) {S.c[y].splice(0,w);}
    S.start_y=S.lvl[0].lvl.d.start_y;
  }
  ,get(x,y){
    var ls=S.lvl, len=ls.length, l, w=0, sy=S.start_y;
    for(var i = 0; i < len; i++){
      if(x>=ls[i].w){
        x-=ls[i].w;
        y+=ls[i].y;
      }
      else break;
    }
    if(i==len) return 1;
    l=ls[i].lvl;
    y+=(l.d.start_y-sy);
    if(x<0||x>=l.w||y<0||y>=l.h) return undefined;
    return l.col[y][x];
  }
  ,check_all_levels(){
    var ls=Levels,j,i,x,y,len,len2;
    for(i=0, len=ls.length; i<len; i++){

      var d = {start_y:5, end_y:5, col_y:0, coins:[], enemy:[]}, l=ls[i], o=l.obj, c=l.col;
      for(j=0, len2=o.length; j<len2; j++){
        switch (o[j].name) {
          case 'start_point': if(o[j].x==0) d.start_y=o[j].y; else d.end_y=o[j].y; break;
          case 'coin1': d.coins.push(o); break;
          case 'enemy1': d.enemy.push(o); break;
        }
      }
      var cnt0=0;
      for(y=0; y<l.h; y++){
        for(x=0,cnt0=0; x<l.w; x++){if(c[y][x]==0) cnt0++;}
        if(cnt0==l.w) d.col_y=y;
        else break;
      }
      l.d=d;
    }
  }
  ,get_position(lv_i){
    var hsy=S.start_y, w=0, h=0, h2=0, l=S.lvl;
    for(var i = 0; i < lv_i; i++) {
      h-=(l[i].y)*64;
      w+=l[i].lvl.w*64;
    }
    h2=(hsy-l[lv_i].lvl.d.start_y)*64;
    h+=h2;
    return {x:w, y:h};
  }
};

class Hero_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.state='jump'
    h.s=Sprite.new_player(player_sprite,h.state)
    h.mask = {w:32,h:64};
    h.sx=0;
    h.sy=0;
    h.extra_jump=true;
    h.fall_speed=2;
    h.max_fall_speed=20;
    h.jump_speed=-34;
    h.extra_jump_speed=-30;
    h.life=3;
    h.hurt_mode=false;
    h.boost=[0,0];
  }
  update(){
    if(sys.IsMobile) TouchEvent.Draw();
    var h = this;
    switch (h.state) {
      case 'idle': h.state_idle(); break;
      case 'walk': h.state_walk(); break;
      case 'jump': h.state_jump(); break;
    }
    var sw=S.w*TileSet.w, x=h.x, y=h.y, mw=h.mask.w, mh=h.mask.h;
    for(var i = 0, c=coins, len=c.length; i < len; i++){
      if(ImageMeetImage(x,y,mw,mh,c[i].x,c[i].y+10,64,64)){
        c[i].collected();
      }
    }
    if(!h.hurt_mode){
      for (var e of enemy) {
        if(e.state!='dead' && ImageMeetImage(x,y,mw,mh, e.x,e.y,64,64)){ h.hurt(); break;}
      }
    }
    else if(--h.hurt_t<=0) h.hurt_mode=false;
    if(h.boost[0]>0){
      for (var c of coins) {
        var dis=point_distance(c.x,c.y,x,y), dir=point_direction(c.x,c.y,x,y);
        if(dis<=300){
          c.x += 10 * Math.cos(Math.PI/180 * dir);
          c.y += 10 * Math.sin(Math.PI/180 * dir);
        }

      }

      h.boost[0]-=.25;
    }
    if(h.boost[1]>0){ds_x=2;h.boost[1]-=.25;}
    else ds_x=1;
  }
  state_idle(){
    var h = this;
    Sprite.change_state(h.s,'idle');
    Sprite.animation(h.s,0.3);

    if(!h.test_col(1,0)){h.state='walk'; h.state_walk(); return;}
    if(!h.test_col(0,2)){ h.start_fall(); return;}
    if(Key.Down('X') || Key.Down('Up')){ h.start_jump(); return;}
  }
  state_walk(){
    var h = this;
    Sprite.change_state(h.s,'run');
    h.sx=run_speed;
    if(Key.Press('Right')){ if(h.x-view.x<600) h.sx+=run_speed/2;}
    else if(Key.Press('Left')){ if(h.x-view.x>50) h.sx-=run_speed/2;}
    else if(Math.abs((h.x-view.x)-350)>50){
      if((h.x-view.x)<350) h.sx+=run_speed/4;
      else h.sx-=run_speed/4;
    }

    //h.s.look_right=h.sx>=0;
    if(!h.test_col(h.sx,0)) h.x+=h.sx;
    else{
      var tsp = h.test_stairs_up(h.sx,0);
      if(tsp && tsp.n<=Math.abs(h.sx)+1){
        h.y-=tsp.n; h.x+=h.sx;
      }
      else h.sx/=2;
    }

    Sprite.animation(h.s,Math.abs(h.sx*0.03));
    var tsp = h.test_stairs_up(0,20);
    if(tsp){ h.y-=tsp.n-20; }
    else {
      h.start_fall();
      return;
    }
    if(Key.Down('X') || Key.Down('Up')){ h.start_jump(); return;}
  }
  state_jump(){
    var h = this, by=h.y;
    h.sx=run_speed;
    if(Key.Press('Right')){ if(h.x-view.x<600) h.sx+=run_speed/2;}
    else if(Key.Press('Left')){ if(h.x-view.x>50) h.sx-=run_speed/2;}
    else if(Math.abs((h.x-view.x)-350)>50){
      if((h.x-view.x)<350) h.sx+=run_speed/4;
      else h.sx-=run_speed/4;
    }
    if(h.sx!=0)h.s.look_right=h.sx>=0;
    if(!h.test_col(h.sx,0)) h.x+=h.sx;
    else h.sx/=2;
    //
    if((Key.Up('X')||Key.Up('Up')) && h.sy<0) h.sy=0;
    if(h.extra_jump){
      if(Key.Down('X') || Key.Down('Up')){h.sy=h.extra_jump_speed; h.extra_jump=false; Sprite.change_index(h.s,0); G.PlaySound(sound.jump2);}
      else if(Key.Down('Down')){h.sy=h.max_fall_speed; h.extra_jump=false;}
    }
    h.sy+=h.fall_speed; if(h.sy>h.max_fall_speed) h.sy=h.max_fall_speed;
    if(h.test_col(0,h.sy)){
      if(h.sy<0) h.sy=0;
      else {
        h.y=Math.floor(h.y);
        for(var i = 0; i < h.max_fall_speed; i++){
          if(h.test_col(0,2)) break;
          h.y+=1;
        }
        h.y=Math.floor(h.y); h.state=h.sx==0?'idle':'walk'; return;
      }
    }
    else h.y+=h.sy;

    if(h.sy<0){
      if(h.s.i<4)Sprite.animation(h.s,0.6);
      else Sprite.change_index(h.s,4);
    }
    else {
      if(h.s.i<h.s.len-1)Sprite.animation(h.s,0.3);
      var x=h.x, y=h.y, w=h.mask.w, h=h.mask.h;
      for (var e of enemy) {
        if(e.state!='dead' && ImageMeetImage(x,y,w,h, e.x,e.y,64,64) && e.y-by>=h-20){ e.hurt(); hero.sy=hero.extra_jump_speed;}
      }
    }
  }
  start_fall(){
    var h = this;
    h.state='jump';
    h.extra_jump=true;
    h.sy=5;
    Sprite.change_state(h.s,'jump'); Sprite.change_index(h.s,3);
  }
  start_jump(){
    var h = this;
    h.state='jump';
    h.extra_jump=true;
    h.sy=h.jump_speed;
    Sprite.change_state(h.s,'jump'); Sprite.change_index(h.s,0);
    G.PlaySound(sound.jump);

  }
  hurt(){
    var h = this;
    if(--h.life<=0) G.set_end_game();
    else {
      h.hurt_mode=true;
      h.hurt_t=50;
    }
    G.PlaySound(sound.hurt);
  }
  active_boost(bs){
    var h = this;
    switch (bs) {
      case 'boost1': h.boost[0]=100; break;
      case 'boost2': h.boost[1]=100; break;
    }
  }
  draw(){
    var h = this, s=h.s, m=Sprite.get_img(s), {x,y}=view, mask=h.mask, ox=60, oy=118-mask.h, bx=200;
    if(h.hurt_mode){
      if(h.hurt_t>20)ctx.globalAlpha=0.5;
      else ctx.globalAlpha=h.hurt_t%2==1?1:0.5;
    }

    //if(!s.look_right) ox=s.c_w-mask.w-ox;
    //alert(h.y+y)
    ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy));
    ctx.globalAlpha=0.3;
    //ctx.fillRect(h.x-x,h.y-y,mask.w,mask.h);
    ctx.globalAlpha=1;
    if(h.boost[0]>0){ h.draw_boost(bx,h.boost[0],img.boost1); bx+=200;}
    if(h.boost[1]>0){ h.draw_boost(bx,h.boost[1],img.boost2); bx+=200;}
  }
  draw_dead(){
    var h = this, s=h.s, m=Sprite.get_img(s), {x,y}=view, mask=h.mask, ox=60, oy=118-mask.h;
    ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy));
    if(h.s.i<h.s.len-1)Sprite.animation(h.s,0.3);
    if(h.y<2000){
      h.sy+=h.fall_speed; if(h.sy>h.max_fall_speed) h.sy=h.max_fall_speed;
      if(h.test_col(0,h.sy)){
        if(h.sy<0) h.sy=0;
        else {
          h.y=Math.floor(h.y);
          for(var i = 0; i < h.max_fall_speed; i++){
            if(h.test_col(0,2)) break;
            h.y+=1;
          }
          h.y=Math.floor(h.y);
        }
      }
      else h.y+=h.sy;
    }
  }
  draw_boost(x,time,m){
    ctx.drawImage(m,x,5,30,30);
    ctx.fillStyle='black'; ctx.fillRect(x+30,10,150,20)
    ctx.fillStyle='green'; ctx.fillRect(x+30,10,150*(time/100),20)
  }
  check_col(){
    var h = this;
    return Room.col(h.x, h.y, h.mask.w, h.mask.h);
  }
  test_col(x,y){
    var h = this;
    return Room.col(h.x+x, h.y+y, h.mask.w, h.mask.h);
  }
  test_stairs_up(x,y){
    var h = this;
    return Room.stairs_up(h.x+x, h.y+y, h.mask.w, h.mask.h);
  }
};

class Enemy1_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.state='walk';
    h.m=img['enemy'+(irandom(4)+1)];
    h.ox=Math.floor((h.m[0].width-64)/2);
    h.w=h.m[0].width;
    h.oy=(h.m[0].height-64)-6;
    h.i=irandom(19);
    h.mask = {w:64,h:64};
    h.isRight=choose([true,false]);
    h.dead=false;
  }
  update(){
    var h = this;
    switch (h.state) {
      case 'walk': h.state_walk(); break;
      case 'dead': h.state_dead(); break;
    }
  }
  state_walk(){
    var h = this, sx=h.isRight?5:-5;
    if(h.test_col(sx,0) || !h.test_col(sx*3,1)){ h.isRight=!h.isRight; sx=-sx; }
    else h.x+=sx;
    //if(h.test_col(sx,1)) h.x+=sx;
  }
  state_dead(){
    var h = this;
    if(--h.t<=0) h.dead=true;
  }
  hurt(){
    var h = this;
    h.state='dead';
    h.t=20;
    score+=30*ds_x;
    G.add_pop_up_text(h.x+32,h.y,30*ds_x,'orange');
    G.PlaySound(sound.pop);
  }
  draw(){
    var h = this, m=h.m[h.i], {x,y}=view, mask=h.mask, ox=h.ox, oy=h.oy;
    if(!h.isRight){
      ctx_e.clearRect(0,0,-120,120);
      ctx_e.drawImage(m, -h.w, 0);
      m=can_e;
    }
    switch (h.state) {
      case 'walk': ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy)); h.i=(h.i+1)%20; break;
      case 'dead':
      ctx.globalAlpha=h.t/20;
      ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy));
      ctx.globalAlpha=1;
      break;
    }
    //ctx.globalAlpha=0.3; ctx.fillStyle='red';
    //ctx.fillRect(h.x-x,h.y-y,mask.w,mask.h);
    //ctx.globalAlpha=1;
  }
  test_col(x,y){
    var h = this;
    return Room.col(h.x+x, h.y+y, h.mask.w, h.mask.h);
  }
};

class Enemy2_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.state='walk';
    h.m=img['enemy_fly'];
    h.ox=Math.floor((h.m[0].width-64)/2);
    h.w=h.m[0].width;
    h.oy=(h.m[0].height-64)-6;
    h.i=irandom(19);
    h.mask = {w:64,h:64};
    h.isRight=choose([true,false]);
    h.dead=false;
  }
  update(){
    var h = this;
    switch (h.state) {
      case 'walk': h.state_walk(); break;
      case 'dead': h.state_dead(); break;
    }
  }
  state_walk(){
    var h = this, sx=h.isRight?5:-5;
    if(h.test_col(sx,0)){ h.isRight=!h.isRight; sx=-sx; }
    h.x+=sx;
  }
  state_dead(){
    var h = this;
    if(--h.t<=0) h.dead=true;
  }
  hurt(){
    var h = this;
    h.state='dead';
    h.t=20;
    score+=30*ds_x;
    G.add_pop_up_text(h.x+32,h.y,30*ds_x,'orange');
    G.PlaySound(sound.pop);
  }
  draw(){
    var h = this, m=h.m[h.i], {x,y}=view, mask=h.mask, ox=h.ox, oy=h.oy;
    if(!h.isRight){
      ctx_e.clearRect(0,0,-120,120);
      ctx_e.drawImage(m, -h.w, 0);
      m=can_e;
    }
    switch (h.state) {
      case 'walk': ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy)); h.i=(h.i+1)%20; break;
      case 'dead':
      ctx.globalAlpha=h.t/20;
      ctx.drawImage(m, Math.round(h.x-x-ox), Math.round(h.y-y-oy));
      ctx.globalAlpha=1;
      break;
    }
    //ctx.globalAlpha=0.3; ctx.fillStyle='red';
    //ctx.fillRect(h.x-x,h.y-y,mask.w,mask.h);
    //ctx.globalAlpha=1;
  }
  test_col(x,y){
    var h = this;
    return Room.col(h.x+x, h.y+y, h.mask.w, h.mask.h);
  }
};

class Coin_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.y2=irandom(20-1);
    h.dead=false;
    h.i=irandom(3);
    h.len=1;

    h.m=choose(['coin1','diamond']);
    switch (h.m) {
      case 'coin1':h.len=4; h.points=5; break;
      case 'diamond': h.m=choose(['diamond1','diamond2','diamond3']); h.len=1; h.points=10; break;
    }
  }
  update(){}
  collected(){
    var h = this;
    score+=h.points*ds_x;
    h.dead=true;
    G.add_pop_up_text(h.x+32,h.y,h.points*ds_x,'orange');
    G.PlaySound(sound.coin1[coin_i]); coin_i=(coin_i+1)%3;
    //effects.push(new Collected_class(h.x,h.y));
  }
  draw(){
    var h=this, m=img[h.m], i=Math.floor(h.i), {x,y}=view, y2=5-(h.y2>10?20-h.y2:h.y2)/2;
    if(h.len==1) ctx.drawImage(m,h.x-x,h.y-y+y2);
    else {
      ctx.drawImage(m[i],h.x-x,h.y-y+y2);
      h.i=(h.i+0.2)%h.len;
    }
    h.y2=(h.y2+1)%20;
  }
};
class Life_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.y2=irandom(20-1);
    h.dead=false;
    h.m='life';
  }
  update(){}
  collected(){
    var h = this;
    if(hero.life<5){
      hero.life++;
      G.add_pop_up_text(h.x+32,h.y,'+1 Life','#e31b23');
      G.PlaySound(sound.life);
    }
    else {
      score+=100*ds_x;
      G.add_pop_up_text(h.x+32,h.y,100*ds_x,'orange');
      G.PlaySound(sound.life);
    }
    h.dead=true;
    //effects.push(new Collected_class(h.x,h.y));
  }
  draw(){
    var h=this, m=img[h.m], i=Math.floor(h.i), {x,y}=view, y2=5-(h.y2>10?20-h.y2:h.y2)/2;
    ctx.drawImage(m,h.x-x,h.y-y+y2);
    h.y2=(h.y2+1)%20;
  }
};
class Boost_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.y2=irandom(20-1);
    h.dead=false;
    var i =irandom(1), bs=['boost1','boost2'], ww=['Magnet','Double Score'];
    h.word=ww[i];
    h.m=bs[i];
  }
  update(){}
  collected(){
    var h = this;
    hero.active_boost(h.m);
    G.add_pop_up_text(h.x+32,h.y,h.word,'#e31b23');
    G.PlaySound(sound.life);
    h.dead=true;
    //effects.push(new Collected_class(h.x,h.y));
  }
  draw(){
    var h=this, m=img[h.m], i=Math.floor(h.i), {x,y}=view, y2=5-(h.y2>10?20-h.y2:h.y2)/2;
    ctx.drawImage(m,h.x-x,h.y-y+y2);
    h.y2=(h.y2+1)%20;
  }
};

class Collected_class {
  constructor(x,y) {
    var h = this;
    h.x=x;
    h.y=y;
    h.dead=false;
    h.i=0;
  }
  draw(){
    var h=this, m=img.collected, i=Math.floor(h.i);
    ctx.drawImage(m[i],h.x,h.y);
    h.i+=1;
    if(h.i>=6) h.dead=true;
  }
};


const Room = {
  col(x,y,w,h){
    var ts=TileSet, ww = ts.w, hh = ts.h, c, i, j;
    var x1 = Math.floor(x / ww), x2 = Math.ceil((x + w) / ww) - 1;
    var y1 = Math.floor(y / hh), y2 = Math.ceil((y + h) / hh) - 1;
    for (i = y1; i <= y2; i++) {
      for (j = x1; j <= x2; j++) {
        c=S.get(j,i);
        if(!c) continue;
        if(c==1) return true;
        var o1={x:x,y:y,w:w,h:h}, o2={x:j*ww,y:i*hh,w:ww,h:hh};
        return Room['col_n'+c](o1,o2);
      }
    }
    return false;
  }
  ,multi_col(x,y,w,h){
    var r={col:false,a:[],len:0};
    var ts=TileSet, ww = ts.w, hh = ts.h, c, i, j;
    var x1 = Math.floor(x / ww), x2 = Math.ceil((x + w) / ww) - 1;
    var y1 = Math.floor(y / hh), y2 = Math.ceil((y + h) / hh) - 1;
    for (i = y1; i <= y2; i++) {
      for (j = x1; j <= x2; j++) {
        c=S.get(j,i);
        if(!c) continue;
        if(c==1 || Room['col_n'+c]({x:x,y:y,w:w,h:h},{x:j*ww,y:i*hh,w:ww,h:hh})){
          r.col=true;r.len++;r.a.push(c);
        }
      }
    }
    return r.col?r:false;
  }
  ,stairs_up(x,y,w,h){
    var r={col:false,n:0}, n;
    var ts=TileSet, ww = ts.w, hh = ts.h, c, i, j;
    var x1 = Math.floor(x / ww), x2 = Math.ceil((x + w) / ww) - 1;
    var y1 = Math.floor(y / hh), y2 = Math.ceil((y + h) / hh) - 1;
    for (i = y1; i <= y2; i++) {
      for (j = x1; j <= x2; j++) {
        c=S.get(j,i);
        if(!c) continue;
        if(c==1) n=(y+h)-i*hh;
        else{
          var o1={x:x,y:y,w:w,h:h}, o2={x:j*ww,y:i*hh,w:ww,h:hh};
          n = Room['col_n'+c](o1,o2);
          if(n) switch (c) {
            case 2: if(o1.x<o2.x) n-=o2.x-o1.x; break;
            case 3: if(o1.x+o1.w>o2.x+o2.w) n+=(o2.x+o2.w)-(o1.x+o1.w); break;
            case 4: case 5: n=(y+h)-i*hh; break;
          }
        }
        if(n>r.n){ r.col=true; r.n=n;}
      }
    }
    return r.col?r:false;
  }
  ,col_n2(o1,o2){
    var x= o2.x-o1.x;
    var y= -(o2.y-(o1.y+o1.h));
    return x+y>0?x+y+1:0;
  }
  ,col_n3(o1,o2){
    var x= -((o2.x+o2.w)-(o1.x+o1.w));
    var y= -(o2.y-(o1.y+o1.h));
    return x+y>0?x+y+1:0;
  }
  ,col_n4(o1,o2){
    var x= o2.x-o1.x;
    var y= ((o2.y+o2.h)-(o1.y));
    return x+y>0?x+y+1:0;
  }
  ,col_n5(o1,o2){
    var x= -((o2.x+o2.w)-(o1.x+o1.w));
    var y= ((o2.y+o2.h)-(o1.y));
    return x+y>0?x+y+1:0;
  }
};

var Sound_arr=[], coin_i=0;
var sound ={
  hurt:loadSound(PATH+"sounds/hurt.mp3"),
  life:loadSound(PATH+"sounds/life.wav"),
  pop:loadSound(PATH+"sounds/pop.wav"),
  jump:loadSound(PATH+"sounds/jump.wav"),
  jump2:loadSound(PATH+"sounds/jump2.wav"),
  coin1:[loadSound(PATH+"sounds/coin1.wav"), loadSound(PATH+"sounds/coin1.wav"), loadSound(PATH+"sounds/coin1.wav")],
  music1:loadSound(PATH+"sounds/msc1.mp3"),
};
var Img_arr=[];
var img = {
  tileset_1:newImage('tileset_1.png'),

  btn_play:newImage('btn_play.png'),
  btn_replay:newImage('btn_replay.png'),
  game_over:newImage('game_over.png'),
  scoreboard:newImage('scoreboard.png'),
  btn_fs:newImage('btn_fs.png'),
  btn_sound_on:newImage('btn_sound_on.png'),
  btn_sound_off:newImage('btn_sound_off.png'),
  logo:newImage('logo.png'),
  btn_left:newImage('btn_left.png'),
  btn_right:newImage('btn_right.png'),
  btn_z:newImage('btn_z.png'),
  btn_x:newImage('btn_x.png'),
  bg:newImage('bg.png'),
  life:newImage('Life.png'), boost1:newImage('boost1.png'), boost2:newImage('boost2.png'),
  diamond1:newImage('coin/diamond1.png'),diamond2:newImage('coin/diamond2.png'),diamond3:newImage('coin/diamond3.png'),
  coin1:newImage_array('coin/coin1_',4),
  enemy1:newImage_array('enemey1/',20),
  enemy2:newImage_array('enemey2/',20),
  enemy3:newImage_array('enemey3/',20),
  enemy4:newImage_array('enemey4/',20),
  enemy5:newImage_array('enemey5/',20),
  enemy_fly:newImage_array('enemey_fly/',20),
};

const Sprite = {
  loadPlayer(){
    var o={}, p, n, i, len;
    n='idle'; p='player/'+n+'/'; len=12; o[n]=[];
    for(i = 0; i <= len; i++) o[n].push(newImage(p+i+'.png'));
    n='jump'; p='player/'+n+'/'; len=12; o[n]=[];
    for(i = 0; i <= len; i++) o[n].push(newImage(p+i+'.png'));
    n='run'; p='player/'+n+'/'; len=12; o[n]=[];
    for(i = 0; i <= len; i++) o[n].push(newImage(p+i+'.png'));
    n='fall'; p='player/'+n+'/'; len=12; o[n]=[];
    for(i = 0; i <= len; i++) o[n].push(newImage(p+i+'.png'));
    return o;
  }
  ,new_player(s,state){
    var cn1 = document.createElement("canvas"), cx1 = cn1.getContext("2d"), m=s[state];
    cn1.width = m[0].width; cn1.height = m[0].height;
    cx1.scale(-1, 1);
    return {
      i:0,
      i2:0,
      s:s,
      state:state,
      m:m,
      len:m.length,
      look_right:true,
      cn:cn1,
      cx:cx1,
      c_w:cn1.width,
      c_h:cn1.height,
    }
  }
  ,change_state(s,state){
    if(s.state!=state){
      s.state=state;
      var m=s.s[state];
      s.i=s.i2=0;
      s.m=m;
      s.len=m.length;
    }
  }
  ,change_index(s,i){s.i=s.i2=i%s.len;}
  ,get_img(s){
    if(s.look_right){
      return s.m[s.i];
    }
    else {
      var w=s.c_w, h=s.c_h;
      s.cx.clearRect(0, 0, -w, h);
      s.cx.drawImage(s.m[s.i], -w, 0);
      //s.cx.drawImage(s.m[s.i], 0, 0);
      return s.cn;
    }
  }
  ,animation(s,sp){
    s.i2=(s.i2+sp)%s.len;
    s.i=Math.floor(s.i2);
  }
};

var player_sprite = Sprite.loadPlayer();

var Key_a={Left:-1, Right:-1, Up:-1, Down:-1, X:-1, a:['Left','Right','Up','Down','X']};
var Key = {
  arr:{Left:-1, Right:-1, Up:-1, Down:-1, X:-1, a:['Left','Right','Up','Down','X']}
  ,CheckKeys(){
    var a = Key_a.a;
    for(var i=0; i < 5; i++){
      if(Keyboard[a[i]].Press()) Key.InDown(a[i]);
      if(Keyboard[a[i]].Up()) Key.InUp(a[i]);
    }
  }
  ,Update(){
    var a = Key_a.a;
    for(var i=0; i < 5; i++){
      Key_a[a[i]] = Key_a[a[i]] >= 1 ? 2 : -1;
    }
  }
  ,InDown(k){
    if(Key_a[k] < 2) Key_a[k]=1;
  }
  ,InUp(k){
    Key_a[k]=0;
  }
  ,Down(k){ return Key_a[k]==1;}
  ,Up(k){ return Key_a[k]==0;}
  ,Press(k){ return Key_a[k]>=1;}
};
function DrawTouch(x,y,m,t){
  ctx.drawImage(m,x,y);
  //Draw.Image(Img_Btn,i,x,y);
  return (Mouse.Square(x,y,90,90) && Mouse[t]('Left')) || TouchEvent.SquareClick(x,y,90,90,t);
}

function timer_loop(){
  var a = setInterval(function () {
    clearInterval(a);
    if(G.isReady) G.loop();
    else G.check_if_all_loaded();
    /* Mouse */Mouse.Update();
    /* Keyboard */Keyboard.funcKeyPress();
    /* Touch */TouchEvent.EndUpdate();
    timer_loop();
  }, 30);
}
timer_loop();
