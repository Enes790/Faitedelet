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
 craftMatch();
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

 // FIRIN UI
 if(furnaceTx!==0||furnaceTy!==0){
  h+='<h3>Fırın <u id="closeFurnace">Kapat</u></h3>';
  h+='<div style="display:flex;gap:12px;align-items:center;margin:8px 0">';
  // Yakıt yuvası
  h+='<div style="text-align:center">';
  h+='<div style="font-size:11px;opacity:.8">YAKIT</div>';
  h+='<div class="cell" data-fs="0" style="position:relative">'+(furnaceSlot[0]?icon(furnaceSlot[0].id)+(furnaceSlot[0].n>1?'<span class="n">×'+furnaceSlot[0].n+'</span>':''):'')+'</div>';
  h+='</div>';
  // Ok
  h+='<div style="font-size:20px;opacity:.5">→</div>';
  // Girdi
  h+='<div style="text-align:center">';
  h+='<div style="font-size:11px;opacity:.8">GİRDİ</div>';
  h+='<div class="cell" data-fs="1" style="position:relative">'+(furnaceSlot[1]?icon(furnaceSlot[1].id)+(furnaceSlot[1].n>1?'<span class="n">×'+furnaceSlot[1].n+'</span>':''):'')+'</div>';
  h+='</div>';
  // Ok2
  h+='<div style="font-size:20px;opacity:.5">→</div>';
  // Çıktı
  h+='<div style="text-align:center">';
  h+='<div style="font-size:11px;opacity:.8">ÇIKTI</div>';
  h+='<div class="cell" data-fs="2" style="position:relative">'+(furnaceSlot[2]?icon(furnaceSlot[2].id)+(furnaceSlot[2].n>1?'<span class="n">×'+furnaceSlot[2].n+'</span>':''):'')+'</div>';
  h+='</div>';
  h+='</div>';
  // İlerleme çubuğu
  const pct=furnaceCookTime>0?Math.min(1,furnaceCook/furnaceCookTime):0;
  h+='<div style="background:#333;height:8px;border-radius:4px;margin:8px 0;overflow:hidden">';
  h+='<div style="background:#ff6f00;height:100%;width:'+(pct*100)+'%;border-radius:4px"></div>';
  h+='</div>';
  h+='<div style="font-size:11px;opacity:.7">Mesafe uzarsa fırın durur</div>';
  h+='<div class="sep"></div>';
 }

 // Craft grid (Minecraft 3x3)
 h+='<h3>Çözümlenme <small>Eşyaları kareye koy, sonuç çıkacak</small></h3>';
 h+='<div style="display:flex;gap:8px;align-items:flex-start;margin:6px 0">';
 h+='<div class="g9" style="gap:4px">';
 for(let cgi=0;cgi<9;cgi++){
  const s=craftGrid[cgi];
  const selCG = (craftHold&&craftHold.grid===cgi);
  h+='<div class="cell'+(selCG?' sel':'')+'" data-cg="'+cgi+'" style="position:relative">'+(s?icon(s.id)+(s.n>1?'<span class="n">'+s.n+'</span>':''):'')+'</div>';
 }
 h+='</div>';
 h+='<div style="display:flex;flex-direction:column;gap:6px;justify-content:center">';
 if(craftResult){
  h+='<div class="cell" style="position:relative">'+icon(craftResult.id)+'<span class="n">×'+craftResult.n+'</span></div>';
  h+='<button onclick="craftTake()" style="padding:8px 12px;border-radius:6px;border:0;background:#4caf50;color:#fff;font-weight:700;cursor:pointer">AL</button>';
 } else {
  h+='<div class="cell" style="opacity:.25"></div>';
  h+='<button disabled style="padding:8px 12px;border-radius:6px;border:0;background:#666;color:#999;font-weight:700">AL</button>';
 }
 h+='</div>';
 h+='</div>';

 h+='<div class="sep"></div>';
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
 // Craft gridden alınan eşyayı envantere koy
 if(craftHold){
  const s=slots[i];
  if(s&&s.id==craftHold.id&&!isTool(s.id)){s.n+=craftHold.n}
  else slots[i]={id:craftHold.id,n:craftHold.n};
  craftHold=null;
  refresh();return;
 }
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
 if(t.id=='newgame'){if(confirm('Yeni oyun başlatmak istediğinizden emin misiniz? Kaydedilen veriler silinecek.')){newWorld(null);pan.style.display='none';return}}
 if(t.id=='drop'){
  if(mv!=null){slots[mv]=null;mv=null;refresh()}
  return;
 }
 if(t.id=='closeFurnace'){furnaceTx=0;furnaceTy=0;pan.style.display='none';return}
 const cfs=t.closest&&t.closest('[data-fs]');
 if(cfs){furnaceSlotTap(+cfs.dataset.fs);return}
 const cg=t.closest&&t.closest('[data-cg]');
 if(cg){craftGridTap(+cg.dataset.cg);return}
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
 mv=null;craftHold=null;craftResult=null;
 if(!o)renderPan();
}

document.getElementById('craft').addEventListener('pointerdown',e=>{
 e.preventDefault();
 togglePan();
});
