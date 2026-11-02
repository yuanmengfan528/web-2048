'use strict';

const { Game2048, SIZE } = require('./game');

/**
 * 2048 游戏核心逻辑测试
 * 覆盖：move 合并逻辑、四方向移动、canMove 判断、得分计算、边界条件
 */

describe('Game2048', () => {
  let game;

  beforeEach(() => {
    game = new Game2048();
  });

  describe('初始化', () => {
    test('newGame 应创建 4x4 空棋盘并生成 2 个初始瓷砖', () => {
      game.newGame();
      expect(game.grid.length).toBe(SIZE);
      expect(game.grid[0].length).toBe(SIZE);
      const tiles = game.grid.flat().filter(Boolean);
      expect(tiles.length).toBe(2);
      expect(game.score).toBe(0);
      expect(game.won).toBe(false);
      expect(game.over).toBe(false);
    });

    test('每个初始瓷砖值只能是 2 或 4', () => {
      game.newGame();
      const tiles = game.grid.flat().filter(Boolean);
      tiles.forEach(tile => {
        expect([2, 4]).toContain(tile.value);
      });
    });

    test('瓷砖 id 应唯一递增', () => {
      game.newGame();
      const ids = new Set(game.grid.flat().filter(Boolean).map(t => t.id));
      expect(ids.size).toBe(2);
    });
  });

  describe('spawnTile', () => {
    test('在空棋盘生成瓷砖应成功', () => {
      game.setBoardValues([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const before = game.emptyCells().length;
      const tile = game.spawnTile(() => 0);
      expect(tile).not.toBeNull();
      expect(game.emptyCells().length).toBe(before - 1);
    });

    test('满棋盘生成瓷砖应返回 null', () => {
      game.setBoardValues([
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ]);
      const tile = game.spawnTile();
      expect(tile).toBeNull();
    });

    test('90% 概率生成值为 2 的瓷砖', () => {
      game.setBoardValues([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const tile = game.spawnTile(() => 0.5);
      expect(tile.value).toBe(2);
    });

    test('10% 概率生成值为 4 的瓷砖', () => {
      game.setBoardValues([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const tile = game.spawnTile(() => 0.95);
      expect(tile.value).toBe(4);
    });
  });

  describe('move - 向左移动 (dir=3)', () => {
    test('基本合并：[2,2,0,0] 向左 → [4,0,0,0]', () => {
      game.setBoardValues([
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(4);
      expect(game.getBoardValues()[0]).toEqual([4, null, null, null]);
    });

    test('四个相同值：[2,2,2,2] 向左 → [4,4,0,0]', () => {
      game.setBoardValues([
        [2, 2, 2, 2],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(8);
      expect(game.getBoardValues()[0]).toEqual([4, 4, null, null]);
    });

    test('不同值不合并不移动', () => {
      game.setBoardValues([
        [2, 4, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(false);
    });

    test('只有移动无合并', () => {
      game.setBoardValues([
        [2, null, 4, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(0);
      expect(game.getBoardValues()[0]).toEqual([2, 4, null, null]);
    });

    test('复杂场景：[2,0,2,4] 向左 → [4,4,0,0]', () => {
      game.setBoardValues([
        [2, null, 2, 4],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(4);
      expect(game.getBoardValues()[0]).toEqual([4, 4, null, null]);
    });

    test('多行合并后 score 正确累加', () => {
      game.setBoardValues([
        [2, 2, null, null],
        [2, 2, null, null],
        [2, 2, null, null],
        [2, 2, null, null],
      ]);
      const result = game.move(3);
      expect(game.score).toBe(16);
      expect(result.gained).toBe(16);
    });
  });

  describe('move - 向右移动 (dir=1)', () => {
    test('基本合并：向右合并到最右', () => {
      game.setBoardValues([
        [null, null, 2, 2],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(1);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(4);
      expect(game.getBoardValues()[0]).toEqual([null, null, null, 4]);
    });

    test('四个相同值向右两两合并', () => {
      game.setBoardValues([
        [2, 2, 2, 2],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(1);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(8);
      expect(game.getBoardValues()[0]).toEqual([null, null, 4, 4]);
    });
  });

  describe('move - 向上移动 (dir=0)', () => {
    test('基本纵向合并', () => {
      game.setBoardValues([
        [2, null, null, null],
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(0);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(4);
      expect(game.getBoardValues()[0][0]).toBe(4);
    });
  });

  describe('move - 向下移动 (dir=2)', () => {
    test('基本纵向合并到最下', () => {
      game.setBoardValues([
        [2, null, null, null],
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(2);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(4);
      expect(game.getBoardValues()[3][0]).toBe(4);
    });
  });

  describe('move - 游戏结束后不能移动', () => {
    test('游戏结束后 move 返回 moved=false', () => {
      game.over = true;
      game.setBoardValues([
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.moved).toBe(false);
    });
  });

  describe('canMove', () => {
    test('空棋盘可以移动', () => {
      game.setBoardValues([
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      expect(game.canMove()).toBe(true);
    });

    test('满盘无可合并返回 false', () => {
      game.setBoardValues([
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ]);
      expect(game.canMove()).toBe(false);
    });

    test('有空格返回 true', () => {
      game.setBoardValues([
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, null],
        [4, 2, 4, 2],
      ]);
      expect(game.canMove()).toBe(true);
    });
  });

  describe('边界条件与胜利条件', () => {
    test('合并出 2048 标记 won=true', () => {
      game.setBoardValues([
        [1024, 1024, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(result.gameWon).toBe(true);
      expect(game.won).toBe(true);
    });

    test('未到 2048 不标记胜利', () => {
      game.setBoardValues([
        [2, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      game.move(3);
      expect(game.won).toBe(false);
    });

    test('胜利后继续合并到 4096 仍保持 won=true', () => {
      game.won = true;
      game.setBoardValues([
        [2048, 2048, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      game.move(3);
      expect(game.won).toBe(true);
      expect(game.getBoardValues()[0][0]).toBe(4096);
    });
  });

  describe('回归测试 - 关键确定性场景', () => {
    test('三个相同值：[2,2,2,0] → [4,2,0,0] 不是 [8,0,0,0]', () => {
      game.setBoardValues([
        [2, 2, 2, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ]);
      const result = game.move(3);
      expect(game.getBoardValues()[0]).toEqual([4, 2, null, null]);
      expect(result.gained).toBe(4);
    });

    test('得分等于所有合并值之和', () => {
      game.setBoardValues([
        [2, 2, 2, 2],
        [4, 4, 4, 4],
        [8, 8, 8, 8],
        [16, 16, 16, 16],
      ]);
      const result = game.move(3);
      expect(result.gained).toBe(120);
      expect(game.score).toBe(120);
    });

    test('满盘相邻相同值应可合并', () => {
      game.setBoardValues([
        [2, 4, 8, 16],
        [2, 4, 8, 16],
        [2, 4, 8, 16],
        [2, 4, 8, 16],
      ]);
      expect(game.canMove()).toBe(true);
      const result = game.move(0);
      expect(result.moved).toBe(true);
      expect(result.gained).toBe(120);
    });
  });

  describe('稳定性', () => {
    test('连续 100 次操作不报错', () => {
      for (let i = 0; i < 100; i++) {
        game.newGame();
        for (let d = 0; d < 4; d++) {
          game.move(d);
        }
      }
      expect(true).toBe(true);
    });
  });
});
