// game.js — Input, kamera, ana döngü

// ==================== INPUT (Kontroller) ====================
const bindEnd=(el,fn)=>['pointerup','pointercancel'].forEach(t=>el.addEventListener(t,fn));
const jb=document.getElementById('jump');
jb.addEventListener('pointerdown',e=>{e.preventDefault();jb.setPointerCapture(e.pointerId);jumpBtn=true});
bindEnd(jb,()=>jumpBtn=false);

const ab=document.getElementById('act');
ab.addEventListener('pointerdown',e=>{e.preventDefault();ab.setPointerCapture(e.pointerId);actHeld=true});
bindEnd(ab,()=>{actHeld=false});

const atb=document.getElementById('at');
atb.addEventListener('pointerdown',e=>{e.preventDefault();throwOrb()});

const kb=document.getElementById('koy');
kb.addEventListener('pointerdown',e=>{e.preventDefault();kb.setPointerCapture(e.pointerId);placeHeld=true;placeCd=0});
bindEnd(kb,()=>{placeHeld=false});

const st=document.getElementById('stick'),kn=document.getElementById('knob');
function stickMove(e){
 const r=st.getBoundingClientRect(),R=r.width/2;
 let dx=(e.clientX-(r.left+R))/R,dy=(e.clientY-(r.top+R))/R;
 const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}
 sx=dx;sy=dy;kn.style.transform='translate('+dx*42+'px,'+dy*42+'px)';
}
st.addEventListener('pointerdown',e=>{e.preventDefault();st.setPointerCapture(e.pointerId);sid=e.pointerId;stickMove(e)});
st.addEventListener('pointermove',e=>{if(e.pointerId==sid)stickMove(e)});
bindEnd(st,e=>{if(e.pointerId==sid){sid=null;sx=sy=0;kn.style.transform=''}});

const keys={};
addEventListener('keydown',e=>{keys[e.code]=1;
 if(e.code>='Digit1'&&e.code<='Digit9'){sel=+e.code[5]-1;refresh();showName()}
 if(e.code=='KeyE')togglePan();
 if(e.code=='KeyF')useItem();
 if(e.code=='KeyQ')throwOrb()
 if(e.code=='KeyK')saveGame(0)
});
addEventListener('keyup',e=>keys[e.code]=0);
cv.addEventListener('contextmenu',e=>e.preventDefault());
setTimeout(()=>{document.getElementById('hint').style.opacity=0},9000);

// ==================== RESIZE + KAMERA ====================
function resize(){
 dpr=Math.min(2,devicePixelRatio||1);
 VW=innerWidth;VH=innerHeight;
 cv.width=VW*dpr;cv.height=VH*dpr;g.setTransform(dpr,0,0,dpr,0,0);
 dc.width=VW*dpr;dc.height=VH*dpr;dg.setTransform(dpr,0,0,dpr,0,0);
 S=Math.max(32,Math.min(64,Math.round(Math.min(VW,VH)/9)));
 tileCache.clear();
}
addEventListener('resize',resize);
resize();
camX=px-VW/S/2;camY=py-VH/S/2;

function say(s){if(sayCd>0)return;sayCd=1.2;fl.push({x:px+pw/2,y:py-.3,t:1.3,s})}

// ==================== TAVUK SPAWN TIMER ====================
let chickenTimer=0;
let chickenNextSpawn=8+Math.random()*7; // 8-15 saniye arası rastgele
let grassTimer=0;

