import {CFG, PL} from './config.js';
import {cl, ri, rf, col} from './utils.js';
import {Board} from './entities.js';
import {Boom} from './effects.js';
import {Pea, Needle, Shell, Sun} from './projectiles.js';
import {Zombie} from './zombies.js';
import {Plant, Mini, BH} from './plants.js';

export class Game {
  constructor(cv){
    this.cv = cv;
    this.ctx = cv.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.lastTime = 0;
    this._fps = 0;
    this._fr = 0;
    this._ft = 0;
    this.state = "menu";
    this.selectedPlants = ["sunflower","peashooter","wallnut","mine"];
    this.shovelMode = false;
    this._lastSun = -1;
    this._loop = this.loop.bind(this);
  }

  // ============ STATE ============
  hide(id){
    const el = document.getElementById(id);
    el.classList.add("h");
    el.style.display = "none";
  }
  show(id){
    const el = document.getElementById(id);
    el.classList.remove("h");
    el.style.display = "flex";
  }

  showMenu(){
    this.state = "menu";
    this.hide("ps"); this.hide("go"); this.hide("pauseOverlay");
    this.show("menu");
    document.getElementById("topbar").style.display = "none";
    document.getElementById("dbg").style.display = "none";
  }

  showPlantSelect(){
    this.state = "plantSelect";
    this.hide("menu"); this.hide("go"); this.hide("pauseOverlay");
    this.show("ps");
    document.getElementById("topbar").style.display = "none";
    document.getElementById("dbg").style.display = "none";
    this.renderCards();
  }

  startFromSelection(){
    if(this.state === "playing") return;
    this.reset();
    this.state = "playing";
    this.hide("menu"); this.hide("ps"); this.hide("go"); this.hide("pauseOverlay");
    document.getElementById("topbar").style.display = "flex";
    document.getElementById("dbg").style.display = "block";
    this.lastTime = performance.now();
  }

  goToMenu(){ this.showMenu(); }

  gameOver(){
    if(this.state === "over") return;
    this.state = "over";
    this.show("go");
  }

  pause(){
    if(this.state !== "playing") return;
    this.state = "paused";
    this.show("pauseOverlay");
  }

  resume(){
    if(this.state !== "paused") return;
    this.state = "playing";
    this.lastTime = performance.now();
    this.hide("pauseOverlay");
  }

  // ============ ÖZEL ============
  onMotherKill(mother, z){
    const c = this.board.cellAt(z.x+z.w/2, z.y+z.h/2);
    if(!c) return;
    let occ = !this.board.isFree(c.row, c.col);
    if(!occ) for(const m of this.minis) if(m.alive && m.row===c.row && m.col===c.col){ occ=1; break; }
    if(occ){
      mother.burstCount = PL.anakok.burst;
      mother.burstTimer = 0;
      mother.restTimer = 0;
    } else {
      const cc = this.board.center(c.row, c.col);
      const w = this.board.cw*.6, h = this.board.ch*.6;
      this.minis.push(new Mini(c.row, c.col, cc.x-w/2, cc.y-h/2, w, h));
    }
  }

  explodeShell(s){
    const isAna = s.owner && s.owner.type === "anakok";
    const isAlev = s.owner && s.owner.type === "alev";
    const isSari = s.owner && s.owner.type === "saricicek";
    const maxT = isAna ? 1 : PL.alev.max;
    const r = this.board.cw * PL.alev.lRT;
    const arr = [];
    for(const z of this.zombies){
      if(!z.alive || z.row !== s.row) continue;
      const d = Math.abs(z.x+z.w/2 - s.ex);
      if(d <= r) arr.push({z, d});
    }
    arr.sort((a,b) => a.d - b.d);
    for(const t of arr.slice(0, maxT)){
      t.z.hit(s.dmg);
      if(isAlev) t.z.burnTimer = PL.alev.bT;
      // Sarı Çiçek kill → zombi konumunda güneş düşür
      if(!t.z.alive && isSari && s.owner.alive){
        const zx = t.z.x + t.z.w/2;
        const zy = t.z.y + t.z.h/2;
        this.suns.push(new Sun(zx, zy, Math.min(this.height-50, zy+ri(30, 60))));
      }
      if(!t.z.alive && isAna && s.owner.alive) this.onMotherKill(s.owner, t.z);
    }
    if(!isAna){
      const cy = this.board.oy + s.row*this.board.ch + this.board.ch/2;
      this.effects.push(new Boom(s.ex, cy, this.board.cw, ["255,140,0","255,60,0"]));
    }
  }

