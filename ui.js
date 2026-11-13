// ui.js — Hotbar, kalpler, envanter paneli

// ---------- DOM ----------
const pan=document.getElementById('panel'),barEl=document.getElementById('bar'),selname=document.getElementById('selname');
const mh=document.getElementById('mhud'),mn=document.getElementById('mn'),mfill=document.getElementById('mfill');
const heartsEl=document.getElementById('hearts');

// ---------- hızlı çubuk ----------
const slotEls=[];
for(let i=0;i<9;i++){
  const d=document.createElement('div');d.className='slot';
  d.addEventListener('pointerdown',e=>{e.preventDefault();sel=i;refresh();showName()});
  barEl.appendChild(d);slotEls.push(d);
}
function renderBar(){slotEls.forEach((d,i)=>{const s=slots[i];d.className='slot'+(i==sel?' sel':'');
  d.innerHTML=s?icon(s.id)+badge(s):''})}
let snT=0;
function showName(){const s=slots[sel];selname.textContent=s?NAME[s.id]+(s.n>1?' ×'+s.n:''):'';selname.style.opacity=s?1:0;clearTimeout(snT);snT=setTimeout(()=>{selname.style.opacity=0},1600)}
function refresh(){renderBar();if(pan.style.display=='block')renderPan()}

// ---------- canlar ----------
function renderHearts(){let h='';
 for(let i=0;i<10;i++){const full=(i+1)*2<=playerHp,half=!full&&(i*2+1<=playerHp);
  h+='<div class="heart '+(full?'f':half?'h':'e')+'">♥</div>'}
 heartsEl.innerHTML=h;lastHpInt=Math.floor(playerHp)}
renderHearts();

// ---------- envanter paneli ----------
const cellHTML=i=>{const s=slots[i];return '<div class="cell'+(i==sel?' sel':'')+(i===mv?' mv':'')+'" data-s="'+i+'">'+(s?icon(s.id)+badge(s):'')+'</div>'};
function renderPan(){
 const st=pan.scrollTop,m=mv!=null?slots[mv]:null,nf=nearForge();lastNF=nf;
 let h='<h3>Envanter <u id="px">Kapat</u></h3><div class="info">'+(m?'Taşınıyor: <b>'+NAME[m.id]+' ×'+m.n+'</b> — hedef kutuya dokun <u id="drop">At</u>':'Bir eşyaya dokun, sonra başka kutuya dokunarak taşı.')+(nf?' <span style="color:#8f8">⚒ Döküm yakınında!</span>':'')+'</div>';
 h+='<div class="g9">';for(let i=9;i<NS;i++)h+=cellHTML(i);
 h+='</div><div class="sep"></div><div class="g9">';for(let i=0;i<9;i++)h+=cellHTML(i);h+='</div>';
 h+='<h3>Üretim <small>Kazma: '+['El','Odun','Taş'][pickLv()]+' · Balta: '+['El','Tahta','Taş'][axeLv()]+' · Kılıç: '+(hasSword()?'Var':'Yok')+'</small></h3>';
 const list=[];REC.forEach((r,i)=>{if(canCraft(r,nf))list.push(i)});
 if(!list.length)h+='<div class="info">Şu an üretebileceğin bir şey yok. Malzeme topla!</div>';
 list.forEach(i=>{const r=REC[i],b=batches(r);
  h+='<div class="rc"><div class="ico">'+icon(r[0])+'</div><span><b>'+NAME[r[0]]+(r[1]>1?' ×'+r[1]:'')+'</b>'+(r[3]?' <span class="forge">⚒ döküm</span>':'')+'<br><span style="opacity:.8">'+Object.keys(r[2]).map(k=>NAME[k]+' '+r[2][k]).join(' + ')+'</span></span><button data-i="'+i+'">Üret</button>'+(b>1?'<button class="all" data-i="'+i+'" data-all="1">×'+Math.min(b,16)+'</button>':'')+'</div>'});
 if(!nf&&REC.some(r=>r[3]&&hasIng(r)&&!(isTool(r[0])&&count(r[0])>0)))h+='<div class="info">⚒ Bazı tarifler için Döküm Bloğu yakınında olmalısın.</div>';
 pan.innerHTML=h;pan.scrollTop=st}
function cellTap(i){
 if(mv==null){if(slots[i])mv=i;if(i<9){sel=i;showName()}}
 else if(mv==i){mv=null}
 else{const a=slots[mv],b=slots[i];
  if(a&&b&&a.id==b.id&&!isTool(a.id)){const x=Math.min(a.n,MAXS-b.n);b.n+=x;a.n-=x;if(!a.n)slots[mv]=null}
  else{slots[mv]=b;slots[i]=a}
  mv=null;if(i<9){sel=i;showName()}}
 refresh()}
pan.addEventListener('click',e=>{const t=e.target;
 if(t.id=='px'){pan.style.display='none';mv=null;return}
 if(t.id=='drop'){if(mv!=null){slots[mv]=null;mv=null;refresh()}return}
 const c=t.closest&&t.closest('.cell');if(c){cellTap(+c.dataset.s);return}
 const b=t.closest&&t.closest('button[data-i]');if(b)craft(+b.dataset.i,!!b.dataset.all)});
function togglePan(){const o=pan.style.display=='block';pan.style.display=o?'none':'block';mv=null;if(!o)renderPan()}
document.getElementById('craft').addEventListener('pointerdown',e=>{e.preventDefault();togglePan()});