import {Entity} from './entities.js';

// ============ BOOM (patlama efekti) ============
export class Boom extends Entity {
  constructor(x,y,r,c){
    super(x,y,r,r);
    this.r = r;
    this.l=.5; this.ml=.5;
    this.c1 = c ? c[0] : "255,180,0";
    this.c2 = c ? c[1] : "255,80,0";
  }
  update(dt){
    this.l -= dt;
    if(this.l<=0) this.alive=0;
  }
  draw(ctx){
    const t=1-this.l/this.ml;
    const a=this.l/this.ml;
    const R=this.r*(.5+t*.5);
    ctx.fillStyle=`rgba(${this.c1},${a*.8})`;
    ctx.beginPath(); ctx.arc(this.x,this.y,R,0,6.28); ctx.fill();
    ctx.fillStyle=`rgba(${this.c2},${a*.5})`;
    ctx.beginPath(); ctx.arc(this.x,this.y,R*.6,0,6.28); ctx.fill();
  }
}

// ============ HEAL (iyileştirme efekti) ============
export class Heal extends Entity {
  constructor(target, healAmt, shieldAmt){
    super(0,0,0,0);
    this.t=target; this.h=healAmt; this.s=shieldAmt;
    this.l=.9; this.ml=.9;
  }
  update(dt){
    this.l -= dt;
    if(this.l<=0) this.alive=0;
  }
  draw(ctx){
    if(!this.t || !this.t.alive) return;
    const p=1-this.l/this.ml;
    const a=this.l/this.ml;
    const cx=this.t.x+this.t.w/2;
    const cy=this.t.y+this.t.h/2;
    const R=this.t.w*.5 + p*this.t.w*.8;
    ctx.strokeStyle=`rgba(46,204,113,${a})`;
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,6.28); ctx.stroke();
    ctx.fillStyle=`rgba(46,204,113,${a*.3})`;
    ctx.beginPath(); ctx.arc(cx,cy,R*.7,0,6.28); ctx.fill();
    ctx.fillStyle=`rgba(168,240,200,${a})`;
    ctx.font=`bold ${this.t.h*.35}px system-ui`;
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(`+${this.h}`, cx, cy-p*30);
    ctx.fillStyle=`rgba(52,152,219,${a})`;
    ctx.font=`bold ${this.t.h*.22}px system-ui`;
    ctx.fillText(`🛡+${this.s}`, cx, cy-p*30+this.t.h*.4);
  }
}