  spawnMiniZombie(kralice){
    const z = new Zombie("normal", kralice.row, kralice.x, kralice.y, kralice.w*0.65, kralice.h*0.65);
    z.hp = 25;
    z.mhp = 25;
    z.speed = 12;
    z.dmg = 40;
    z.color = "#c39bd3";
    z.isMini = true;
    this.zombies.push(z);
  }

  // ============ SEÇİM EKRANI ============
  renderCards(){
    const g = document.getElementById("grid");
    g.innerHTML = "";
    for(const [t, d] of Object.entries(PL)){
      const c = document.createElement("div");
      c.className = "pc" + (this.selectedPlants.includes(t) ? " s" : "");
      c.innerHTML = `<div class="e">${d.em}</div><div class="n">${d.n}</div><div class="c">☀${d.c}</div>`;
      const h = e => { e.preventDefault(); this.togglePlant(t); };
      c.addEventListener("touchstart", h, {passive:false});
      c.addEventListener("click", h);
      g.appendChild(c);
    }
    const b = document.getElementById("bar");
    b.innerHTML = "";
    for(let i=0; i<CFG.MAX_SLOTS; i++){
      const s = document.createElement("div");
      s.className = "slot";
      if(i < this.selectedPlants.length){
        s.classList.add("f");
        s.textContent = PL[this.selectedPlants[i]].em;
        const h = e => { e.preventDefault(); this.removeSlot(i); };
        s.addEventListener("touchstart", h, {passive:false});
        s.addEventListener("click", h);
      }
      b.appendChild(s);
    }
    const ct = this.selectedPlants.length;
    const c = document.getElementById("cnt");
    c.textContent = `${ct}/${CFG.MAX_SLOTS}`;
    c.classList.toggle("f", ct >= CFG.MAX_SLOTS);
    document.getElementById("bG").disabled = ct < 1;
  }

  togglePlant(t){
    const i = this.selectedPlants.indexOf(t);
    if(i >= 0) this.selectedPlants.splice(i, 1);
    else if(this.selectedPlants.length < CFG.MAX_SLOTS) this.selectedPlants.push(t);
    this.renderCards();
  }

  removeSlot(i){ this.selectedPlants.splice(i, 1); this.renderCards(); }

  toggleShovel(){
    this.shovelMode = !this.shovelMode;
    if(this.shovelMode) this.selected = null;
    this.refreshSeeds();
    const btn = document.getElementById("shovelBtn");
    if(btn) btn.classList.toggle("active", this.shovelMode);
  }

  // ============ RESET ============
  reset(){
    this.board = this.makeBoard();
    this.sun = CFG.SUN0;
    this.skyTimer = rf(CFG.SKY_MIN, CFG.SKY_MAX);
    this.wave = 0;
    this.queue = [];
    this.spawnT = 0;
    this.spawnI = 0;
    this.nextW = CFG.ZFIRST;
    this.lastVal = 0;
    this.plants = [];
    this.zombies = [];
    this.peas = [];
    this.needles = [];
    this.shells = [];
    this.winds = [];
    this.blades = [];
    this.minis = [];
    this.suns = [];
    this.effects = [];
    this.cardCooldowns = {};
    this.selected = null;
    this.shovelMode = false;
    this._lastSun = -1;
    this.lastTime = performance.now();
    this.buildSeedBar();
    this.refreshSeeds();
  }

  makeBoard(){
    const s = Math.min(this.width/CFG.COLS, this.height/CFG.ROWS);
    return new Board(CFG.COLS, CFG.ROWS, s, (this.width - s*CFG.COLS)/2, (this.height - s*CFG.ROWS)/2);
  }

  resize(){
    const r = this.cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = r.width;
    this.height = r.height;
    this.cv.width = r.width * dpr;
    this.cv.height = r.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if(this.board) this.board = this.makeBoard();
  }

  buildSeedBar(){
    const el = document.getElementById("seeds");
    el.innerHTML = "";
    for(const type of this.selectedPlants){
      const d = PL[type];
      const b = document.createElement("button");
      b.className = "seed";
      b.dataset.type = type;
      b.innerHTML = `<span class="e">${d.em}</span><span>${d.c}</span>`;
      const h = e => { e.preventDefault(); this.selectSeed(type); };
      b.addEventListener("touchstart", h, {passive:false});
      b.addEventListener("click", h);
      el.appendChild(b);
    }
  }

