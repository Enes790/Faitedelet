// render.js — Tüm çizim fonksiyonları

// ==================== YARDIMCI ====================
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}

// ==================== MOB ÇİZİM ====================
function drawZombie(m,now,hf,t){
 const walk=Math.sin(t)*.12*S,armSwing=Math.sin(t*1.3)*.15*S;
 g.fillStyle='#2a2a4a';
 g.fillRect(-.22*S+walk,1.15*S,.18*S,.6*S);g.fillRect(.02*S-walk,1.15*S,.18*S,.6*S);
 g.fillStyle='#1a1a3a';
 g.fillRect(-.22*S+walk,1.65*S,.2*S,.1*S);g.fillRect(.02*S-walk,1.65*S,.2*S,.1*S);
 g.fillStyle=hf?'#ff6666':'#5a2a2a';g.fillRect(-.26*S,.6*S,.52*S,.6*S);
 g.fillStyle=hf?'#ff8888':'#3a1a1a';
 g.fillRect(-.26*S,.9*S,.15*S,.15*S);g.fillRect(.05*S,1.05*S,.1*S,.1*S);
 g.fillStyle=hf?'#ff9999':'#5a8a4a';
 g.fillRect(.15*S,.7*S+armSwing,.5*S,.14*S);g.fillRect(-.35*S,.7*S-armSwing,.18*S,.14*S);
 g.fillStyle='#4a7a3a';g.fillRect(.6*S,.7*S+armSwing,.08*S,.14*S);
 g.fillStyle=hf?'#ff8888':'#4a7a3a';g.fillRect(-.28*S,0,.56*S,.6*S);
 g.fillStyle='rgba(0,0,0,.2)';g.fillRect(-.28*S,0,.56*S,.1*S);
 g.fillStyle='#2a1a10';
 g.fillRect(-.28*S,-.05*S,.56*S,.12*S);g.fillRect(-.28*S,0,.1*S,.2*S);g.fillRect(.15*S,0,.13*S,.15*S);
 const eyeGlow=Math.sin(now/300+m.id)*0.3+0.7;
 g.fillStyle='rgba(200,20,20,'+eyeGlow+')';
 g.fillRect(.06*S,.2*S,.14*S,.12*S);g.fillRect(-.2*S,.2*S,.14*S,.12*S);
 g.fillStyle='#ff3333';g.fillRect(.08*S,.22*S,.06*S,.05*S);g.fillRect(-.18*S,.22*S,.06*S,.05*S);
 g.fillStyle='#fff';g.fillRect(.10*S,.23*S,.02*S,.02*S);g.fillRect(-.16*S,.23*S,.02*S,.02*S);
 g.fillStyle='#0a0a0a';g.fillRect(-.12*S,.42*S,.24*S,.08*S);
 g.fillStyle='#e0e0d0';
 g.fillRect(-.1*S,.42*S,.03*S,.05*S);g.fillRect(-.05*S,.42*S,.03*S,.05*S);
 g.fillRect(.02*S,.42*S,.03*S,.05*S);g.fillRect(.07*S,.42*S,.03*S,.05*S);
}
function drawSkeleton(m,now,hf,t){
 const walk=Math.sin(t)*.1*S,bone=hf?'#ffb0b0':'#e6e2d0',shade=hf?'#d08080':'#b8b4a0';
 g.fillStyle=bone;
 g.fillRect(-.2*S+walk,1.2*S,.11*S,.55*S);g.fillRect(.06*S-walk,1.2*S,.11*S,.55*S);
 g.fillStyle=shade;
 g.fillRect(-.23*S+walk,1.72*S,.17*S,.08*S);g.fillRect(.03*S-walk,1.72*S,.17*S,.08*S);
 g.fillStyle=bone;g.fillRect(-.2*S,1.12*S,.4*S,.1*S);
 g.fillStyle='#262626';g.fillRect(-.2*S,.6*S,.4*S,.54*S);
 g.fillStyle=bone;g.fillRect(-.02*S,.6*S,.05*S,.54*S);
 for(let i=0;i<4;i++)g.fillRect(-.2*S,(.66+i*.12)*S,.4*S,.05*S);
 g.fillRect(-.3*S,.64*S+walk*.3,.1*S,.5*S);
 g.fillRect(.1*S,.66*S,.5*S,.09*S);
 const bcx=.42*S,bcy=.7*S,br=.38*S,a1=-1.1,a2=1.1;
 g.strokeStyle='#7a5230';g.lineWidth=Math.max(2,S/16);g.lineCap='round';
 g.beginPath();g.arc(bcx,bcy,br,a1,a2);g.stroke();
 const e1x=bcx+Math.cos(a1)*br,e1y=bcy+Math.sin(a1)*br,e2x=bcx+Math.cos(a2)*br,e2y=bcy+Math.sin(a2)*br;
 const pull=m.aimT>0?Math.min(1,m.aimT/.6):0;
 const sx2=e1x-pull*.22*S;
 g.strokeStyle='rgba(240,240,230,.85)';g.lineWidth=1.5;
 g.beginPath();g.moveTo(e1x,e1y);g.lineTo(sx2,bcy);g.lineTo(e2x,e2y);g.stroke();
 if(pull>0){g.strokeStyle='#9a7a45';g.lineWidth=2;g.beginPath();g.moveTo(sx2,bcy);g.lineTo(bcx+br*.9,bcy);g.stroke();
  g.fillStyle='#ddd';g.fillRect(bcx+br*.9,bcy-2,4,4)}
 g.fillStyle=bone;g.fillRect(-.28*S,0,.56*S,.58*S);
 g.fillStyle=shade;g.fillRect(-.28*S,0,.56*S,.08*S);g.fillRect(-.28*S,.5*S,.56*S,.08*S);
 g.fillStyle='#111';
 g.fillRect(.04*S,.17*S,.16*S,.15*S);g.fillRect(-.2*S,.17*S,.16*S,.15*S);
 const glow=pull>0?'#ff4444':'#6a6a6a';
 g.fillStyle=glow;g.fillRect(.09*S,.22*S,.06*S,.06*S);g.fillRect(-.15*S,.22*S,.06*S,.06*S);
 g.fillStyle='#111';g.fillRect(-.03*S,.36*S,.06*S,.07*S);
 g.fillStyle='#222';g.fillRect(-.14*S,.46*S,.28*S,.05*S);
 g.fillStyle=bone;for(let i=0;i<4;i++)g.fillRect((-.12+i*.07)*S,.46*S,.025*S,.05*S);
}
function drawMob(m,now){
 const x=(m.x-camX)*S,y=(m.y-camY)*S,hf=m.hurt>0,t=now/150+m.id;
 g.save();g.translate(x+pw*S/2,y);g.scale(m.face,1);
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,ph*S,S*.35,S*.08,0,0,6.283);g.fill();
 if(m.type=='s')drawSkeleton(m,now,hf,t);else drawZombie(m,now,hf,t);
 g.restore();
 if(m.hp<m.maxHp*0.7){
  const bx=x,by=y-S*.28,bw=pw*S,bh=Math.max(3,S*.09),pct=m.hp/m.maxHp;
  g.fillStyle='rgba(0,0,0,.75)';g.fillRect(bx-1,by-1,bw+2,bh+2);
  g.fillStyle=pct>0.5?'#4ac04a':(pct>0.25?'#ffd23c':'#e74c3c');
  g.fillRect(bx,by,bw*pct,bh);
  g.fillStyle='rgba(255,255,255,.3)';g.fillRect(bx,by,bw*pct,bh/3);
 }
 if(m.burn>0){
  g.fillStyle='rgba(255,120,0,'+(0.3+Math.random()*0.2)+')';g.fillRect(x,y,pw*S,ph*S);
  for(let i=0;i<3;i++){
   const fx=x+Math.random()*pw*S,fy=y+Math.random()*ph*S*.5;
   g.fillStyle='#ff8c00';g.fillRect(fx,fy,S*.06,S*.1);
   g.fillStyle='#ffee44';g.fillRect(fx+1,fy+1,S*.03,S*.05);
  }
 }
}

