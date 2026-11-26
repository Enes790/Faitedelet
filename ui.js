// ui.js — Hotbar, kalpler, envanter paneli

// ==================== DOM ====================
const pan=document.getElementById('panel');
const barEl=document.getElementById('bar');
const selname=document.getElementById('selname');
const mh=document.getElementById('mhud');
const mn=document.getElementById('mn');
const mfill=document.getElementById('mfill');
const heartsEl=document.getElementById('hearts');

// ==================== HIZLI ÇUBUK ====================
const slotEls=[];
for(let i=0;i<9;i++){
 const d=document.createElement('div');
 d.className='slot';
 d.style.position='relative'; // dayanıklılık çubuğu için
 d.addEventListener('pointerdown',e=>{
  e.preventDefault();
  sel=i;
  refresh();
  showName();
 });
 barEl.appendChild(d);
 slotEls.push(d);
}

function renderBar(){
 slotEls.forEach((d,i)=>{
  const s=slots[i];
  d.className='slot'+(i==sel?' sel':'');
  d.innerHTML=s?icon(s.id)+badge(s):'';
 });
}

let snT=0;
function showName(){
 const s=slots[sel];
 selname.textContent=s?NAME[s.id]+(DUR[s.id]?' '+durOf(s)+'/'+DUR[s.id]:'')+(s.n>1?' ×'+s.n:''):'';
 selname.style.opacity=s?1:0;
 clearTimeout(snT);
 snT=setTimeout(()=>{selname.style.opacity=0},1600);
}

function refresh(){
 renderBar();
 if(pan.style.display=='block')renderPan();
}

// ==================== CANLAR ====================
function renderHearts(){
 let h='';
 for(let i=0;i<10;i++){
  const full=(i+1)*2<=playerHp;
  const half=!full&&(i*2+1<=playerHp);
  h+='<div class="heart '+(full?'f':half?'h':'e')+'">♥</div>';
 }
 heartsEl.innerHTML=h;
 lastHpInt=Math.floor(playerHp);
}

renderHearts();

// ==================== ENVANTER PANELİ ====================
const cellHTML=i=>{
 const s=slots[i];
 return '<div class="cell'+(i==sel?' sel':'')+(i===mv?' mv':'')+'" data-s="'+i+'" style="position:relative">'+
  (s?icon(s.id)+badge(s):'')+'</div>';
};

