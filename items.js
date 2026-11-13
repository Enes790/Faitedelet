// items.js — Eşya tanımları, envanter, craft mantığı

// ---------- eşya tanımları ----------
const NAME={1:'Çimen',2:'Toprak',3:'Taş',4:'Odun',5:'Yaprak',6:'Kum',7:'Kalas',8:'Kömür',9:'Çubuk',10:'Odun kazma',11:'Taş kazma',12:'Tahta balta',13:'Tahta kürek',14:'Meşale',15:'Demir cevheri',16:'Demir',17:'Taş balta',18:'Taş kürek',19:'Döküm Bloğu',20:'Cevher Topu',21:'Demir Kılıç',22:'Çürük Et',23:'Gübre',24:'Cam Topu',25:'Kemik'};
const IC={...BASE,9:'#8a6a35',10:'#b8864b',11:'#9a9a9a',12:'#c08a4a',13:'#a0a0a0',16:'#c0c0c0',17:'#9a9a9a',18:'#9a9a9a',20:'#a0a0a0',21:'#d0d0d0',24:'#a0e0f0',25:'#e6e2d0'};
const GL={9:'╱',10:'⛏',11:'⛏',12:'🪓',13:'⚒',14:'🔥',17:'🪓',18:'⚒',19:'⚒',20:'●',21:'🗡',22:'🍖',23:'🌱',24:'❄',25:'🦴'};
const REC=[
 [7,4,{4:1},0],[9,4,{7:2},0],[14,4,{8:2,9:1},0],
 [10,1,{7:3,9:2},0],[11,1,{3:3,9:2},0],
 [12,1,{7:3,9:2},0],[13,1,{7:1,9:2},0],
 [17,1,{3:3,9:2},0],[18,1,{3:1,9:2},0],
 [19,1,{7:4,16:1,8:4},0],
 [21,1,{16:2,9:1},0],
 [20,4,{16:2,8:2},1],[24,2,{20:1,6:2,16:1},1],
 [23,2,{25:1},0],[23,2,{22:1,2:1},0],
];
const HARD={1:1.0,2:1.0,3:5.0,4:2.2,5:0.5,6:1.2,7:2.2,8:6.0,14:0.6,15:7.5,19:5.0};
const PLACE=new Set([2,3,4,5,6,7,8,14,19]);

// ---------- eşya yardımcıları ----------
const canUse=id=>PLACE.has(id)||id==23;
const isTool=id=>TOOL_SET.has(id);
const stackMax=id=>isTool(id)?1:MAXS;
const badge=s=>s.n>1?'<span class="n">'+s.n+'</span>':'';
const icon=id=>'<i class="ic" style="background:'+IC[id]+'">'+(GL[id]||'')+'</i>';

function count(id){let c=0;for(const s of slots)if(s&&s.id==id)c+=s.n;return c}
function room(id){const m=stackMax(id);for(const s of slots){if(!s||(s.id==id&&s.n<m))return true}return false}
function addItem(id,n){n=n||1;const m=stackMax(id);
 for(let i=0;i<NS&&n>0;i++){const s=slots[i];if(s&&s.id==id&&s.n<m){const a=Math.min(n,m-s.n);s.n+=a;n-=a}}
 for(let i=0;i<NS&&n>0;i++){if(!slots[i]){const a=Math.min(n,m);slots[i]={id,n:a};n-=a}}
 refresh();return n}
function take(id,n){for(let i=NS-1;i>=0&&n>0;i--){const s=slots[i];if(s&&s.id==id){const a=Math.min(n,s.n);s.n-=a;n-=a;if(!s.n)slots[i]=null}}refresh()}

function nearForge(){const cx=Math.floor(px+pw/2),cy=Math.floor(py+ph/2);
 for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++){if(inBounds(x,y)&&w[y*W+x]==19)return true}return false}

// ---------- alet seviyeleri ----------
const pickLv=()=>count(11)>0?2:count(10)>0?1:0;
const axeLv=()=>count(17)>0?2:count(12)>0?1:0;
const shovelLv=()=>count(18)>0?2:count(13)>0?1:0;
const hasSword=()=>count(21)>0;
const needsTool=b=>b==15&&pickLv()<2;

const mineTime=b=>{
 if(b==3||b==8||b==15||b==19)return HARD[b]/[1,2.2,3.8][pickLv()];
 if(b==4||b==7)return HARD[b]/[1,2.8,4.2][axeLv()];
 if(b==1||b==2||b==6||b==14)return HARD[b]/[1,2.8,4.2][shovelLv()];
 return HARD[b]||1;
};

// ---------- craft mantığı ----------
const hasIng=r=>Object.keys(r[2]).every(k=>count(+k)>=r[2][k]);
const canCraft=(r,nf)=>hasIng(r)&&!(isTool(r[0])&&count(r[0])>0)&&(!r[3]||nf);
const batches=r=>isTool(r[0])?1:Math.min(...Object.keys(r[2]).map(k=>Math.floor(count(+k)/r[2][k])));
function craftOnce(i){const r=REC[i];if(!canCraft(r,nearForge()))return false;
 for(const k in r[2])take(+k,r[2][k]);
 const left=addItem(r[0],r[1]);
 if(left>0)for(let n=0;n<left;n++)drops.push({x:px+pw/2,y:py,vy:-4,b:r[0],age:0});
 return true}
function craft(i,all){if(!all){craftOnce(i);return}let n=0;while(n<16&&craftOnce(i))n++}