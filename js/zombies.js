import {Entity} from './entities.js';
import {CFG, ZB, BADGE, PL} from './config.js';

export class Zombie extends Entity {
  constructor(type, row, x, y, w, h){
    super(x, y, w, h);
    this.type = type;
    this.row = row;
    const d = ZB[type];
    this.hp = d.hp;
    this.mhp = d.hp;
    this.speed = d.spd;
    this.dmg = d.dmg;
    this.color = d.col;
    this.weakenTimer = 0;
    this.burnTimer = 0;
    this.stunTimer = 0;
    this.freezeTimer = 0;
    this.slowTimer = 0;
    this.slowMult = 1;
    this.form = 1;
    this.state = "walking";
    this.formTimer = 0;
    this._lastThreshold = 0;
    this.isMini = false;
  }

  update(dt, g){
    if(this.state === "downed"){
      this.formTimer -= dt;
      if(this.formTimer <= 0){
        this.form = 2;
        this.state = "walking";
        this.hp = 300;
        this.mhp = 300;
      }
      return;
    }

    if(this.weakenTimer > 0) this.weakenTimer -= dt;
    if(this.stunTimer > 0) this.stunTimer -= dt;
    if(this.freezeTimer > 0) this.freezeTimer -= dt;
    if(this.slowTimer > 0) this.slowTimer -= dt;

    if(this.burnTimer > 0){
      this.hit(CFG.BURN_D * dt);
      this.burnTimer -= dt;
    }

    if(this.type === "kralice" && this.alive){
      const lost = this.mhp - this.hp;
      const threshold = Math.floor(lost / 50);
      if(threshold > this._lastThreshold){
        this._lastThreshold = threshold;
        g.spawnMiniZombie(this);
      }
    }

    if(this.freezeTimer > 0) return;

    if(this.type === "boksor" && this.form === 1){
      this.x -= this.speed * dt;
      if(this.x + this.w < g.board.ox) g.gameOver();
      return;
    }

    const dmg = this.weakenTimer > 0 ? this.dmg * PL.ignear.wm : this.dmg;
    const target = g.plantInFront(this);

    if(this.stunTimer > 0){
      if(target) target.hit(dmg * dt);
      return;
    }

    let spd = this.speed;
    if(this.slowTimer > 0) spd *= this.slowMult;

    if(target){
      target.hit(dmg * dt);
      if(this.type === "boksor" && this.form === 2){
        const above = this.row - 1;
        const below = this.row + 1;
        for(const p of g.plants){
          if(!p.alive) continue;
          if(p.row === above || p.row === below){
            p.hit(dmg * 0.5 * dt);
          }
        }
      }
    } else {
      this.x -= spd * dt;
    }

    if(this.x + this.w < g.board.ox) g.gameOver();
  }

  hit(d){
    if(this.state === "downed") return;
    this.hp -= d;
    if(this.hp <= 0){
      if(this.type === "boksor" && this.form === 1){
        this.state = "downed";
        this.formTimer = 1.5;
        return;
      }
      this.alive = 0;
    }
  }

  draw(ctx){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    if(this.freezeTimer > 0){
      ctx.fillStyle = "rgba(120,200,255,0.55)";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    } else if(this.slowTimer > 0){
      ctx.fillStyle = "rgba(120,180,255,0.25)";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    if(this.weakenTimer > 0){
      ctx.fillStyle = "rgba(160,80,220,.35)";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    if(this.type === "boksor" && this.form === 2 && this.state !== "downed"){
      ctx.fillStyle = "rgba(255,0,0,0.25)";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    if(this.burnTimer > 0){
      const pu = .4 + .3 * Math.sin(performance.now()/100);
      ctx.fillStyle = `rgba(255,120,0,${pu})`;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.font = `${this.h*.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔥", this.x+this.w*.5, this.y+this.h*.15);
    }

    ctx.font = `${this.h*.55}px serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("🧟", this.x, this.y+this.h/2);

    const badge = BADGE[this.type];
    if(badge){
      ctx.font = `${this.h*(this.type==="armored"?.35:.3)}px serif`;
      ctx.textAlign = this.type==="runner" ? "left" : "center";
      ctx.fillText(badge,
        this.type==="runner" ? this.x+this.w*.55 : this.x+this.w*.5,
        this.y + this.h*(this.type==="runner"?.25:.3));
    }

    if(this.type === "kralice"){
      ctx.font = `${this.h*0.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText("👑", this.x + this.w/2, this.y - this.h*0.15);
    }

    if(this.type === "boksor" && this.form === 2 && this.state !== "downed"){
      ctx.font = `${this.h*0.4}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🥊", this.x + this.w/2, this.y + this.h*0.85);
    }

    if(this.state === "downed"){
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(this.x, this.y + this.h*0.5, this.w, this.h*0.5);
      ctx.font = `${this.h*0.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💫", this.x + this.w/2, this.y + this.h*0.3);
    }

    if(this.weakenTimer > 0){
      ctx.font = `${this.h*.28}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("💜", this.x+this.w*.85, this.y+this.h*.15);
    }

    if(this.freezeTimer > 0){
      ctx.font = `${this.h*.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❄️", this.x+this.w*.5, this.y+this.h*.15);
    } else if(this.stunTimer > 0){
      ctx.font = `${this.h*.35}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💫", this.x+this.w*.5, this.y+this.h*.15);
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(this.x, this.y-4, this.w, 3);
    ctx.fillStyle = this.burnTimer>0 ? "#ff8c00" : (this.type==="boksor" && this.form===2 ? "#ff0066" : "#f00");
    ctx.fillRect(this.x, this.y-4, this.w*(this.hp/this.mhp), 3);
  }
}