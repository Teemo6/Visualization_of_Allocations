package application;

import data.Table;
import data.TableRow;
import javafx.scene.control.TableCell;

import java.time.Duration;
import java.time.LocalTime;

public class CustomDurationCell extends TableCell<TableRow, Duration> {

    public CustomDurationCell() {
        this.getStyleClass().add("text-id");
    }

    @Override
    protected void updateItem(Duration duration, boolean empty) {
        super.updateItem(duration, empty);
        setItem(duration);

        setGraphic(null);

        if(empty || duration == null) {
            setText(null);
        }
        else {
            if(isEditing()) {
                setText(null);
            } else {
                setText(Table.dateFormatter.format(LocalTime.MIDNIGHT.plus(duration)));
            }
        }
    }
}
