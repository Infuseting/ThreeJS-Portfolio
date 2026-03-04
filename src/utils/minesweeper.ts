/* ═══════════════════════════════════════════════
 *  Minesweeper Pure Domain Logic
 *
 *  Provides a framework-agnostic implementation
 *  for Minesweeper. (SOLID Principle: Single Responsibility)
 *  - No React logic or UI types are used here.
 *  - Contains board generation, cell revealing, flagging,
 *    and win/loss condition tracking.
 * ═══════════════════════════════════════════════ */

export type GameStatus = "idle" | "playing" | "won" | "lost";
export type Difficulty = "beginner" | "intermediate" | "expert";

export interface CellData {
    x: number;
    y: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
}

export interface GameState {
    board: CellData[][];
    status: GameStatus;
    minesCount: number;
    flagsCount: number;
    cols: number;
    rows: number;
    startTime: number | null;
    endTime: number | null;
}

export const DIFFICULTIES: Record<
    Difficulty,
    { cols: number; rows: number; mines: number }
> = {
    beginner: { cols: 9, rows: 9, mines: 10 },
    intermediate: { cols: 16, rows: 16, mines: 40 },
    expert: { cols: 30, rows: 16, mines: 99 },
};

/**
 * Creates an initial empty board state based on a difficulty.
 */
export function createEmptyBoard(difficulty: Difficulty): GameState {
    const { cols, rows, mines } = DIFFICULTIES[difficulty];
    const board: CellData[][] = [];

    for (let y = 0; y < rows; y++) {
        const row: CellData[] = [];
        for (let x = 0; x < cols; x++) {
            row.push({
                x,
                y,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
            });
        }
        board.push(row);
    }

    return {
        board,
        status: "idle",
        minesCount: mines,
        flagsCount: 0,
        cols,
        rows,
        startTime: null,
        endTime: null,
    };
}

/**
 * Places mines randomly, avoiding the initial click cell.
 * Calculates neighborhood mine counts.
 */
export function initializeBoardWithMines(
    state: GameState,
    startX: number,
    startY: number
): GameState {
    const newState = { ...state, board: cloneBoard(state.board), status: "playing" as GameStatus, startTime: Date.now() };
    let minesPlaced = 0;

    while (minesPlaced < newState.minesCount) {
        const y = Math.floor(Math.random() * newState.rows);
        const x = Math.floor(Math.random() * newState.cols);

        // Don't place a mine on the starting cell (or its immediate neighbors for a guaranteed safe start area)
        const isStartArea = Math.abs(x - startX) <= 1 && Math.abs(y - startY) <= 1;

        if (!newState.board[y][x].isMine && !isStartArea) {
            newState.board[y][x].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbor counts
    for (let y = 0; y < newState.rows; y++) {
        for (let x = 0; x < newState.cols; x++) {
            if (!newState.board[y][x].isMine) {
                newState.board[y][x].neighborMines = countNeighborMines(newState.board, x, y);
            }
        }
    }

    return newState;
}

/**
 * Reveals a cell and cascade-reveals around empty cells.
 */
export function revealCell(state: GameState, x: number, y: number): GameState {
    if (state.status === "won" || state.status === "lost") return state;
    if (!isValid(state, x, y)) return state;

    const cell = state.board[y][x];
    if (cell.isRevealed || cell.isFlagged) return state;

    let newState = state;

    // If first click, initialize mines
    if (state.status === "idle") {
        newState = initializeBoardWithMines(state, x, y);
    } else {
        newState = { ...state, board: cloneBoard(state.board) };
    }

    const newCell = newState.board[y][x];

    if (newCell.isMine) {
        // Game Over
        return revealAllMines({ ...newState, status: "lost", endTime: Date.now() });
    }

    // Recursive reveal
    cascadeReveal(newState.board, x, y);

    // Check win condition
    if (checkWinCondition(newState)) {
        newState.status = "won";
        newState.endTime = Date.now();
    }

    return newState;
}

/**
 * Checks if the board meets the win criteria (all non-mine cells revealed).
 */
export function checkWinCondition(state: GameState): boolean {
    for (let y = 0; y < state.rows; y++) {
        for (let x = 0; x < state.cols; x++) {
            const cell = state.board[y][x];
            if (!cell.isMine && !cell.isRevealed) {
                return false; // Still unrevealed safe cells
            }
        }
    }
    return true;
}

/**
 * Toggles a flag on a cell.
 */
export function toggleFlag(state: GameState, x: number, y: number): GameState {
    if (state.status === "won" || state.status === "lost") return state;
    if (!isValid(state, x, y)) return state;

    const cell = state.board[y][x];
    if (cell.isRevealed) return state;

    const newState = { ...state, board: cloneBoard(state.board) };
    newState.board[y][x].isFlagged = !cell.isFlagged;
    newState.flagsCount += newState.board[y][x].isFlagged ? 1 : -1;

    return newState;
}

/**
 * Reveals neighbors if the number of surrounding flags matches the cell's neighbor count.
 */
export function revealChord(state: GameState, x: number, y: number): GameState {
    if (state.status !== "playing") return state;
    if (!isValid(state, x, y)) return state;

    const cell = state.board[y][x];
    if (!cell.isRevealed || cell.neighborMines === 0) return state;

    let flagCount = 0;
    const neighbors = getNeighbors(state.board, x, y);
    for (const [nx, ny] of neighbors) {
        if (state.board[ny][nx].isFlagged) {
            flagCount++;
        }
    }

    if (flagCount === cell.neighborMines) {
        let newState = state;
        for (const [nx, ny] of neighbors) {
            if (!newState.board[ny][nx].isRevealed && !newState.board[ny][nx].isFlagged) {
                newState = revealCell(newState, nx, ny);
                if (newState.status === "lost") break; // Stop cascading on a mine
            }
        }
        return newState;
    }

    return state;
}

/** --- Helpers --- **/

function cascadeReveal(board: CellData[][], x: number, y: number) {
    if (!isValidBounds(board, x, y) || board[y][x].isRevealed || board[y][x].isFlagged) return;

    board[y][x].isRevealed = true;

    if (board[y][x].neighborMines === 0) {
        const neighbors = getNeighbors(board, x, y);
        for (const [nx, ny] of neighbors) {
            cascadeReveal(board, nx, ny);
        }
    }
}

function revealAllMines(state: GameState): GameState {
    state.board.forEach((row) => {
        row.forEach((cell) => {
            if (cell.isMine) {
                cell.isRevealed = true;
            }
        });
    });
    return state;
}

function countNeighborMines(board: CellData[][], cx: number, cy: number): number {
    let count = 0;
    for (const [nx, ny] of getNeighbors(board, cx, cy)) {
        if (board[ny][nx].isMine) count++;
    }
    return count;
}

function getNeighbors(board: CellData[][], cx: number, cy: number): [number, number][] {
    const neighbors: [number, number][] = [];
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if (isValidBounds(board, nx, ny)) {
                neighbors.push([nx, ny]);
            }
        }
    }
    return neighbors;
}

function isValidBounds(board: CellData[][], x: number, y: number): boolean {
    return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
}

function isValid(state: GameState, x: number, y: number): boolean {
    return isValidBounds(state.board, x, y);
}

function cloneBoard(board: CellData[][]): CellData[][] {
    return board.map((row) => row.map((cell) => ({ ...cell })));
}