function renderPan(){
 const st=pan.scrollTop;
 const m=mv!=null?slots[mv]:null;
 const nf=nearForge();
 lastNF=nf;

 let h='<h3>Envanter <u id="px">Kapat</u> <u id="newgame" style="color:#ff6b6b">Yeni Oyun</u></h3>';
 h+='<div class="info">';
 if(m){
  h+='Taşınıyor: <b>'+NAME[m.id]+(DUR[m.id]?' ('+durOf(m)+'/'+DUR[m.id]+')':' ×'+m.n)+'</b> — hedef kutuya dokun <u id="drop">At</u>';
 }else{
  h+='Bir eşyaya dokun, sonra başka kutuya dokunarak taşı.';
 }
 if(nf)h+=' <span style="color:#8f8">⚒ Döküm yakınında!</span>';
 h+='</div>';

 h+='<div class="g9">';
 for(let i=9;i<NS;i++)h+=cellHTML(i);
 h+='</div>';

 h+='<div class="sep"></div>';

 h+='<div class="g9">';
 for(let i=0;i<9;i++)h+=cellHTML(i);
 h+='</div>';

 h+='<h3>Üretim <small>';
 h+='Kazma: '+['El','Odun','Taş','Demir','Elmas'][pickLv()];
 h+=' · Balta: '+['El','Tahta','Taş','Demir','Elmas'][axeLv()];
 h+=' · Kılıç: '+['Yok','Tahta','Taş','Demir','Elmas'][swordLv()];
 h+='</small></h3>';

 const list=[];
 REC.forEach((r,i)=>{if(canCraft(r,nf))list.push(i)});

 if(!list.length)h+='<div class="info">Şu an üretebileceğin bir şey yok. Malzeme topla!</div>';

 list.forEach(i=>{
  const r=REC[i];
  const b=batches(r);
  h+='<div class="rc">';
  h+='<div class="ico">'+icon(r[0])+'</div>';
  h+='<span><b>'+NAME[r[0]]+(r[1]>1?' ×'+r[1]:'')+'</b>';
  if(r[3])h+=' <span class="forge">⚒ döküm</span>';
  h+='<br><span style="opacity:.8">';
  h+=Object.keys(r[2]).map(k=>NAME[k]+' '+r[2][k]).join(' + ');
  h+='</span></span>';
  h+='<button data-i="'+i+'">Üret</button>';
  if(b>1)h+='<button class="all" data-i="'+i+'" data-all="1">×'+Math.min(b,16)+'</button>';
  h+='</div>';
 });

 if(!nf&&REC.some(r=>r[3]&&hasIng(r)&&!(isTool(r[0])&&count(r[0])>=2))){
  h+='<div class="info">⚒ Bazı tarifler için Döküm Bloğu yakınında olmalısın.</div>';
 }

 // ---- TAMİR ----
 const dmg=damagedTools();
 if(dmg.length){
  h+='<h3>Tamir</h3>';
  if(!nf){
   h+='<div class="info">⚒ Hasarlı aletlerini Döküm Bloğu yakınında tamir edebilirsin.</div>';
  }else{
   dmg.forEach(i=>{
    const s=slots[i],max=DUR[s.id],r=REPAIR_BY_DUR[max];
    h+='<div class="rc">';
    h+='<div class="ico">'+icon(s.id)+'</div>';
    h+='<span><b>'+NAME[s.id]+'</b> '+durOf(s)+'/'+max;
    h+='<br><span style="opacity:.8">'+NAME[r[0]]+' '+r[1]+' → +%35 ömür</span></span>';
    if(canRepair(i))h+='<button data-rep="'+i+'">Tamir</button>';
    else h+='<span style="opacity:.6;font-size:12px">malzeme yok</span>';
    h+='</div>';
   });
  }
 }

 pan.innerHTML=h;
 pan.scrollTop=st;
}

function cellTap(i){
 if(mv==null){
  if(slots[i])mv=i;
  if(i<9){sel=i;showName()}
 }
 else if(mv==i){
  mv=null;
 }
 else{
  const a=slots[mv],b=slots[i];
  if(a&&b&&a.id==b.id&&!isTool(a.id)){
   const x=Math.min(a.n,MAXS-b.n);
   b.n+=x;
   a.n-=x;
   if(!a.n)slots[mv]=null;
  }else{
   slots[mv]=b;
   slots[i]=a;
  }
  mv=null;
  if(i<9){sel=i;showName()}
 }
 refresh();
}

pan.addEventListener('click',e=>{
 const t=e.target;
 if(t.id=='px'){pan.style.display='none';mv=null;return}
 if(t.id=='newgame'){if(confirm('Yeni oyun başlatmak istediğinizden emin misiniz? Kaydedilen veriler silinecek.')){newGame();pan.style.display='none';return}}
 if(t.id=='drop'){
  if(mv!=null){slots[mv]=null;mv=null;refresh()}
  return;
 }
 const c=t.closest&&t.closest('.cell');
 if(c){cellTap(+c.dataset.s);return}
 const rp=t.closest&&t.closest('button[data-rep]');
 if(rp){repairTool(+rp.dataset.rep);return}
 const b=t.closest&&t.closest('button[data-i]');
 if(b)craft(+b.dataset.i,!!b.dataset.all);
});

function togglePan(){
 const o=pan.style.display=='block';
 pan.style.display=o?'none':'block';
 mv=null;
 if(!o)renderPan();
}

document.getElementById('craft').addEventListener('pointerdown',e=>{
 e.preventDefault();
 togglePan();
});
