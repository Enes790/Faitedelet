// player.js — Nişan, fizik, kazma, koyma, toplar, can yenilenmesi

// ==================== NİŞAN ====================
const DIRS=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
const overlapsPl=(x,y)=>x+1>px&&x<px+pw&&y+1>py&&y<py+ph;

function rayCells(ox,oy,dx,dy,maxD){
 const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,out=[];
 let lx=null,ly=null;
 for(let t=0;t<=maxD;t+=.04){
  const cx=Math.floor(ox+ux*t),cy=Math.floor(oy+uy*t);
  if(cx!==lx||cy!==ly){out.push([cx,cy]);lx=cx;ly=cy}
 }
 return out;
}

function aimTargets(){
 const ox=px+pw/2;
 const rays=aimY==0?[[ox,Math.floor(py+1.4)+.5],[ox,Math.floor(py+.5)+.5]]:[[ox,py+ph*.5]];
 let hitC=null,hk=1e9,place=null,hitLayer='w';
 rays.forEach((o,ri)=>{
  const cells=rayCells(o[0],o[1],aimX,aimY,REACH).filter(c=>inBounds(c[0],c[1])&&!overlapsPl(c[0],c[1]));
  let k=-1,layer='w';
  for(let i=0;i<cells.length;i++){
   const c=cells[i];
   const gb=get(c[0],c[1]);
   // Su nişanı engellemez: suyun altındaki/ötesindeki bloklar hedeflenebilir
   if(gb&&gb!==43){k=i;layer='w';break}
   if(getBg(c[0],c[1])){k=i;layer='bg';break}
  }
  if(k>=0&&k<hk){hk=k;hitC=cells[k];hitLayer=layer}
  if(ri==0){if(k>0)place=cells[k-1];else if(k<0&&cells.length)place=cells[0]}
 });
 return{hit:hitC,place,hitLayer};
}

function los(x0,y0,x1,y1){
 const dx=x1-x0,dy=y1-y0,n=Math.ceil(Math.hypot(dx,dy)/.3);
 for(let i=1;i<n;i++){
  const t=i/n;
  if(solid(Math.floor(x0+dx*t),Math.floor(y0+dy*t)))return false;
 }
 return true;
}

// ==================== FİZİK ====================
function collBox(x,y,bw,bh){
 const x0=Math.floor(x),x1=Math.floor(x+bw-.001);
 const y0=Math.floor(y),y1=Math.floor(y+bh-.001);
 for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++)if(solid(i,j))return true;
 return false;
}
const coll=(x,y)=>collBox(x,y,pw,ph);

// Su içinde mi? (Yüzme fiziği game.js içinde)
function inWater(x,y){
 const x0=Math.floor(x),x1=Math.floor(x+pw-.001);
 const y0=Math.floor(y),y1=Math.floor(y+ph-.001);
 for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++){
  if(get(i,j)===43)return true;
 }
 return false;
}

// ==================== CAN YENİLENMESİ ====================
function updateRegen(dt){
 if(playerHp>=playerMaxHp)return;
 if(regenTimer>0){regenTimer-=dt;return}
 playerHp=Math.min(playerMaxHp,playerHp+dt);
 if(Math.floor(playerHp)!==lastHpInt)renderHearts();
}

// ==================== KAKTÜS HASARI ====================
function checkCactusDamage(){
 if(invT>0)return;
 const x0=Math.floor(px),x1=Math.floor(px+pw-.001);
 const y0=Math.floor(py),y1=Math.floor(py+ph-.001);
 for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++){
  if(get(i,j)===31){
   // Kaktüs içindeyse hasar ver (1 hasar = yarım kalp)
   damagePlayer(1,px+(px>i?1:-1));
   return;
  }
 }
}