  // ============ YARDIMCI ============
  spawnSun(x, y){ this.suns.push(new Sun(x, y, Math.min(this.height-50, y+ri(40, 90)))); }
  zombieInRow(row, fromX){ return this.zombies.some(z => z.alive && z.row===row && z.x > fromX); }

  plantInFront(z){
    if(z.state === "downed") return null;
    let best = null, bx = -1e9;
    for(const p of this.plants){
      if(!p.alive || p.row !== z.row) continue;
      if(p.type === "spike") continue;
      if(p.type === "anka" && p.form === 2) continue;
      if(col(z.rect, p.rect) && (p.x+p.w) > bx){ bx = p.x+p.w; best = p; }
    }
    for(const m of this.minis){
      if(!m.alive || m.row !== z.row) continue;
      if(col(z.rect, m.rect) && (m.x+m.w) > bx){ bx = m.x+m.w; best = m; }
    }
    return best;
  }

  areaHit(cx, cy, radius, maxTargets, dmg){
    const arr = [];
    for(const z of this.zombies){
      if(!z.alive) continue;
      const dx = z.x+z.w/2 - cx, dy = z.y+z.h/2 - cy;
      const d2 = dx*dx + dy*dy;
      if(d2 < radius*radius) arr.push({z, d2});
    }
    arr.sort((a,b) => a.d2 - b.d2);
    for(const t of arr.slice(0, maxTargets)) t.z.hit(dmg);
  }

  mineTriggered(m){
    const cx = m.x+m.w/2, cy = m.y+m.h/2, r = m.w*CFG.MINE_R;
    return this.zombies.some(z => {
      if(!z.alive) return 0;
      const dx = z.x+z.w/2 - cx, dy = z.y+z.h/2 - cy;
      return dx*dx + dy*dy < r*r;
    });
  }

  explodeMine(m){
    const cx = m.x+m.w/2, cy = m.y+m.h/2, r = m.w*CFG.MINE_R;
    this.areaHit(cx, cy, r, PL.mine.max, PL.mine.dmg);
    this.effects.push(new Boom(cx, cy, r));
  }

  tryPlant(row, c, type){
    if(this.cardCooldowns[type] && this.cardCooldowns[type] > 0) return 0;
    if(!this.board.isFree(row, c)) return 0;
    for(const m of this.minis) if(m.alive && m.row===row && m.col===c) return 0;
    if(this.sun < PL[type].c) return 0;
    const cc = this.board.center(row, c);
    const w = this.board.cw*.8, h = this.board.ch*.8;
    const p = new Plant(type, row, c, cc.x-w/2, cc.y-h/2, w, h);
    this.board.place(row, c, p);
    if(this.board.grid[row][c] !== p){ return 0; }
    this.plants.push(p);
    this.sun -= PL[type].c;
    this.refreshSeeds();
    return 1;
  }

  collectSun(s){ s.alive = 0; this.sun += CFG.SUNVAL; this.refreshSeeds(); }

  // ============ INPUT ============
  onPointer(px, py){
    if(this.state !== "playing") return;

    if(this.shovelMode){
      const c = this.board.cellAt(px, py);
      if(c && !this.board.isFree(c.row, c.col)){
        const plant = this.board.grid[c.row][c.col];
        plant.alive = 0;
        this.board.remove(c.row, c.col);
      }
      this.shovelMode = false;
      const btn = document.getElementById("shovelBtn");
      if(btn) btn.classList.remove("active");
      return;
    }

    for(let i = this.suns.length-1; i>=0; i--){
      const s = this.suns[i];
      if(px >= s.x && px <= s.x+s.w && py >= s.y && py <= s.y+s.h){ this.collectSun(s); return; }
    }

    if(this.selected){
      const c = this.board.cellAt(px, py);
      if(c && this.tryPlant(c.row, c.col, this.selected)){
        this.selected = null;
        this.refreshSeeds();
      }
    }
  }

  selectSeed(t){
    if(this.cardCooldowns[t] && this.cardCooldowns[t] > 0) return;
    if(this.selected === t) this.selected = null;
    else if(this.sun >= PL[t].c) this.selected = t;
    this.refreshSeeds();
  }

  refreshSeeds(){
    document.querySelectorAll(".seed").forEach(el => {
      const t = el.dataset.type;
      const cd = this.cardCooldowns[t] && this.cardCooldowns[t] > 0;
      el.classList.toggle("s", this.selected === t);
      el.classList.toggle("d", this.sun < PL[t].c || cd);
    });
  }