// ==================== FX ====================
function drawFx(t,now){
 for(const m of mobs)if(!m.dead)drawMob(m,now);
 for(const a of arrows){
  const x=(a.x-camX)*S,y=(a.y-camY)*S,ang=Math.atan2(a.vy,a.vx);
  g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle='#9a7a45';g.fillRect(-S*.3,-1,S*.45,2);
  g.fillStyle='#ddd';g.beginPath();g.moveTo(S*.15,-3);g.lineTo(S*.28,0);g.lineTo(S*.15,3);g.fill();
  g.fillStyle='#eee';g.fillRect(-S*.3,-3,S*.08,2);g.fillRect(-S*.3,1,S*.08,2);
  g.restore()}
 for(const o of drops){
  const x=(o.x-camX)*S,y=(o.y-camY+Math.sin(t*5+o.x)*.05)*S,z=S*.3;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x-z/2,y+z/2,z,3);
  g.fillStyle=(IC[o.b]||BASE[o.b]);g.fillRect(x-z/2,y-z/2,z,z);
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.strokeRect(x-z/2,y-z/2,z,z);
  g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x-z/2,y-z/2,z*.3,z*.3);
 }
 for(const p of projectiles){
  const x=(p.x-camX)*S,y=(p.y-camY)*S;
  if(p.type==24){
   g.fillStyle='rgba(160,224,240,.35)';g.beginPath();g.arc(x,y,S*.22,0,6.283);g.fill();
   g.fillStyle='rgba(160,224,240,.25)';g.beginPath();g.arc(x-p.vx*S*.03,y-p.vy*S*.03,S*.14,0,6.283);g.fill();
   g.save();g.translate(x,y);g.rotate(p.spin);
   g.strokeStyle='#e0f8ff';g.lineWidth=2;
   g.beginPath();g.moveTo(0,-S*.2);g.lineTo(S*.16,0);g.lineTo(0,S*.2);g.lineTo(-S*.16,0);g.closePath();g.stroke();
   g.fillStyle='rgba(160,224,240,.7)';
   g.beginPath();g.moveTo(0,-S*.15);g.lineTo(S*.12,0);g.lineTo(0,S*.15);g.lineTo(-S*.12,0);g.closePath();g.fill();
   g.restore();
   g.fillStyle='#fff';g.beginPath();g.arc(x,y,S*.07,0,6.283);g.fill();
   g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(x,y,S*.13,0,6.283);g.fill();
  }else{
   g.fillStyle='rgba(200,200,200,.3)';g.beginPath();g.arc(x-p.vx*S*.04,y-p.vy*S*.04,S*.12,0,6.283);g.fill();
   g.fillStyle='rgba(200,200,200,.15)';g.beginPath();g.arc(x-p.vx*S*.08,y-p.vy*S*.08,S*.1,0,6.283);g.fill();
   g.fillStyle='#606060';g.beginPath();g.arc(x,y,S*.19,0,6.283);g.fill();
   g.fillStyle='#909090';g.beginPath();g.arc(x,y,S*.17,0,6.283);g.fill();
   g.fillStyle='#b0b0b0';g.beginPath();g.arc(x-S*.04,y-S*.04,S*.1,0,6.283);g.fill();
   g.save();g.translate(x,y);g.rotate(p.spin*0.5);
   g.fillStyle='#e0e0e0';g.beginPath();g.arc(-S*.06,-S*.06,S*.04,0,6.283);g.fill();
   g.restore();
   g.strokeStyle='#d0d0d0';g.lineWidth=1.5;g.beginPath();g.arc(x,y,S*.18,0,6.283);g.stroke();
  }
 }
 const s=slots[sel],a=AIM;
 let pv=null;
 if(s&&s.id==23){const f=fertTarget();if(f)pv=f}
 else if(s&&PLACE.has(s.id)&&a.place)pv=a.place;
 if(pv){
  const x=(pv[0]-camX)*S,y=(pv[1]-camY)*S;
  g.fillStyle='rgba(120,255,120,.2)';g.fillRect(x,y,S,S);
  g.strokeStyle='rgba(120,255,120,.95)';g.lineWidth=2.5;
  g.setLineDash([8,4]);g.strokeRect(x+1.5,y+1.5,S-3,S-3);g.setLineDash([]);
  g.fillStyle='rgba(120,255,120,.6)';
  g.fillRect(x,y,S*.15,2);g.fillRect(x,y,2,S*.15);
  g.fillRect(x+S-S*.15,y,S*.15,2);g.fillRect(x+S-2,y,2,S*.15);
  g.fillRect(x,y+S-2,S*.15,2);g.fillRect(x,y+S-S*.15,2,S*.15);
  g.fillRect(x+S-S*.15,y+S-2,S*.15,2);g.fillRect(x+S-2,y+S-S*.15,2,S*.15);
 }
 if(a.hit){
  const x=(a.hit[0]-camX)*S,y=(a.hit[1]-camY)*S,pulse=.6+.4*Math.sin(t*8);
  if(a.hitLayer=='bg'){g.strokeStyle='rgba(255,210,60,'+pulse+')';g.lineWidth=3;g.setLineDash([5,3]);g.strokeRect(x+1.5,y+1.5,S-3,S-3);g.setLineDash([])}
  else{g.strokeStyle='rgba(255,255,255,'+pulse+')';g.lineWidth=3;g.strokeRect(x+1.5,y+1.5,S-3,S-3)}
  g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x+S/2,y+S/2,3,0,6.283);g.fill();
  g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(x+S/2,y+S/2,6,0,6.283);g.fill();
 }
 if(Math.hypot(sx,sy)>.35||actHeld){
  const cx=(px+pw/2-camX)*S,cy=(py+ph*.5-camY)*S;
  const tx=a.hit?(a.hit[0]+.5-camX)*S:cx+aimX*S*2.2,ty=a.hit?(a.hit[1]+.5-camY)*S:cy+aimY*S*2.2;
  const grd=g.createLinearGradient(cx,cy,tx,ty);
  grd.addColorStop(0,'rgba(255,255,255,.6)');grd.addColorStop(1,'rgba(255,255,255,.1)');
  g.strokeStyle=grd;g.lineWidth=2.5;
  g.setLineDash([6,6]);g.beginPath();g.moveTo(cx,cy);g.lineTo(tx,ty);g.stroke();g.setLineDash([]);
 }
 if(mine){
  const b=mine.layer=='bg'?getBg(mine.tx,mine.ty):get(mine.tx,mine.ty);
  if(b&&mine.p>0){
   const x=(mine.tx-camX)*S,y=(mine.ty-camY)*S,p=mine.p;
   drawCrack(x,y,p,mine.tx,mine.ty);
   g.strokeStyle='rgba(255,210,60,'+(.7+.3*Math.sin(t*12))+')';g.lineWidth=3;g.strokeRect(x+1.5,y+1.5,S-3,S-3);
   g.fillStyle='rgba(0,0,0,.7)';g.fillRect(x,y-12,S,8);
   g.fillStyle='#1a1a1a';g.fillRect(x+1,y-11,S-2,6);
   g.fillStyle='#ffd23c';g.fillRect(x+1,y-11,(S-2)*p,6);
   g.fillStyle='rgba(255,255,255,.4)';g.fillRect(x+1,y-11,(S-2)*p,2);
  }
 }
 for(const q of pops){
  const k=1-q.t/.28,sz=S*(1+k*.6),x=(q.x+.5-camX)*S-sz/2,y=(q.y+.5-camY)*S-sz/2;
  g.globalAlpha=Math.max(0,1-k)*.75;
  g.fillStyle=q.c;g.fillRect(x,y,sz,sz);
  g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x+sz*.2,y+sz*.2,sz*.3,sz*.3);
  g.globalAlpha=1;
 }
 for(const q of parts){
  const z=S*(q.s||.12);
  g.fillStyle=q.c;g.fillRect((q.x-camX)*S,(q.y-camY)*S,z,z);
  g.fillStyle='rgba(255,255,255,.4)';g.fillRect((q.x-camX)*S,(q.y-camY)*S,z*.4,z*.4);
 }
}

