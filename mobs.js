// mobs.js — Mob sistemi (zombi, iskelet, tavuk), savaş, oklar, respawn

// ==================== YARDIMCI ====================
function burst(x,y,n,c,sp){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*sp,vy:-Math.random()*sp*.7,l:.4+Math.random()*.4,c,s:.08+Math.random()*.1})}

function mobInWater(m){
 const x0=Math.floor(m.x),x1=Math.floor(m.x+pw-.001);
 const y0=Math.floor(m.y),y1=Math.floor(m.y+ph-.001);
 for(let i=x0;i<=x1;i++)for(let j=y0;j<=y1;j++)if(get(i,j)===43)return true;
 return false;
}

// ==================== AYARLAR ====================
const MOB_DESPAWN_DIST=70;   // oyuncudan bu kadar uzaktaki moblar silinir
const MOB_NEAR_DIST=40;      // "yakın mob" sayımı için mesafe
const MOB_TOTAL_CAP=16;      // dünyadaki toplam düşman sınırı
const RESPAWN_PROTECT=2.5;   // dirilince hasar almama süresi (sn)

// ==================== ORTAK MOB ====================
 const newMob=(type,x,y)=>({
 id:mobIdCounter++,
 type,x,y,
 vx:0,vy:0,
 hp:type=='c'?4:type=='s'?8:type=='f'?2:10,
 maxHp:type=='c'?4:type=='s'?8:type=='f'?2:10,
 face:1,hurt:0,burn:0,onGround:false,
 atkCd:0,shootCd:1.5,aimT:0,
 dead:false,
 wanderCd:0,wanderDir:0,panicCd:0,stun:0
});

function moveMob(m,dt){
 // Balık: su içinde yüzer
 if(m.type=='f'){
  m.vy=Math.min(3,m.vy+10*dt);
  m.wanderCd=Math.max(0,(m.wanderCd||0)-dt);
  if(m.wanderCd<=0){
   m.wanderCd=1+Math.random()*2;
   m.vx=(Math.random()-.5)*2;
   m.face=m.vx>0?1:-1;
  }
  if(m.onGround&&Math.random()<0.05)m.vy=-6;
 } else if(m.type=='c'){m.vy=Math.min(4,m.vy+18*dt);}
 else{m.vy=Math.min(20,m.vy+30*dt);}
 const ox=m.x;m.x+=m.vx*dt;
 if(coll(m.x,m.y)){m.x=ox;if(m.onGround&&m.vx&&!coll(ox+(m.vx>0?.05:-.05),m.y-1.0))m.vy=-9;m.vx=0}
 m.x=Math.max(0,Math.min(W-pw,m.x));
 m.onGround=false;m.y+=m.vy*dt;
 if(coll(m.x,m.y)){
  if(m.vy>0){m.y=Math.floor(m.y+ph)-ph-.001;m.onGround=true}
  else m.y=Math.floor(m.y)+1.001;
  m.vy=0;
 }
}

function hitMob(m,damage,knockback){
 if(m.dead)return;
 m.hp-=damage;m.hurt=0.3;shakeT=0.05;
 const nmx=m.x+((m.x+pw/2>px+pw/2)?1:-1)*knockback;
 if(!coll(nmx,m.y))m.x=nmx;
 // Vurulma geri bildirimi: damage number
 fl.push({x:m.x+pw/2,y:m.y-0.3,t:1.2,s:'-'+damage,color:'#ff4444'});
 const color=m.type=='s'?'#e6e2d0':m.type=='c'?'#f0e8d0':'#e74c3c';
 burst(m.x+pw/2,m.y+ph/2,4,color,4);
 if(m.hp<=0){
  killMob(m);
 }else{
  burst(m.x+pw/2,m.y+ph/2,4,color,4);
  // Tavuk vurulunca kaçar
  if(m.type=='c'){
   m.panicCd=4;
   m.face=(m.x+pw/2>px+pw/2)?1:-1;
   m.vx=m.face*3.5;
  }
 }
}