  // ============ ANA DÖNGÜ ============
  loop(t){
    try {
      this._fr++;
      if(t - this._ft > 500){
        this._fps = Math.round(this._fr * 1000 / (t - this._ft));
        this._fr = 0;
        this._ft = t;
      }
      if(this.state === "playing"){
        const dt = cl((t - this.lastTime)/1000 || 0, 0, .05);
        this.update(dt);
        this.draw();
      }
    } catch(e){
      console.error("LOOP HATA:", e.message);
      if(document.getElementById("dbg")){
        document.getElementById("dbg").textContent = "HATA: " + e.message;
      }
    }
    this.lastTime = t;
    requestAnimationFrame(this._loop);
  }

  cleanup(){
    this.plants = this.plants.filter(p => p.alive);
    this.zombies = this.zombies.filter(z => z.alive);
    this.peas = this.peas.filter(p => p.alive);
    this.needles = this.needles.filter(n => n.alive);
    this.shells = this.shells.filter(s => s.alive);
    this.winds = this.winds.filter(w => w.alive);
    this.blades = this.blades.filter(b => b.alive);
    this.minis = this.minis.filter(m => m.alive);
    this.suns = this.suns.filter(s => s.alive);
    this.effects = this.effects.filter(e => e.alive);
  }

  // ============ UPDATE ============
  update(dt){
    // Cooldown azalt + bitince refresh
    for(const type in this.cardCooldowns){
      if(this.cardCooldowns[type] > 0){
        this.cardCooldowns[type] -= dt;
        if(this.cardCooldowns[type] <= 0){
          delete this.cardCooldowns[type];
          this.refreshSeeds();
        }
      }
    }

    this.skyTimer -= dt;
    if(this.skyTimer <= 0){
      this.skyTimer = rf(CFG.SKY_MIN, CFG.SKY_MAX);
      this.spawnSun(rf(this.board.ox+30, this.board.ox+this.board.cols*this.board.cw-30), -20);
    }

    this.nextW -= dt;
    if(this.nextW <= 0){
      this.wave++;
      this.buildWave();
      this.nextW = this.waveInt(this.wave);
    }
    if(this.queue.length > 0){
      this.spawnT -= dt;
      if(this.spawnT <= 0){
        this.spawnZ(this.queue.shift());
        this.spawnT = this.spawnI;
      }
    }

    for(const p of this.plants) p.update(dt, this);
    for(const z of this.zombies) z.update(dt, this);
    for(const p of this.peas) p.update(dt, this);
    for(const n of this.needles) n.update(dt, this);
    for(const s of this.shells) s.update(dt, this);
    for(const w of this.winds) w.update(dt, this);
    for(const b of this.blades) b.update(dt, this);
    for(const m of this.minis) m.update(dt, this);
    for(const s of this.suns) s.update(dt);
    for(const e of this.effects) e.update(dt);

    for(const p of this.plants){
      if(p.healFlash > 0) p.healFlash -= dt;
      if(!p.alive && p.type === "buzul" && !p.frozen){
        BH.buzul(p, 0, this);
      }
      if(p.type==="anka" && p.form===1 && p.hp<=0){
        p.form = 2;
        p.formTimer = PL.anka.gT;
        p.hp = 0;
        if(this.board.grid[p.row][p.col] === p) this.board.remove(p.row, p.col);
      }
      if(!p.alive && this.board.grid[p.row][p.col] === p) this.board.remove(p.row, p.col);
    }

    this.cleanup();

    // Kart yanıp sönmesin → sadece sun değişince refresh
    const newSun = Math.floor(this.sun);
    document.getElementById("sv").textContent = newSun;
    if(this._lastSun !== newSun){
      this._lastSun = newSun;
      this.refreshSeeds();
    }
  }

  // ============ DALGA ============
  waveInt(w){
    if(w === 0) return 20;
    if(w === 1) return 20;
    if(w === 2) return 15;
    if(w === 3) return 13;
    if(w <= 29) return 12;
    if(w <= 69) return 12 + (w - 29) * 0.1;
    return 16;
  }

  valWave(w){
    const t = {1:1,2:1,3:2,4:2,5:4,6:5,7:8,8:8,9:8,10:11,11:11,12:12,13:12,14:13,15:14,16:14,
               17:15,18:15,19:16,20:16,21:17,22:17,23:17,24:17};
    if(w <= 24) return t[w];
    if(w <= 50) return Math.round(25 + (w - 25) * 0.6);
    return 40 + Math.floor((w - 50) / 10) * 5;
  }