// ==================== GÖKYÜZÜ ====================
function drawSky(){
 const day=todDay;
 const c=mix([11,16,48],[135,206,235],Math.min(1,day*1.6));
 const grd=g.createLinearGradient(0,0,0,VH);
 grd.addColorStop(0,'rgb('+c.map(v=>Math.max(0,v-20)).join(',')+')');
 grd.addColorStop(0.7,'rgb('+c.join(',')+')');
 grd.addColorStop(1,'rgb('+c.map(v=>Math.min(255,v+20)).join(',')+')');
 g.fillStyle=grd;g.fillRect(0,0,VW,VH);
 if(day<0.4){
  const starAlpha=(1-day/0.4)*0.8;
  g.fillStyle='rgba(255,255,255,'+starAlpha+')';
  for(let i=0;i<40;i++){
   const r=((i*73856093+Math.floor(seed)*19349663)>>>0);
   const qx=(r%VW),qy=((r>>8)%(VH*0.5));
   const twinkle=(Math.sin(Date.now()/400+i)*0.5+0.5)*0.5+0.5;
   g.globalAlpha=starAlpha*twinkle;g.fillRect(qx,qy,2,2);
  }
  g.globalAlpha=1;
 }
 if(day>0.4){
  const sunX=VW-70,sunY=70-camY*.08,sunAlpha=Math.min(1,(day-0.4)*2.5);
  const sunGrd=g.createRadialGradient(sunX,sunY,10,sunX,sunY,80);
  sunGrd.addColorStop(0,'rgba(255,246,180,'+(0.4*sunAlpha)+')');
  sunGrd.addColorStop(1,'rgba(255,246,180,0)');
  g.fillStyle=sunGrd;g.beginPath();g.arc(sunX,sunY,80,0,6.283);g.fill();
  g.fillStyle='rgba(255,246,180,'+sunAlpha+')';g.beginPath();g.arc(sunX,sunY,26,0,6.283);g.fill();
  g.fillStyle='rgba(255,255,220,'+sunAlpha+')';g.beginPath();g.arc(sunX,sunY,20,0,6.283);g.fill();
 }
 if(day<0.5){
  const moonX=100,moonY=80-camY*.05,moonAlpha=Math.min(1,(0.5-day)*2);
  const moonGrd=g.createRadialGradient(moonX,moonY,8,moonX,moonY,60);
  moonGrd.addColorStop(0,'rgba(220,230,255,'+(0.3*moonAlpha)+')');
  moonGrd.addColorStop(1,'rgba(220,230,255,0)');
  g.fillStyle=moonGrd;g.beginPath();g.arc(moonX,moonY,60,0,6.283);g.fill();
  g.fillStyle='rgba(220,230,240,'+moonAlpha+')';g.beginPath();g.arc(moonX,moonY,22,0,6.283);g.fill();
  g.fillStyle='rgba(180,190,200,'+moonAlpha+')';
  g.beginPath();g.arc(moonX-6,moonY-4,5,0,6.283);g.fill();
  g.beginPath();g.arc(moonX+8,moonY+6,4,0,6.283);g.fill();
  g.beginPath();g.arc(moonX-4,moonY+9,3,0,6.283);g.fill();
 }
 const mountOff=-camX*.15,mountY=VH*.55-camY*.05;
 g.fillStyle='rgba(80,100,140,'+(day*0.3+0.2)+')';
 g.beginPath();g.moveTo(0,mountY+50);
 for(let i=0;i<8;i++){const mx=(i*VW/6+mountOff)%(VW+200)-100;g.lineTo(mx,mountY-Math.abs(Math.sin(i*1.7))*60)}
 g.lineTo(VW,mountY+50);g.closePath();g.fill();
}

