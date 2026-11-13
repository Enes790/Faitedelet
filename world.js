// world.js — Dünya erişimi, üretim, blok dokuları, çatlaklar, ışık cache

// ---------- dünya erişim ----------
function get(x,y){if(x<0||x>=W||y>=H)return 3;if(y<0)return 0;return w[y*W+x]}
function getBg(x,y){if(x<0||x>=W||y<0||y>=H)return 0;return bg[y*W+x]}
function solid(x,y){const b=get(x,y);return b!==0&&!NONSOLID.has(b)}

function plantTree(x,h,t){
 if(h-t-2<0||x<2||x>W-3)return false;
 for(let i=1;i<=t;i++)if(w[(h-i)*W+x]||bg[(h-i)*W+x])return false;
 for(let i=1;i<=t;i++)bg[(h-i)*W+x]=4;
 for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=0;dy++){const X=x+dx,Y=h-t+dy;
  if(inBounds(X,Y)&&!w[Y*W+X]&&!bg[Y*W+X]&&!(Math.abs(dx)==2&&dy==-2))bg[Y*W+X]=5}
 const ty=h-t-2;if(!w[ty*W+x]&&!bg[ty*W+x])bg[ty*W+x]=5;
 return true}

// ---------- dünya üretimi ----------
(function gen(){
 // 1. Yüzey + taş
 for(let x=0;x<W;x++){const h=hgt(x),sandy=h>=29;
  for(let y=h;y<H;y++){const d=y-h;let b;
   if(sandy&&d<3)b=6;else if(d==0)b=1;else if(d<4)b=2;else b=3;
   w[y*W+x]=b}}

 // 2. Tüneller (random walk, oda, dallanma)
 function carveRoom(cx,cy){
  const r=3+Math.floor(Math.random()*2);
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   if(dx*dx+dy*dy>r*r)continue;
   if(Math.random()<0.15)continue;
   const tx=cx+dx,ty=cy+dy;
   if(inBounds(tx,ty)&&w[ty*W+tx]===3)w[ty*W+tx]=0;
  }
 }
 function carveTunnel(sx,sy,length){
  let x=sx,y=sy,dir=Math.floor(Math.random()*4),width=1,sinceChange=0;
  for(let step=0;step<length;step++){
   sinceChange++;
   // Yumuşak yön değişimi (%20, 180° dönüş yok)
   if(sinceChange>2&&Math.random()<0.2){
    const options=[0,1,2,3].filter(d=>{
     if(dir===0&&d===1)return false;
     if(dir===1&&d===0)return false;
     if(dir===2&&d===3)return false;
     if(dir===3&&d===2)return false;
     return true;
    });
    dir=options[Math.floor(Math.random()*options.length)];
    sinceChange=0;
   }
   // Değişken genişlik (%10)
   if(Math.random()<0.1)width=1+Math.floor(Math.random()*2);
   // Hareket
   if(dir===0)x++;else if(dir===1)x--;else if(dir===2)y++;else y--;
   // Sınır kontrol
   if(x<3||x>W-4||y<6||y>H-3)break;
   const surf=hgt(x);
   if(y<surf+3)break;
   // Yuvarlak tünel kaz
   for(let dy=-width;dy<=width;dy++)for(let dx=-width;dx<=width;dx++){
    if(dx*dx+dy*dy<=width*width){
     const tx=x+dx,ty=y+dy;
     if(inBounds(tx,ty)&&w[ty*W+tx]===3)w[ty*W+tx]=0;
    }
   }
   // Pürüzlü kenar (%30)
   if(Math.random()<0.3){
    const d=Math.floor(Math.random()*4);
    let px=x,py=y;
    if(d===0)py--;else if(d===1)py++;else if(d===2)px--;else px++;
    if(inBounds(px,py)&&w[py*W+px]===3)w[py*W+px]=0;
   }
   // Oda ihtimali (%3 her adım)
   if(Math.random()<0.03)carveRoom(x,y);
   // Dallanma (%5)
   if(Math.random()<0.05){
    let bx=x,by=y,bdir=Math.floor(Math.random()*4);
    for(let bstep=0;bstep<15+Math.floor(Math.random()*15);bstep++){
     if(bdir===0)bx++;else if(bdir===1)bx--;else if(bdir===2)by++;else by--;
     if(bx<3||bx>W-4||by<6||by>H-3)break;
     const bsurf=hgt(bx);
     if(by<bsurf+3)break;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(dx*dx+dy*dy<=1){
       const tx=bx+dx,ty=by+dy;
       if(inBounds(tx,ty)&&w[ty*W+tx]===3)w[ty*W+tx]=0;
      }
     }
    }
   }
  }
 }
 const tunnelCount=Math.floor(W/28);
 for(let i=0;i<tunnelCount;i++){
  const sx=5+Math.floor(Math.random()*(W-10));
  const surf=hgt(sx);
  const sy=surf+5+Math.floor(Math.random()*(H-surf-10));
  if(sy>=H-3)continue;
  carveTunnel(sx,sy,30+Math.floor(Math.random()*30));
 }

 // 3. Ağaçlar (tünelden sonra, sadece sağlam çimene)
 for(let x=3;x<W-3;x+=4+Math.floor(Math.random()*5)){const h=hgt(x);if(w[h*W+x]!=1)continue;
  plantTree(x,h,3+Math.floor(Math.random()*2))}

 // 4. Cevher damarları (komşu kontrolü — havada cevher yok)
 function vein(x,y,type,size){let cx=x,cy=y;
  for(let i=0;i<size;i++){
   if(inBounds(cx,cy)&&w[cy*W+cx]==3){
    let stoneN=0;
    if(cx+1<W&&w[cy*W+cx+1]===3)stoneN++;
    if(cx-1>=0&&w[cy*W+cx-1]===3)stoneN++;
    if(cy+1<H&&w[(cy+1)*W+cx]===3)stoneN++;
    if(cy-1>=0&&w[(cy-1)*W+cx]===3)stoneN++;
    if(stoneN>=2)w[cy*W+cx]=type;
   }
   const d=Math.floor(Math.random()*4);
   if(d==0)cx++;else if(d==1)cx--;else if(d==2)cy++;else cy--;
  }}
 function scatter(type,n,minD,sMin,sMax){
  for(let i=0;i<n;i++){const x=Math.floor(Math.random()*W),surf=hgt(x);
   const y=surf+minD+Math.floor(Math.random()*Math.max(1,H-1-surf-minD));
   vein(x,y,type,sMin+Math.floor(Math.random()*(sMax-sMin+1)))}}
 scatter(8,240,3,4,8);
 scatter(15,180,8,2,6);
})();

