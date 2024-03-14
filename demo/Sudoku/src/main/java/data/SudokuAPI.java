package data;

import java.util.HashSet;
import java.util.Set;

public class SudokuAPI {

    public static final int TILE_COUNT = 81;
    public static final int ROWS = 9;
    public static final int COLS = 9;
    public static final int BOX = 9;
    public static final int BOXROWS = 3;
    public static final int BOXCOLS = 3;
    public static final int DEFAULT_VALUE = 0;

    public static Set<Integer> check(int[] sudoku) {
        Set<Integer> mistakes = new HashSet<>();

        for(int i = 0; i < 9; ++i) {
            mistakes.addAll(checkColumn(i, sudoku));
            mistakes.addAll(checkRow(i, sudoku));
            mistakes.addAll(checkBox(i, sudoku));
        }

        return mistakes;
    }

    private static void check(int index, int max, int[] numSet, int[] sudoku, Set<Integer> wrongNumbers) {
        int number = sudoku[index];

        for (int j = 0; j < max; ++j) {

            int boxIdx = numSet[j];

            if(sudoku[boxIdx] != DEFAULT_VALUE && sudoku[boxIdx] == number) {
                wrongNumbers.add(boxIdx);
                wrongNumbers.add(index);
            }
        }
    }

    public static Set<Integer> checkColumn(int x, int[] sudoku) {

        Set<Integer> wrongNumbers = new HashSet<>();
        int[] columnSet = new int[ROWS];

        for (int y = 0; y < ROWS; ++y) {
            int index = y * COLS + x;

            check(index, y, columnSet, sudoku, wrongNumbers);

            columnSet[y] = index;
        }

        return wrongNumbers;
    }

    public static Set<Integer> checkRow(int y, int[] sudoku) {

        Set<Integer> wrongNumbers = new HashSet<>();
        int[] rowSet = new int[COLS];

        for (int x = 0; x < COLS; ++x) {
            int index = y * COLS + x;

            check(index, x, rowSet, sudoku, wrongNumbers);

            rowSet[x] = index;
        }

        return wrongNumbers;
    }

    public static Set<Integer> checkBox(int boxIndex, int[] sudoku) {

        Set<Integer> wrongNumbers = new HashSet<>();

        int[] boxSet = new int[BOX];

        for (int i = 0; i < BOX; ++i) {

            int boxX = BOXCOLS * (boxIndex % BOXCOLS);
            int boxY = BOXROWS * (boxIndex / BOXROWS);

            int y = i / BOXROWS + boxY;
            int x = i % BOXCOLS + boxX;

            int index = y * COLS + x;

            check(index, i, boxSet, sudoku, wrongNumbers);

            boxSet[i] = index;
        }

        return wrongNumbers;
    }

    private static boolean isSafe(int x, int y, int number, int[] sudoku) {
        for (int i = 0; i < ROWS; ++i) {
            int index = i * COLS + x;

            if (sudoku[index] == number) {
                return false;
            }
        }

        for (int i = 0; i < COLS; ++i) {
            int index = y * COLS + i;

            if (sudoku[index] == number) {
                return false;
            }
        }

        int startRow = y - y % BOXROWS;
        int startCol = x - x % BOXCOLS;

        for (int i = 0; i < BOXROWS; ++i) {
            for (int j = 0; j < BOXCOLS; ++j) {
                int row = i + startRow;
                int col = j + startCol;

                int index = row * COLS + col;

                if (sudoku[index] == number) {
                    return false;
                }
            }
        }

        return true;
    }

    public static boolean solve(int x, int y, int[] sudoku) {
        if (y == ROWS - 1 && x == COLS) {
            return true;
        }

        if (x == COLS) {
            y++;
            x = 0;
        }

        int index = y * COLS + x;

        if (sudoku[index] != DEFAULT_VALUE) {
            return solve(x + 1, y, sudoku);
        }

        for (int i = 1; i <= 9; ++i) {
            if (isSafe(x, y, i, sudoku)) {
                sudoku[index] = i;

                if (solve(x + 1, y, sudoku)) {
                    return true;
                }

                sudoku[index] = 0;
            }
        }

        return false;

    }

    public static int nrSolutions(int x, int y, int candidates, int[] sudoku) {

        if (y == ROWS - 1 && x == COLS) {
            return candidates + 1;
        }

        if (x == COLS) {
            y++;
            x = 0;
        }

        int index = y * COLS + x;

        if (sudoku[index] != DEFAULT_VALUE) {
            return nrSolutions(x + 1, y, candidates, sudoku);
        }

        for (int i = 1; i <= 9; ++i) {
            if (isSafe(x, y, i, sudoku)) {
                sudoku[index] = i;

                candidates = nrSolutions(x + 1, y, candidates, sudoku);

                if (candidates > 1) {
                    return 2;
                }

                sudoku[index] = DEFAULT_VALUE;
            }
        }

        return candidates;
    }

    public static int nrSolutions(int[] sudoku) {
        if(check(sudoku).isEmpty()) {
            return nrSolutions(0, 0, 0, sudoku);
        }

        return 0;
    }
}
