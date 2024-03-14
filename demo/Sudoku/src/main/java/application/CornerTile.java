package application;

import java.util.List;

import javafx.geometry.HPos;
import javafx.geometry.VPos;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.RowConstraints;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.scene.text.TextBoundsType;

public class CornerTile extends GridPane {
	public CornerTile(List<Integer> list, boolean editable) {
		for (int i = 0; i < 3; ++i) {
			RowConstraints rowConst = new RowConstraints();
			rowConst.setFillHeight(true);
			rowConst.setVgrow(Priority.ALWAYS);
			rowConst.setValignment(VPos.CENTER);
			rowConst.setPercentHeight(33.33);
			this.getRowConstraints().add(rowConst);

			ColumnConstraints colConst = new ColumnConstraints();
			colConst.setFillWidth(true);
			colConst.setHgrow(Priority.ALWAYS);
			colConst.setHalignment(HPos.CENTER);
			colConst.setPercentWidth(33.33);
			this.getColumnConstraints().add(colConst);
		}

		for (Integer value : list) {
			int posValue = value - 1;

			int y = posValue / 3;
			int x = posValue % 3;

			Text text = new Text(value.toString());
			text.setFont(Font.font(15));

			if (editable) {
				text.setFill(Color.BLUE);
			}

			this.add(text, x, y);

			text.setBoundsType(TextBoundsType.VISUAL);
		}
	}
}