function killMob(m){
 if(m.dead)return;
 m.dead=true;
 const cx=m.x+pw/2,cy=m.y+ph/2;
 if(m.type=='c'){
  // Tavuk: tüy + yumurta (%30) + çiğ tavuk
  drops.push({x:cx,y:cy,vy:-3,b:26,age:0});
  if(Math.random()<.5)drops.push({x:cx+.15,y:cy,vy:-3.2,b:26,age:0});
  if(Math.random()<.3)drops.push({x:cx-.15,y:cy,vy:-3.4,b:27,age:0});
  drops.push({x:cx+.3,y:cy,vy:-3.6,b:28,age:0});
  burst(cx,cy,8,'#f0e8d0',5);
 }else if(m.type=='f'){
  // Balık: ham balık düşür
  drops.push({x:cx,y:cy,vy:-3,b:49,age:0});
  if(Math.random()<.5)drops.push({x:cx+.2,y:cy,vy:-3.2,b:49,age:0});
  burst(cx,cy,6,'#4a90e0',4);
 }else if(m.type=='s'){
  // İskelet: kemik
  drops.push({x:cx,y:cy,vy:-3,b:25,age:0});
  if(Math.random()<.5)drops.push({x:cx+.2,y:cy,vy:-3.5,b:25,age:0});
  burst(cx,cy,10,'#e6e2d0',6);
 }else{
  // Zombi: çürük et
  drops.push({x:cx,y:cy,vy:-3,b:22,age:0});
  burst(cx,cy,10,'#5a7a3a',6);
 }
}

// ==================== TAVUK SPAWN (yüzeyde) ====================
function spawnChicken(){
 const dir=Math.random()<0.5?-1:1;
 const mx=Math.floor(px+pw/2+dir*(4+Math.random()*8));
 if(mx<3||mx>W-3)return false;
 const surf=hgt(mx);
 for(let y=surf-2;y<surf+2;y++){
  if(!inBounds(mx,y))continue;
  if(!solid(mx,y)&&!solid(mx,y-1)&&solid(mx,y+1)&&skyExposed[y*W+mx]>10){
   mobs.push(newMob('c',mx+.15,y));
   return true;
  }
 }
 return false;
}

// ==================== ZOMBI/İSKELET SPAWN ====================
// İki mod: GECE YÜZEYDE (açık havada) ve YERALTINDA (karanlık mağara).
// Oyuncunun çevresinde 12-25 blok uzakta, ekranın dışında doğar.
// Sınırlar oyuncunun çevresindeki mob sayısına göre. game.js her ~3 sn'de bir çağırır.
function spawnMob(){
 const pcx=px+pw/2,pcy=py+ph/2;
 const surfP=hgt(Math.max(0,Math.min(W-1,Math.floor(pcx))));
 const under=pcy>surfP+6;       // oyuncu yeraltında mı
 const isNight=todDay<0.3;
 if(!under&&!isNight)return;    // gündüz yüzeyde düşman yok

 // yakın / toplam düşman sayısı
 let near=0,nearSk=0,total=0;
 for(const m of mobs){
  if(m.dead||m.type=='c')continue;
  total++;
  if(Math.hypot(m.x-pcx,m.y-pcy)<MOB_NEAR_DIST){near++;if(m.type=='s')nearSk++}
 }
 const cap=under?5:6;
 if(near>=cap||total>=MOB_TOTAL_CAP)return;

 for(let tries=0;tries<25;tries++){
  const dir=Math.random()<0.5?-1:1;
  const mx=Math.floor(pcx+dir*(12+Math.random()*13));
  if(mx<2||mx>W-3)continue;
  let spawnY=-1;

  if(under){
   // Oyuncu derinliğinin çevresinde açık zemin ara (rastgele noktadan başla)
   const y0=Math.max(2,Math.floor(pcy)-8),y1=Math.min(H-3,Math.floor(pcy)+8);
   const span=y1-y0;if(span<=0)continue;
   const off=Math.floor(Math.random()*span);
   for(let k=0;k<span;k++){
    const y=y0+(k+off)%span;
    if(!solid(mx,y)&&!solid(mx,y+1)&&solid(mx,y+2)){spawnY=y;break}
   }
  }else{
   // Gece yüzey: yüzeydeki zemini bul
   const surf=hgt(mx);
   for(let y=Math.max(3,surf-4);y<=surf+3;y++){
    if(solid(mx,y)&&!solid(mx,y-1)&&!solid(mx,y-2)){spawnY=y-2;break}
   }
  }
  if(spawnY<0)continue;

  // Suyun içinde doğmasın
  if(get(mx,spawnY)==43||get(mx,spawnY+1)==43)continue;

  // Meşale/döküm yakınında doğmasın (güvenli bölgeler)
  let nearLight=false;
  for(let dy=-3;dy<=3&&!nearLight;dy++)for(let dx=-3;dx<=3;dx++){
   const bx=mx+dx,by=spawnY+dy;
   if(inBounds(bx,by)&&(w[by*W+bx]==14||w[by*W+bx]==19)){nearLight=true;break}
  }
  if(nearLight)continue;

  // Yeraltında sadece karanlık yerlerde
  if(under&&skyExposed[spawnY*W+mx]>3)continue;

  // Çok yakında veya gözünün önünde doğmasın
  const dist=Math.hypot(mx+.5-pcx,spawnY+1-pcy);
  if(dist<10)continue;
  if(dist<16&&los(mx+.5,spawnY+1,pcx,pcy))continue;

  // Tür seçimi: yeraltında daha çok iskelet, yüzeyde çoğunlukla zombi
  const skChance=under?.35:.15,skMax=under?2:1;
  const type=(Math.random()<skChance&&nearSk<skMax)?'s':'z';
  mobs.push(newMob(type,mx+.15,spawnY));
  return;
 }
}

