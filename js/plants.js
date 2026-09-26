import {Entity} from './entities.js';
import {CFG, PL} from './config.js';
import {Pea, Needle, Shell, Wind, PercentBlade} from './projectiles.js';
import {Heal} from './effects.js';
import {col} from './utils.js';

// ============ MİNİ FİLİZ ============
export class Mini extends Entity {
  constructor(r, c, x, y, w, h){
    super(x, y, w, h);
    this.row = r;
    this.col = c;
    this.hp = 1000;
    this.mhp = 1000;
    this.cd = 0;
  }
  update(dt, g){
    this.hp -= CFG.MINI_DECAY * dt;
    if(this.hp <= 0){ this.alive = 0; return; }
    this.cd -= dt;
    if(this.cd <= 0 && g.zombies.some(z => z.alive && z.row===this.row && z.x > this.x+this.w)){
      this.cd = 1;
      g.peas.push(new Pea(this.x+this.w, this.y+this.h*.35, this.row, 10, null));
    }
  }
  hit(d){ this.hp -= d; if(this.hp <= 0) this.alive = 0; }
  draw(ctx){
    const r = this.hp/this.mhp;
    const cx = this.x+this.w/2;
    ctx.fillStyle="#3d2817";
    ctx.beginPath(); ctx.ellipse(cx, this.y+this.h*.85, this.w*.42, this.h*.12, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle="#2e7d32";
    ctx.fillRect(cx-2, this.y+this.h*.45, 4, this.h*.4);
    ctx.fillStyle="#66bb6a";
    ctx.beginPath(); ctx.ellipse(cx-this.w*.18, this.y+this.h*.5, this.w*.18, this.h*.08, -.5, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+this.w*.18, this.y+this.h*.5, this.w*.18, this.h*.08, .5, 0, 6.28); ctx.fill();
    ctx.fillStyle="#a5d6a7";
    ctx.beginPath(); ctx.arc(cx, this.y+this.h*.32, this.w*.13, 0, 6.28); ctx.fill();
    ctx.strokeStyle="#1e8449"; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle="#000"; ctx.fillRect(this.x, this.y-4, this.w, 3);
    ctx.fillStyle = r<.3 ? "#e74c3c" : (r<.6 ? "#f39c12" : "#2ecc71");
    ctx.fillRect(this.x, this.y-4, this.w*r, 3);
  }
}

// ============ ÇİZİM FONKSİYONLARI ============
function drawBase(p, ctx){
  const armed = p.type!=="mine" || p.armTimer<=0;
  ctx.fillStyle = armed ? p.color : "#555";
  ctx.fillRect(p.x+2, p.y+2, p.w-4, p.h-4);
  if(p.type==="shifaci" && p.shield>0){
    ctx.strokeStyle="#3498db"; ctx.lineWidth=2;
    ctx.strokeRect(p.x+1, p.y+1, p.w-2, p.h-2);
  }
  ctx.font=`${p.h*.55}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(p.em, p.x+p.w/2, p.y+p.h/2);
  if(p.type==="shifaci"){
    const pct = 1 - p.cd/PL.shifaci.cd;
    ctx.strokeStyle="#a8f0c8"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(p.x+p.w*.82, p.y+p.h*.18, p.h*.12, -1.57, -1.57+pct*6.28);
    ctx.stroke();
  }
  if(p.type==="mine" && !armed){
    ctx.strokeStyle="#f00"; ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(p.x+6, p.y+6); ctx.lineTo(p.x+p.w-6, p.y+p.h-6);
    ctx.moveTo(p.x+p.w-6, p.y+6); ctx.lineTo(p.x+6, p.y+p.h-6);
    ctx.stroke();
  }
}

function drawSpike(p, ctx){
  ctx.fillStyle="#6b4226";
  ctx.fillRect(p.x+2, p.y+p.h*.55, p.w-4, p.h*.4);
  ctx.fillStyle="#a8724a";
  const n=5, sw=(p.w-4)/n;
  for(let i=0;i<n;i++){
    const sx = p.x+2+i*sw+sw/2;
    const sy = p.y+p.h*.55;
    ctx.beginPath();
    ctx.moveTo(sx-sw*.35, sy);
    ctx.lineTo(sx, sy-p.h*.32);
    ctx.lineTo(sx+sw*.35, sy);
    ctx.closePath(); ctx.fill();
  }
}

function drawAnka(p, ctx){
  const pu = .45+.25*Math.sin(performance.now()/180);
  ctx.fillStyle=`rgba(230,126,34,${pu})`;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.strokeStyle=`rgba(255,200,120,${pu+.2})`;
  ctx.lineWidth=2;
  ctx.strokeRect(p.x, p.y, p.w, p.h);
  ctx.font=`${p.h*.6}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("👻", p.x+p.w/2, p.y+p.h/2);
}

function drawAna(p, ctx){
  const cx = p.x+p.w/2;
  ctx.fillStyle="#3d2817";
  ctx.beginPath(); ctx.ellipse(cx, p.y+p.h*.88, p.w*.42, p.h*.12, 0, 0, 6.28); ctx.fill();
  ctx.fillStyle="#2e7d32";
  ctx.fillRect(cx-3, p.y+p.h*.35, 6, p.h*.5);
  ctx.fillStyle="#4caf50";
  ctx.beginPath(); ctx.ellipse(cx-p.w*.2, p.y+p.h*.42, p.w*.2, p.h*.09, -.5, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+p.w*.2, p.y+p.h*.42, p.w*.2, p.h*.09, .5, 0, 6.28); ctx.fill();
  ctx.strokeStyle="#5d4037"; ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(cx, p.y+p.h*.8); ctx.lineTo(cx-p.w*.25, p.y+p.h*.98);
  ctx.moveTo(cx, p.y+p.h*.8); ctx.lineTo(cx, p.y+p.h*.98);
  ctx.moveTo(cx, p.y+p.h*.8); ctx.lineTo(cx+p.w*.25, p.y+p.h*.98);
  ctx.stroke();
  ctx.fillStyle="#a5d6a7";
  ctx.beginPath(); ctx.arc(cx, p.y+p.h*.28, p.w*.14, 0, 6.28); ctx.fill();
  ctx.strokeStyle="#1e8449"; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.arc(cx-p.w*.08, p.y+p.h*.55, p.w*.05, 0, 6.28);
  ctx.arc(cx+p.w*.08, p.y+p.h*.55, p.w*.05, 0, 6.28);
  ctx.fill();
  ctx.fillStyle="#000";
  ctx.beginPath();
  ctx.arc(cx-p.w*.07, p.y+p.h*.55, p.w*.025, 0, 6.28);
  ctx.arc(cx+p.w*.09, p.y+p.h*.55, p.w*.025, 0, 6.28);
  ctx.fill();
  if(p.burstCount > 0){
    const pu = .5+.5*Math.sin(performance.now()/80);
    ctx.strokeStyle=`rgba(255,60,0,${pu})`;
    ctx.lineWidth=3;
    ctx.strokeRect(p.x+1, p.y+1, p.w-2, p.h-2);
  } else if(p.restTimer > 0){
    ctx.strokeStyle="rgba(180,180,180,.6)";
    ctx.lineWidth=2;
    ctx.setLineDash([4,4]);
    ctx.strokeRect(p.x+1, p.y+1, p.w-2, p.h-2);
    ctx.setLineDash([]);
  }
}

function drawAlev(p, ctx){
  const cx = p.x+p.w/2, cy = p.y+p.h*.38;
  const pu = .3+.2*Math.sin(performance.now()/200);
  ctx.fillStyle=`rgba(255,140,40,${pu})`;
  ctx.beginPath(); ctx.arc(cx, p.y+p.h*.5, p.w*.5, 0, 6.28); ctx.fill();
  ctx.fillStyle="#2e7d32";
  ctx.beginPath(); ctx.ellipse(cx-p.w*.22, p.y+p.h*.82, p.w*.16, p.h*.09, -.4, 0, 6.28); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+p.w*.22, p.y+p.h*.82, p.w*.16, p.h*.09, .4, 0, 6.28); ctx.fill();
  const cs = ["#e74c3c","#ff5722","#ff8c00","#ff5722","#e74c3c"];
  for(let i=0; i<5; i++){
    const a = (i/5)*6.28-1.57;
    ctx.fillStyle=cs[i];
    ctx.beginPath();
    ctx.arc(cx+Math.cos(a)*p.w*.22, cy+Math.sin(a)*p.h*.2, p.w*.13, 0, 6.28);
    ctx.fill();
  }
  ctx.fillStyle="#ffd700";
  ctx.beginPath(); ctx.arc(cx, cy, p.w*.12, 0, 6.28); ctx.fill();
  ctx.fillStyle="#ff5722";
  ctx.beginPath(); ctx.arc(cx, cy, p.w*.07, 0, 6.28); ctx.fill();
}