// ==================== UPDATE (Ana Döngü) ====================
function update(dt){
 // Süreleri azalt
 sayCd=Math.max(0,sayCd-dt);
 invT=Math.max(0,invT-dt);
 atkT=Math.max(0,atkT-dt);
 attackCd=Math.max(0,attackCd-dt);

 // Hareket girdisi
 let mx=0;if(Math.abs(sx)>.25)mx=sx;
 if(keys.KeyA||keys.ArrowLeft)mx=-1;
 if(keys.KeyD||keys.ArrowRight)mx=1;
 
 const jmp=jumpBtn||(sy<-.6&&!actHeld)||keys.Space||keys.KeyW||keys.ArrowUp;
 if(mx)face=mx>0?1:-1;

 // Su içinde mi?
 const water=inWater(px,py);

 // Fizik (Su ve Kara)
 if(water){
  // SUDA YÜZME
  vx = mx * 3;
  vy = Math.min(vy + 15*dt, 3); // Suyun içinde yavaşça aşağı bat
  if (jmp) vy = -4; // Zıplama tuşuna basılı tutarsan yukarı yüz
 } else {
  // KARADA YÜRÜME
  vx = mx * 5;
  vy = Math.min(20, vy + 30*dt);
  if(jmp && ground){vy=-10.5;ground=false}
 }

 // X Ekseninde Çarpışma
 let o=px;px+=vx*dt;
 if(coll(px,py)){
  px=o;
  if(ground&&mx&&!coll(o+(mx>0?.05:-.05),py-1.05))vy=-9;
 }
 px=Math.max(0,Math.min(W-pw,px));

 // Y Ekseninde Çarpışma
 ground=false;py+=vy*dt;
 if(coll(px,py)){
  if(vy>0){
   py=Math.floor(py+ph)-ph-.001;
   ground=true;
  }else if(vy<0){
   py=Math.floor(py)+1.001;
  }
  vy=0;
 }
 
 // Haritadan düşerse respawn
 if(py>H+5)respawn();
 
 // Yürüme animasyonu
 if(mx&&ground)anim+=dt*12;else if(!mx)anim=0;

 // Nişan yönü
 if(Math.hypot(sx,sy)>.35){
  const k=(Math.round(Math.atan2(sy,sx)/(Math.PI/4))+8)%8;
  aimX=DIRS[k][0];aimY=DIRS[k][1];
 } else if(keys.KeyS||keys.ArrowDown){
  aimX=0;aimY=1;
 } else{
  aimX=face;aimY=0;
 }
 AIM=aimTargets();

 // Saldırı
 const mt=actHeld?mobTarget():null;
 if(mt&&attackCd<=0)strike(mt);

 // Kazma
 mineStep(dt,!!mt);

 // Kaktüs hasarı kontrolü
 checkCactusDamage();

 // Can yenilenmesi
 updateRegen(dt);

 // Blok koyma
 if(placeHeld){
  placeCd-=dt;
  if(placeCd<=0)placeCd=useItem()?.22:.1;
 }

 // Zaman (Gündüz/Gece)
 tod+=dt/90;
 todDay=(Math.sin(tod)+1)/2;

 // Canavar Doğma (Zombi/İskelet): sınırlar spawnMob içinde (oyuncunun çevresine göre)
 spawnTimer+=dt;
 if(spawnTimer>3){
  spawnTimer=0;
  spawnMob();
 }

 // Tavuk Doğma (Sadece gündüz)
 chickenTimer+=dt;
 if(todDay>0.5&&chickenTimer>chickenNextSpawn){
  chickenTimer=0;
  chickenNextSpawn=8+Math.random()*7; // Yeni süre belirle
  const chickenCount=mobs.filter(m=>m.type=='c'&&!m.dead).length;
  // %5 şans ve max 4 tavuk
  if(chickenCount<4&&Math.random()<0.05)spawnChicken();
 }

 // Çimen yayılma: oyuncunun çevresinde, aşağıda çimen/üstünde varsaToprak → çimene çevir (her 5 saniye)
 grassTimer+=dt;
 if(grassTimer>5){
  grassTimer=0;
  const cx=Math.floor(px),cy=Math.floor(py);
  let spread=0;
  for(let t=0;t<8&&spread<2;t++){
   const x=cx+(Math.floor(Math.random()*9)-4);
   const y=cy+(Math.floor(Math.random()*9)-4);
   if(x>=0&&x<W&&y>=0&&y<H-1 && get(x,y)==1 && get(x,y+1)==2){
    w[(y+1)*W+x]=1;
    spread++;
    updateSkyColumn(x);
   }
  }
 }

 // Mob Üretici (Spawner): Yakındaki 48 bloklarından mob doğur\n let spawnerTimer=0;\n spawnerTimer+=dt;\n if(spawnerTimer>2){\n  spawnerTimer=0;\n  const pcx=px+pw/2,pcy=py+ph/2;\n  let totalMobs=mobs.filter(m=>!m.dead).length;\n  if(totalMobs<16){\n   for(let y=Math.max(0,Math.floor(pcy)-6);y<=Math.min(H-1,Math.floor(pcy)+6)&&totalMobs<16;y++){\n    for(let x=Math.max(0,Math.floor(pcx)-6);x<=Math.min(W-1,Math.floor(pcx)+6)&&totalMobs<16;x++){\n     if(get(x,y)==48){\n      const spawnY=y-1;\n      if(!get(x,spawnY)&&!getBg(x,spawnY)&&solid(x,spawnY+1)){\n       const type=Math.random()<0.5?'z':'s';\n       mobs.push(newMob(type,x+0.15,spawnY));\n       totalMobs++;\n      }\n     }\n    }\n   }\n  }\n }\n\n // Mobları güncelle\n updateMobs(dt);\n updateArrows(dt);
 
 // Hasar titremesi
 hurtT=Math.max(0,hurtT-dt);
 shakeT=Math.max(0,shakeT-dt);

 // Panel yenileme (Döküm yakını değişince)
 panT+=dt;
 if(panT>.4){
  panT=0;
  if(pan.style.display=='block'&&nearForge()!==lastNF)renderPan();
 }

 // Kamera takibi
 const tw=VW/S,th=VH/S;
 camX+=(px+pw/2-tw/2-camX)*Math.min(1,dt*8);
 camY+=(py+ph/2-th/2-camY)*Math.min(1,dt*8);
 camX=Math.max(0,Math.min(Math.max(0,W-tw),camX));
 camY=Math.max(0,Math.min(Math.max(0,H-th),camY));
}