// ==================== ANA ÇİZİM ====================
function draw(){
 const now=Date.now(),day=todDay;
 drawSky();
 let shakeX=0,shakeY=0;
 if(shakeT>0){const mag=shakeT*30;shakeX=(Math.random()-.5)*mag;shakeY=(Math.random()-.5)*mag}
 g.save();g.translate(shakeX,shakeY);
 const x0=Math.floor(camX),y0=Math.floor(camY),x1=Math.ceil(camX+VW/S),y1=Math.ceil(camY+VH/S);

 // Arka plan (bg — ağaçlar)
for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
 if(!inBounds(x,y))continue;
 const skl=skyExposed[y*W+x];
 const lightPct=skl/15;
 const surf=hgt(x);
 const depth=Math.max(0,y-surf);
 const depthDark=Math.min(0.55,depth/130);
 const tileDark=Math.min(0.98,(1-lightPct)*0.90+depthDark);
 if(tileDark>0.02){
  const qx=Math.floor((x-camX)*S),qy=Math.floor((y-camY)*S);
  dg.fillStyle='rgba(3,5,15,'+tileDark.toFixed(3)+')';
  dg.fillRect(qx,qy,S+1,S+1);
 }
}
 // Ön plan (w — bloklar)
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const b=get(x,y);
  if(b&&inBounds(x,y))drawTile(b,Math.floor((x-camX)*S),Math.floor((y-camY)*S),x,y);
 }

 drawFx(now/1000,now);

 // Oyuncu
 const X=(px-camX)*S,Y=(py-camY)*S,hurt=hurtT>0;
 g.fillStyle='rgba(0,0,0,.3)';
 g.beginPath();g.ellipse(X+pw*S/2,Y+ph*S,S*.4,S*.1,0,0,6.283);g.fill();
 g.save();g.translate(X+pw*S/2,Y);g.scale(face,1);
 const walk=Math.sin(anim)*.12*S;
 g.fillStyle='#2b2b7c';
 g.fillRect(-.22*S+walk,1.2*S,.2*S,.6*S);g.fillRect(.02*S-walk,1.2*S,.2*S,.6*S);
 g.fillStyle='#1a1a5c';
 g.fillRect(-.22*S+walk,1.7*S,.22*S,.1*S);g.fillRect(.02*S-walk,1.7*S,.22*S,.1*S);
 g.fillStyle=hurt?'#ff6666':'#2aa0a8';g.fillRect(-.25*S,.6*S,.5*S,.62*S);
 g.fillStyle=hurt?'#cc4444':'#1a8088';g.fillRect(-.25*S,.9*S,.5*S,.32*S);
 g.fillStyle=hurt?'#ff8888':'#1a8088';g.fillRect(-.15*S,.6*S,.3*S,.08*S);
 g.save();g.translate(0,.68*S);g.rotate(armA);
 g.fillStyle='#c68e6a';g.fillRect(0,-.08*S,.55*S,.16*S);
 g.fillStyle='#a06a48';g.fillRect(0,.02*S,.55*S,.04*S);
 if(hasSword()){
  g.fillStyle='#8a6a35';g.fillRect(.2*S,-.04*S,.3*S,.08*S);
  g.fillStyle='#d0d0d0';g.fillRect(.45*S,-.06*S,.5*S,.12*S);
  g.fillStyle='#f0f0f0';g.fillRect(.45*S,-.06*S,.5*S,.04*S);
  g.fillStyle='#8a6a35';g.fillRect(.42*S,-.08*S,.06*S,.16*S);
 }else{
  const tl=pickLv();
  if(tl){
   g.fillStyle='#6b4a24';g.fillRect(.2*S,-.04*S,.4*S,.08*S);
   g.fillStyle=tl==2?'#c0c0c0':'#b8864b';g.fillRect(.5*S,-.24*S,.14*S,.48*S);
   g.fillStyle=tl==2?'#a0a0a0':'#9a6030';g.fillRect(.5*S,.16*S,.14*S,.08*S);
  }
 }
 g.restore();
 g.fillStyle=hurt?'#ff9999':'#f0c090';g.fillRect(-.3*S,0,.6*S,.6*S);
 g.fillStyle='#3a2412';
 g.fillRect(-.3*S,-.05*S,.6*S,.2*S);g.fillRect(-.3*S,0,.06*S,.3*S);g.fillRect(.24*S,0,.06*S,.15*S);
 g.fillStyle='#2a1a08';g.fillRect(-.3*S,.13*S,.6*S,.02*S);
 g.fillStyle='#fff';g.fillRect(.05*S,.25*S,.16*S,.11*S);g.fillRect(-.2*S,.25*S,.16*S,.11*S);
 g.fillStyle='#1a4a8a';g.fillRect(.1*S,.27*S,.09*S,.09*S);g.fillRect(-.15*S,.27*S,.09*S,.09*S);
 g.fillStyle='#000';g.fillRect(.13*S,.29*S,.05*S,.06*S);g.fillRect(-.12*S,.29*S,.05*S,.06*S);
 g.fillStyle='rgba(255,255,255,.8)';g.fillRect(.11*S,.27*S,.03*S,.03*S);g.fillRect(-.14*S,.27*S,.03*S,.03*S);
 g.fillStyle='#8a4a2a';g.fillRect(-.05*S,.46*S,.1*S,.03*S);
 g.restore();

 // ==================== KARANLIK (skyExposed + derinlik + meşale + oyuncu halesi) ====================
 const dark=Math.max(0,.55-day*.9);
 const vis=[];
 for(const L of lights)if(L[0]>=x0-6&&L[0]<=x1+6&&L[1]>=y0-6&&L[1]<=y1+6)vis.push(L);
 let needDark=dark>0;
 if(!needDark){
  for(let y=y0;y<=y1&&!needDark;y++)for(let x=x0;x<=x1;x++){
   if(!inBounds(x,y))continue;
   if(skyExposed[y*W+x]===0){needDark=true;break}
   const surf=hgt(x);
   if(y-surf>3){needDark=true;break}
  }
 }
 if(needDark){
  dg.clearRect(0,0,VW,VH);
  if(dark>0){dg.fillStyle='rgba(10,15,35,'+dark*.92+')';dg.fillRect(0,0,VW,VH)}
  // Her tile için karanlık (derinlik faktörlü)
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   if(!inBounds(x,y))continue;
   const surf=hgt(x);
   const depth=Math.max(0,y-surf);
   const depthDark=Math.min(0.75,depth/90);
   let tileDark;
   if(skyExposed[y*W+x]===0){
    tileDark=Math.min(0.98,0.95+depthDark*0.03);
   }else{
    tileDark=depthDark;
   }
   if(tileDark>0.02){
    const qx=Math.floor((x-camX)*S),qy=Math.floor((y-camY)*S);
    dg.fillStyle='rgba(3,5,15,'+tileDark.toFixed(3)+')';
    dg.fillRect(qx,qy,S+1,S+1);
   }
  }
  dg.globalCompositeOperation='destination-out';
  // Meşale delikleri
  for(const L of vis){
   const tx=(L[0]+.5-camX)*S,ty=(L[1]+.5-camY)*S,R=L[2]==19?S*4:S*5;
   dg.drawImage(getLightTex(R,false),tx-R,ty-R);
  }
  // Oyuncu halesi (2 blok yarıçap)
  const pcx=(px+pw/2-camX)*S,pcy=(py+ph/2-camY)*S,pR=S*2;
  dg.drawImage(getLightTex(pR,false),pcx-pR,pcy-pR);
  dg.globalCompositeOperation='source-over';
  g.drawImage(dc,0,0,VW,VH);
  // Sıcak glow
  g.globalCompositeOperation='lighter';g.globalAlpha=.25;
  for(const L of vis){
   const tx=(L[0]+.5-camX)*S,ty=(L[1]+.5-camY)*S,R=L[2]==19?S*3:S*3.5;
   g.drawImage(getLightTex(R,true),tx-R,ty-R);
  }
  // Oyuncu glow (soluk)
  g.globalAlpha=.12;
  g.drawImage(getLightTex(pR,true),pcx-pR,pcy-pR);
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
 }

 if(hurtT>0.2){g.fillStyle='rgba(255,200,200,'+(hurtT-0.2)*3*.4+')';g.fillRect(0,0,VW,VH)}
 if(regenTimer<=0&&playerHp<playerMaxHp){
  const grd=g.createRadialGradient(VW/2,VH/2,VH*0.35,VW/2,VH/2,VH*0.75);
  grd.addColorStop(0,'rgba(80,200,100,0)');grd.addColorStop(1,'rgba(80,200,100,.1)');
  g.fillStyle=grd;g.fillRect(0,0,VW,VH);
 }
 if(hurtT>0||playerHp<=6){
  const intensity=Math.max(hurtT*2,playerHp<=6?(1-playerHp/6)*0.45:0);
  const grd=g.createRadialGradient(VW/2,VH/2,VH*0.3,VW/2,VH/2,VH*0.7);
  grd.addColorStop(0,'rgba(200,0,0,0)');grd.addColorStop(1,'rgba(200,0,0,'+intensity+')');
  g.fillStyle=grd;g.fillRect(0,0,VW,VH);
 }
 g.font='bold 14px system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000';
 for(const f of fl){
  const fx=(f.x-camX)*S,fy=(f.y-camY)*S;
  g.fillStyle='rgba(255,255,255,'+Math.min(1,f.t*2)+')';g.strokeText(f.s,fx,fy);g.fillText(f.s,fx,fy);
 }
 if(mine&&mine.p>0){
  const b=mine.layer=='bg'?getBg(mine.tx,mine.ty):get(mine.tx,mine.ty);
  if(b){mh.style.display='block';mn.textContent=NAME[b]||'';mfill.style.width=(mine.p*100)+'%'}else mh.style.display='none';
 }else mh.style.display='none';
 g.restore();
}