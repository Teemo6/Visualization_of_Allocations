package application;

import controller.SudokuController;
import data.CellDataBinding;
import data.DataModel;
import data.SudokuAPI;
import data.SudokuMode;
import javafx.collections.ListChangeListener;
import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.Node;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.RowConstraints;

public class Sudoku extends GridPane {
    private final DataModel dataModel = DataModel.getInstance();
    private final SudokuTile[] tiles = new SudokuTile[SudokuAPI.TILE_COUNT];

    private int cursorX = 0;
    private int cursorY = 0;

    private final ListChangeListener<CellDataBinding> tileChangeListener = change -> {
        getChildren().clear();
        initSudokuTiles();
    };

    public Sudoku(int size) {
        super();

        this.setMinWidth(size);
        this.setMinHeight(size);

        this.setMaxWidth(size);
        this.setMaxHeight(size);

        final double percentSize = 100.0 / 9;

        for (int i = 0; i < 9; ++i) {
            RowConstraints rowConst = new RowConstraints();
            rowConst.setFillHeight(true);
            rowConst.setVgrow(Priority.ALWAYS);
            rowConst.setValignment(VPos.CENTER);
            rowConst.setPercentHeight(percentSize);
            this.getRowConstraints().add(rowConst);

            ColumnConstraints colConst = new ColumnConstraints();
            colConst.setFillWidth(true);
            colConst.setHgrow(Priority.ALWAYS);
            colConst.setHalignment(HPos.CENTER);
            colConst.setPercentWidth(percentSize);
            this.getColumnConstraints().add(colConst);
        }

        initSudokuTiles();

        dataModel.tiles.addListener(this.tileChangeListener);

        this.getStyleClass().addAll("blackBorder");
        this.setStyle("-fx-border-width: 6;");
    }

    private void initSudokuTiles() {
        for (int i = 0; i < SudokuAPI.TILE_COUNT; ++i) {
            int x = i % 9;
            int y = i / 9;

            tiles[i] = new SudokuTile(dataModel.tiles.get(i));
            this.add(tiles[i], x, y);

            if ((y + 1) % 3 == 0 && (x + 1) % 3 == 0) {
                tiles[i].getStyleClass().addAll("tileBorderRightBottom", "blackBorder");
            } else if ((x + 1) % 3 == 0) {
                tiles[i].getStyleClass().addAll("tileBorderRight", "blackBorder");
            } else if ((y + 1) % 3 == 0) {
                tiles[i].getStyleClass().addAll("tileBorderBottom", "blackBorder");
            } else {
                tiles[i].getStyleClass().addAll("tileBorder", "blackBorder");
            }

            tiles[i].setId(String.valueOf(i));
            tiles[i].setOnMouseClicked(SudokuController::onMouseClickAction);

            GridPane.setHalignment(tiles[i], HPos.CENTER);
            GridPane.setValignment(tiles[i], VPos.CENTER);
            GridPane.setHgrow(tiles[i], Priority.ALWAYS);
            GridPane.setVgrow(tiles[i], Priority.ALWAYS);
        }
    }

}
