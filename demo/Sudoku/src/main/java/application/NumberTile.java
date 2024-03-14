package application;

import data.SudokuAPI;
import javafx.geometry.Pos;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.scene.text.TextBoundsType;

public class NumberTile extends StackPane {
	public NumberTile(Integer value, boolean editable) {
		GridPane.setFillHeight(this, true);
		GridPane.setFillWidth(this, true);

		GridPane.setVgrow(this, Priority.ALWAYS);
		GridPane.setHgrow(this, Priority.ALWAYS);
		
		String strValue = value.equals(SudokuAPI.DEFAULT_VALUE) ? "" : value.toString();

		Text text = new Text(strValue);

		if (editable) {
			text.setFill(Color.BLUE);
		}

		text.setFont(Font.font(30));
		text.setBoundsType(TextBoundsType.VISUAL);
		setAlignment(Pos.CENTER);
		getChildren().addAll(text);
	}
}
