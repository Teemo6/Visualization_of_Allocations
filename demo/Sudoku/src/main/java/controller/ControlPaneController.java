package controller;

import application.Main;
import data.DataModel;
import data.SudokuFile;
import data.SudokuMode;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import javafx.stage.FileChooser;

import java.io.File;
import java.time.Duration;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * Control Pane Controller allows the user to control the application via the control pane
 *
 * @author Jiri Velek
 */
public class ControlPaneController {

    private final static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());
    private final DataModel dataModel = DataModel.getInstance();

    @FXML
    protected VBox vbox;
    @FXML
    protected ToggleGroup mode;
    @FXML
    protected Text timerText;
    @FXML
    protected RadioButton buttonSetNormal;
    @FXML
    protected RadioButton buttonSetFlag;
    private double playPaneWidth = 0;
    private double playPaneHeight = 0;
    private double createPaneWidth = 0;
    private double createPaneHeight = 0;
    @FXML
    private VBox playPane;
    @FXML
    private VBox createPane;

    @FXML
    private void initialize() {

        buttonSetNormal.getStyleClass().remove("radio-button");
        buttonSetFlag.getStyleClass().remove("radio-button");

        mode.selectedToggleProperty().addListener((observableValue, toggle, t1) -> {
            if (observableValue.getValue() == buttonSetFlag) {
                dataModel.setCurrentMode(SudokuMode.PLAY_CORNER);
            } else if (observableValue.getValue() == buttonSetNormal) {
                dataModel.setCurrentMode(SudokuMode.PLAY);
            }
        });

        dataModel.modeProperty().addListener((observableValue, sudokuMode, t1) -> {
            SudokuMode currentMode = observableValue.getValue();
            switch (currentMode) {
                case CREATE: {
                    if (playPane.isVisible()) {
                        toggleMode();
                    }
                }
                break;

                case PLAY:
                case PLAY_CORNER: {
                    if (createPane.isVisible()) {
                        toggleMode();
                    }
                }
                break;
            }
        });

        dataModel.secondsPassedProperty().addListener((observableValue, number, t1) -> updateTimer());
        timerText.visibleProperty().bind(dataModel.timerEnabledProperty());

        playPaneWidth = playPane.getMaxWidth();
        playPaneHeight = playPane.getMaxHeight();
        createPaneWidth = createPane.getMaxWidth();
        createPaneHeight = createPane.getMaxHeight();

        toggleMode();
    }

    private void updateTimer() {
        Duration dur = Duration.ofSeconds(dataModel.secondsPassedProperty().get());
        timerText.setText(formatter.format(LocalTime.MIDNIGHT.plus(dur)));
    }

    @FXML
    public void checkAction() {
        if (dataModel.check()) {
            TextInputDialog dialog = new TextInputDialog();
            dialog.setHeaderText(null);
            dialog.setTitle("Successful solve");
            dialog.setContentText("Enter your name: ");

            while (true) {
                Optional<String> value = dialog.showAndWait();

                if (value.isEmpty()) {
                    break;
                }

                String name = value.get();

                try {
                    dataModel.addToRecords(name);
                    break;
                } catch (IllegalArgumentException e) {
                    dialog.setHeaderText(e.getMessage());
                }
            }
        }
    }

    @FXML
    private void deleteNumber() {
        dataModel.delete();
    }

    @FXML
    private void putNumber(ActionEvent event) {
        Button numberButton = (Button) event.getSource();
        Integer number = Integer.parseInt(numberButton.getText());

        SudokuMode mode = SudokuMode.CREATE;
        SudokuMode currentMode = dataModel.getCurrentMode();

        if(currentMode != SudokuMode.CREATE) {
            if(buttonSetFlag.isSelected()) {
                mode = SudokuMode.PLAY_CORNER;
            } else {
                mode = SudokuMode.PLAY;
            }
        }

        dataModel.toggleNumber(number, mode);
    }

    @FXML
    private void solveAction() {
        dataModel.solve();
    }

    @FXML
    private void createAction() {

        int solutions = dataModel.nrSolutions();

        if (solutions > 1) {
            Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
            alert.setTitle("Non-unique solution sudoku");
            alert.setContentText("Sudoku has more than one solutions, do you want to continue?");
            Optional<ButtonType> result = alert.showAndWait();

            if (result.isPresent()) {
                if (result.get() == ButtonType.CANCEL) {
                    return;
                }
            }
        } else if (solutions == 0) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Sudoku doesn't have a solution");
            alert.setContentText("Sudoku doesn't have any solutions");
            alert.show();
            return;
        }


        FileChooser chooser = new FileChooser();
        chooser.setInitialDirectory(new File("./"));
        chooser.setTitle("Save sudoku");

        while (true) {
            File newFile = chooser.showSaveDialog(Main.window);

            if (newFile == null) break;

            try {
                dataModel.saveToFile(newFile);
                break;
            } catch (SudokuFile.Exception ex) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Couldn't save sudoku");
                alert.setContentText(ex.getMessage());
                alert.showAndWait();
            }
        }

        dataModel.startGame();
    }

    private void toggleMode() {
        if (playPane.isVisible()) {
            createPane.setMaxWidth(createPaneWidth);
            createPane.setMaxHeight(createPaneHeight);
            createPane.setVisible(true);

            playPane.setMaxWidth(0);
            playPane.setMaxHeight(0);
            playPane.setVisible(false);
        } else {
            playPane.setMaxWidth(playPaneWidth);
            playPane.setMaxHeight(playPaneHeight);
            playPane.setVisible(true);

            createPane.setMaxWidth(0);
            createPane.setMaxHeight(0);
            createPane.setVisible(false);
        }
    }

    @FXML
    public void clearAction() {
        dataModel.clear();
    }
}
