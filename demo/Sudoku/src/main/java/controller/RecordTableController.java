package controller;

import data.Table;
import data.TableRow;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.control.TableView;

import java.io.IOException;
import java.time.LocalTime;
import java.util.Optional;

public class RecordTableController {

    private final Table table;

    @FXML
    private TableView<TableRow> recordTableView;

    public RecordTableController() throws IOException {
        table = new Table();
    }

    public void initialize() {
        recordTableView.setItems(table.getItems());
    }

    public void removeAction() {
        int index = recordTableView.getSelectionModel().getSelectedIndex();
        TableRow item = recordTableView.getSelectionModel().getSelectedItem();

        if (index >= 0) {

            String formattedDate = Table.dateFormatter.format(LocalTime.MIDNIGHT.plus(item.timeProperty().get()));

            Alert confirmationDialog = new Alert(Alert.AlertType.CONFIRMATION, "Confirmation", ButtonType.YES, ButtonType.NO);
            confirmationDialog.setContentText("Are you sure you want to remove selected record?" + String.format(" (%s with time %s)", item.nameProperty().get(), formattedDate));
            Optional<ButtonType> result = confirmationDialog.showAndWait();

            if (result.isPresent()) {
                if (result.get() == ButtonType.NO) {
                    return;
                }
            }

            try {
                table.remove(index);
            } catch (IOException ex) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Deletion error");
                alert.setContentText("Couldn't remove record");
                alert.show();
            }
        } else {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle("Selection error");
            alert.setContentText("Nothing is selected");
            alert.show();
        }
    }
}
