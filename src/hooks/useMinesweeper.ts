import { useState, useCallback } from "react";
import {
    Difficulty,
    GameState,
    createEmptyBoard,
    revealCell,
    toggleFlag,
    revealChord,
} from "../utils/minesweeper";

export function useMinesweeper(initialDifficulty: Difficulty = "beginner") {
    const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
    const [gameState, setGameState] = useState<GameState>(() =>
        createEmptyBoard(initialDifficulty)
    );

    const resetGame = useCallback((newDifficulty?: Difficulty) => {
        const diff = newDifficulty || difficulty;
        setDifficulty(diff);
        setGameState(createEmptyBoard(diff));
    }, [difficulty]);

    const reveal = useCallback((x: number, y: number) => {
        setGameState((prev) => revealCell(prev, x, y));
    }, []);

    const flag = useCallback((x: number, y: number) => {
        setGameState((prev) => toggleFlag(prev, x, y));
    }, []);

    const chord = useCallback((x: number, y: number) => {
        setGameState((prev) => revealChord(prev, x, y));
    }, []);

    return {
        gameState,
        difficulty,
        resetGame,
        reveal,
        flag,
        chord,
    };
}
