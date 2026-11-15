// render.js — Su, Gökyüzü, Efektler, Işık ve Ana Çizim Döngüsü

function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}

// ==================== SU ====================
function drawWater(x,y,X,Y,now){
 const wave=Math.sin(now/500+X*0.5+Y*0.3)*0.5+0.5;
 g.fillStyle='rgba(40, 120, 200, 0.6)'; 
 g.fillRect(x,y,S+1,S+1);
 g.fillStyle='rgba(20, 80, 160, 0.4)';
 g.fillRect(x,y+S*.5,S+1,S*.5);
 g.fillStyle='rgba(150, 220, 255, 0.3)';
 g.fillRect(x+2,y+S*.1+wave*2,S*.6,2);
 g.fillRect(x+S*.4,y+S*.25+wave,S*.4,1.5);
 g.strokeStyle='rgba(255,255,255,0.1)';
 g.lineWidth=1;
 g.strokeRect(x+.5, y+.5, S-1, S-1);
}

// ==================== FX (Efektler) ====================
function drawFx(t,now){
 for(const m of mobs)if(!m.dead)drawMob(m,now); // entities.js'den gelir

 for(const a of arrows){
  const x=(a.x-camX)*S,y=(a.y-camY)*S,ang=Math.atan2(a.vy,a.vx);
  g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle='#9a7a45';g.fillRect(-S*.3,-1,S*.45,2);
  g.fillStyle='#ddd';g.beginPath();g.moveTo(S*.15,-3);g.lineTo(S*.28,0);g.lineTo(S*.15,3);g.fill();
  g.fillStyle='#eee';g.fillRect(-S*.3,-3,S*.08,2);g.fillRect(-S*.3,1,S*.08,2);
  g.restore();
 }
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
  if(a.hitLayer=='bg'){
   g.strokeStyle='rgba(255,210,60,'+pulse+')';g.lineWidth=3;g.setLineDash([5,3]);g.strokeRect(x+1.5,y+1.5,S-3,S-3);g.setLineDash([]);
  } else {
   g.strokeStyle='rgba(255,255,255,'+pulse+')';g.lineWidth=3;g.strokeRect(x+1.5,y+1.5,S-3,S-3);
  }
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

// ==================== GÖKYÜZÜ (Dağ hatası düzeltildi) ====================
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
 
 // Dağ hatası düzeltmesi (Negatif modül operatörü fix)
 const mountOff=-camX*.15, mountY=VH*.55-camY*.05;
 const step=VW/6, f=Math.floor(mountOff/step), off=mountOff-f*step;
 g.fillStyle='rgba(80,100,140,'+(day*0.3+0.2)+')';
 g.beginPath();g.moveTo(0,mountY+50);
 for(let i=-1;i<=7;i++){
  const k=i-f;
  g.lineTo(i*step+off, mountY - Math.abs(Math.sin(k*1.7))*60);
 }
 g.lineTo(VW,mountY+50);g.closePath();g.fill();
}

// ==================== DÜNYA VE SU AYRIŞTIRMA ====================
function drawWorld(x0,y0,x1,y1,now,waters){
 // Arka plan
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const b=bg[y*W+x];
  if(b){
   const qx=Math.floor((x-camX)*S),qy=Math.floor((y-camY)*S);
   drawTile(b,qx,qy,x,y);
   g.fillStyle='rgba(15,20,35,.55)';g.fillRect(qx,qy,S+1,S+1);
  }
 }
 // Ön plan (Su hariç)
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const b=w[y*W+x];
  if(!b) continue;
  if(b==43){
   waters.push(Math.floor((x-camX)*S), Math.floor((y-camY)*S), x, y);
   continue; // Suyu listeye ekle ve çizmeyi atla
  }
  drawTile(b,Math.floor((x-camX)*S),Math.floor((y-camY)*S),x,y);
 }
}

// ==================== IŞIKLANDIRMA (Lightmap Optimizasyonu) ====================
const lm=document.createElement('canvas'), lg=lm.getContext('2d');
function drawLighting(x0,y0,x1,y1){
 const dark=Math.max(0,.55-todDay*.9);
 const vis=[];
 for(const L of lights)if(L[0]>=x0-6&&L[0]<=x1+6&&L[1]>=y0-6&&L[1]<=y1+6)vis.push(L);
 
 let needDark=dark>0;
 if(!needDark){
  for(let y=y0;y<=y1&&!needDark;y++){
   for(let x=x0;x<=x1;x++){
    if(skyExposed[y*W+x]<15){needDark=true;break}
   }
  }
 }
 if(!needDark) return;

 dg.clearRect(0,0,VW,VH);
 
 const sw=x1-x0+1, sh=y1-y0+1;
 if(lm.width!=sw||lm.height!=sh){lm.width=sw;lm.height=sh}
 const img=lg.createImageData(sw,sh);
 let idx=0;
 
 for(let y=y0;y<=y1;y++){
  const surf=hgt(Math.max(0,Math.min(W-1,Math.floor(x0)))); // Placeholder
  for(let x=x0;x<=x1;x++){
   const skl=skyExposed[y*W+x];
   const lightPct=skl/15;
   const surface=hgt(x);
   const depth=Math.max(0,y-surface);
   const depthDark=Math.min(0.55,depth/130);
   const tileDark=Math.min(0.98,(1-lightPct)*0.90+depthDark);
   
   img.data[idx]=3; img.data[idx+1]=5; img.data[idx+2]=15; img.data[idx+3]=tileDark*255;
   idx+=4;
  }
 }
 lg.putImageData(img,0,0);
 
 // Yumuşak geçişli karanlık haritasını ekrana bas
 dg.imageSmoothingEnabled=true;
 dg.drawImage(lm, (x0-camX)*S, (y0-camY)*S, sw*S, sh*S);
 dg.imageSmoothingEnabled=false;
 
 // Meşalelerin ışıklarını delik açarak çiz
 dg.globalCompositeOperation='destination-out';
 for(const L of vis){
  const tx=(L[0]+.5-camX)*S,ty=(L[1]+.5-camY)*S,R=L[2]==19?S*4:S*5;
  dg.drawImage(getLightTex(R,false),tx-R,ty-R);
 }
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
 g.globalAlpha=.12;
 g.drawImage(getLightTex(pR,true),pcx-pR,pcy-pR);
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}

