import { useState, useEffect, useCallback, useRef } from 'react'

export type TetrisGameState = 'idle' | 'playing' | 'game_over' | 'paused'

export interface TetrisState {
    grid: number[][]
    currentPiece: Piece | null
    nextPiece: Piece | null
    score: number
    level: number
    lines: number
    gameState: TetrisGameState
}

interface Point {
    x: number
    y: number
}

interface Piece {
    shape: number[][]
    pos: Point
    color: number // 1-7 corresponding to standard tetrimino colors
}

// 10 cols, 20 rows standard
export const COLS = 10
export const ROWS = 20

// Shapes matrix representation
const PIECES: { shape: number[][], color: number }[] = [
    // I
    { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 1 },
    // J
    { shape: [[2, 0, 0], [2, 2, 2], [0, 0, 0]], color: 2 },
    // L
    { shape: [[0, 0, 3], [3, 3, 3], [0, 0, 0]], color: 3 },
    // O
    { shape: [[4, 4], [4, 4]], color: 4 },
    // S
    { shape: [[0, 5, 5], [5, 5, 0], [0, 0, 0]], color: 5 },
    // T
    { shape: [[0, 6, 0], [6, 6, 6], [0, 0, 0]], color: 6 },
    // Z
    { shape: [[7, 7, 0], [0, 7, 7], [0, 0, 0]], color: 7 }
]

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0))

const getRandomPiece = (): Piece => {
    const template = PIECES[Math.floor(Math.random() * PIECES.length)]
    return {
        shape: template.shape,
        pos: { x: Math.floor(COLS / 2) - Math.floor(template.shape[0].length / 2), y: 0 },
        color: template.color
    }
}

