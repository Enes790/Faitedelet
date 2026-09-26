// Oyun ayarları
export const CFG = {
  COLS:9, ROWS:5,
  SUN0:50, SUNVAL:25,
  SKY_MIN:8, SKY_MAX:12, SUN_LIFE:12,
  ZFIRST:20,
  PEA_SPD:380, NEEDLE_SPD:280,
  MINE_R:1.4,
  MINI_DECAY:50,
  SHELL_DUR:.9, SHELL_PEAK:120,
  MAX_SLOTS:7,
  BURN_D:10,
  ZCAP_EARLY:8,
  ZCAP_LATE:10
};

// Bitkiler
export const PL = {
  sunflower:{n:"Ayçiçeği",c:50,hp:300,col:"#ffd700",em:"🌻",rate:20,first:5},
  peashooter:{n:"Bezelye",c:100,hp:300,col:"#4caf50",em:"🌱",dmg:25,cd:1.2},
  wallnut:{n:"Ceviz",c:50,hp:4000,col:"#8b5a2b",em:"🌰"},
  mine:{n:"Mayın",c:25,hp:300,col:"#c0392b",em:"💣",arm:15,dmg:400,max:3},
  ignear:{n:"İğneatar",c:125,hp:300,col:"#8e44ad",em:"🏹",dmg:15,cd:1.8,pierce:3,rt:4.5,wt:1.5,wm:.6},
  spike:{n:"Diken",c:75,hp:300,col:"#6b4226",em:"🪵",dmg:15,tick:1,max:4},
  anka:{n:"Anka",c:75,hp:700,col:"#e67e22",em:"🌺",hitD:15,hitCD:1.4,rt:1,gT:8,gD:65,gRT:1.5},
  shifaci:{n:"Şifacı",c:75,hp:300,col:"#2ecc71",em:"⚕️",heal:600,shield:150,cd:20,rt:1.5},
  anakok:{n:"Ana Kök",c:100,hp:300,col:"#27ae60",em:"🪴",dmg:60,cd:3,burst:3,bInt:.3,bMult:3,rest:4},
  alev:{n:"Alev Çiçeği",c:100,hp:300,col:"#e74c3c",em:"🔥",fire:5,direct:15,bT:6,max:3,lRT:1.5},
  ruzgar:{n:"Rüzgar Topu",c:25,hp:300,col:"#90caf9",em:"🌪️",shots:6,interval:0.5,push:0.70,stun:0.3,cooldown:7},
  buzul:{n:"Buzul Çiçeği",c:75,hp:500,col:"#4fc3f7",em:"🧊",slow:0.3,auraR:1.5,freezeT:3},
  zipkin:{n:"Zıpkın",c:125,hp:300,col:"#8d6e63",em:"🎣",dmg:20,cd:2.1,pierce:5,rt:4.5},
  tepkiliMayin:{n:"Tepkili Mayın",c:150,hp:300,col:"#7b1fa2",em:"💣",dmg:400,max:3,arm:15,reload:25},
  cehennem:{n:"Cehennem Çiçeği",c:175,hp:300,col:"#c0392b",em:"🌋",rt:4.5},
  saricicek:{n:"Sarı Çiçek",c:50,hp:300,col:"#f39c12",em:"🌼",dmg:8,cd:1,sunRate:20,sunVal:15,killBonus:35},
  hançer:{n:"Hançer",c:25,hp:200,col:"#7f8c8d",em:"🗡️",shots:10,interval:0.4,minDmg:20,maxDmg:35,percent:0.07,cooldown:5}
};

// Zombiler
export const ZB = {
  normal:{n:"Normal", hp:240, spd:7, dmg:100, col:"#7a3b3b"},
  runner:{n:"Koşucu", hp:360, spd:10, dmg:150, col:"#b85a3b"},
  armored:{n:"Zırlı", hp:1440, spd:7, dmg:150, col:"#4a4a5a"},
  kralice:{n:"Kraliçe", hp:275, spd:6, dmg:40, col:"#8e44ad"},
  boksor:{n:"Boksör", hp:450, spd:6, dmg:200, col:"#c0392b"},
  dev:{n:"Dev", hp:1500, spd:4, dmg:300, col:"#6b4226"}
};

// Zombi rozetleri
export const BADGE = {
  runner:"💨",
  armored:"🛡️",
  kralice:"👑",
  boksor:"🥊",
  dev:"🦣"
};