// ==================== BAŞLANGIÇ EKRANI ====================
const ss=document.getElementById('startscreen');
const seedInput=document.getElementById('seedinput');
const worldList=document.getElementById('worldlist');
let gameStarted=false;

function renderWorldList(){
 const saves=listSaves();
 let html='';
 if(saves.length===0)html='<div style="font-size:12px;opacity:.6;padding:8px">Kayıtlı dünya yok</div>';
 else{
  saves.forEach(d=>{
   const date=new Date(d.time).toLocaleString('tr-TR');
   html+=`<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,.1);cursor:pointer" onclick="loadSlot(${d.slot})">
    <div style="font-weight:700">Slot ${d.slot+1}</div>
    <div style="font-size:12px;opacity:.8">Seed: ${d.seed?.toFixed?.(0)??'-'} · ${date}</div>
   </div>`;
  });
 }
 worldList.innerHTML=html;
}

window.loadSlot=(slot)=>{
 if(loadGameSlot(slot)){ss.style.display='none';gameStarted=true;startLoop();}
};

renderWorldList();

document.getElementById('startbtn').addEventListener('click',()=>{
 const val=seedInput.value.trim();
 const s=val?parseFloat(val):null;
 newWorld(s);
 ss.style.display='none';
 gameStarted=true;
 startLoop();
});

function startLoop(){
 showName();
 let last=performance.now();
 function loop(n){
  const dt=Math.min(.05,(n-last)/1000);
  last=n;
  update(dt);
  draw();
  requestAnimationFrame(loop);
 }
 requestAnimationFrame(loop);
}

// Başlangıç ekranındayken döngüyü çalıştırma
if(!gameStarted){
 ss.style.display='flex';
 // İlk karede canvası temizle
 g.fillStyle='#0a0f1e';g.fillRect(0,0,VW,VH);
}
