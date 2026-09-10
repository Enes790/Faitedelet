// ========== korku-bolum1.js — BÖLÜM 1 / ODA 1 ==========
// Eğitim odası: hareket → sis botu → anahtar → kapı.
// Sis botu ölmeden anahtar alınamaz.

(function () {
    'use strict';

    const ODA_GENISLIK = 600;
    const ODA_YUKSEKLIK = 800;
    const WALL = KORKU.WALL_THICKNESS;

    KORKU.odaKaydet('bolum1_oda1', {
        oyuncu: null,
        sisBotu: null,
        oyuncuMermileri: [],
        sisMermileri: [],
        parcaciklar: [],
        anahtar: null,
        kapi: null,

        // ========== BAŞLANGIÇ ==========
        baslangic: function () {
            this.oyuncu = {
                x: ODA_GENISLIK / 2, y: ODA_YUKSEKLIK - 150,
                radius: 20, speed: 220, angle: 0,
                ammo: 1, maxAmmo: 1, reloadSpeed: 0.008, lastShot: 0
            };
            KORKU.oyuncu = this.oyuncu;
            KORKU.kamera.x = this.oyuncu.x;
            KORKU.kamera.y = this.oyuncu.y;

            this.sisBotu = {
                x: ODA_GENISLIK / 2, y: 200,
                radius: 32, hp: 1200, maxHp: 1200,
                isDead: false, angle: 0, lastShot: 0,
                shootInterval: 2200, isActive: false,
                color: '#7f8c8d'
            };

            this.anahtar = { x: ODA_GENISLIK / 2, y: 100, radius: 14, alindi: false };
            this.kapi = {
                x: ODA_GENISLIK / 2 - 60, y: 0,
                width: 120, height: WALL, acik: false
            };

            this.oyuncuMermileri = [];
            this.sisMermileri = [];
            this.parcaciklar = [];

            if (window.KORKU_EGITIM) window.KORKU_EGITIM.baslat();

            this._joystickBagla();
        },

        // ========== JOYSTICK ==========
        _joystickBagla: function () {
            const self = this;
            const joyConfig = { baseRadius: 55, stickRadius: 22, maxStickDistance: 45, deadZone: 0.15 };
            this.solJoy = { active: false, baseX: 0, baseY: 0, stickX: 0, stickY: 0, id: null };
            this.sagJoy = { active: false, baseX: 0, baseY: 0, stickX: 0, stickY: 0, id: null };
            this.pointerMap = new Map();

            function coords(e) {
                const r = canvas.getBoundingClientRect();
                return {
                    x: (e.clientX - r.left) * (canvas.width / r.width),
                    y: (e.clientY - r.top) * (canvas.height / r.height)
                };
            }

            canvas.addEventListener('pointerdown', function (e) {
                if (!KORKU.aktif) return;
                e.preventDefault();
                const c = coords(e);
                const isLeft = c.x < canvas.width / 2;
                const joy = isLeft ? self.solJoy : self.sagJoy;
                if (joy.active) return;
                joy.active = true; joy.baseX = c.x; joy.baseY = c.y;
                joy.stickX = 0; joy.stickY = 0; joy.id = e.pointerId;
                self.pointerMap.set(e.pointerId, isLeft ? 'left' : 'right');
            });

            canvas.addEventListener('pointermove', function (e) {
                if (!KORKU.aktif) return;
                const side = self.pointerMap.get(e.pointerId);
                if (!side) return;
                e.preventDefault();
                const joy = side === 'left' ? self.solJoy : self.sagJoy;
                const c = coords(e);
                let dx = c.x - joy.baseX, dy = c.y - joy.baseY;
                const d = Math.hypot(dx, dy);
                if (d > joyConfig.maxStickDistance) {
                    dx = (dx / d) * joyConfig.maxStickDistance;
                    dy = (dy / d) * joyConfig.maxStickDistance;
                }
                let nx = dx / joyConfig.maxStickDistance;
                let ny = dy / joyConfig.maxStickDistance;
                if (Math.hypot(nx, ny) < joyConfig.deadZone) { nx = 0; ny = 0; }
                joy.stickX = nx; joy.stickY = ny;
            });

            function up(e) {
                const side = self.pointerMap.get(e.pointerId);
                if (side) {
                    const joy = side === 'left' ? self.solJoy : self.sagJoy;
                    joy.active = false; joy.stickX = 0; joy.stickY = 0;
                    self.pointerMap.delete(e.pointerId);
                }
            }
            canvas.addEventListener('pointerup', up);
            canvas.addEventListener('pointercancel', up);

            this._joyConfig = joyConfig;
        },

        // ========== GÜNCELLEME ==========
        guncelle: function (dt) {
            const o = this.oyuncu;
            const joyConfig = this._joyConfig;

            // Hareket
            const mx = this.solJoy.stickX, my = this.solJoy.stickY;
            const moving = Math.hypot(mx, my) > joyConfig.deadZone;
            if (moving) {
                o.x += mx * o.speed * dt;
                o.y += my * o.speed * dt;
                o.angle = Math.atan2(my, mx);
            }
            if (window.KORKU_EGITIM) window.KORKU_EGITIM.hareketBildir(dt, moving);

            // Nişan + ateş
            const rx = this.sagJoy.stickX, ry = this.sagJoy.stickY;
            if (Math.hypot(rx, ry) > joyConfig.deadZone) {
                o.angle = Math.atan2(ry, rx);
                if (o.ammo >= 1 && performance.now() - o.lastShot > 300) {
                    o.ammo--; o.lastShot = performance.now();
                    this.oyuncuMermileri.push({
                        x: o.x, y: o.y,
                        vx: Math.cos(o.angle) * 500, vy: Math.sin(o.angle) * 500,
                        radius: 6, life: 1.2
                    });
                    this._parcacik(o.x, o.y, '#f1c40f', 5);
                }
            }

            // Cephane yenileme
            if (o.ammo < o.maxAmmo) {
                o.ammo = Math.min(o.maxAmmo, o.ammo + o.reloadSpeed * dt * 60);
            }

            // Sınırlar
            o.x = Math.max(WALL + o.radius, Math.min(ODA_GENISLIK - WALL - o.radius, o.x));
            const minY = (this.kapi.acik && o.x > this.kapi.x && o.x < this.kapi.x + this.kapi.width)
                ? -100 : WALL + o.radius;
            o.y = Math.max(minY, Math.min(ODA_YUKSEKLIK - WALL - o.radius, o.y));

            // Sis botu aktif et (adım 2)
            if (window.KORKU_EGITIM && window.KORKU_EGITIM.adimNo() >= 2 && !this.sisBotu.isDead) {
                this.sisBotu.isActive = true;
            }

            // Sis botu AI
            const sb = this.sisBotu;
            if (sb.isActive && !sb.isDead) {
                sb.angle = Math.atan2(o.y - sb.y, o.x - sb.x);
                if (performance.now() - sb.lastShot > sb.shootInterval) {
                    sb.lastShot = performance.now();
                    const a = sb.angle + (Math.random() - 0.5) * 0.2;
                    this.sisMermileri.push({
                        x: sb.x, y: sb.y,
                        vx: Math.cos(a) * 180, vy: Math.sin(a) * 180,
                        radius: 8, life: 3
                    });
                }
            }

            // Sis mermileri
            for (let i = this.sisMermileri.length - 1; i >= 0; i--) {
                const b = this.sisMermileri[i];
                b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
                if (b.life <= 0 || b.x < 0 || b.x > ODA_GENISLIK || b.y < 0 || b.y > ODA_YUKSEKLIK) {
                    this.sisMermileri.splice(i, 1); continue;
                }
                if (Math.hypot(b.x - o.x, b.y - o.y) < b.radius + o.radius) {
                    this._parcacik(o.x, o.y, '#e74c3c', 8);
                    KORKU.sarsinti(8);
                    this.sisMermileri.splice(i, 1);
                }
            }

            // Oyuncu mermileri
            for (let i = this.oyuncuMermileri.length - 1; i >= 0; i--) {
                const b = this.oyuncuMermileri[i];
                b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
                if (b.life <= 0 || b.x < 0 || b.x > ODA_GENISLIK || b.y < 0 || b.y > ODA_YUKSEKLIK) {
                    this.oyuncuMermileri.splice(i, 1); continue;
                }
                if (!sb.isDead && Math.hypot(b.x - sb.x, b.y - sb.y) < b.radius + sb.radius) {
                    sb.hp -= 400;
                    this._parcacik(b.x, b.y, '#e67e22', 6);
                    this.oyuncuMermileri.splice(i, 1);
                    if (sb.hp <= 0) {
                        sb.isDead = true; sb.isActive = false;
                        this._parcacik(sb.x, sb.y, '#7f8c8d', 20);
                        if (window.KORKU_EGITIM) window.KORKU_EGITIM.atesBildir();
                    }
                }
            }

            // ANAHTAR: Sadece sis botu öldüyse alınabilir
            if (!this.anahtar.alindi && this.sisBotu.isDead &&
                Math.hypot(o.x - this.anahtar.x, o.y - this.anahtar.y) < this.anahtar.radius + o.radius + 10) {
                this.anahtar.alindi = true;
                if (window.KORKU_EGITIM) window.KORKU_EGITIM.anahtarBildir();
            }

            // Kapı: Sadece anahtar alındıysa açılabilir
            if (this.anahtar.alindi && !this.kapi.acik &&
                o.y < this.kapi.y + this.kapi.height + 30 &&
                o.x > this.kapi.x - 20 && o.x < this.kapi.x + this.kapi.width + 20) {
                this.kapi.acik = true;
                if (window.KORKU_EGITIM) window.KORKU_EGITIM.kapiBildir();
            }

            // Parçacıklar
            for (let i = this.parcaciklar.length - 1; i >= 0; i--) {
                const p = this.parcaciklar[i];
                p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
                if (p.life <= 0) this.parcaciklar.splice(i, 1);
            }
        },

        _parcacik: function (x, y, renk, adet) {
            for (let i = 0; i < adet; i++) {
                const a = Math.random() * Math.PI * 2;
                const s = 50 + Math.random() * 150;
                this.parcaciklar.push({
                    x: x, y: y,
                    vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                    life: 0.4 + Math.random() * 0.3, maxLife: 0.7,
                    color: renk, size: 2 + Math.random() * 3
                });
            }
        },

        // ========== ÇİZİM ==========
        ciz: function (ctx2) {
            // Zemin
            ctx2.fillStyle = '#16202b';
            ctx2.fillRect(0, 0, ODA_GENISLIK, ODA_YUKSEKLIK);
            ctx2.strokeStyle = '#0e1620';
            ctx2.lineWidth = 1;
            for (let gx = 0; gx < ODA_GENISLIK; gx += 40) {
                ctx2.beginPath(); ctx2.moveTo(gx, 0); ctx2.lineTo(gx, ODA_YUKSEKLIK); ctx2.stroke();
            }
            for (let gy = 0; gy < ODA_YUKSEKLIK; gy += 40) {
                ctx2.beginPath(); ctx2.moveTo(0, gy); ctx2.lineTo(ODA_GENISLIK, gy); ctx2.stroke();
            }

            // Duvarlar
            ctx2.fillStyle = '#05080c';
            ctx2.fillRect(0, 0, WALL, ODA_YUKSEKLIK);
            ctx2.fillRect(ODA_GENISLIK - WALL, 0, WALL, ODA_YUKSEKLIK);
            ctx2.fillRect(0, ODA_YUKSEKLIK - WALL, ODA_GENISLIK, WALL);
            if (this.kapi.acik) {
                ctx2.fillRect(0, 0, this.kapi.x, WALL);
                ctx2.fillRect(this.kapi.x + this.kapi.width, 0, ODA_GENISLIK - (this.kapi.x + this.kapi.width), WALL);
            } else {
                ctx2.fillRect(0, 0, ODA_GENISLIK, WALL);
            }

            // Kapı
            if (!this.kapi.acik) {
                ctx2.fillStyle = this.anahtar.alindi ? '#2ecc71' : '#5d6d7e';
                ctx2.fillRect(this.kapi.x, this.kapi.y, this.kapi.width, this.kapi.height);
                ctx2.fillStyle = '#1a1a2e';
                ctx2.beginPath();
                ctx2.arc(this.kapi.x + this.kapi.width / 2, this.kapi.y + this.kapi.height / 2, 6, 0, Math.PI * 2);
                ctx2.fill();
            } else {
                ctx2.fillStyle = '#1a3a1a';
                ctx2.fillRect(this.kapi.x, this.kapi.y, this.kapi.width, this.kapi.height);
                ctx2.fillStyle = '#2ecc71';
                ctx2.beginPath();
                ctx2.arc(this.kapi.x + this.kapi.width / 2, this.kapi.y + this.kapi.height / 2, 6, 0, Math.PI * 2);
                ctx2.fill();
            }

            // ANAHTAR: Sadece sis botu öldüyse görünür
            if (!this.anahtar.alindi && this.sisBotu.isDead) {
                const pulse = 1 + Math.sin(performance.now() / 300) * 0.15;
                ctx2.save();
                ctx2.translate(this.anahtar.x, this.anahtar.y);
                ctx2.scale(pulse, pulse);
                ctx2.beginPath();
                ctx2.arc(0, 0, this.anahtar.radius + 8, 0, Math.PI * 2);
                ctx2.fillStyle = 'rgba(241,196,15,0.15)';
                ctx2.fill();
                ctx2.beginPath();
                ctx2.arc(0, 0, this.anahtar.radius, 0, Math.PI * 2);
                ctx2.fillStyle = '#f1c40f';
                ctx2.fill();
                ctx2.strokeStyle = '#d4ac0d';
                ctx2.lineWidth = 2;
                ctx2.stroke();
                ctx2.beginPath();
                ctx2.arc(0, 0, this.anahtar.radius * 0.4, 0, Math.PI * 2);
                ctx2.fillStyle = '#0a0a0a';
                ctx2.fill();
                ctx2.restore();
            }

            // Sis botu
            const sb = this.sisBotu;
            if (!sb.isDead && sb.isActive) {
                ctx2.save();
                ctx2.translate(sb.x, sb.y);
                for (let i = 0; i < 3; i++) {
                    const a = performance.now() / 500 + i * 2.1;
                    ctx2.beginPath();
                    ctx2.arc(Math.cos(a) * 12, Math.sin(a) * 12, sb.radius * 0.8, 0, Math.PI * 2);
                    ctx2.fillStyle = 'rgba(127,140,141,' + (0.3 - i * 0.08) + ')';
                    ctx2.fill();
                }
                ctx2.beginPath();
                ctx2.arc(0, 0, sb.radius, 0, Math.PI * 2);
                ctx2.fillStyle = sb.color;
                ctx2.fill();
                ctx2.strokeStyle = '#2c3e50';
                ctx2.lineWidth = 3;
                ctx2.stroke();
                ctx2.fillStyle = '#e74c3c';
                ctx2.beginPath();
                ctx2.arc(-8, -4, 4, 0, Math.PI * 2);
                ctx2.arc(8, -4, 4, 0, Math.PI * 2);
                ctx2.fill();
                ctx2.restore();
                const bw = 60, bx = sb.x - bw / 2, by = sb.y - sb.radius - 15;
                ctx2.fillStyle = '#2c3e50';
                ctx2.fillRect(bx, by, bw, 6);
                ctx2.fillStyle = '#e74c3c';
                ctx2.fillRect(bx, by, bw * (sb.hp / sb.maxHp), 6);
            }

            // Mermiler
            this.sisMermileri.forEach(b => {
                ctx2.beginPath();
                ctx2.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx2.fillStyle = '#95a5a6';
                ctx2.fill();
                ctx2.strokeStyle = '#2c3e50';
                ctx2.lineWidth = 2;
                ctx2.stroke();
            });
            this.oyuncuMermileri.forEach(b => {
                ctx2.beginPath();
                ctx2.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                ctx2.fillStyle = '#f1c40f';
                ctx2.fill();
                ctx2.strokeStyle = '#d4ac0d';
                ctx2.lineWidth = 2;
                ctx2.stroke();
            });

            // Oyuncu
            const o = this.oyuncu;
            ctx2.save();
            ctx2.translate(o.x, o.y);
            ctx2.beginPath();
            ctx2.arc(0, 0, o.radius, 0, Math.PI * 2);
            ctx2.fillStyle = '#3e5c76';
            ctx2.fill();
            ctx2.strokeStyle = '#1f2d3d';
            ctx2.lineWidth = 3;
            ctx2.stroke();
            ctx2.rotate(o.angle);
            ctx2.beginPath();
            ctx2.moveTo(o.radius - 4, 0);
            ctx2.lineTo(o.radius + 14, 0);
            ctx2.strokeStyle = '#ffffff';
            ctx2.lineWidth = 4;
            ctx2.stroke();
            ctx2.beginPath();
            ctx2.moveTo(o.radius + 16, 0);
            ctx2.lineTo(o.radius + 8, -7);
            ctx2.lineTo(o.radius + 8, 7);
            ctx2.closePath();
            ctx2.fillStyle = '#ffffff';
            ctx2.fill();
            ctx2.restore();

            // Parçacıklar
            this.parcaciklar.forEach(p => {
                ctx2.globalAlpha = p.life / p.maxLife;
                ctx2.beginPath();
                ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx2.fillStyle = p.color;
                ctx2.fill();
            });
            ctx2.globalAlpha = 1;

            this._joystickCiz(ctx2);
        },

        _joystickCiz: function (ctx2) {
            const cfg = this._joyConfig;
            if (!cfg) return;
            [this.solJoy, this.sagJoy].forEach(joy => {
                if (!joy.active) return;
                const sx = joy.baseX / KORKU.CAMERA_ZOOM + KORKU.kamera.x - canvas.width / 2 / KORKU.CAMERA_ZOOM;
                const sy = joy.baseY / KORKU.CAMERA_ZOOM + KORKU.kamera.y - canvas.height / 2 / KORKU.CAMERA_ZOOM;
                ctx2.beginPath();
                ctx2.arc(sx, sy, cfg.baseRadius, 0, Math.PI * 2);
                ctx2.fillStyle = 'rgba(255,255,255,0.08)';
                ctx2.fill();
                ctx2.strokeStyle = 'rgba(255,255,255,0.25)';
                ctx2.lineWidth = 2;
                ctx2.stroke();
                const stx = sx + joy.stickX * cfg.maxStickDistance;
                const sty = sy + joy.stickY * cfg.maxStickDistance;
                ctx2.beginPath();
                ctx2.arc(stx, sty, cfg.stickRadius, 0, Math.PI * 2);
                ctx2.fillStyle = 'rgba(241,196,15,0.6)';
                ctx2.fill();
            });
        }
    });

    KORKU._baslangicOda = 'bolum1_oda1';

    console.log('[KORKU] Bölüm 1 / Oda 1 yüklendi.');
})();