// ==================== MOB UPDATE ====================
function updateMobs(dt){
 const isDay=todDay>0.5,cx=px+pw/2,cy=py+ph/2;
 for(const m of mobs){
  if(m.dead)continue;
  m.hurt=Math.max(0,m.hurt-dt);
  m.atkCd=Math.max(0,m.atkCd-dt);
  m.shootCd=Math.max(0,m.shootCd-dt);
  const mx=m.x+pw/2,my=m.y+ph/2,dx=cx-mx,dy=cy-my,dist=Math.hypot(dx,dy);

  // Çok uzaktaki mobları sessizce sil (keşifte arkanda birikmesin)
  if(dist>MOB_DESPAWN_DIST){m.dead=true;continue}

  // Sersemlemiş mob (respawn'da geri itilenler): yapay zeka çalışmaz
  if(m.stun>0){
   m.stun-=dt;m.vx*=.92;
   moveMob(m,dt);
   continue;
  }

  if(m.type=='c'){
   // TAVUK: gezin, kaç, panik
   m.wanderCd=Math.max(0,(m.wanderCd||0)-dt);
   m.panicCd=Math.max(0,(m.panicCd||0)-dt);
   if(dist<4){
    m.panicCd=1.5;
    m.face=dx>0?-1:1;
    m.vx=m.face*3.5;
    if(m.onGround&&Math.random()<0.08)m.vy=-9;
   }else if(m.panicCd>0){
    m.vx=m.face*3.5;
   }else if(m.wanderCd<=0){
    m.wanderCd=2+Math.random()*2;
    m.wanderDir=(Math.random()-.5)*2;
    m.face=m.wanderDir>0?1:-1;
    m.vx=Math.random()<0.4?0:m.face*1.5;
   }else{
    m.vx=m.wanderDir>0?1.5:-1.5;
   }
  }else if(m.type=='f'){
   // BALIK: su içinde yüzme, karadaゆavaş
   const inWater=mobInWater(m);
   if(inWater){
    m.vx=m.wanderDir>0?1.5:-1.5;
    if(m.onGround)m.vy=-5; // zıplayarak yüz
   } else {
    m.vx=m.wanderDir*0.5; // karada çok yavaş
   }
   m.wanderCd=Math.max(0,(m.wanderCd||0)-dt);
   if(m.wanderCd<=0){
    m.wanderCd=2+Math.random()*2;
    m.wanderDir=(Math.random()-.5)*2;
    m.face=m.wanderDir>0?1:-1;
   }
  }else if(m.type=='s'){
   // İSKELET: uzak dur, ok at
   m.face=dx>0?1:-1;
   let sp=0;
   if(dist<22){if(dist>8)sp=m.face;else if(dist<3.5)sp=-m.face}
   const see=dist<12&&Math.abs(dy)<4.5&&los(mx,my,cx,cy);
   if(see&&m.shootCd<=0){
    m.aimT+=dt;sp=0;
    if(m.aimT>=.6){shootArrow(m,cx,cy);m.shootCd=1.8+Math.random();m.aimT=0}
   }
   else m.aimT=0;
   m.vx=sp*1.9;
  }else{
   // ZOMBİ: kovala, vur
   if(dist<20&&dist>0.5){m.face=dx>0?1:-1;m.vx=m.face*2.4}
   else m.vx=0;
  }

  moveMob(m,dt);

  // Güneşte yanma (zombi/iskelet, tavuk hariç)
  const surf=hgt(Math.max(0,Math.min(W-1,Math.floor(m.x))));
  if(isDay&&m.y<surf+3&&m.type!='c'){
   m.burn+=dt;
   if(m.burn>=1){
    m.burn=0;m.hp-=1;
    burst(m.x+Math.random()*pw,m.y+Math.random()*ph,3,'#ff8c00',3);
    if(m.hp<=0){killMob(m);continue}
   }
  }else m.burn=0;

  // Zombi saldırısı
  if(m.type=='z'&&dist<1.4&&m.atkCd<=0&&damagePlayer(2,mx))m.atkCd=1.0;

  if(m.y>H+5)m.dead=true;
 }
 if(mobs.some(m=>m.dead))mobs=mobs.filter(m=>!m.dead);
}

