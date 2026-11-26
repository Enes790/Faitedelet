// items.js — Eşya tanımları, envanter, craft mantığı, alet dayanıklılığı

// ==================== EŞYA TANIMLARI ====================
const NAME={
 1:'Çimen',2:'Toprak',3:'Taş',4:'Odun',5:'Yaprak',6:'Kum',7:'Kalas',8:'Kömür',9:'Çubuk',
 10:'Odun kazma',11:'Taş kazma',12:'Tahta balta',13:'Tahta kürek',14:'Meşale',15:'Demir cevheri',
 16:'Demir',17:'Taş balta',18:'Taş kürek',19:'Döküm Bloğu',20:'Cevher Topu',21:'Demir Kılıç',
 22:'Çürük Et',23:'Gübre',24:'Cam Topu',25:'Kemik',
 26:'Tüy',27:'Yumurta',28:'Çiğ Tavuk',
 31:'Kaktüs',
 32:'Demir kazma',33:'Demir balta',34:'Demir kürek',
 35:'Elmas cevheri',36:'Elmas',37:'Elmas Blok',
 38:'Elmas kazma',39:'Elmas balta',40:'Elmas kürek',41:'Elmas kılıç',
 42:'Toprak Vazo',
 43:'Su',
 44:'Tahta Kılıç',45:'Taş Kılıç',46:'Pişmiş Tavuk',
 47:'Sandık',48:'Mob Üretici',
 49:'Ham Balık',50:'Pişmiş Balık',51:'Fırın',52:'Çalışma Masası'
};

const IC={
 ...BASE,
 9:'#8a6a35',10:'#b8864b',11:'#9a9a9a',12:'#c08a4a',13:'#a0a0a0',
 16:'#c0c0c0',17:'#9a9a9a',18:'#9a9a9a',
 20:'#a0a0a0',21:'#d0d0d0',24:'#a0e0f0',25:'#e6e2d0',
 26:'#f0f0f0',27:'#f5f0d0',28:'#e8a080',
 31:'#5a8a3a',
 32:'#e0e0e0',33:'#e0e0e0',34:'#e0e0e0',
 35:'#7f7f7f',36:'#6ee8f0',37:'#6ee8f0',
 38:'#6ee8f0',39:'#6ee8f0',40:'#6ee8f0',41:'#6ee8f0',
 42:'#b06040',
 43:'#3080d0',
 44:'#b8864b',45:'#9a9a9a',46:'#d09050'
};

const GL={
 9:'╱',10:'⛏',11:'⛏',12:'🪓',13:'⚒',14:'🔥',
 17:'🪓',18:'⚒',19:'⚒',20:'●',21:'🗡',22:'🍖',23:'🌱',24:'❄',25:'🦴',
 26:'🪶',27:'🥚',28:'🍗',
 31:'🌵',
 32:'⛏',33:'🪓',34:'⚒',
 36:'💎',37:'💎',38:'⛏',39:'🪓',40:'⚒',41:'🗡',
 42:'🏺',
 43:'💧',
 44:'🗡',45:'🗡',46:'🍗',
 47:'📦',48:'🔥',
 49:'🐟',50:'🍳',51:'🔥',52:'🪵'
};

// [çıktı, adet, {malzeme:adet}, dökümGerekir]
const REC=[
 [7,4,{4:1},0],       // Kalas x4
 [9,4,{7:2},0],       // Çubuk x4
 [14,4,{8:2,9:1},0],  // Meşale x4
 [10,1,{7:3,9:2},0],  // Odun kazma
 [11,1,{3:3,9:2},0],  // Taş kazma
 [12,1,{7:3,9:2},0],  // Tahta balta
 [13,1,{7:1,9:2},0],  // Tahta kürek
 [17,1,{3:3,9:2},0],  // Taş balta
 [18,1,{3:1,9:2},0],  // Taş kürek
 [44,1,{7:2,9:1},0],  // Tahta Kılıç (YENİ)
 [45,1,{3:2,9:1},0],  // Taş Kılıç (YENİ)
 [19,1,{7:4,16:1,8:4},0],  // Döküm Bloğu
 [21,1,{16:2,9:1},0],      // Demir Kılıç
 [20,4,{16:2,8:2},1],      // Cevher Topu (döküm)
 [24,2,{20:1,6:2,16:1},1], // Cam Topu (döküm)
 [46,1,{28:1,8:1},1],      // Pişmiş Tavuk (döküm, 1 kömür) (YENİ)
 [23,2,{25:1},0],          // Gübre (kemik)
 [23,2,{22:1,2:1},0],      // Gübre (çürük et)
 [32,1,{16:3,9:2},0],      // Demir kazma
 [33,1,{16:3,9:2},0],      // Demir balta
 [34,1,{16:1,9:2},0],      // Demir kürek
 [37,1,{36:9},0],          // Elmas Blok (9 elmas)
 [38,1,{36:3,9:2},0],      // Elmas kazma
 [39,1,{36:3,9:2},0],      // Elmas balta
 [40,1,{36:1,9:2},0],      // Elmas kürek
 [41,1,{36:3,9:1},0],      // Elmas kılıç (2 -> 3 elmas)
 [52,1,{4:4},0],           // Çalışma Masası (4 odun)
 [51,1,{3:8},0],           // Fırın (8 taş)
];

