'use strict';

/**
 * 2048 游戏核心逻辑模块
 * 从 index.html 中提取的可测试纯逻辑（不含 DOM 操作）
 */

const SIZE = 4;

class Game2048 {
  constructor() {
    this.grid = []; // 4x4 二维数组，每个元素为 tile 对象或 null
    this.score = 0;
    this.won = false;
    this.over = false;
    this.nextId = 1;
  }

  /**
   * 重置游戏状态
   */
  newGame() {
    this.grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    this.score = 0;
    this.won = false;
    this.over = false;
    this.nextId = 1;
    this.spawnTile();
    this.spawnTile();
  }

  /**
   * 获取所有空格子坐标
   * @returns {Array<[number, number]>}
   */
  emptyCells() {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!this.grid[r][c]) cells.push([r, c]);
      }
    }
    return cells;
  }

  /**
   * 在随机空格生成新瓷砖
   * @param {Function} [randomFn] - 可控的随机函数，用于测试
   * @returns {object|null} 生成的瓷砖，或无空格时返回 null
   */
  spawnTile(randomFn) {
    const cells = this.emptyCells();
    if (!cells.length) return null;
    const rand = randomFn || Math.random;
    const pos = Math.floor(rand() * cells.length);
    const [r, c] = cells[pos];
    const tile = {
      id: this.nextId++,
      value: rand() < 0.9 ? 2 : 4,
      r,
      c,
    };
    this.grid[r][c] = tile;
    return tile;
  }

  /**
   * 移动方向 0=up 1=right 2=down 3=left
   * @param {number} dir - 移动方向
   * @returns {{moved: boolean, gained: number, mergedTiles: Array, absorbedTiles: Array}}
   */
  move(dir) {
    if (this.over) return { moved: false, gained: 0, mergedTiles: [], absorbedTiles: [] };

    const vertical = dir === 0 || dir === 2;
    const reverse = dir === 1 || dir === 2;
    let moved = false;
    let gained = 0;
    const keepers = [];
    const absorbed = [];

    for (let i = 0; i < SIZE; i++) {
      const line = [];
      for (let j = 0; j < SIZE; j++) {
        const idx = reverse ? SIZE - 1 - j : j;
        const t = vertical ? this.grid[idx][i] : this.grid[i][idx];
        if (t) line.push(t);
      }

      const result = [];
      for (let k = 0; k < line.length; k++) {
        const keeper = line[k];
        if (k + 1 < line.length && keeper.value === line[k + 1].value) {
          keeper.value *= 2;
          gained += keeper.value;
          keepers.push(keeper);
          absorbed.push({ tile: line[k + 1], target: keeper });
          k++;
        }
        result.push(keeper);
      }

      for (let j = 0; j < SIZE; j++) {
        const idx = reverse ? SIZE - 1 - j : j;
        const t = result[j] || null;
        if (vertical) this.grid[idx][i] = t; else this.grid[i][idx] = t;
        if (t) {
          const nr = vertical ? idx : i;
          const nc = vertical ? i : idx;
          if (t.r !== nr || t.c !== nc) {
            t.r = nr;
            t.c = nc;
            moved = true;
          }
        }
      }
    }

    if (absorbed.length) moved = true;
    if (!moved) {
      return { moved: false, gained: 0, mergedTiles: [], absorbedTiles: [] };
    }

    // 更新得分
    this.score += gained;

    // 移除被吸收的瓷砖
    absorbed.forEach(({ tile }) => {
      // tile 已从 grid 中被覆盖
    });

    // 检查胜利条件
    if (!this.won && keepers.some(t => t.value === 2048)) {
      this.won = true;
    }

    return {
      moved: true,
      gained,
      mergedTiles: keepers.slice(),
      absorbedTiles: absorbed.map(a => a.tile),
      gameWon: this.won,
    };
  }

  /**
   * 判断是否还能移动
   * @returns {boolean}
   */
  canMove() {
    if (this.emptyCells().length) return true;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const v = this.grid[r][c].value;
        if (r + 1 < SIZE && this.grid[r + 1][c].value === v) return true;
        if (c + 1 < SIZE && this.grid[r][c + 1].value === v) return true;
      }
    }
    return false;
  }

  /**
   * 检查游戏是否结束（满盘且无可合并）
   * @returns {boolean}
   */
  isGameOver() {
    return !this.canMove();
  }

  /**
   * 获取当前棋盘值的快照，便于测试断言
   * @returns {Array<Array<number|null>>}
   */
  getBoardValues() {
    return this.grid.map(row => row.map(tile => (tile ? tile.value : null)));
  }

  /**
   * 通过值直接设置棋盘状态（测试辅助方法）
   * @param {Array<Array<number|null>>} values
   */
  setBoardValues(values) {
    this.grid = Array.from({ length: SIZE }, (_, r) =>
      Array.from({ length: SIZE }, (_, c) => {
        const v = values[r][c];
        return v ? { id: this.nextId++, value: v, r, c } : null;
      })
    );
  }
}

module.exports = { Game2048, SIZE };
