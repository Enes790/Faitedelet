// state.js — Tüm global sabitler ve değişkenler

// ==================== CANVAS ====================
const cv=document.getElementById('c'),g=cv.getContext('2d');
const dc=document.createElement('canvas'),dg=dc.getContext('2d');

// ==================== SABİTLER ====================
const W=650,H=90,pw=.7,ph=1.8,REACH=4.5,RD2=42;
const BASE={1:'#7a5230',2:'#7a5230',3:'#7f7f7f',4:'#6b4a24',5:'#2f7d2a',6:'#e0d08a',7:'#b8864b',8:'#7f7f7f',14:'#ff8c00',15:'#7f7f7f',19:'#4a4a4a',22:'#5a7a3a',23:'#3a2a1a',31:'#5a8a3a',35:'#7f7f7f',37:'#6ee8f0',42:'#b06040',43:'#3080d0'};
const SPK={1:'#5e3f22',2:'#5e3f22',3:'#6a6a6a',5:'#245f20',6:'#c9b870',8:'#6a6a6a',15:'#d4a373',35:'#3ac8d8'};
const NONSOLID=new Set([14,43,45]);
const MAXS=64,NS=27;
const TOOL_SET=new Set([10,11,12,13,17,18,21,32,33,34,38,39,40,41]);

// ==================== DÜNYA VERİSİ ====================
const w=new Uint8Array(W*H),bg=new Uint8Array(W*H);
const tileCache=new Map();
let seed=window.chosenSeed??(Math.random()*1000);
const hgt=x=>Math.floor(24+Math.sin(x*.07+seed)*5+Math.sin(x*.19+seed*2)*2.5+Math.sin(x*.023+seed)*6);
const inBounds=(x,y)=>x>=0&&x<W&&y>=0&&y<H;
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

// ==================== ENVANTER ====================
const slots=new Array(NS).fill(null);
let sel=0,mv=null;
// Crafting grid (Minecraft 3x3)
const craftGrid=new Array(9).fill(null);
let craftHold=null;   // gridden alınan eşya
let craftResult=null; // {id,n,i} recipe sonucu

// ==================== OYUN DURUMU ====================
let lights=[];
const skyExposed=new Uint8Array(W*H);
let px=W/2,py=hgt(W/2)+0.2,vx=0,vy=0,ground=false,face=1,anim=0,tod=0,todDay=.5;
let playerHp=20,playerMaxHp=20,hurtT=0,invT=0,attackCd=0,atkT=0,regenTimer=0,lastHpInt=20,shakeT=0,sayCd=0,panT=0,lastNF=false;
let VW=0,VH=0,S=40,camX=0,camY=0,dpr=1;
let drops=[],fl=[],parts=[],pops=[],mine=null,projectiles=[],arrows=[];
let actHeld=false,placeHeld=false,placeCd=0,chipT=0,swingT=0,armA=1.4;
let aimX=1,aimY=0,AIM={hit:null,place:null,hitLayer:'w'},sx=0,sy=0,sid=null,jumpBtn=false;
let mobs=[],spawnTimer=0,mobIdCounter=0;