// ==================== ANA ÇİZİM DÖNGÜSÜ ====================
function draw(){
 const now=Date.now();
 drawSky();
 
 let shakeX=0,shakeY=0;
 if(shakeT>0){const mag=shakeT*30;shakeX=(Math.random()-.5)*mag;shakeY=(Math.random()-.5)*mag}
 
 g.save();
 g.translate(shakeX,shakeY);
 
 // Sınırları bir kez hesapla (inBounds optimizasyonu)
 const x0=Math.max(0, Math.floor(camX));
 const y0=Math.max(0, Math.floor(camY));
 const x1=Math.min(W-1, Math.ceil(camX+VW/S));
 const y1=Math.min(H-1, Math.ceil(camY+VH/S));

 const waters=[];

 // Dünyayı çiz
 drawWorld(x0,y0,x1,y1,now,waters);

 // Efektleri çiz (Moblar, mermiler)
 drawFx(now/1000,now);

 // Oyuncuyu çiz
 const X=(px-camX)*S,Y=(py-camY)*S,hurt=hurtT>0;
 g.fillStyle='rgba(0,0,0,.3)';
 g.beginPath();g.ellipse(X+pw*S/2,Y+ph*S,S*.4,S*.1,0,0,6.283);g.fill();
 g.save();g.translate(X+pw*S/2,Y);g.scale(face,1);
 const walk=Math.sin(anim)*.12*S;
 // Bacaklar (Normal çiz)
 g.fillStyle='#2b2b7c';
 g.fillRect(-.22*S+walk,1.2*S,.2*S,.6*S);g.fillRect(.02*S-walk,1.2*S,.2*S,.6*S);
 g.fillStyle='#1a1a5c';
 g.fillRect(-.22*S+walk,1.7*S,.22*S,.1*S);g.fillRect(.02*S-walk,1.7*S,.22*S,.1*S);
 // Gövde
 g.fillStyle=hurt?'#ff6666':'#2aa0a8';g.fillRect(-.25*S,.6*S,.5*S,.62*S);
 g.fillStyle=hurt?'#cc4444':'#1a8088';g.fillRect(-.25*S,.9*S,.5*S,.32*S);
 g.fillStyle=hurt?'#ff8888':'#1a8088';g.fillRect(-.15*S,.6*S,.3*S,.08*S);
 // Kol / Alet
 g.save();g.translate(0,.68*S);g.rotate(armA);
 g.fillStyle='#c68e6a';g.fillRect(0,-.08*S,.55*S,.16*S);
 g.fillStyle='#a06a48';g.fillRect(0,.02*S,.55*S,.04*S);
 if(hasSword()){
  const isDiamond=count(41)>0;
  const bladeC=isDiamond?'#6ee8f0':'#d0d0d0';
  const bladeShine=isDiamond?'#b8f8ff':'#f0f0f0';
  g.fillStyle='#8a6a35';g.fillRect(.2*S,-.04*S,.3*S,.08*S);
  g.fillStyle=bladeC;g.fillRect(.45*S,-.06*S,.5*S,.12*S);
  g.fillStyle=bladeShine;g.fillRect(.45*S,-.06*S,.5*S,.04*S);
  g.fillStyle='#8a6a35';g.fillRect(.42*S,-.08*S,.06*S,.16*S);
 }else{
  const tl=pickLv();
  if(tl){
   const headColor=tl==4?'#6ee8f0':tl==3?'#e0e0e0':tl==2?'#c0c0c0':'#b8864b';
   const shadeColor=tl==4?'#3ac8d8':tl==3?'#b0b0b0':tl==2?'#a0a0a0':'#9a6030';
   g.fillStyle='#6b4a24';g.fillRect(.2*S,-.04*S,.4*S,.08*S);
   g.fillStyle=headColor;g.fillRect(.5*S,-.24*S,.14*S,.48*S);
   g.fillStyle=shadeColor;g.fillRect(.5*S,.16*S,.14*S,.08*S);
   if(tl>=3){g.fillStyle='#fff';g.fillRect(.5*S,-.24*S,.14*S,.06*S);}
  }
 }
 g.restore();
 // Kafa
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

 // Suyu Çiz (Oyuncunun üstüne, yarı saydam)
 for(let i=0; i<waters.length; i+=4){
  drawWater(waters[i], waters[i+1], waters[i+2], waters[i+3], now);
 }

 g.restore(); // Shake geri al

 // Karanlık / Işık Sistemi (Shake dışında, kenarlar boş kalmasın)
 drawLighting(x0,y0,x1,y1);

 // Arayüz ve HUD Efektleri
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
  if(b){mh.style.display='block';mn.textContent=NAME[b]||'';mfill.style.width=(mine.p*100)+'%'}
  else mh.style.display='none';
 }else mh.style.display='none';
}