// ==================== KIRMA / KOYMA ====================
function breakB(tx,ty,layer){
 if(ty>=H-1)return;
 const i=ty*W+tx;let b;
 if(layer=='bg'){b=bg[i];if(!b)return;bg[i]=0}
 else{b=w[i];if(!b)return;w[i]=0}

 if(b==14||b==19)lights=lights.filter(L=>!(L[0]==tx&&L[1]==ty));

 // SU KIRILMAZ (Kovayla alınabilir ileride): bloğu geri koy
 if(b==43){
  w[i]=43;
  return;
 }

 // Toprak Vazo: Loot düşür
 if(b==42){
  burst(tx+.5,ty+.5,14,'#b06040',5);
  pops.push({x:tx,y:ty,t:.28,c:'#b06040'});
  const loot=[];
  if(Math.random()<0.5)loot.push([8,1+Math.floor(Math.random()*3)]); // Kömür
  if(Math.random()<0.3)loot.push([16,1+Math.floor(Math.random()*2)]); // Demir
  if(Math.random()<0.2)loot.push([7,2+Math.floor(Math.random()*3)]);  // Kalas
  if(Math.random()<0.2)loot.push([9,2+Math.floor(Math.random()*3)]);  // Çubuk
  if(Math.random()<0.15)loot.push([22,1+Math.floor(Math.random()*2)]); // Çürük Et
  if(Math.random()<0.1)loot.push([36,1]); // Elmas (%10)
  if(Math.random()<0.05)loot.push([21,1]); // Demir Kılıç (%5)
  if(loot.length===0)loot.push([8,1]); // Boş çıkmasın

  loot.forEach(([itemId,amount])=>{
   for(let k=0;k<amount;k++){
    drops.push({x:tx+.5+(Math.random()-.5)*.6,y:ty+.5,vy:-3-Math.random()*2,b:itemId,age:0});
   }
  });
  updateSkyColumn(tx);
  shakeT=0.08;buzz(14);
  return;
 }

 // Elmas Blok: Kırınca 9 elmas düşür
 if(b==37){
  for(let k=0;k<9;k++){
   drops.push({x:tx+.5+(Math.random()-.5)*.6,y:ty+.5,vy:-3-Math.random()*2,b:36,age:0});
  }
  burst(tx+.5,ty+.5,14,'#6ee8f0',5);
  pops.push({x:tx,y:ty,t:.28,c:'#6ee8f0'});
  updateSkyColumn(tx);
  shakeT=0.08;buzz(14);
  return;
 }

 // Sandık: Kırınca loot düşür
 if(b==47){
  const loot=[];
  if(Math.random()<0.7)loot.push([8,1+Math.floor(Math.random()*3)]); // Kömür
  if(Math.random()<0.5)loot.push([16,1]); // Demir
  if(Math.random()<0.4)loot.push([36,1]); // Elmas
  if(Math.random()<0.3)loot.push([21,1]); // Demir Kılıç
  if(Math.random()<0.2)loot.push([41,1]); // Elmas Kılıç
  if(Math.random()<0.15)loot.push([20,1]); // Cevher Topu
  if(Math.random()<0.1)loot.push([24,1]); // Cam Topu
  if(loot.length===0)loot.push([8,1]);
  loot.forEach(([itemId,amount])=>{
   for(let k=0;k<amount;k++){
    drops.push({x:tx+.5+(Math.random()-.5)*.6,y:ty+.5,vy:-3-Math.random()*2,b:itemId,age:0});
   }
  });
  burst(tx+.5,ty+.5,14,'#8b5a2b',6);
  pops.push({x:tx,y:ty,t:.28,c:'#8b5a2b'});
  updateSkyColumn(tx);
  shakeT=0.08;buzz(14);
  return;
 }

 // Mob Üretici: Kırınca kendini düşür
 if(b==48){
  drops.push({x:tx+.5,y:ty+.5,vy:-3,b:48,age:0});
  burst(tx+.5,ty+.5,14,'#555',6);
  pops.push({x:tx,y:ty,t:.28,c:'#555'});
  updateSkyColumn(tx);
  shakeT=0.08;buzz(14);
  return;
 }

 // Normal drop
 let d=b;
 if(b==1)d=2;
 else if(b==15)d=16;
 else if(b==35)d=36; // Elmas Cevheri -> Elmas
 drops.push({x:tx+.5,y:ty+.5,vy:-3,b:d,age:0});
 burst(tx+.5,ty+.5,14,BASE[b],5);
 pops.push({x:tx,y:ty,t:.28,c:BASE[b]});
 updateSkyColumn(tx);
 shakeT=0.08;buzz(14);
}

function chip(tx,ty,c){
 parts.push({x:tx+.5+(Math.random()-.5)*.6,y:ty+.5+(Math.random()-.5)*.6,vx:(Math.random()-.5)*3,vy:-Math.random()*3,l:.45,c,s:.09});
}