const HARD={
 1:1.0,2:1.0,3:5.0,4:2.2,5:0.5,6:1.2,7:2.2,8:6.0,14:0.6,15:7.5,19:5.0,
 31:0.5,35:12.0,37:8.0,42:0.8,43:0.5,47:1.0,48:10.0,49:0.5,50:0.5,51:2.0,52:1.0
};

const PLACE=new Set([2,3,4,5,6,7,8,14,19,31,37,47,48,51,52]);

// ==================== DAYANIKLILIK ====================
// Aletlerin azami kullanım sayısı (malzemeye göre)
const DUR={
 10:40,12:40,13:40,44:40,       // tahta
 11:90,17:90,18:90,45:90,       // taş
 32:250,33:250,34:250,21:250,   // demir
 38:800,39:800,40:800,41:800    // elmas
};

// Her alet türü için seviye sırası: [tahta, taş, demir, elmas]
const TOOLS={
 pick:[10,11,32,38],
 axe:[12,17,33,39],
 shovel:[13,18,34,40],
 sword:[44,45,21,41]
};

// Tamir malzemesi: azami dayanıklılığa göre [malzeme, adet]. Her adet ömrün %35'ini geri verir
const REPAIR_BY_DUR={40:[7,1],90:[3,2],250:[16,1],800:[36,1]};

// Yenilebilir eşyalar: id -> yenilenen can
const FOOD={22:1,28:2,46:5,49:2,50:5};

// ==================== EŞYA YARDIMCILARI ====================
const isTool=id=>DUR[id]!==undefined||TOOL_SET.has(id);
const canUse=id=>PLACE.has(id)||id==23||FOOD[id]!==undefined;
const stackMax=id=>isTool(id)?1:MAXS;
const durOf=s=>s.d===undefined?DUR[s.id]:s.d;

// Dayanıklılık çubuğu: sağlam aletlerde görünmez. Slotun position:relative olması gerekir.
function durBar(s){
 const max=DUR[s.id];if(!max)return'';
 const d=durOf(s);if(d>=max)return'';
 const p=Math.max(0,Math.min(1,d/max));
 const c=p>.5?'#4ac04a':p>.2?'#ffd23c':'#e74c3c';
 return '<span style="position:absolute;left:3px;right:3px;bottom:2px;height:3px;background:rgba(0,0,0,.65);border-radius:2px;pointer-events:none"><b style="display:block;height:100%;width:'+(p*100)+'%;background:'+c+';border-radius:2px"></b></span>';
}
const badge=s=>(s.n>1?'<span class="n">'+s.n+'</span>':'')+durBar(s);
const icon=id=>'<i class="ic" style="background:'+IC[id]+'">'+(GL[id]||'')+'</i>';

function count(id){let c=0;for(const s of slots)if(s&&s.id==id)c+=s.n;return c}
function room(id){const m=stackMax(id);for(const s of slots){if(!s||(s.id==id&&s.n<m))return true}return false}

// d: sadece aletler için kalan dayanıklılık (verilmezse tam dolu)
function addItem(id,n,d){n=n||1;const m=stackMax(id);
 for(let i=0;i<NS&&n>0;i++){const s=slots[i];if(s&&s.id==id&&s.n<m){const a=Math.min(n,m-s.n);s.n+=a;n-=a}}
 for(let i=0;i<NS&&n>0;i++){if(!slots[i]){const a=Math.min(n,m);slots[i]={id,n:a};if(DUR[id]!==undefined)slots[i].d=(d===undefined?DUR[id]:d);n-=a}}
 refresh();return n}
function take(id,n){for(let i=NS-1;i>=0&&n>0;i--){const s=slots[i];if(s&&s.id==id){const a=Math.min(n,s.n);s.n-=a;n-=a;if(!s.n)slots[i]=null}}refresh()}

function nearForge(){const cx=Math.floor(px+pw/2),cy=Math.floor(py+ph/2);
 for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++){if(inBounds(x,y)&&w[y*W+x]==19)return true}return false}

