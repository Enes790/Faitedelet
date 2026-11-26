// save.js — Slot tabanlı kayıt / yükle (localStorage)
const SAVE_PREFIX='faitedelet_slot_';
const MAX_SLOTS=5;

function encodeWorld(arr){
 let binary='';
 for(let i=0;i<arr.length;i++)binary+=String.fromCharCode(arr[i]);
 return btoa(binary);
}
function decodeWorld(str,length){
 const binary=atob(str);
 const arr=new Uint8Array(length);
 for(let i=0;i<length;i++)arr[i]=binary.charCodeAt(i);
 return arr;
}
function serializeSlots(){
 return slots.map(s=>s?{id:s.id,n:s.n,d:s.d}:null);
}
function deserializeSlots(data){
 if(!data)return;
 for(let i=0;i<NS;i++){
  const s=data[i];
  slots[i]=s?{id:s.id,n:s.n,d:s.d}:null;
 }
}
function listSaves(){
 const out=[];
 for(let i=0;i<MAX_SLOTS;i++){
  const raw=localStorage.getItem(SAVE_PREFIX+i);
  if(raw){try{const d=JSON.parse(raw);d.slot=i;out.push(d)}catch(e){}}
 }
 return out.sort((a,b)=>b.time-a.time);
}
function saveGame(slot){
 const data={
  slot,
  seed,
  time:Date.now(),
  slots:serializeSlots(),
  sel,
  playerHp,playerMaxHp,
  px,py,vx,vy,ground,face,anim,
  tod,todDay,
  w:encodeWorld(w),
  bg:encodeWorld(bg),
 };
 try{
  localStorage.setItem(SAVE_PREFIX+slot,JSON.stringify(data));
  fl.push({x:px+pw/2,y:py-.3,t:1.5,s:'Dünya kaydedildi (slot '+(slot+1)+')'});
  return true;
 }catch(e){
  fl.push({x:px+pw/2,y:py-.3,t:1.5,s:'Kaydetme başarısız'});
  console.error('Save failed',e);
  return false;
 }
}
function loadGameSlot(slot){
 const raw=localStorage.getItem(SAVE_PREFIX+slot);
 if(!raw)return false;
 try{
  const data=JSON.parse(raw);
  // Seed'i geri yükle ve dünyayı yeniden üret
  seed=data.seed??seed;
  generateWorld(seed);

  // Blokları kaydetten override et
  if(data.w){
   const savedW=decodeWorld(data.w,W*H);
   w.set(savedW);
  }
  if(data.bg){
   const savedBg=decodeWorld(data.bg,W*H);
   bg.set(savedBg);
  }
  scanLights();
  computeSkyExposure();

  // Oyuncu durumu
  deserializeSlots(data.slots);
  sel=data.sel??0;
  playerHp=data.playerHp??playerMaxHp;
  playerMaxHp=data.playerMaxHp??20;
  px=data.px??W/2;
  py=data.py??hgt(W/2)-3;
  vx=data.vx??0;
  vy=data.vy??0;
  ground=data.ground??false;
  face=data.face??1;
  anim=data.anim??0;
  tod=data.tod??0;
  todDay=data.todDay??0.5;

  renderHearts();
  refresh();
  showName();
  fl.push({x:px+pw/2,y:py-.3,t:1.5,s:'Dünya yüklendi (slot '+(slot+1)+')'});
  return true;
 }catch(e){
  console.error('Load failed',e);
  return false;
 }
}
function deleteSave(slot){
 localStorage.removeItem(SAVE_PREFIX+slot);
}
function newWorld(seedVal){
 // Mevcut kaydı temizle (slotlara bağlı değil, sadece mevcut oyun durumu)
 seed=seedVal??Math.random()*1000;
 generateWorld(seed);
 scanLights();
 computeSkyExposure();
// Oyuncu sıfırla
 for(let i=0;i<NS;i++)slots[i]=null;
 for(let i=0;i<9;i++)craftGrid[i]=null;
 craftHold=null;craftResult=null;
 sel=0;
 addItem(2,10);
 addItem(7,12);
 playerHp=playerMaxHp;
 px=W/2;py=hgt(W/2)-3;vx=0;vy=0;ground=false;face=1;anim=0;
 tod=0;todDay=0.5;
 renderHearts();
 refresh();
 showName();
 fl.push({x:px+pw/2,y:py-.3,t:1.5,s:'Yeni dünya'});
}
function autoSaveCurrentSlot(){
 // Eğer mevcut bir slot yüklüyse ona kaydet, yoksa ilk boş slota
 for(let i=0;i<MAX_SLOTS;i++){
  if(localStorage.getItem(SAVE_PREFIX+i)){saveGame(i);return}
 }
 // Hiç kayıt yoksa slot 0'a kaydet
 saveGame(0);
}
