import {Entity} from './entities.js';
import {CFG, PL} from './config.js';

// ============ PEA (bezelye mermisi) ============
export class Pea extends Entity {
  constructor(x,y,row,dmg,owner){
    super(x,y,14,14);
    this.row=row; this.dmg=dmg; this.owner=owner;
  }
  update(dt,g){
    this.x += CFG.PEA_SPD*dt;
    if(this.x > g.width+30){ this.alive=0; return; }
    let t=null, bx=1e9;
    for(const z of g.zombies){
      if(!z.alive || z.row!==this.row) continue;
      if(this.x < z.x+z.w && this.x+this.w > z.x && this.y < z.y+z.h && this.y+this.h > z.y){
        if(z.x < bx){ bx=z.x; t=z; }
      }
    }
    if(t){
      t.hit(this.dmg);
      if(!t.alive && this.owner && this.owner.alive && this.owner.type==="anakok"){
        g.onMotherKill(this.owner, t);
      }
      this.alive=0;
    }
  }
  draw(ctx){
    ctx.fillStyle="#8bc34a";
    ctx.beginPath(); ctx.arc(this.x+7,this.y+7,7,0,6.28); ctx.fill();
  }
}

// ============ NEEDLE (iğneatar + zıpkın) ============
export class Needle extends Entity {
  constructor(x,y,row,maxX,dmg,pierce,weaken){
    super(x,y,22,10);
    this.row = row;
    this.maxX = maxX;
    this.dmg = dmg !== undefined ? dmg : PL.ignear.dmg;
    this.pierce = pierce !== undefined ? pierce : PL.ignear.pierce;
    this.weaken = weaken !== undefined ? weaken : true;
    this.hits = new Set();
  }
  update(dt,g){
    this.x += CFG.NEEDLE_SPD*dt;
    if(this.x > this.maxX){ this.alive=0; return; }
    for(const z of g.zombies){
      if(!z.alive || z.row!==this.row || this.hits.has(z)) continue;
      if(this.x < z.x+z.w && this.x+this.w > z.x && this.y < z.y+z.h && this.y+this.h > z.y){
        z.hit(this.dmg);
        if(this.weaken) z.weakenTimer = PL.ignear.wt;
        this.hits.add(z);
        if(this.hits.size >= this.pierce){ this.alive=0; return; }
      }
    }
  }
  draw(ctx){
    ctx.fillStyle="#8e44ad";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y+5);
    ctx.lineTo(this.x+15, this.y);
    ctx.lineTo(this.x+22, this.y+5);
    ctx.lineTo(this.x+15, this.y+10);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#d2a4f0"; ctx.lineWidth=1; ctx.stroke();
  }
}

// ============ SHELL (yay mermisi) ============
export class Shell extends Entity {
  constructor(sx, sy, ex, row, dmg, owner){
    super(sx, sy, 22, 22);
    this.sx=sx; this.sy=sy; this.ex=ex;
    this.row=row; this.dmg=dmg; this.owner=owner;
    this.t=0;
  }
  update(dt,g){
    this.t += dt;
    const p = Math.min(1, this.t/CFG.SHELL_DUR);
    this.x = this.sx + (this.ex-this.sx)*p;
    this.y = this.sy - Math.sin(p*Math.PI)*CFG.SHELL_PEAK;
    if(p>=1){ g.explodeShell(this); this.alive=0; }
  }
  draw(ctx){
    const cx=this.x+11, cy=this.y+11;
    const isAna = this.owner && this.owner.type==="anakok";
    const c = isAna
      ? ["#1e8449","#27ae60","#a5d6a7"]
      : ["#e74c3c","#ff8c00","#ffd700"];
    ctx.fillStyle=c[0]; ctx.beginPath(); ctx.arc(cx,cy,11,0,6.28); ctx.fill();
    ctx.fillStyle=c[1]; ctx.beginPath(); ctx.arc(cx,cy,8,0,6.28); ctx.fill();
    ctx.fillStyle=c[2]; ctx.beginPath(); ctx.arc(cx,cy,4,0,6.28); ctx.fill();
  }
}

// ============ WIND (Rüzgar Topu) ============
export class Wind extends Entity {
  constructor(x, y, row, owner){
    super(x, y, 14, 14);
    this.row = row;
    this.owner = owner;
    this.hitZombies = new Set();
    this.maxTargets = 2;
  }
  update(dt, g){
    this.x += 300 * dt;
    if(this.x > g.width + 30){ this.alive = 0; return; }
    if(this.hitZombies.size >= this.maxTargets){ this.alive = 0; return; }
    for(const z of g.zombies){
      if(!z.alive || z.row !== this.row) continue;
      if(this.hitZombies.has(z)) continue;
      if(this.hitZombies.size >= this.maxTargets){ this.alive = 0; return; }
      if(this.x < z.x+z.w && this.x+this.w > z.x &&
         this.y < z.y+z.h && this.y+this.h > z.y){
        const boardRight = g.board.ox + g.board.cols*g.board.cw;
        const zcx = z.x + z.w/2;
        // Dev: ittirilemez, sadece sersemler
        if(z.type === "dev"){
          z.stunTimer = PL.ruzgar.stun;
        } else if(zcx >= boardRight - 30){
          z.stunTimer = PL.ruzgar.stun;
        } else {
          z.x += g.board.cw * PL.ruzgar.push;
        }
        this.hitZombies.add(z);
      }
    }
  }
  draw(ctx){
    ctx.fillStyle = "rgba(200,230,255,0.75)";
    ctx.beginPath(); ctx.arc(this.x+7, this.y+7, 7, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke();
  }
}

// ============ SUN (güneş) ============
export class Sun extends Entity {
  constructor(x,y,targetY){
    super(x-18, y-18, 36, 36);
    this.ty=targetY;
    this.l=CFG.SUN_LIFE;
  }
  update(dt){
    if(this.y+18 < this.ty) this.y += 80*dt;
    this.l -= dt;
    if(this.l<=0) this.alive=0;
  }
  draw(ctx){
    ctx.fillStyle="#ffd700";
    ctx.beginPath(); ctx.arc(this.x+18, this.y+18, 18, 0, 6.28); ctx.fill();
    ctx.strokeStyle="#ffaa00"; ctx.lineWidth=2; ctx.stroke();
    ctx.font="18px serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("☀", this.x+18, this.y+18);
  }
}