package application;

import data.CellData;
import data.CellDataBinding;
import data.TileType;
import javafx.scene.Node;
import javafx.scene.layout.StackPane;

public class SudokuTile extends StackPane {

	private void update(CellData data) {
		getChildren().clear();

		Node tile;

		if (data.getTileType() == TileType.CORNER) {
			tile = new CornerTile(data.getNumberList(), data.isEditable());
		} else {
			tile = new NumberTile(data.getNumber(), data.isEditable());
		}

		if(data.isSelected()) {
			tile.getStyleClass().add("tile-selected");
		} else if(!data.isCorrect()) {
			tile.getStyleClass().add("error");
		}

		getChildren().addAll(tile);
	}

	public SudokuTile(CellDataBinding cellDataBinding) {
		super();

		cellDataBinding.dataProperty().addListener((observable, oldValue, newValue) -> update(observable.getValue()));
		update(cellDataBinding.getData());
	}
}