// ==================== İSKELET OK ====================
function shootArrow(m,tx,ty){
 const x0=m.x+pw/2,y0=m.y+.5;
 const dx=tx-x0,dy=ty-y0,d=Math.hypot(dx,dy)||1;
 arrows.push({x:x0,y:y0,vx:dx/d*14,vy:dy/d*14-1.5,age:0});
 buzz(8);
}

function updateArrows(dt){
 for(let i=arrows.length-1;i>=0;i--){
  const a=arrows[i];
  a.age+=dt;a.vy+=9*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;
  if(a.age>4||!inBounds(a.x,a.y)){arrows.splice(i,1);continue}
  if(solid(Math.floor(a.x),Math.floor(a.y))){
   burst(a.x,a.y,4,'#c9b98a',3);arrows.splice(i,1);continue;
  }
  if(a.x>px&&a.x<px+pw&&a.y>py&&a.y<py+ph&&damagePlayer(2,a.x-a.vx*.1)){
   arrows.splice(i,1);
  }
 }
}

// ==================== SAVAŞ ====================
function damagePlayer(a,fromX){
 if(invT>0)return false;
 playerHp=Math.max(0,playerHp-a);
 invT=.5;hurtT=.3;regenTimer=3;shakeT=.15;
 renderHearts();
 fl.push({x:px+pw/2,y:py-0.5,t:1.2,s:'-'+a,color:'#ff4444'});
 const npx=px+(px+pw/2>fromX?.4:-.4);
 if(!coll(npx,py))px=Math.max(0,Math.min(W-pw,npx));
 buzz([30,20,30]);
 if(playerHp<=0)respawn();
 return true;
}

function mobTarget(){
 const pcx=px+pw/2,pcy=py+ph/2;
 let best=null,bd=1e9;
 for(const m of mobs){
  if(m.dead)continue;
  const dx=m.x+pw/2-pcx,dy=m.y+ph/2-pcy,d=Math.hypot(dx,dy);
  if(d>3.0||(dx*aimX+dy*aimY)/(d||1)<0.25)continue;
  if(d<bd){bd=d;best=m}
 }
 return best;
}

function strike(m){
 const dmg=swordDmg();
 const kb=hasSword()?0.5:0.2;
 hitMob(m,dmg,kb);
 onStrike();
 attackCd=hasSword()?0.4:0.6;
 atkT=.25;
 buzz(20);
}

// ==================== OYUNCU RESPAWN ====================
function respawn(){
 playerHp=playerMaxHp;
 hurtT=0.5;invT=RESPAWN_PROTECT;regenTimer=0;
 renderHearts();
 px=W/2;py=hgt(W/2)-3;vx=0;vy=0;
 arrows=[];
 // Yakındaki mobları silme: sersemlet ve geri it
 for(const m of mobs){
  if(m.dead)continue;
  const dx=m.x-px,d=Math.hypot(dx,m.y-py);
  if(d<10){m.stun=1.5;m.vx=(dx>=0?1:-1)*7;m.vy=-6}
 }
 fl.push({x:px,y:py,t:1.5,s:'Respawn'});
}
