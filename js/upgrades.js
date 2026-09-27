// ============ YÜKSELTME SİSTEMİ ============
// 100+ güneş fiyatlı bitkiler için 2'şer yükseltme

export const UPGRADES = {
  peashooter: {
    damage: { name: "Sert Atışlar",  desc: "1.5x hasar",    cost: 75, icon: "⚔", color: "#e74c3c" },
    speed:  { name: "Hızlı Atışlar", desc: "1.5x ateş hızı", cost: 75, icon: "⚡", color: "#3498db" }
  },
  ignear: {
    damage: { name: "Sert Delme",    desc: "1.5x hasar",     cost: 75, icon: "⚔", color: "#e74c3c" },
    range:  { name: "Uzun Menzil",   desc: "4.5 → 6 kare",   cost: 75, icon: "🎯", color: "#9b59b6" }
  },
  anakok: {
    burst:  { name: "Güçlü Burst",   desc: "3 → 5 atış",     cost: 75, icon: "💥", color: "#e67e22" },
    rest:   { name: "Hızlı Toparlanma", desc: "4 sn → 2 sn", cost: 75, icon: "⏱", color: "#16a085" }
  },
  alev: {
    burn:   { name: "Uzun Yanma",    desc: "6 → 10 sn yanma", cost: 75, icon: "🔥", color: "#e74c3c" },
    area:   { name: "Geniş Alan",    desc: "3 → 5 hedef",     cost: 75, icon: "💫", color: "#f39c12" }
  },
  zipkin: {
    pierce: { name: "Derin Delme",   desc: "5 → 8 zombi",    cost: 75, icon: "🎣", color: "#8d6e63" },
    range:  { name: "Uzun Menzil",   desc: "4.5 → 6 kare",   cost: 75, icon: "🎯", color: "#9b59b6" }
  },
  tepkiliMayin: {
    damage: { name: "Büyük Patlama", desc: "400 → 600 hasar", cost: 75, icon: "💥", color: "#c0392b" },
    reload: { name: "Hızlı Kurulum", desc: "25 → 15 sn",      cost: 75, icon: "⏱", color: "#16a085" }
  },
  cehennem: {
    maxDps: { name: "Yüksek Max",    desc: "100 → 150/sn",   cost: 75, icon: "🌋", color: "#e74c3c" },
    ramp:   { name: "Hızlı Ramp",    desc: "8 sn → 5 sn",    cost: 75, icon: "⚡", color: "#f39c12" }
  },
  cephaneli: {
    bigPea: { name: "Güçlü Mermi",   desc: "6 → 9 dmg",      cost: 75, icon: "🔫", color: "#455a64" },
    charge: { name: "Hızlı Şarj",    desc: "2 sn → 1.5 sn",  cost: 75, icon: "⚡", color: "#ffd700" }
  }
};

// ============ YÜKSELTME STATE ============
export class UpgradeState {
  constructor(){
    this.selectedPlant = null;
    this.rects = [];   // tıklama alanları
  }

  reset(){
    this.selectedPlant = null;
    this.rects = [];
  }

  // Bitki seçildi mi? Seçilen bitkiyi ayarla
  select(plant){
    if(this.selectedPlant === plant){
      this.selectedPlant = null;
    } else {
      this.selectedPlant = plant;
    }
  }

  // Yükseltme var mı? (bitki tipi 100+ fiyatlı mı?)
  hasUpgrades(plant){
    if(!plant || !plant.alive) return false;
    return UPGRADES[plant.type] !== undefined;
  }

  // Bitki için upgrade tablosunu al
  getTable(plant){
    if(!this.hasUpgrades(plant)) return null;
    return UPGRADES[plant.type];
  }

  // Yükseltme al
  tryUpgrade(plant, kind, economy){
    if(!plant || !plant.alive) return false;
    const table = this.getTable(plant);
    if(!table) return false;
    const up = table[kind];
    if(!up) return false;

    // Zaten alınmış mı?
    if(plant.upgrades && plant.upgrades[kind]) return false;

    // Güneş yeterli mi?
    if(economy.sun < up.cost) return false;

    // Al
    economy.spend(up.cost);
    if(!plant.upgrades) plant.upgrades = {};
    plant.upgrades[kind] = true;
    return true;
  }

  // ============ ÇİZİM ============
  drawBoxes(ctx, board, width, height){
    this.rects = [];
    const plant = this.selectedPlant;
    if(!plant || !plant.alive) return;
    if(!this.hasUpgrades(plant)) return;

    const table = this.getTable(plant);
    const keys = Object.keys(table);
    if(keys.length === 0) return;

    // Alt boşluk (grid altından ekran altına)
    const gridBottom = board.oy + board.rows * board.ch;
    const spaceTop = gridBottom + 8;
    const spaceBottom = height - 8;
    const spaceH = spaceBottom - spaceTop;
    if(spaceH < 70) return;

    const gap = 10;
    const availW = width - 20;
    const boxW = (availW - gap * (keys.length - 1)) / keys.length;
    const boxH = Math.min(spaceH - 4, 110);
    const y = spaceTop + (spaceH - boxH) / 2;

    keys.forEach((kind, i) => {
      const up = table[kind];
      const x = 10 + i * (boxW + gap);
      const done = plant.upgrades && plant.upgrades[kind];
      const canAfford = !done; // güneş kontrolü ayrı yapılır
      this.rects.push({x, y, w: boxW, h: boxH, plant, kind});

      // Arka plan
      if(done)         ctx.fillStyle = "#1e4a1e";
      else             ctx.fillStyle = up.color;
      ctx.fillRect(x, y, boxW, boxH);

      // Çerçeve
      ctx.strokeStyle = done ? "#0f0" : "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      // Başlık
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const titleSize = Math.max(12, Math.min(16, boxH * 0.15));
      ctx.font = `bold ${titleSize}px system-ui`;
      ctx.fillText(`${up.icon} ${up.name}`, x + boxW/2, y + boxH * 0.12);

      // Açıklama
      const descSize = Math.max(10, Math.min(12, boxH * 0.11));
      ctx.font = `${descSize}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(up.desc, x + boxW/2, y + boxH * 0.45);

      // Alt: AKTİF veya maliyet
      ctx.textBaseline = "bottom";
      const costSize = Math.max(13, boxH * 0.16);
      if(done){
        ctx.fillStyle = "#0f0";
        ctx.font = `bold ${costSize}px system-ui`;
        ctx.fillText("✓ AKTİF", x + boxW/2, y + boxH - 8);
      } else {
        ctx.fillStyle = "#ffd700";
        ctx.font = `bold ${costSize}px system-ui`;
        ctx.fillText(`☀ ${up.cost}`, x + boxW/2, y + boxH - 8);
      }
    });
  }

  // ============ TIKLAMA ============
  handleClick(px, py, economy){
    for(const r of this.rects){
      if(px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h){
        return this.tryUpgrade(r.plant, r.kind, economy);
      }
    }
    return false;
  }
}