function placeAt(tx,ty){
 const s=slots[sel];
 if(!s||!PLACE.has(s.id))return false;
 if(!inBounds(tx,ty))return false;
 // Boş yere ya da suyun üstüne/içine koyulabilir (su yer değiştirir: köprü/dolgu)
 const cur=get(tx,ty);
 if(cur&&cur!==43)return false;

 // KAKTÜS KONTROLÜ: Sadece kum (6) üzerine dikilebilir
 if(s.id===31){
  if(get(tx,ty+1)!==6){
   say('Kaktüs sadece kuma dikilir!');
   return false;
  }
 }

 const dx=tx+.5-(px+pw/2),dy=ty+.5-(py+ph/2);
 if(dx*dx+dy*dy>RD2)return false;
 if(!NONSOLID.has(s.id)&&overlapsPl(tx,ty))return false;

 w[ty*W+tx]=s.id;
 if(s.id==14||s.id==19)lights.push([tx,ty,s.id]);
 updateSkyColumn(tx);

 s.n--;
 if(!s.n)slots[sel]=null;
 pops.push({x:tx,y:ty,t:.2,c:'#9f9'});
 refresh();
 return true;
}

// ==================== GÜBRE (Fidan) ====================
function fertTarget(){
 const h=AIM.hit;
 if(!h||AIM.hitLayer!='w'||get(h[0],h[1])!=1)return null;
 const x=h[0],y=h[1];
 if(get(x,y-1)||getBg(x,y-1))return null;
 const dx=x+.5-(px+pw/2),dy=y+.5-(py+ph/2);
 if(dx*dx+dy*dy>RD2)return null;
 return[x,y];
}

function tryFertilize(){
 const s=slots[sel];
 if(!s||s.id!=23)return false;
 const t=fertTarget();
 if(!t){say('Çimen bloğuna nişan al');return false}
 if(!plantTree(t[0],t[1],3+Math.floor(Math.random()*2))){say('Burada yer yok');return false}
 s.n--;if(!s.n)slots[sel]=null;
 burst(t[0]+.5,t[1]-.5,14,'#7acc4a',5);
 pops.push({x:t[0],y:t[1]-1,t:.3,c:'#7acc4a'});
 refresh();
 buzz(15);
 return true;
}

function useItem(){
 const s=slots[sel];
 if(!s)return false;
 if(FOOD[s.id]!==undefined)return eatSel(); // yemek ye
 if(s.id==23)return tryFertilize();
 // FIRIN: Ham balığı yakin bir firin icinde pişir
 if(s.id==49){
  const cx=Math.floor(px+pw/2),cy=Math.floor(py+ph/2);
  let nearFurnace=false;
  for(let y=cy-2;y<=cy+2&&!nearFurnace;y++)for(let x=cx-2;x<=cx+2;x++){
   if(inBounds(x,y)&&get(x,y)==51)nearFurnace=true;
  }
  if(nearFurnace){
   s.id=50;s.n=1;refresh();
   fl.push({x:px+pw/2,y:py-.3,t:1.2,s:'Balık pişirildi!',color:'#ff6f00'});
   buzz(14);
   return true;
  }
 }
 return AIM.place?placeAt(AIM.place[0],AIM.place[1]):false;
}

// ==================== TOPLAR ====================
function throwOrb(){
 const s=slots[sel];
 if(!s||(s.id!=20&&s.id!=24)||s.n<=0)return;
 let dx=aimX,dy=aimY;
 if(!dx&&!dy){dx=face;dy=0}
 const l=Math.hypot(dx,dy)||1;
 projectiles.push({x:px+pw/2,y:py+ph/2,vx:dx/l*16,vy:dy/l*16,age:0,type:s.id,spin:0});
 s.n--;if(!s.n)slots[sel]=null;
 refresh();
 buzz(10);
}

function glassBurst(x,y){
 for(const m of mobs){
  if(m.dead)continue;
  const d=Math.hypot(m.x+pw/2-x,m.y+ph/2-y);
  if(d<1.6)hitMob(m,2,0.8);
 }
 for(let i=0;i<16;i++){
  const a=Math.random()*Math.PI*2,sp=2+Math.random()*4;
  parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,l:.5,c:i%3?'#a0e0f0':'#e0f8ff',s:.1+Math.random()*.08});
 }
 pops.push({x:Math.floor(x),y:Math.floor(y),t:.3,c:'#a0e0f0'});
 buzz(20);
}

