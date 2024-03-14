package data;

import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;

import java.io.File;
import java.io.IOException;
import java.util.*;

public class DataModel {

    private static final DataModel instance = new DataModel();
    private final BooleanProperty timerRunning = new SimpleBooleanProperty();
    private final ObjectProperty<SudokuMode> currentMode = new SimpleObjectProperty<>(SudokuMode.CREATE);
    private Timer timer = null;
    private TimerTask timerTask;

    private final LongProperty secondsPassed = new SimpleLongProperty();
    private final BooleanProperty timerEnabled = new SimpleBooleanProperty(true);
    public ObservableList<CellDataBinding> tiles = FXCollections.observableArrayList(Arrays.asList(new CellDataBinding[SudokuAPI.TILE_COUNT]));

    @SuppressWarnings("unchecked")
    private final ListChangeListener<Integer> selectionChangeListener = change -> {
        change.next();

        List<Integer> removed = (List<Integer>) change.getRemoved();
        List<Integer> added = (List<Integer>) change.getAddedSubList();

        for (Integer index : removed) {
            tiles.get(index).setSelected(false);
        }

        for (Integer index : added) {
            tiles.get(index).setSelected(true);
        }
    };

    public ObservableList<Integer> selectedTiles = FXCollections.observableArrayList();
    private String currentLevel = null;

    private DataModel() {
        selectedTiles.addListener(selectionChangeListener);

        for (int i = 0; i < tiles.size(); ++i) {
            tiles.set(i, new CellDataBinding(true));
        }
    }

    public static DataModel getInstance() {
        return instance;
    }

    public LongProperty secondsPassedProperty() {
        return secondsPassed;
    }

    public void startTimer() {
        endTimer();

        timerRunning.set(true);
        secondsPassed.set(0);

        timer = new Timer(false);

        timerTask = new TimerTask() {
            @Override
            public void run() {
                secondsPassed.set(secondsPassed.get() + 1);
            }
        };

        timer.scheduleAtFixedRate(timerTask, 0, 1000);
    }

    public void endTimer() {
        timerRunning.set(false);
        if(timer != null) {
            timer.cancel();
        }
    }

    public void startGame() {
        startTimer();
        currentMode.set(SudokuMode.PLAY);
    }

    private void startEdit() {
        currentMode.set(SudokuMode.CREATE);
    }

    public void loadFile(File file) throws Exception {
        tiles.setAll(SudokuFile.load(file));

        if (nrSolutions() == 0) {
            clear();
            throw new Exception("Loaded sudoku doesn't have any solution");
        }

        currentLevel = file.getName();
        startGame();
    }

    public void saveToFile(File newFile) throws SudokuFile.Exception {
        SudokuFile.save(newFile, tiles);
    }

    public void newSudoku() {
        startEdit();
        clear();
    }

    public void selectTile(Integer tileIndex) {
        selectedTiles.add(tileIndex);
    }

    public void deselectTile(Integer tileIndex) {
        selectedTiles.remove(tileIndex);
    }

    public void deselectAll() {
        while (!selectedTiles.isEmpty()) {
            deselectTile(selectedTiles.get(0));
        }
    }

    public void setCurrentMode(SudokuMode mode) {
        if (currentMode.get() != SudokuMode.CREATE) {
            currentMode.set(mode);
        }
    }

    public void toggleNumber(Integer number, SudokuMode forceMode) {
        for (Integer i : selectedTiles) {
            tiles.get(i).toggleNumber(number, forceMode == null ? currentMode.get() : forceMode);
        }
    }

    public void delete() {
        for (Integer i : selectedTiles) {
            tiles.get(i).delete(currentMode.get());
        }
    }

    private void setCorrect(Iterable<Integer> index, boolean correct) {
        for(int i : index) {
            tiles.get(i).setCorrect(correct);
        }
    }

    public boolean check() {
        int filledTileCount = 0;

        int[] sudoku = new int[SudokuAPI.TILE_COUNT];

        for (int i = 0; i < tiles.size(); ++i) {
            CellDataBinding tile = tiles.get(i);

            sudoku[i] = tile.getNumber();

            tile.setCorrect(true);

            if (tile.getNumber() != SudokuAPI.DEFAULT_VALUE) {
                filledTileCount++;
            }
        }

        Set<Integer> mistakes = SudokuAPI.check(sudoku);
        setCorrect(mistakes, false);

        boolean isCorrect = mistakes.isEmpty();

        if (!timerRunning.get() || !timerEnabled.get()) {
            return false;
        }

        if (isCorrect && filledTileCount == SudokuAPI.TILE_COUNT) {
            endTimer();
            return true;
        }

        return false;
    }

    public void clear() {
        for (CellDataBinding tile : tiles) {
            tile.erase(currentMode.get());
        }
    }

    public void solve() {
        endTimer();

        int[] numbers = new int[SudokuAPI.TILE_COUNT];
        for (int i = 0; i < SudokuAPI.TILE_COUNT; ++i) {
            if (!tiles.get(i).isEditable()) {
                numbers[i] = tiles.get(i).getNumber();
            }
        }

        if (SudokuAPI.solve(0, 0, numbers)) {
            for (int i = 0; i < SudokuAPI.TILE_COUNT; ++i) {
                tiles.get(i).toggleNumber(numbers[i], SudokuMode.PLAY);
            }
        }
    }

    public void addToRecords(String name) throws IllegalArgumentException {
        if (name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if (name.contains("|")) {
            throw new IllegalArgumentException("Name contains unsupported character (|)");
        }

        String level = currentLevel == null ? "Custom" : currentLevel;

        try {
            Table.writeTableData(name, level, secondsPassed.get());
        } catch (IOException e) {
            throw new RuntimeException("Can't write to file");
        }
    }


    public int nrSolutions() {
        int[] numbers = new int[SudokuAPI.TILE_COUNT];
        for (int i = 0; i < SudokuAPI.TILE_COUNT; ++i) {
            if (!tiles.get(i).isEditable()) {
                numbers[i] = tiles.get(i).getNumber();
            }
        }

        return SudokuAPI.nrSolutions(numbers);
    }

    public ObjectProperty<SudokuMode> modeProperty() {
        return currentMode;
    }

    public BooleanProperty timerEnabledProperty() {
        return timerEnabled;
    }

    public SudokuMode getCurrentMode() {
        return modeProperty().get();
    }
}