// ==================== ELDE TUTMA (OTOMATİK SEÇİM) ====================
// Her tür için envanterdeki en yüksek seviyeli aleti seçer; aynı seviyede
// iki tane varsa daha çok yıpranmış olanı önce kullanır.
function heldIdx(kind){
 const list=TOOLS[kind];
 for(let lv=3;lv>=0;lv--){
  let best=-1;
  for(let i=0;i<NS;i++){
   const s=slots[i];
   if(s&&s.id==list[lv]&&(best<0||durOf(s)<durOf(slots[best])))best=i;
  }
  if(best>=0)return best;
 }
 return -1;
}
const toolLv=kind=>{const i=heldIdx(kind);return i<0?0:TOOLS[kind].indexOf(slots[i].id)+1};

// ==================== ALET SEVİYELERİ ====================
const pickLv=()=>toolLv('pick');
const axeLv=()=>toolLv('axe');
const shovelLv=()=>toolLv('shovel');
const swordLv=()=>toolLv('sword');
const hasSword=()=>swordLv()>0;
const swordDmg=()=>[1,1.5,2,2.5,3][swordLv()];
const needsTool=b=>(b==15&&pickLv()<2)||(b==35&&pickLv()<3);

const mineTime=b=>{
 if(b==3||b==8||b==15||b==19||b==35||b==37)return HARD[b]/[1,2.2,3.8,6.0,10.0][pickLv()];
 if(b==4||b==7)return HARD[b]/[1,2.8,4.2,7.0,11.0][axeLv()];
 if(b==1||b==2||b==6||b==14||b==31)return HARD[b]/[1,2.8,4.2,7.0,11.0][shovelLv()];
 return HARD[b]||1;
};

// Hangi blok hangi aletle kırılır
const toolKindFor=b=>{
 if(b==3||b==8||b==15||b==19||b==35||b==37)return 'pick';
 if(b==4||b==7)return 'axe';
 if(b==1||b==2||b==6||b==14||b==31)return 'shovel';
 return null;
};

// ==================== YIPRANMA ====================
function wear(kind,amt){
 const i=heldIdx(kind);if(i<0)return;
 const s=slots[i],max=DUR[s.id];
 if(s.d===undefined)s.d=max;
 const old=s.d;s.d-=amt;
 if(s.d<=0){
  slots[i]=null;
  fl.push({x:px+pw/2,y:py-.3,t:1.6,s:NAME[s.id]+' kırıldı!'});
  buzz([40,30,40]);
  refresh();return;
 }
 const thr=max*.1;
 if(old>thr&&s.d<=thr)fl.push({x:px+pw/2,y:py-.3,t:1.6,s:'Alet kırılmak üzere!'});
 refresh();
}
// Blok kırılınca çağır (mineStep içinde). Sert bloklar aleti 2 kat yıpratır.
function onBlockBroken(b){
 const k=toolKindFor(b);if(!k)return;
 wear(k,(HARD[b]||1)>=6?2:1);
}
// Kılıçla vurulunca çağır (strike içinde)
function onStrike(){wear('sword',1)}

// ==================== TAMİR (döküm bloğu yanında) ====================
function damagedTools(){
 const r=[];
 for(let i=0;i<NS;i++){const s=slots[i];if(s&&DUR[s.id]&&durOf(s)<DUR[s.id])r.push(i)}
 return r;
}
function canRepair(i){
 const s=slots[i];if(!s||!DUR[s.id])return false;
 const max=DUR[s.id];if(durOf(s)>=max)return false;
 const r=REPAIR_BY_DUR[max];
 return nearForge()&&count(r[0])>=r[1];
}
function repairTool(i){
 if(!canRepair(i))return false;
 const s=slots[i],max=DUR[s.id],r=REPAIR_BY_DUR[max];
 take(r[0],r[1]);
 s.d=Math.min(max,durOf(s)+Math.ceil(max*.35));
 refresh();return true;
}

// ==================== YEMEK ====================
// Seçili slottaki yemeği yer. useItem() başında çağır.
function eatSel(){
 const s=slots[sel];if(!s||FOOD[s.id]===undefined)return false;
 if(playerHp>=playerMaxHp){fl.push({x:px+pw/2,y:py-.3,t:1.2,s:'Canın dolu'});return false}
 const h=FOOD[s.id];
 playerHp=Math.min(playerMaxHp,playerHp+h);
 s.n--;if(!s.n)slots[sel]=null;
 refresh();renderHearts();
 fl.push({x:px+pw/2,y:py-.3,t:1.2,s:'+'+h+' can'});
 return true;
}

// ==================== CRAFT MANTIĞI ====================
const hasIng=r=>Object.keys(r[2]).every(k=>count(+k)>=r[2][k]);
// Aletlerden en fazla 2 tane (1 yedek) taşınabilir
const canCraft=(r,nf)=>hasIng(r)&&!(isTool(r[0])&&count(r[0])>=2)&&(!r[3]||nf);
const batches=r=>isTool(r[0])?1:Math.min(...Object.keys(r[2]).map(k=>Math.floor(count(+k)/r[2][k])));
function craftOnce(i){const r=REC[i];if(!canCraft(r,nearForge()))return false;
 for(const k in r[2])take(+k,r[2][k]);
 const left=addItem(r[0],r[1]);
 if(left>0)for(let n=0;n<left;n++)drops.push({x:px+pw/2,y:py,vy:-4,b:r[0],age:0,d:DUR[r[0]]});
 return true}
