package data;

import javafx.beans.binding.ObjectBinding;
import javafx.beans.property.*;
import javafx.collections.FXCollections;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;

import java.util.ArrayList;

public class CellDataBinding {
    private final ObjectProperty<TileType> tileType = new SimpleObjectProperty<>(TileType.NORMAL);
    private final ObservableList<Integer> numberList = FXCollections.observableArrayList(new ArrayList<>(9));
    private final IntegerProperty number = new SimpleIntegerProperty(0);
    private final BooleanProperty selected = new SimpleBooleanProperty();
    private final BooleanProperty editable = new SimpleBooleanProperty();
    private final BooleanProperty correct = new SimpleBooleanProperty(true);

    private final ObjectBinding<CellData> data = new ObjectBinding<>() {
        {
            bind(tileType, numberList, number, selected, correct);
        }

        @Override
        protected CellData computeValue() {
            return new CellData(tileType.get(), numberList, number.get(), selected.get(), editable.get(), correct.get());
        }
    };

    public CellDataBinding(boolean editable) {
        number.addListener((observable, oldValue, newValue) -> {
            if (number.get() != 0) {
                tileType.setValue(TileType.NORMAL);
            } else {
                tileType.setValue(TileType.CORNER);
            }
        });

        numberList.addListener((ListChangeListener<Integer>) change -> {
            if (change.getList().isEmpty() || number.get() != 0) {
                tileType.setValue(TileType.NORMAL);
            } else {
                tileType.setValue(TileType.CORNER);
            }
        });

        this.editable.set(editable);
    }

    public ObjectBinding<CellData> dataProperty() {
        return data;
    }

    public CellData getData() {
        return dataProperty().get();
    }

    public IntegerProperty numberProperty() {
        return number;
    }

    public int getNumber() {
        return number.get();
    }


    public void setCorrect(boolean correct) {
        if (this.editable.get()) {
            this.correct.set(correct);
        }
    }

    public void setSelected(boolean selected) {
        this.selected.set(selected);
    }

    private void toggleNumberPlay(Integer number, SudokuMode mode) {
        if (isEditable()) {
            if (mode == SudokuMode.PLAY) {
                this.number.set(number);
            } else {
                if (this.number.get() == 0) {
                    if (this.numberList.contains(number)) {
                        this.numberList.remove(number);
                    } else {
                        this.numberList.add(number);
                    }
                }
            }
        }
    }

    public void toggleNumber(Integer number, SudokuMode mode) {
        switch (mode) {
            case PLAY:
            case PLAY_CORNER:
                toggleNumberPlay(number, mode);
                break;

            case CREATE:
                this.editable.set(false);
                this.number.set(number);
                break;
        }
    }

    public void delete(SudokuMode mode) {
        if (mode == SudokuMode.CREATE) {
            this.editable.set(false);
            this.number.set(0);
        }

        if (number.get() == 0) {
            this.numberList.clear();
        } else if (this.editable.get()) {
            this.number.set(0);
        }
    }

    public void erase(SudokuMode mode) {
        this.numberList.clear();
        number.set(0);
        if (mode == SudokuMode.CREATE) {
            this.setCorrect(true);
            this.editable.set(true);
        }
    }

    public boolean isEditable() {
        return editable.get();
    }
}
