// debug.js — Hata yakalayıcı + ekran üstü debug paneli
// index.html'de game.js'ten SONRA yüklenmeli: <script src="debug.js"></script>
(function(){
 const DBG={on:true,errs:[],errCount:0,frames:0,fps:0,lastDraw:performance.now(),fixed:0,lastFlag:''};
 window.DBG=DBG;

 // ---------- hata kaydı ----------
 function logErr(where,e){
  DBG.errCount++;
  const stack=String((e&&e.stack)||'').split('\n').slice(1,3)
   .map(s=>s.trim().replace(/^at /,'').replace(/https?:\/\/[^/]+\//g,'').replace(/\(|\)/g,'')).join(' | ');
  const msg=where+': '+((e&&e.message)||e)+(stack?' @ '+stack:'');
  if(DBG.errs[0]!==msg)DBG.errs=[msg].concat(DBG.errs).slice(0,4);
 }
 addEventListener('error',e=>logErr('global',{message:e.message,stack:'x\n'+(e.filename||'').split('/').pop()+':'+e.lineno}));
 addEventListener('unhandledrejection',e=>logErr('promise',e.reason));

 // ---------- canvas durumunu sıfırla (yarım kalan kare bozmasın) ----------
 function resetCtx(){
  for(const c of [g,dg]){
   c.setTransform(dpr,0,0,dpr,0,0);
   c.globalAlpha=1;c.globalCompositeOperation='source-over';
   c.setLineDash([]);c.textAlign='left';
  }
 }

 // ---------- update / draw sarmalayıcıları ----------
 const _update=window.update,_draw=window.draw;
 window.update=function(dt){
  try{_update(dt)}catch(e){logErr('update',e)}
  // güvenlik ağı: bozuk sayıları düzelt
  if(!isFinite(px+py+vx+vy)){
   px=W/2;py=hgt(W/2)-3;vx=0;vy=0;DBG.fixed++;
   logErr('FIX','konum bozuldu (NaN), sıfırlandı');
  }
  if(!isFinite(armA)){armA=1.4;DBG.fixed++;logErr('FIX','kol açısı bozuldu (NaN)')}
  if(!isFinite(camX+camY)){camX=px-VW/S/2;camY=py-VH/S/2;DBG.fixed++;logErr('FIX','kamera bozuldu (NaN)')}
 };
 window.draw=function(){
  resetCtx();
  try{_draw()}catch(e){logErr('draw',e);resetCtx()}
  DBG.lastDraw=performance.now();
  DBG.frames++;
 };

 // ---------- panel ----------
 const box=document.createElement('div');
 box.style.cssText='position:fixed;left:8px;top:calc(96px + env(safe-area-inset-top,0px));z-index:90;max-width:62vw;background:rgba(0,0,0,.72);color:#9f9;font:10px/1.35 monospace;padding:5px 7px;border-radius:6px;pointer-events:none;white-space:pre-wrap;word-break:break-all';
 document.body.appendChild(box);

 const warn=document.createElement('div');
 warn.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(6px + env(safe-area-inset-bottom,0px));z-index:90;max-width:92vw;background:rgba(120,0,0,.85);color:#fff;font:10px/1.3 monospace;padding:4px 8px;border-radius:6px;pointer-events:none;white-space:pre-wrap;word-break:break-all;display:none';
 document.body.appendChild(warn);

 const btn=document.createElement('div');
 btn.textContent='🐞';
 btn.style.cssText='position:fixed;right:6px;top:50%;z-index:91;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:16px;touch-action:none';
 btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();DBG.on=!DBG.on;update_panel()});
 document.body.appendChild(btn);

 function update_panel(){
  const now=performance.now();
  // FPS
  DBG.fps=DBG.frames;DBG.frames=0;

  // kritik değişkenlerde bozuk sayı var mı
  const vals={px,py,vx,vy,camX,camY,armA,playerHp,todDay};
  const bad=Object.keys(vals).filter(k=>!isFinite(vals[k]));

  // karakter ekranda mı
  const sX=(px-camX)*S,sY=(py-camY)*S;
  const offscreen=sX<-S||sX>VW+S||sY<-S*2||sY>VH+S;
  const frozen=now-DBG.lastDraw>1500;

  const flags=[];
  if(frozen)flags.push('DONDU: çizim durdu');
  if(bad.length)flags.push('BOZUK: '+bad.join(','));
  if(offscreen)flags.push('KARAKTER EKRAN DIŞI');
  if(DBG.errCount)flags.push('hata sayısı '+DBG.errCount);
  DBG.lastFlag=flags.join(' | ');

  // her zaman görünen kırmızı uyarı (panel kapalı olsa bile)
  if(flags.length||DBG.errs.length){
   warn.style.display='block';
   warn.textContent=(flags.join(' | ')+(DBG.errs[0]?'\n'+DBG.errs[0]:'')).slice(0,260);
  }else warn.style.display='none';

  if(!DBG.on){box.style.display='none';return}
  box.style.display='block';

  const surf=hgt(Math.max(0,Math.min(W-1,Math.floor(px))));
  const sk=inBounds(Math.floor(px),Math.floor(py))?skyExposed[Math.floor(py)*W+Math.floor(px)]:-1;
  const f=n=>isFinite(n)?n.toFixed(1):'NaN';
  let t='FPS '+DBG.fps+'  hata '+DBG.errCount+'  düzelt '+DBG.fixed+'\n';
  t+='x '+f(px)+' y '+f(py)+'  vx '+f(vx)+' vy '+f(vy)+' zemin '+(ground?1:0)+'\n';
  t+='derinlik '+f(py-surf)+' (yüzey '+surf+')  su '+(inWater(px,py)?1:0)+'\n';
  t+='kam '+f(camX)+'/'+f(camY)+'  ekran '+Math.round(sX)+','+Math.round(sY)+'  S '+S+'\n';
  t+='can '+f(playerHp)+'/'+playerMaxHp+'  gün '+f(todDay)+'  gökışık '+sk+'\n';
  t+='mob '+mobs.length+' drop '+drops.length+' parça '+parts.length+' ok '+arrows.length+' fx '+fl.length+' pop '+pops.length+'\n';
  t+='ışık '+lights.length+'  tileC '+tileCache.size+'  lightC '+Object.keys(lightCache).length+'\n';
  if(flags.length)t+='! '+flags.join(' | ')+'\n';
  for(const e of DBG.errs.slice(0,2))t+='> '+e.slice(0,140)+'\n';
  box.style.color=(flags.length||DBG.errs.length)?'#ffb0b0':'#9f9';
  box.textContent=t;
 }
 setInterval(update_panel,1000);
 update_panel();
})();
