// mobdraw.js — Mob çizim fonksiyonları (zombi, iskelet, tavuk)

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

function drawChicken(m,now,hf,t){
 g.save();g.scale(.55,.55);g.translate(0,.95*S);
 const walk=Math.sin(t*8)*.04*S,bob=Math.abs(Math.sin(t*8))*.04*S;
 const bodyC=hf?'#ffb0b0':'#d08040',wingC=hf?'#ffd0d0':'#f0e8d0';
 const legC='#e8a040',beakC='#f0c030',combC='#d03020';
 g.fillStyle=legC;g.fillRect(-.15*S+walk,1.5*S,.08*S,.35*S);g.fillRect(.07*S-walk,1.5*S,.08*S,.35*S);
 g.fillStyle=bodyC;g.fillRect(-.25*S,.7*S-bob,.5*S,.85*S);
 g.fillStyle='rgba(0,0,0,.15)';g.fillRect(-.25*S,1.35*S-bob,.5*S,.2*S);
 g.fillStyle=wingC;g.fillRect(-.3*S,.85*S-bob,.08*S,.4*S);g.fillRect(.22*S,.85*S-bob,.08*S,.4*S);
 g.fillStyle=bodyC;g.fillRect(-.32*S,.75*S-bob,.08*S,.25*S);
 g.fillStyle=bodyC;g.fillRect(-.18*S,.35*S-bob,.36*S,.4*S);
 g.fillStyle=combC;g.fillRect(-.1*S,.3*S-bob,.05*S,.1*S);g.fillRect(-.02*S,.28*S-bob,.05*S,.12*S);g.fillRect(.06*S,.3*S-bob,.05*S,.1*S);
 g.fillStyle=beakC;g.fillRect(.18*S,.55*S-bob,.12*S,.08*S);g.fillRect(.18*S,.63*S-bob,.08*S,.05*S);
 g.fillStyle='#1a1a1a';g.fillRect(.04*S,.48*S-bob,.06*S,.06*S);
 g.fillStyle='#fff';g.fillRect(.05*S,.49*S-bob,.02*S,.02*S);
 g.restore();
 if(m.panicCd>0){g.fillStyle='#ff3030';g.font='bold '+Math.floor(S*.5)+'px system-ui';g.textAlign='center';g.fillText('!',0,-.15*S);g.textAlign='left';}
}

function drawMob(m,now){
 const x=(m.x-camX)*S,y=(m.y-camY)*S,hf=m.hurt>0,t=now/150+m.id;
 // Ekran dışındaki mobları çizme (performans)
 if(x<-S*2||x>VW+S*2||y<-S*3||y>VH+S*2)return;
 g.save();g.translate(x+pw*S/2,y);g.scale(m.face,1);
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,ph*S,S*.35,S*.08,0,0,6.283);g.fill();
 if(m.type=='s')drawSkeleton(m,now,hf,t);
 else if(m.type=='c')drawChicken(m,now,hf,t);
 else drawZombie(m,now,hf,t);
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