function scanLights(){lights=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const b=w[y*W+x];if(b==14||b==19)lights.push([x,y,b])}}
scanLights();

function computeSkyExposure(){
 for(let x=0;x<W;x++){
  let exposed=1;
  for(let y=0;y<H;y++){
   skyExposed[y*W+x]=exposed;
   if(w[y*W+x]!==0)exposed=0;
  }
 }
}
function updateSkyColumn(x){
 let exposed=1;
 for(let y=0;y<H;y++){
  skyExposed[y*W+x]=exposed;
  if(w[y*W+x]!==0)exposed=0;
 }
}
computeSkyExposure();

// ---------- ışık cache ----------
const lightCache={};
function getLightTex(R,glow){
 const key=(glow?'g':'d')+R;
 if(lightCache[key])return lightCache[key];
 const c=document.createElement('canvas');c.width=c.height=R*2;
 const lx=c.getContext('2d');
 const grad=lx.createRadialGradient(R,R,0,R,R,R);
 const col=glow?'255,200,90':'0,0,0';
 grad.addColorStop(0,'rgba('+col+',1)');
 if(glow)grad.addColorStop(1,'rgba('+col+',0)');
 else{grad.addColorStop(.6,'rgba('+col+',.7)');grad.addColorStop(1,'rgba('+col+',0)')}
 lx.fillStyle=grad;lx.beginPath();lx.arc(R,R,R,0,6.283);lx.fill();
 return lightCache[key]=c;
}