function drawCehennem(p, ctx){
  const cx = p.x+p.w/2;
  const cy = p.y+p.h*.5;
  ctx.fillStyle="#4a1a1a";
  ctx.beginPath();
  ctx.moveTo(cx-p.w*.35, p.y+p.h*.85);
  ctx.lineTo(cx, p.y+p.h*.2);
  ctx.lineTo(cx+p.w*.35, p.y+p.h*.85);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle="#ff4500";
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(cx-p.w*.15, p.y+p.h*.5);
  ctx.lineTo(cx, p.y+p.h*.3);
  ctx.lineTo(cx+p.w*.15, p.y+p.h*.5);
  ctx.stroke();
  ctx.font=`${p.h*.5}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("🌋", cx, p.y+p.h*.65);
  if(p.laserTarget && p.laserTarget.alive){
    const tx = p.laserTarget.x + p.laserTarget.w/2;
    const ty = p.laserTarget.y + p.laserTarget.h/2;
    let thick = 2;
    if(p.rampTime >= 8) thick = 6;
    else if(p.rampTime >= 6) thick = 5;
    else if(p.rampTime >= 4) thick = 4;
    else if(p.rampTime >= 2) thick = 3;
    ctx.strokeStyle = `rgba(255,80,0,0.4)`;
    ctx.lineWidth = thick + 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.strokeStyle = p.rampTime >= 8 ? "#ffe066" : "#ff4500";
    ctx.lineWidth = thick;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }
}

function drawBuzul(p, ctx, board){
  if(board){
    const r0 = Math.max(0, p.row-1);
    const r1 = Math.min(board.rows-1, p.row+1);
    const c0 = Math.max(0, p.col-1);
    const c1 = Math.min(board.cols-1, p.col+1);
    for(let r=r0; r<=r1; r++){
      for(let c=c0; c<=c1; c++){
        const x = board.ox + c*board.cw;
        const y = board.oy + r*board.ch;
        ctx.fillStyle = "rgba(100,180,255,0.18)";
        ctx.fillRect(x, y, board.cw, board.ch);
      }
    }
  }
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x+2, p.y+2, p.w-4, p.h-4);
  ctx.strokeStyle = "#29b6f6";
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x+1, p.y+1, p.w-2, p.h-2);
  ctx.font=`${p.h*.55}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(p.em, p.x+p.w/2, p.y+p.h/2);
}

