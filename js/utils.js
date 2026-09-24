// Sayıyı min-max arasına sıkıştır
export const cl = (v,a,b) => Math.max(a, Math.min(b, v));

// Rastgele tam sayı (a-b arası, dahil)
export const ri = (a,b) => Math.floor(Math.random() * (b-a+1)) + a;

// Rastgele ondalık sayı (a-b arası)
export const rf = (a,b) => Math.random() * (b-a) + a;

// İki dikdörtgen çarpışıyor mu?
export const col = (a,b) =>
  a.x < b.x+b.w && a.x+a.w > b.x &&
  a.y < b.y+b.h && a.y+a.h > b.y;