function updateProjectiles(dt){
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i];
  p.age+=dt;p.vy+=15*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin+=dt*15;
  if(p.age>4||!inBounds(p.x,p.y)){projectiles.splice(i,1);continue}
  let hit=false;
  for(const m of mobs){
   if(m.dead)continue;
   if(p.x>m.x&&p.x<m.x+pw&&p.y>m.y&&p.y<m.y+ph){
    if(p.type==24)glassBurst(p.x,p.y);
    else hitMob(m,3,1.2);
    hit=true;
    break;
   }
  }
  if(hit){projectiles.splice(i,1);continue}
  const tx=Math.floor(p.x),ty=Math.floor(p.y);
  if(get(tx,ty)){
   if(p.type==24)glassBurst(p.x,p.y);
   else{
    if(ty<H-1)breakB(tx,ty,'w');
    burst(p.x,p.y,8,'#ffd23c',6);
   }
   projectiles.splice(i,1);
  }
 }
}

// ==================== KAZMA DÖNGÜSÜ ====================
function mineStep(dt,busy){
 const t=(actHeld&&!busy&&AIM.hit)?[AIM.hit[0],AIM.hit[1],AIM.hitLayer]:null;
 if(t){
  if(!mine||mine.tx!=t[0]||mine.ty!=t[1]||mine.layer!=t[2]){
   mine={tx:t[0],ty:t[1],layer:t[2],p:0};
  }
 }
 else mine=null;

 let on=false;
 if(mine){
  const b=mine.layer=='bg'?getBg(mine.tx,mine.ty):get(mine.tx,mine.ty);
  const dx=mine.tx+.5-(px+pw/2),dy=mine.ty+.5-(py+ph/2);
  if(b&&mine.ty<H-1&&dx*dx+dy*dy<=RD2){
   if(needsTool(b)){
    mine.p=0;
    say(b==35?'Demir kazma gerekli':'Taş kazma gerekli');
   }else if(b==43){
    mine.p=0; // Su kazılmaz
   }else{
    on=true;
    mine.p+=dt/mineTime(b);
    chipT-=dt;
    if(chipT<=0){chip(mine.tx,mine.ty,BASE[b]);chipT=.1}
    if(mine.p>=1){
     breakB(mine.tx,mine.ty,mine.layer);
     onBlockBroken(b); // aleti yıprat
     mine.p=0;on=false;
    }
   }
  }
  else mine.p=0;
 }

 // Kol animasyonu
 let tg=1.45+(anim?Math.sin(anim)*.5:0);
 if(on){
  swingT+=dt*13;
  tg=Math.atan2(mine.ty+.5-(py+.68),(mine.tx+.5-(px+pw/2))*face)+Math.sin(swingT)*.6-.2;
 }
 else if(atkT>0){
  swingT+=dt*18;
  tg=Math.atan2(aimY,aimX*face)+Math.sin(swingT)*.7-.2;
 }
 armA+=(tg-armA)*Math.min(1,dt*18);

 // Partiküller
 for(const q of parts){q.vy+=25*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt}
 parts=parts.filter(q=>q.l>0);
 for(const q of pops)q.t-=dt;
 pops=pops.filter(q=>q.t>0);

 // Drop toplama
 const cx=px+pw/2,cy=py+ph/2;
 drops=drops.filter(o=>{
  o.age+=dt;
  o.vy=Math.min(14,o.vy+25*dt);
  o.y+=o.vy*dt;
  if(solid(Math.floor(o.x),Math.floor(o.y+.15))){
   o.y=Math.floor(o.y+.15)-.15;
   o.vy=0;
  }
  const dx=cx-o.x,dy=cy-o.y,l=Math.hypot(dx,dy)||1,ok=room(o.b);
  if(ok&&o.age>.5&&l<3){o.vy=0;o.x+=dx/l*9*dt;o.y+=dy/l*9*dt}
  if(ok&&l<.7&&o.age>.3){
   addItem(o.b,1,o.d); // aletlerin kalan dayanıklılığı korunur
   fl.push({x:o.x,y:o.y-.3,t:1,s:'+1 '+NAME[o.b]});
   return false;
  }
  return true;
 });

 fl.forEach(f=>{f.y-=dt*1.2;f.t-=dt});
 fl=fl.filter(f=>f.t>0);

 updateProjectiles(dt);
}