export function useTetris() {
    const [gameState, setGameState] = useState<TetrisGameState>('idle')
    const [grid, setGrid] = useState<number[][]>(createEmptyGrid())
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
    const [nextPiece, setNextPiece] = useState<Piece | null>(null)
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [lines, setLines] = useState(0)

    // Using refs for state accessed in intervals/timeouts to avoid stale closures
    const stateRef = useRef({
        grid, currentPiece, gameState
    })

    useEffect(() => {
        stateRef.current = { grid, currentPiece, gameState }
    }, [grid, currentPiece, gameState])

    const checkCollision = (piece: Piece, board: number[][]) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const boardX = piece.pos.x + x
                    const boardY = piece.pos.y + y
                    if (
                        boardX < 0 ||
                        boardX >= COLS ||
                        boardY >= ROWS ||
                        (boardY >= 0 && board[boardY][boardX] !== 0)
                    ) {
                        return true
                    }
                }
            }
        }
        return false
    }

    const mergePiece = (piece: Piece, board: number[][]) => {
        const newBoard = board.map(row => [...row])
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const boardY = piece.pos.y + y
                    if (boardY >= 0) {
                        newBoard[boardY][piece.pos.x + x] = piece.color
                    }
                }
            }
        }
        return newBoard
    }

    const clearLines = (board: number[][]) => {
        let linesCleared = 0
        const newBoard = board.filter(row => {
            if (row.every(cell => cell !== 0)) {
                linesCleared++
                return false
            }
            return true
        })

        while (newBoard.length < ROWS) {
            newBoard.unshift(Array(COLS).fill(0))
        }

        return { newBoard, linesCleared }
    }

    const startGame = useCallback(() => {
        setGrid(createEmptyGrid())
        setScore(0)
        setLevel(1)
        setLines(0)
        setGameState('playing')
        setCurrentPiece(getRandomPiece())
        setNextPiece(getRandomPiece())
    }, [])

    const pauseGame = useCallback(() => {
        setGameState(prev => prev === 'playing' ? 'paused' : 'playing')
    }, [])

    const spawnNextPiece = useCallback(() => {
        if (!nextPiece) return
        setCurrentPiece(nextPiece)
        setNextPiece(getRandomPiece())

        // Check initial collision (Game Over)
        if (checkCollision(nextPiece, grid)) {
            setGameState('game_over')
        }
    }, [nextPiece, grid])

    const moveLeft = useCallback(() => {
        if (gameState !== 'playing' || !currentPiece) return
        const movedPiece = { ...currentPiece, pos: { ...currentPiece.pos, x: currentPiece.pos.x - 1 } }
        if (!checkCollision(movedPiece, grid)) {
            setCurrentPiece(movedPiece)
        }
    }, [currentPiece, grid, gameState])

    const moveRight = useCallback(() => {
        if (gameState !== 'playing' || !currentPiece) return
        const movedPiece = { ...currentPiece, pos: { ...currentPiece.pos, x: currentPiece.pos.x + 1 } }
        if (!checkCollision(movedPiece, grid)) {
            setCurrentPiece(movedPiece)
        }
    }, [currentPiece, grid, gameState])

    const moveDown = useCallback(() => {
        const { grid: currentGrid, currentPiece: piece, gameState: state } = stateRef.current
        if (state !== 'playing' || !piece) return false

        const movedPiece = { ...piece, pos: { ...piece.pos, y: piece.pos.y + 1 } }

        if (!checkCollision(movedPiece, currentGrid)) {
            setCurrentPiece(movedPiece)
            return true
        } else {
            // Lock piece
            const newGrid = mergePiece(piece, currentGrid)
            const { newBoard, linesCleared } = clearLines(newGrid)

            setGrid(newBoard)

            if (linesCleared > 0) {
                setLines(prev => {
                    const newLines = prev + linesCleared
                    setLevel(Math.floor(newLines / 10) + 1)
                    return newLines
                })

                // Classic scoring 
                const lineScores = [0, 40, 100, 300, 1200]
                setScore(prev => prev + (lineScores[linesCleared] * level))
            }

            spawnNextPiece()
            return false
        }
    }, [level, spawnNextPiece])

    const hardDrop = useCallback(() => {
        if (gameState !== 'playing' || !currentPiece) return

        let movedPiece = { ...currentPiece }
        while (!checkCollision({ ...movedPiece, pos: { ...movedPiece.pos, y: movedPiece.pos.y + 1 } }, grid)) {
            movedPiece.pos.y += 1
            // Add a small score bonus for hard drop
            setScore(prev => prev + 2)
        }

        setCurrentPiece(movedPiece)
        // Small timeout to let user see it landed before locking it instantly and spawning
        setTimeout(() => {
            moveDown()
        }, 0)
    }, [currentPiece, grid, gameState, moveDown])

    const rotate = useCallback(() => {
        if (gameState !== 'playing' || !currentPiece) return

        // Matrix transpose & reverse rows (rotate 90 deg clockwise)
        const rotatedShape = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map(row => row[i]).reverse()
        )

        const rotatedPiece = { ...currentPiece, shape: rotatedShape }

        // Basic wall kick (try shifting left/right up to 2 times to fit)
        let kickedPiece = { ...rotatedPiece }
        let validRotation = false

        const kicks = [0, -1, 1, -2, 2]
        for (let k of kicks) {
            kickedPiece.pos = { ...rotatedPiece.pos, x: rotatedPiece.pos.x + k }
            if (!checkCollision(kickedPiece, grid)) {
                validRotation = true
                break
            }
        }

        if (validRotation) {
            setCurrentPiece(kickedPiece)
        }
    }, [currentPiece, grid, gameState])

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing') return

        // Speed increases with level. Levels 1-15 scale down delay
        const speed = Math.max(100, 1000 - (level - 1) * 60)

        const timer = setInterval(() => {
            moveDown()
        }, speed)

        return () => clearInterval(timer)
    }, [gameState, level, moveDown])

    return {
        grid,
        currentPiece,
        nextPiece,
        score,
        level,
        lines,
        gameState,
        startGame,
        pauseGame,
        moveLeft,
        moveRight,
        moveDown,
        hardDrop,
        rotate
    }
}