// ---------- blok dokusu ----------
function tile(b,x,y,X,Y,g){
 const now=Date.now();
 if(b==14){
   const flicker=Math.sin(now/100+X*2.7)*0.5+0.5;
   g.fillStyle='rgba(255,180,60,'+(0.15+flicker*0.15)+')';
   g.beginPath();g.arc(x+S*.5,y+S*.35,S*.4,0,6.283);g.fill();
   g.fillStyle='#2a1a08';g.fillRect(x+S*.43,y+S*.5,S*.14,S*.5);
   g.fillStyle='#6b4a24';g.fillRect(x+S*.45,y+S*.5,S*.10,S*.5);
   g.fillStyle='#8a6030';g.fillRect(x+S*.45,y+S*.5,S*.04,S*.5);
   g.fillStyle='#cc5500';g.fillRect(x+S*.40,y+S*.30,S*.20,S*.22);
   g.fillStyle='#ff8c00';g.fillRect(x+S*.42,y+S*.26,S*.16,S*.18);
   g.fillStyle='#ffcc33';g.fillRect(x+S*.45,y+S*.22,S*.10,S*.13);
   g.fillStyle='#ffee88';g.fillRect(x+S*.48,y+S*.25,S*.04,S*.08);
   g.fillStyle='rgba(255,255,200,'+flicker+')';g.fillRect(x+S*.47,y+S*.28,S*.02,S*.02);
   return;
 }
 if(b==19){
   const flicker=Math.sin(now/150+X*1.5)*0.5+0.5;
   g.fillStyle='#2a2a2a';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#4a4a4a';g.fillRect(x+2,y+2,S-4,S-4);
   g.fillStyle='#3a3a3a';g.fillRect(x+4,y+4,S-8,S-8);
   g.fillStyle='#1a1a1a';g.fillRect(x+S*.2,y+S*.2,S*.6,S*.6);
   g.fillStyle='rgba(255,120,0,'+(0.5+flicker*0.4)+')';
   g.fillRect(x+S*.3,y+S*.35,S*.4,S*.35);
   g.fillStyle='rgba(255,200,60,'+(0.6+flicker*0.4)+')';
   g.fillRect(x+S*.38,y+S*.42,S*.24,S*.22);
   g.fillStyle='rgba(255,255,180,'+(0.7+flicker*0.3)+')';
   g.fillRect(x+S*.43,y+S*.48,S*.14,S*.12);
   g.fillStyle='#666';
   g.fillRect(x+4,y+4,3,3);g.fillRect(x+S-7,y+4,3,3);
   g.fillRect(x+4,y+S-7,3,3);g.fillRect(x+S-7,y+S-7,3,3);
   return;
 }
 if(b==1){
   g.fillStyle='#6b4828';g.fillRect(x,y,S+1,S+1);
   for(let n=0;n<6;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.8,oy=S*.35+((r>>3)&7)/8*S*.6,sz=S*.1;
     g.fillStyle='#4a2a18';g.fillRect(x+ox,y+oy,sz,sz);
   }
   g.fillStyle='#3d7020';g.fillRect(x,y,S+1,Math.ceil(S*.32));
   g.fillStyle='#5aa832';g.fillRect(x,y,S+1,Math.ceil(S*.24));
   for(let i=0;i<S;i+=2){
     const r=((X*97+i*31)>>>0)%5;
     const h=S*.18+r*S*.02;
     g.fillStyle='#5aa832';g.fillRect(x+i,y,2,h);
     g.fillStyle='#7acc4a';g.fillRect(x+i,y,1,h);
   }
   for(let n=0;n<4;n++){
     const r=(((X*1827364+Y*987654)^(n*998877))>>>0);
     const ox=(r&7)/8*S*.8,oy=((r>>3)&7)/8*S*.2;
     g.fillStyle='#8add5a';g.fillRect(x+ox,y+oy,2,1);
   }
   return;
 }
 if(b==2){
   g.fillStyle='#6b4828';g.fillRect(x,y,S+1,S+1);
   for(let n=0;n<12;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.9,oy=((r>>3)&7)/8*S*.9,sz=S*(0.08+(r&3)*0.02);
     g.fillStyle=n%3===0?'#4a2a18':(n%3===1?'#7a5838':'#5a3820');
     g.fillRect(x+ox,y+oy,sz,sz);
   }
   for(let n=0;n<3;n++){
     const r=(((X*364578+Y*658709)^(n*667788))>>>0);
     const ox=(r&7)/8*S*.85,oy=((r>>3)&7)/8*S*.85;
     g.fillStyle='#8a8a7a';g.fillRect(x+ox,y+oy,2,2);
     g.fillStyle='#a0a090';g.fillRect(x+ox,y+oy,1,1);
   }
   g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,y+S-1,S+1,1);
   return;
 }
 if(b==3){
   g.fillStyle='#6a6e73';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#8b8f96';g.fillRect(x+1,y+1,S-1,S-1);
   for(let n=0;n<10;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.9,oy=((r>>3)&7)/8*S*.9,sz=S*(0.1+(r&3)*0.03);
     g.fillStyle=n%3===0?'#a0a4a8':(n%3===1?'#70737a':'#9a9ea3');
     g.fillRect(x+ox,y+oy,sz,sz);
   }
   g.strokeStyle='rgba(40,40,45,.6)';g.lineWidth=1;
   g.beginPath();
   g.moveTo(x+S*.2,y+S*.15);g.lineTo(x+S*.3,y+S*.35);g.lineTo(x+S*.25,y+S*.6);
   g.moveTo(x+S*.7,y+S*.25);g.lineTo(x+S*.8,y+S*.5);g.lineTo(x+S*.75,y+S*.85);
   g.moveTo(x+S*.5,y+S*.45);g.lineTo(x+S*.55,y+S*.7);
   g.stroke();
   g.strokeStyle='rgba(180,180,185,.3)';g.lineWidth=1;
   g.beginPath();g.moveTo(x+S*.3,y+S*.16);g.lineTo(x+S*.35,y+S*.34);g.stroke();
   g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y,1,S);g.fillRect(x,y,S,1);
   g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x,y+S-1,S,1);g.fillRect(x+S-1,y,1,S);
   return;
 }
 if(b==4){
   g.fillStyle='#5a3f1a';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#7d5328';g.fillRect(x+2,y,S-3,S+1);
   for(let i=2;i<S-2;i+=3){
     const shade=((X*97+i*13)>>>0)%3;
     g.fillStyle=shade===0?'#5a3820':(shade===1?'#8a6038':'#6b4a24');
     g.fillRect(x+i,y,1+(i%2),S+1);
   }
   for(let n=0;n<2;n++){
     const r=(((X*876543+Y*234567)^(n*112233))>>>0);
     const ox=(r&7)/8*S*.5+S*.25,oy=((r>>3)&7)/8*S*.6+S*.2;
     g.fillStyle='#3a2210';g.fillRect(x+ox,y+oy,3,3);
     g.fillStyle='#5a3820';g.fillRect(x+ox+1,y+oy+1,1,1);
   }
   g.fillStyle='#4a3010';g.fillRect(x,y,2,S);g.fillRect(x+S-2,y,2,S);
   g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y+S-1,S,1);
   return;
 }
 if(b==5){
   g.fillStyle='#1f5a2a';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#2f7d2a';g.fillRect(x+1,y+1,S-1,S-1);
   for(let n=0;n<7;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.85,oy=((r>>3)&7)/8*S*.85,sz=S*(0.15+(r&3)*0.04);
     g.fillStyle=n%3===0?'#3fa83a':(n%3===1?'#4ac04a':'#2a6a25');
     g.fillRect(x+ox,y+oy,sz,sz);
   }
   for(let n=0;n<3;n++){
     const r=(((X*928374+Y*567483)^(n*778899))>>>0);
     const ox=(r&7)/8*S*.7+S*.15,oy=((r>>3)&7)/8*S*.7+S*.15;
     g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x+ox,y+oy,2,2);
   }
   g.fillStyle='rgba(120,255,140,.15)';g.fillRect(x+1,y+1,S-2,2);
   return;
 }
 if(b==6){
   g.fillStyle='#c9b878';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#e0d08a';g.fillRect(x+1,y+1,S-1,S-1);
   for(let n=0;n<15;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.9,oy=((r>>3)&7)/8*S*.9,sz=1+(r&1);
     g.fillStyle=n%3===0?'#d8c878':(n%3===1?'#b8a868':'#f0e0a0');
     g.fillRect(x+ox,y+oy,sz,sz);
   }
   for(let i=0;i<S;i+=6){
     g.fillStyle='rgba(180,160,90,.3)';
     g.fillRect(x+i,y+S*.3,3,1);g.fillRect(x+i+3,y+S*.6,3,1);
   }
   return;
 }
 if(b==7){
   g.fillStyle='#a07840';g.fillRect(x,y,S+1,S+1);
   const plankH=S/3;
   for(let i=0;i<3;i++){
     g.fillStyle=i%2===0?'#b8864b':'#a67838';
     g.fillRect(x,y+i*plankH,S+1,plankH);
     g.fillStyle='rgba(80,50,20,.4)';
     g.fillRect(x,y+i*plankH+plankH-1,S+1,1);
     for(let j=0;j<3;j++){
       const r=(((X*374761393+Y*668265263)^(i*1274126177+j*456789))>>>0);
       const ox=(r&7)/8*S*.8,oy=i*plankH+((r>>3)&3)/4*plankH;
       g.fillStyle='rgba(90,60,30,.3)';g.fillRect(x+ox,y+oy,2,1);
     }
   }
   g.fillStyle='rgba(80,50,20,.3)';g.fillRect(x+S*.5,y,1,S);
   return;
 }
 if(b==8||b==15){
   g.fillStyle='#6a6e73';g.fillRect(x,y,S+1,S+1);
   g.fillStyle='#8b8f96';g.fillRect(x+1,y+1,S-1,S-1);
   for(let n=0;n<5;n++){
     const r=(((X*374761393+Y*668265263)^(n*1274126177))>>>0);
     const ox=(r&7)/8*S*.85,oy=((r>>3)&7)/8*S*.85;
     g.fillStyle=n%2?'#a0a4a8':'#70737a';g.fillRect(x+ox,y+oy,2,2);
   }
   for(let n=0;n<5;n++){
     const r=(((X*973917+Y*567483)^(n*782919))>>>0);
     const ox=4+(r&7)/8*(S-12),oy=4+((r>>3)&7)/8*(S-12),sz=3+(r&3);
     if(b==8){
       g.fillStyle='#0a0a0a';g.fillRect(x+ox,y+oy,sz,sz);
       g.fillStyle='#1a1a1a';g.fillRect(x+ox+1,y+oy+1,sz-2,sz-2);
       g.fillStyle='#3a3a3a';g.fillRect(x+ox,y+oy,1,1);
     }else{
       g.fillStyle='#b87333';g.fillRect(x+ox,y+oy,sz,sz);
       g.fillStyle='#d4a373';g.fillRect(x+ox+1,y+oy+1,sz-2,sz-2);
       g.fillStyle='#f0c090';g.fillRect(x+ox,y+oy,1,1);
       g.fillStyle='#8a4a1a';g.fillRect(x+ox+sz-1,y+oy+sz-1,1,1);
     }
   }
   return;
 }
 g.fillStyle=BASE[b]||'#f0f';g.fillRect(x,y,S+1,S+1);
}
function tileTex(b,v){const key=b+'_'+v;let c=tileCache.get(key);if(c)return c;
 c=document.createElement('canvas');c.width=c.height=Math.ceil((S+1)*dpr);
 const cx=c.getContext('2d');cx.setTransform(dpr,0,0,dpr,0,0);
 tile(b,0,0,v*37+5,v*91+11,cx);tileCache.set(key,c);return c}
