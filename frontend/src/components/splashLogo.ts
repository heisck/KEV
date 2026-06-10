export type LineDirection = 'h' | 'v';

export type LineSpec = {
  key: string;
  direction: LineDirection;
  row: number;
  col: number;
};

export const BG = '#FFFFFF';
export const INK = '#000000';
export const LINE = '#000000';
export const CELL = 32;
export const COLS = 5;
export const ROWS = 4;
export const GRID_WIDTH = COLS * CELL;
export const LOGO_HEIGHT = ROWS * CELL;
export const COMMA_HEIGHT = LOGO_HEIGHT;
export const COMMA_WIDTH = Math.round((COMMA_HEIGHT * 94) / 144);
export const COMMA_LEFT = GRID_WIDTH - 10;
export const COMMA_TOP = LOGO_HEIGHT - COMMA_HEIGHT + 4;
export const LOGO_WIDTH = COMMA_LEFT + COMMA_WIDTH;
export const GRID_CENTER_OFFSET = (LOGO_WIDTH - GRID_WIDTH) / 2;
export const COMMA_PATH =
  'M72 2 C91 41,102 79,96 113 C90 148,62 174,31 171 C9 169,-3 150,8 127 C16 110,35 101,50 88 C76 65,84 31,72 2Z';

export const vanishSteps = [
  { row: 0, col: 1, at: 220, duration: 220 },
  { row: 2, col: 1, at: 260, duration: 200 },
  { row: 3, col: 1, at: 300, duration: 180 },
  { row: 3, col: 0, at: 500, duration: 160 },
  { row: 3, col: 2, at: 690, duration: 140 },
  { row: 3, col: 3, at: 840, duration: 120 },
  { row: 0, col: 4, at: 990, duration: 100 },
  { row: 3, col: 4, at: 1030, duration: 90 },
];

export const mergeSteps = [
  { at: 620, keys: ['h-1-2', 'h-2-2', 'v-1-1', 'v-1-2'] },
  { at: 1160, keys: ['h-2-4'] },
];

export const lineSpecs = [
  ...Array.from({ length: (ROWS + 1) * COLS }, (_, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    return { key: `h-${row}-${col}`, direction: 'h' as const, row, col };
  }),
  ...Array.from({ length: ROWS * (COLS + 1) }, (_, index) => {
    const row = index % ROWS;
    const col = Math.floor(index / ROWS);
    return { key: `v-${row}-${col}`, direction: 'v' as const, row, col };
  }),
];

export const lineIndex = new Map(lineSpecs.map((line, index) => [line.key, index]));

function cellIndex(row: number, col: number) {
  return row * COLS + col;
}

function isOut(row: number, col: number) {
  return row < 0 || row >= ROWS || col < 0 || col >= COLS;
}

function isGone(row: number, col: number, removed: Set<number>) {
  return isOut(row, col) || removed.has(cellIndex(row, col));
}

export function hideLine(key: string, hidden: Set<string>, onHide: (key: string) => void) {
  if (hidden.has(key)) return;
  hidden.add(key);
  onHide(key);
}

function hideOrphanLines(
  row: number,
  col: number,
  removed: Set<number>,
  hidden: Set<string>,
  onHide: (key: string) => void,
) {
  if (isGone(row - 1, col, removed)) hideLine(`h-${row}-${col}`, hidden, onHide);
  if (isGone(row + 1, col, removed)) hideLine(`h-${row + 1}-${col}`, hidden, onHide);
  if (isGone(row, col - 1, removed)) hideLine(`v-${row}-${col}`, hidden, onHide);
  if (isGone(row, col + 1, removed)) hideLine(`v-${row}-${col + 1}`, hidden, onHide);
}

export function removeCell(
  row: number,
  col: number,
  removed: Set<number>,
  hidden: Set<string>,
  onHide: (key: string) => void,
) {
  removed.add(cellIndex(row, col));
  hideOrphanLines(row, col, removed, hidden, onHide);

  for (const [nextRow, nextCol] of [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]) {
    if (!isOut(nextRow, nextCol) && removed.has(cellIndex(nextRow, nextCol))) {
      hideOrphanLines(nextRow, nextCol, removed, hidden, onHide);
    }
  }
}

function getFinalHiddenLines() {
  const removed = new Set<number>();
  const hidden = new Set<string>();

  for (const step of vanishSteps) {
    removeCell(step.row, step.col, removed, hidden, () => undefined);
  }
  for (const step of mergeSteps) {
    for (const key of step.keys) hidden.add(key);
  }

  return hidden;
}

export const finalHiddenLines = getFinalHiddenLines();
