// mobs.js — Düşman moblar (zombi, iskelet), savaş, oklar, respawn

// ==================== YARDIMCI ====================
function burst(x,y,n,c,sp){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp*.7,l:.4+Math.random()*.4,c,s:.08+Math.random()*.1})}

// ==================== ORTAK MOB ====================
const newMob=(type,x,y)=>({id:mobIdCounter++,type,x,y,vx:0,vy:0,hp:type=='c'?4:type=='s'?8:10,maxHp:type=='c'?4:type=='s'?8:10,face:1,hurt:0,burn:0,onGround:false,atkCd:0,shootCd:1.5,aimT:0,dead:false,wanderCd:0,wanderDir:0,panicCd:0});

function moveMob(m,dt){
 m.vy=Math.min(20,m.vy+30*dt);
 const ox=m.x;m.x+=m.vx*dt;
 if(coll(m.x,m.y)){m.x=ox;if(m.onGround&&m.vx&&!coll(ox+(m.vx>0?.05:-.05),m.y-1.0))m.vy=-9;m.vx=0}
 m.x=Math.max(0,Math.min(W-pw,m.x));
 m.onGround=false;m.y+=m.vy*dt;
 if(coll(m.x,m.y)){if(m.vy>0){m.y=Math.floor(m.y+ph)-ph-.001;m.onGround=true}else m.y=Math.floor(m.y)+1.001;m.vy=0}
}

function hitMob(m,damage,knockback){
 if(m.dead)return;
 m.hp-=damage;m.hurt=0.3;shakeT=0.05;
 const nmx=m.x+((m.x+pw/2>px+pw/2)?1:-1)*knockback;
 if(!coll(nmx,m.y))m.x=nmx;
 if(m.hp<=0)killMob(m);else burst(m.x+pw/2,m.y+ph/2,4,m.type=='s'?'#e6e2d0':'#e74c3c',4);
}

function killMob(m){
 if(m.dead)return;m.dead=true;
 const cx=m.x+pw/2,cy=m.y+ph/2;
 if(m.type=='s'){drops.push({x:cx,y:cy,vy:-3,b:25,age:0});if(Math.random()<.5)drops.push({x:cx+.2,y:cy,vy:-3.5,b:25,age:0});burst(cx,cy,10,'#e6e2d0',6)}
 else{drops.push({x:cx,y:cy,vy:-3,b:22,age:0});burst(cx,cy,10,'#5a7a3a',6)}
}

// ==================== DÜŞMAN SPAWN & UPDATE ====================
function spawnMob(){
 const isNight=todDay<0.3;
 for(let tries=0;tries<20;tries++){
  const dir=Math.random()<0.5?-1:1;
  const mx=Math.floor(px+pw/2+dir*(10+Math.random()*10));
  if(mx<2||mx>W-2)continue;
  let spawnY=-1;
  if(isNight){for(let y=2;y<H-2;y++){if(solid(mx,y)&&!solid(mx,y-1)&&!solid(mx,y-2)){spawnY=y-2;break}}}
  else{const surf=hgt(mx);for(let y=surf+5;y<H-2;y++){if(!solid(mx,y)&&!solid(mx,y+1)&&solid(mx,y+2)){spawnY=y;break}}}
  if(spawnY<0)continue;
  let nearLight=false;
  for(let dy=-3;dy<=3&&!nearLight;dy++)for(let dx=-3;dx<=3;dx++){
   const bx=mx+dx,by=spawnY+dy;
   if(inBounds(bx,by)&&(w[by*W+bx]==14||w[by*W+bx]==19)){nearLight=true;break}}
if(nearLight)continue;
if(skyExposed[spawnY*W+mx]>3)continue;
const sk=mobs.filter(m=>m.type=='s'&&!m.dead).length;
  mobs.push(newMob(Math.random()<.35&&sk<3?'s':'z',mx+.15,spawnY));
  return}
}