function craft(i,all){
 // Aletler hep tek tek üretilir ("hepsini yap" malzemeyi tüketmesin)
 if(!all||isTool(REC[i][0])){craftOnce(i);return}
 let n=0;while(n<16&&craftOnce(i))n++}

// ==================== MINECRAFT TARZI CRAFT GRID ====================
// Griddeki eşyaları say ve eşleşen tarayı bul (şekilsiz / herhangi bir yere koyulabilir)
function craftMatch(){
 const counts={};
 for(const s of craftGrid){if(s)counts[s.id]=(counts[s.id]||0)+(s.n||1)}
 for(let i=0;i<REC.length;i++){
  const r=REC[i];
  let ok=true;
  for(const k in r[2]){if((counts[+k]||0)<r[2][k]){ok=false;break}}
  if(ok){craftResult={id:r[0],n:r[1],i};return true}
 }
 craftResult=null;
 return false;
}

// Gridden eşya al / bırak (envanter panelinden çağrılır)
function craftGridTap(i){
 const s=craftGrid[i];
 if(mv!=null){
  // Envanterden gride koy (mv = envanter slot indeksi)
  const inv=slots[mv];
  if(inv){
   if(s&&s.id==inv.id&&!isTool(inv.id)){s.n+=inv.n;slots[mv]=null}
   else{craftGrid[i]={id:inv.id,n:inv.n};slots[mv]=null}
  }
  mv=null;
 }
 else if(craftHold==null){
  if(s){craftHold={id:s.id,n:s.n};craftGrid[i]=null}
 }
 else if(typeof craftHold==='number'){
  // Envanterden gride koy
  const inv=slots[craftHold];
  if(inv){
   if(s&&s.id==inv.id&&!isTool(inv.id)){s.n+=inv.n;slots[craftHold]=null}
   else{craftGrid[i]={id:inv.id,n:inv.n};slots[craftHold]=null}
  }
  craftHold=null;
 }
 else {
  // Gridten gride taşı / birleştir
  if(s&&s.id==craftHold.id&&!isTool(s.id)){s.n+=craftHold.n}
  else{craftGrid[i]={id:craftHold.id,n:craftHold.n}}
  craftGrid[craftHold.grid]=null;
  craftHold=null;
 }
 craftMatch();
 refresh();
}

// Craft sonucunu al (malzemeyi gridden tüket, sonucu envantere ekle)
function craftTake(){
 if(!craftResult)return false;
 const r=REC[craftResult.i];
 // Gridden malzemeyi tüket
 for(const k in r[2]){
  let need=r[2][k];
  for(let gi=0;gi<9&&need>0;gi++){
   const gs=craftGrid[gi];
   if(gs&&gs.id==+k){const a=Math.min(need,gs.n);gs.n-=a;need-=a;if(!gs.n)craftGrid[gi]=null}
  }
 }
 const left=addItem(craftResult.id,craftResult.n);
 if(left>0)for(let n=0;n<left;n++)drops.push({x:px+pw/2,y:py,vy:-4,b:craftResult.id,age:0,d:DUR[craftResult.id]});
 craftResult=null;
 craftMatch();
 refresh();
 return true;
}

// Fırın yuvası tıklama (0=yakıt, 1=girdi, 2=çıktı)
function furnaceSlotTap(fs){
 if(craftHold){
  // Elinde eşya var, fırına koy (çıkış yuvasına koyulamaz)
  if(fs===2)return;
  const target=furnaceSlot[fs];
  if(target&&target.id==craftHold.id&&!isTool(target.id)){
   target.n+=craftHold.n;
  }else{
   furnaceSlot[fs]={id:craftHold.id,n:craftHold.n};
  }
  craftHold=null;
  refresh();return;
 }
 if(mv!=null){
  const inv=slots[mv];
  if(inv){
   if(fs===2)return; // çıkışa koyulamaz
   const target=furnaceSlot[fs];
   if(target&&target.id==inv.id&&!isTool(target.id)){
    target.n+=inv.n;
   }else{
    furnaceSlot[fs]={id:inv.id,n:inv.n};
   }
   slots[mv]=null;mv=null;
  }
  refresh();return;
 }
 // El boş, fırından al
 const s=furnaceSlot[fs];
 if(s){
  if(s.id==49||s.id==50){
   // Ham/pişmiş balık envantere al
   addItem(s.id,s.n);
  }else{
   addItem(s.id,s.n);
  }
  furnaceSlot[fs]=null;
  refresh();
 }
}
