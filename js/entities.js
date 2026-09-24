// ============ ENTITY (temel sınıf) ============
export class Entity {
  constructor(x,y,w,h){
    this.x=x; this.y=y; this.w=w; this.h=h;
    this.alive=1;
  }
  get rect(){ return {x:this.x, y:this.y, w:this.w, h:this.h}; }
  update(dt,g){}
  draw(ctx){}
}

// ============ BOARD (grid sistemi) ============
export class Board {
  constructor(cols, rows, cellSize, ox, oy){
    this.cols=cols; this.rows=rows;
    this.cw=cellSize; this.ch=cellSize;
    this.ox=ox; this.oy=oy;
    this.grid = Array.from({length:rows}, () => Array(cols).fill(null));
  }

  cellAt(px, py){
    const col = Math.floor((px - this.ox) / this.cw);
    const row = Math.floor((py - this.oy) / this.ch);
    if(row<0 || row>=this.rows || col<0 || col>=this.cols) return null;
    return {row, col};
  }

  center(row, col){
    return {
      x: this.ox + col*this.cw + this.cw/2,
      y: this.oy + row*this.ch + this.ch/2
    };
  }

  place(row, col, p){ this.grid[row][col] = p; }
  remove(row, col){ this.grid[row][col] = null; }
  isFree(row, col){ return this.grid[row][col] === null; }
}