function updateMobs(dt){
 const isDay=todDay>0.5,cx=px+pw/2,cy=py+ph/2;
 for(const m of mobs){
  if(m.dead)continue;
  m.hurt=Math.max(0,m.hurt-dt);m.atkCd=Math.max(0,m.atkCd-dt);m.shootCd=Math.max(0,m.shootCd-dt);
  const mx=m.x+pw/2,my=m.y+ph/2,dx=cx-mx,dy=cy-my,dist=Math.hypot(dx,dy);
  if(m.type=='s'){
   m.face=dx>0?1:-1;
   let sp=0;
   if(dist<22){if(dist>8)sp=m.face;else if(dist<3.5)sp=-m.face}
   const see=dist<12&&Math.abs(dy)<4.5&&los(mx,my,cx,cy);
   if(see&&m.shootCd<=0){m.aimT+=dt;sp=0;
    if(m.aimT>=.6){shootArrow(m,cx,cy);m.shootCd=1.8+Math.random();m.aimT=0}}
   else m.aimT=0;
   m.vx=sp*1.9;
  }else{
   if(dist<20&&dist>0.5){m.face=dx>0?1:-1;m.vx=m.face*2.4}else m.vx=0;
  }
  moveMob(m,dt);
  const surf=hgt(Math.max(0,Math.min(W-1,Math.floor(m.x))));
  if(isDay&&m.y<surf+3){m.burn+=dt;
   if(m.burn>=1){m.burn=0;m.hp-=1;burst(m.x+Math.random()*pw,m.y+Math.random()*ph,3,'#ff8c00',3);
    if(m.hp<=0){killMob(m);continue}}}
  else m.burn=0;
  if(m.type=='z'&&dist<1.0&&m.atkCd<=0&&damagePlayer(2,mx))m.atkCd=1.0;
  if(m.y>H+5)m.dead=true;
 }
 if(mobs.some(m=>m.dead))mobs=mobs.filter(m=>!m.dead);
}

// ==================== İSKELET OK ====================
function shootArrow(m,tx,ty){
 const x0=m.x+pw/2,y0=m.y+.5,dx=tx-x0,dy=ty-y0,d=Math.hypot(dx,dy)||1;
 arrows.push({x:x0,y:y0,vx:dx/d*14,vy:dy/d*14-1.5,age:0});
 buzz(8)}

function updateArrows(dt){
 for(let i=arrows.length-1;i>=0;i--){const a=arrows[i];
  a.age+=dt;a.vy+=9*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;
  if(a.age>4||!inBounds(a.x,a.y)){arrows.splice(i,1);continue}
  if(solid(Math.floor(a.x),Math.floor(a.y))){burst(a.x,a.y,4,'#c9b98a',3);arrows.splice(i,1);continue}
  if(a.x>px&&a.x<px+pw&&a.y>py&&a.y<py+ph&&damagePlayer(2,a.x-a.vx*.1)){arrows.splice(i,1)}
 }}

// ==================== SAVAŞ ====================
function damagePlayer(a,fromX){
 if(invT>0)return false;
 playerHp=Math.max(0,playerHp-a);invT=.5;hurtT=.3;regenTimer=3;shakeT=.15;renderHearts();
 const npx=px+(px+pw/2>fromX?.4:-.4);if(!coll(npx,py))px=Math.max(0,Math.min(W-pw,npx));
 buzz([30,20,30]);
 if(playerHp<=0)respawn();
 return true}

function mobTarget(){
 const pcx=px+pw/2,pcy=py+ph/2;let best=null,bd=1e9;
 for(const m of mobs){if(m.dead)continue;
  const dx=m.x+pw/2-pcx,dy=m.y+ph/2-pcy,d=Math.hypot(dx,dy);
  if(d>2.2||(dx*aimX+dy*aimY)/(d||1)<0.3)continue;
  if(d<bd){bd=d;best=m}}
 return best}

function strike(m){
 hitMob(m,hasSword()?2:1,hasSword()?0.5:0.2);
 attackCd=hasSword()?0.4:0.6;atkT=.25;buzz(20)}

// ==================== OYUNCU RESPAWN ====================
function respawn(){
 playerHp=playerMaxHp;hurtT=0.5;invT=1;regenTimer=0;renderHearts();
 px=W/2;py=hgt(W/2)-3;vx=0;vy=0;arrows=[];
 mobs=mobs.filter(m=>Math.hypot(m.x-px,m.y-py)>12);
 fl.push({x:px,y:py,t:1.5,s:'Respawn'});
}