function drawSariCicek(p, ctx){
  const cx = p.x+p.w/2, cy = p.y+p.h/2;
  const cs = ["#ffd700","#ffec70","#ffd700","#ffec70","#ffd700"];
  for(let i=0; i<5; i++){
    const a = (i/5)*6.28-1.57;
    ctx.fillStyle=cs[i];
    ctx.beginPath();
    ctx.arc(cx+Math.cos(a)*p.w*.24, cy+Math.sin(a)*p.h*.24, p.w*.15, 0, 6.28);
    ctx.fill();
  }
  ctx.fillStyle="#f39c12";
  ctx.beginPath(); ctx.arc(cx, cy, p.w*.14, 0, 6.28); ctx.fill();
  ctx.font=`${p.h*.35}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("🌼", cx, cy);
}

function drawHancer(p, ctx){
  ctx.fillStyle="#7f8c8d";
  ctx.fillRect(p.x+2, p.y+2, p.w-4, p.h-4);
  ctx.strokeStyle="#bdc3c7";
  ctx.lineWidth=2;
  ctx.strokeRect(p.x+1, p.y+1, p.w-2, p.h-2);
  ctx.font=`${p.h*.55}px serif`;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("🗡️", p.x+p.w/2, p.y+p.h/2);
}

const DW = {
  spike:drawSpike,
  anakok:drawAna,
  alev:drawAlev,
  cehennem:drawCehennem,
  buzul:drawBuzul,
  saricicek:drawSariCicek,
  hançer:drawHancer
};

// ============ BİTKİ DAVRANIŞLARI ============
const findFirst = (p, g) => {
  let t=null, bx=1e9;
  for(const z of g.zombies){
    if(!z.alive || z.row!==p.row) continue;
    if(z.x > p.x+p.w && z.x < bx){ bx=z.x; t=z; }
  }
  return t;
};

export const BH = {
  sunflower(p, dt, g){
    p.sunTimer -= dt;
    if(p.sunTimer <= 0){
      p.sunTimer = PL.sunflower.rate;
      g.spawnSun(p.x+p.w/2, p.y+p.h/2);
    }
  },
  peashooter(p, dt, g){
    p.cd -= dt;
    if(p.cd<=0 && g.zombieInRow(p.row, p.x+p.w)){
      p.cd = PL.peashooter.cd;
      g.peas.push(new Pea(p.x+p.w, p.y+p.h*.35, p.row, PL.peashooter.dmg, null));
    }
  },
  // === SARİ ÇİÇEK — düz Pea + pasif güneş ===
  saricicek(p, dt, g){
    p.cd -= dt;
    if(p.cd <= 0 && g.zombieInRow(p.row, p.x+p.w)){
      p.cd = PL.saricicek.cd;
      g.peas.push(new Pea(p.x+p.w, p.y+p.h*.35, p.row, PL.saricicek.dmg, null));
    }
    p.sunTimer -= dt;
    if(p.sunTimer <= 0){
      p.sunTimer = PL.saricicek.sunRate;
      g.spawnSun(p.x+p.w/2, p.y+p.h/2);
    }
  },
  // === HANÇER — 10 mermi sonra yok ol, cooldown başlat ===
  hançer(p, dt, g){
    if(p.shotsLeft === undefined){ p.shotsLeft = PL.hançer.shots; p.shotTimer = 0; }
    if(p.shotsLeft <= 0){
      p.alive = 0;
      if(g.board.grid[p.row][p.col] === p) g.board.remove(p.row, p.col);
      if(g.cardCooldowns){
        g.cardCooldowns["hançer"] = PL.hançer.cooldown;
        g.refreshSeeds();
      }
      return;
    }
    p.shotTimer -= dt;
    if(p.shotTimer <= 0){
      p.shotTimer = PL.hançer.interval;
      p.shotsLeft--;
      g.blades.push(new PercentBlade(p.x+p.w, p.y+p.h*.35, p.row));
    }
  },
  anakok(p, dt, g){
    if(p.restTimer > 0){ p.restTimer -= dt; return; }
    if(p.burstCount > 0){
      p.burstTimer -= dt;
      if(p.burstTimer <= 0){
        const t = findFirst(p, g);
        if(t){
          g.shells.push(new Shell(p.x+p.w*.5, p.y-10, t.x+t.w/2, p.row, PL.anakok.dmg*PL.anakok.bMult, p));
          p.burstCount--;
          p.burstTimer = PL.anakok.bInt;
          if(p.burstCount<=0) p.restTimer = PL.anakok.rest;
        } else { p.burstCount=0; p.restTimer=PL.anakok.rest; }
      }
    } else {
      p.cd -= dt;
      if(p.cd <= 0){
        const t = findFirst(p, g);
        if(t){
          p.cd = PL.anakok.cd;
          g.shells.push(new Shell(p.x+p.w*.5, p.y-10, t.x+t.w/2, p.row, PL.anakok.dmg, p));
        }
      }
    }
  },
  alev(p, dt, g){
    p.cd -= dt;
    if(p.cd <= 0){
      const t = findFirst(p, g);
      if(t){
        p.cd = PL.alev.fire;
        g.shells.push(new Shell(p.x+p.w*.5, p.y-10, t.x+t.w/2, p.row, PL.alev.direct, p));
      }
    }
  },
  ignear(p, dt, g){
    p.cd -= dt;
    const end = p.x+p.w + g.board.cw*PL.ignear.rt;
    if(p.cd<=0 && g.zombies.some(z => z.alive && z.row===p.row && z.x > p.x+p.w && z.x < end)){
      p.cd = PL.ignear.cd;
      g.needles.push(new Needle(p.x+p.w, p.y+p.h*.4, p.row, end));
    }
  },
  mine(p, dt, g){
    if(p.armTimer > 0) p.armTimer -= dt;
    if(p.armTimer<=0 && g.mineTriggered(p)){
      g.explodeMine(p);
      p.alive = 0;
      if(g.board.grid[p.row][p.col]===p) g.board.remove(p.row, p.col);
    }
  },
  spike(p, dt, g){
    p.tickTimer -= dt;
    if(p.tickTimer <= 0){
      p.tickTimer = PL.spike.tick;
      const top = [];
      for(const z of g.zombies){
        if(!z.alive || z.row!==p.row) continue;
        if(col(p.rect, z.rect)) top.push(z);
      }
      for(const z of top.slice(0, PL.spike.max)) z.hit(PL.spike.dmg);
    }
  },
  anka(p, dt, g){
    const near = (cx, r) => {
      let t=null, bd=1e9;
      for(const z of g.zombies){
        if(!z.alive) continue;
        const d = Math.abs(z.x+z.w/2-cx);
        if(d<=r && d<bd){ bd=d; t=z; }
      }
      return t;
    };
    if(p.form === 1){
      p.cd -= dt;
      if(p.cd <= 0){
        const t = near(p.x+p.w/2, p.w*PL.anka.rt);
        if(t){ t.hit(PL.anka.hitD); p.cd = PL.anka.hitCD; }
      }
    } else {
      p.formTimer -= dt;
      if(p.formTimer <= 0){ p.alive = 0; return; }
      const t = near(p.x+p.w/2, p.w*PL.anka.gRT);
      if(t) t.hit(PL.anka.gD * dt);
    }
  },
  shifaci(p, dt, g){
    p.cd -= dt;
    if(p.cd <= 0){
      const max = p.w*PL.shifaci.rt;
      let t = null;
      for(const o of g.plants){
        if(!o.alive || o===p || o.row!==p.row) continue;
        if(o.x > p.x+p.w*.3 && (o.x-p.x) < max && (!t || o.x < t.x)) t = o;
      }
      if(!t && p.hp < p.mhp) t = p;
      if(t){
        t.hp = Math.min(t.mhp, t.hp + PL.shifaci.heal);
        t.shield += PL.shifaci.shield;
        t.healFlash = .9;
        g.effects.push(new Heal(t, PL.shifaci.heal, PL.shifaci.shield));
        p.cd = PL.shifaci.cd;
      }
    }
  },
  // === RÜZGAR — 6 mermi sonra yok ol, cooldown başlat ===
  ruzgar(p, dt, g){
    if(p.shotsLeft === undefined){ p.shotsLeft = PL.ruzgar.shots; p.shotTimer = 0; }
    if(p.shotsLeft <= 0){
      p.alive = 0;
      if(g.board.grid[p.row][p.col] === p) g.board.remove(p.row, p.col);
      if(g.cardCooldowns){
        g.cardCooldowns["ruzgar"] = PL.ruzgar.cooldown;
        g.refreshSeeds();
      }
      return;
    }
    p.shotTimer -= dt;
    if(p.shotTimer <= 0){
      p.shotTimer = PL.ruzgar.interval;
      p.shotsLeft--;
      g.winds.push(new Wind(p.x+p.w, p.y+p.h*.35, p.row, p));
    }
  },
  buzul(p, dt, g){
    if(!p.alive && !p.frozen){
      p.frozen = true;
      const cx = p.x + p.w/2, cy = p.y + p.h/2;
      const r = g.board.cw * PL.buzul.auraR;
      const r2 = r*r;
      for(const z of g.zombies){
        if(!z.alive) continue;
        const zcx = z.x + z.w/2, zcy = z.y + z.h/2;
        if((zcx-cx)**2 + (zcy-cy)**2 < r2){
          z.freezeTimer = PL.buzul.freezeT;
        }
      }
      return;
    }
    if(!p.alive) return;
    const cx = p.x + p.w/2, cy = p.y + p.h/2;
    const r = g.board.cw * PL.buzul.auraR;
    const r2 = r*r;
    for(const z of g.zombies){
      if(!z.alive) continue;
      const zcx = z.x + z.w/2, zcy = z.y + z.h/2;
      if((zcx-cx)**2 + (zcy-cy)**2 < r2){
        z.slowTimer = 0.2;
        z.slowMult = 1 - PL.buzul.slow;
      }
    }
  },
  zipkin(p, dt, g){
    p.cd -= dt;
    const end = p.x + p.w + g.board.cw * PL.zipkin.rt;
    if(p.cd<=0 && g.zombies.some(z => z.alive && z.row===p.row && z.x > p.x+p.w && z.x < end)){
      p.cd = PL.zipkin.cd;
      g.needles.push(new Needle(p.x+p.w, p.y+p.h*.4, p.row, end, PL.zipkin.dmg, PL.zipkin.pierce, false));
    }
  },
  tepkiliMayin(p, dt, g){
    if(p.state === undefined){ p.state = "arming"; p.armTimer = PL.tepkiliMayin.arm; }
    if(p.state === "arming"){
      p.armTimer -= dt;
      if(p.armTimer <= 0) p.state = "ready";
    } else if(p.state === "ready"){
      if(g.mineTriggered(p)){
        g.explodeMine(p);
        p.state = "waiting";
        p.reloadTimer = PL.tepkiliMayin.reload;
      }
    } else if(p.state === "waiting"){
      p.reloadTimer -= dt;
      if(p.reloadTimer <= 0) p.state = "ready";
    }
  },
  cehennem(p, dt, g){
    const t = p.rampTime;
    let dps;
    if(t < 2)        dps = 1.7;
    else if(t < 4)   dps = 10;
    else if(t < 6)   dps = 30;
    else if(t < 8)   dps = 60;
    else             dps = 100;
    const maxX = p.x + p.w + g.board.cw * PL.cehennem.rt;
    let target = null, bx = 1e9;
    for(const z of g.zombies){
      if(!z.alive || z.row !== p.row) continue;
      if(z.x < p.x + p.w) continue;
      if(z.x > maxX) continue;
      if(z.x < bx){ bx = z.x; target = z; }
    }
    if(!target){
      p.rampTime = 0;
      p.laserTarget = null;
      return;
    }
    if(p.laserTarget !== target){
      p.rampTime = 0;
      p.laserTarget = target;
    }
    p.rampTime += dt;
    target.hit(dps * dt);
  }
};

// ============ PLANT ============
export class Plant extends Entity {
  constructor(type, row, c, x, y, w, h){
    super(x, y, w, h);
    this.type = type;
    this.row = row;
    this.col = c;
    const d = PL[type];
    this.hp = d.hp;
    this.mhp = d.hp;
    this.color = d.col;
    this.em = d.em;
    this.cd = 0;
    this.form = 1;
    this.formTimer = 0;
    this.shield = 0;
    this.healFlash = 0;
    this.burstCount = 0;
    this.burstTimer = 0;
    this.restTimer = 0;
    this.frozen = false;
    this.rampTime = 0;
    this.laserTarget = null;
    this.state = undefined;
    this.armTimer = 0;
    this.reloadTimer = 0;
    this.shotsLeft = undefined;
    this.shotTimer = 0;
    if(type==="sunflower") this.sunTimer = d.first;
    if(type==="saricicek") this.sunTimer = d.sunRate;
    if(type==="mine") this.armTimer = d.arm;
    if(type==="spike") this.tickTimer = d.tick;
    if(type==="shifaci") this.cd = d.cd;
  }

  update(dt, g){
    BH[this.type]?.(this, dt, g);
  }

  hit(d){
    if(this.type==="anka" && this.form===2) return;
    if(this.shield > 0){
      if(d <= this.shield){ this.shield -= d; return; }
      d -= this.shield;
      this.shield = 0;
    }
    this.hp -= d;
    if(this.hp <= 0){
      if(this.type==="anka" && this.form===1) this.hp = 0;
      else this.alive = 0;
    }
  }

  draw(ctx, g){
    if(this.type==="anka" && this.form===2){ drawAnka(this, ctx); return; }
    (DW[this.type] || drawBase)(this, ctx, g ? g.board : null);
    if(this.healFlash > 0){
      const a = this.healFlash/.9;
      ctx.fillStyle = `rgba(255,255,255,${a*.6})`;
      ctx.fillRect(this.x+2, this.y+2, this.w-4, this.h-4);
    }
    if(this.type!=="spike" && (this.hp<this.mhp || this.shield>0) && this.hp>0){
      ctx.fillStyle="#000";
      ctx.fillRect(this.x, this.y-4, this.w, 3);
      ctx.fillStyle="#0f0";
      ctx.fillRect(this.x, this.y-4, this.w*(this.hp/this.mhp), 3);
      if(this.shield > 0){
        ctx.fillStyle="#3498db";
        ctx.fillRect(this.x, this.y-7, this.w*Math.min(1, this.shield/(this.mhp*.5)), 2);
      }
    }
  }
}