  buildWave(){
    const w = this.wave;
    let val = this.valWave(w);
    this.lastVal = val;

    const rMax = w<=6 ? 0 : (w<=14 ? 2 : (w<=24 ? 3 : (w<=39 ? 2 : 1)));
    const aMax = w<=19 ? 0 : (w<=21 ? 1 : (w<=24 ? 3 : (w<=49 ? 3 : 2)));
    const kMax = w<=24 ? 0 : (w<=39 ? 1 : 2);
    const bMax = w<=34 ? 0 : 1;
    const dMax = w<=49 ? 0 : 1;

    const cap = w <= 29 ? CFG.ZCAP_EARLY : CFG.ZCAP_LATE;

    const list = [];
    let c;

    if(w >= 15 && w <= 20 && val >= 4){
      list.push("kralice");
      val -= 4;
    }

    c = 0; while(c<dMax && val>=15 && list.length<cap){ list.push("dev"); val-=15; c++; }
    c = 0; while(c<bMax && val>=5 && list.length<cap){ list.push("boksor"); val-=5; c++; }
    c = 0; while(c<kMax && val>=4 && list.length<cap){ list.push("kralice"); val-=4; c++; }
    c = 0; while(c<aMax && val>=6 && list.length<cap){ list.push("armored"); val-=6; c++; }
    c = 0; while(c<rMax && val>=3 && list.length<cap){ list.push("runner"); val-=3; c++; }

    const nMax = w<=24 ? 99 : 1;
    c = 0; while(c<nMax && val>=1 && list.length<cap){ list.push("normal"); val-=1; c++; }

    const isSwapWave = (w % 22 === 0) || (w % 23 === 0);
    if(isSwapWave){
      let armoredCount = 0;
      for(let i = 0; i < list.length; i++){
        if(list[i] === "armored"){
          armoredCount++;
          if(armoredCount % 4 === 0){
            list[i] = "runner";
          }
        }
      }
    }

    list.sort(() => Math.random() - .5);
    this.queue = list;
    this.spawnI = list.length>0 ? this.waveInt(w)/list.length : 0;
    this.spawnT = 0;
  }

  spawnZ(type){
    const row = ri(0, this.board.rows-1);
    const x = this.board.ox + this.board.cols*this.board.cw + 10 + ri(0, 60);
    const c = this.board.center(row, 0);
    const w = this.board.cw*.6, h = this.board.ch*.7;
    const z = new Zombie(type, row, x, c.y-h/2, w, h);
    const mult = 1 + Math.floor(this.wave/10) * 0.05;
    z.hp *= mult;
    z.mhp = z.hp;
    this.zombies.push(z);
  }

  // ============ DRAW ============
  draw(){
    const ctx = this.ctx, b = this.board;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#5a8f3a";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = "rgba(0,0,0,.15)";
    ctx.lineWidth = 1;
    for(let r=0; r<=b.rows; r++){
      ctx.beginPath(); ctx.moveTo(b.ox, b.oy+r*b.ch); ctx.lineTo(b.ox+b.cols*b.cw, b.oy+r*b.ch); ctx.stroke();
    }
    for(let c=0; c<=b.cols; c++){
      ctx.beginPath(); ctx.moveTo(b.ox+c*b.cw, b.oy); ctx.lineTo(b.ox+c*b.cw, b.oy+b.rows*b.ch); ctx.stroke();
    }
    const ghosts = this.plants.filter(p => p.type==="anka" && p.form===2);
    const grounds = this.plants.filter(p => p.type==="spike");
    const uppers = this.plants.filter(p => p.type!=="spike" && !(p.type==="anka" && p.form===2));
    for(const p of ghosts) p.draw(ctx, this);
    for(const p of grounds) p.draw(ctx, this);
    for(const p of uppers) p.draw(ctx, this);
    for(const m of this.minis) m.draw(ctx);
    for(const z of this.zombies) z.draw(ctx);
    for(const p of this.peas) p.draw(ctx);
    for(const n of this.needles) n.draw(ctx);
    for(const s of this.shells) s.draw(ctx);
    for(const w of this.winds) w.draw(ctx);
    for(const b of this.blades) b.draw(ctx);
    for(const e of this.effects) e.draw(ctx);
    for(const s of this.suns) s.draw(ctx);
    document.getElementById("dbg").textContent =
      `FPS:${this._fps} Z:${this.zombies.length} B:${this.plants.length} M:${this.minis.length} D:${this.wave} Değer:${this.lastVal}`;
  }
}