function drawTile(b,x,y,X,Y){
 if(b==14||b==19){tile(b,x,y,X,Y,g);return}
 const v=(((X*73856093)^(Y*19349663))>>>0)%8;
 g.drawImage(tileTex(b,v),x,y,S+1,S+1)}

// ---------- kırma çatlakları ----------
const CR=[];(function(){let r=12345;const rnd=()=>(r=(r*1664525+1013904223)>>>0)/4294967296;
 const pts=[[.5,.5]];
 for(let i=0;i<16;i++){const p=pts[Math.floor(rnd()*pts.length)],a=rnd()*6.283,l=.14+rnd()*.14;
  const bx=Math.max(.04,Math.min(.96,p[0]+Math.cos(a)*l)),by=Math.max(.04,Math.min(.96,p[1]+Math.sin(a)*l));
  CR.push([p[0],p[1],bx,by]);pts.push([bx,by])}})();
function drawCrack(x,y,p,X,Y){
 g.fillStyle='rgba(0,0,0,'+(p*.42)+')';g.fillRect(x,y,S,S);
 const n=Math.max(1,Math.ceil(p*CR.length)),h=((X*73856093)^(Y*19349663))>>>0,fx=h&1,fy=(h>>1)&1;
 g.lineCap='square';
 for(let pass=0;pass<3;pass++){
  if(pass===0){g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=Math.max(1,S/24)}
  else if(pass===1){g.strokeStyle='rgba(10,10,10,.9)';g.lineWidth=Math.max(2,S/14)}
  else{g.strokeStyle='rgba(80,80,80,.5)';g.lineWidth=Math.max(1,S/22)}
  g.beginPath();
  for(let i=0;i<n;i++){const s=CR[i];let x1=s[0],y1=s[1],x2=s[2],y2=s[3];
   if(fx){x1=1-x1;x2=1-x2}if(fy){y1=1-y1;y2=1-y2}
   const o=pass===0?1:0;
   g.moveTo(x+x1*S+o,y+y1*S+o);g.lineTo(x+x2*S+o,y+y2*S+o)}
  g.stroke()}
}