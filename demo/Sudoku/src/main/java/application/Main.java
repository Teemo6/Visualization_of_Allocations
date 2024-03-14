package application;

import controller.SudokuController;
import data.DataModel;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import javafx.stage.*;

import java.io.File;
import java.net.URL;

public class Main extends Application {

    public static Stage window;
    final int WIDTH = 1200;
    final int HEIGHT = 900;
    final int SUDOKU_SIZE = 800;
    private Sudoku sudoku = new Sudoku(SUDOKU_SIZE);
    private final DataModel dataModel = DataModel.getInstance();

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) {
        window = primaryStage;

        try {
            URL css = getClass().getResource("style.css");

            BorderPane root = getRootNode();


            root.getStylesheets().add(css.toExternalForm());

            root.addEventFilter(KeyEvent.KEY_PRESSED, SudokuController::keyPressAction);
            root.addEventFilter(KeyEvent.KEY_RELEASED, SudokuController::keyReleaseAction);

            Scene scene = new Scene(root);
            primaryStage.setScene(scene);
            primaryStage.setTitle("Sudoku - Jiri Velek, A20B0269P");

            primaryStage.setMinWidth(WIDTH);
            primaryStage.setMinHeight(HEIGHT);
            primaryStage.setMaxWidth(WIDTH);
            primaryStage.setMaxHeight(HEIGHT);

            primaryStage.setResizable(false);
            primaryStage.show();
            primaryStage.centerOnScreen();

            primaryStage.setOnCloseRequest(this::closeRequest);

        } catch (Exception ex) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Failed to launch application");
            alert.setContentText("Application couldn't find required resources");
            alert.showAndWait();
            Platform.exit();
        }
    }

    private void closeRequest(WindowEvent windowEvent) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION, "Exit confirmation", ButtonType.YES, ButtonType.NO);
        alert.setTitle("Exit confirmation");
        alert.setContentText("Are you sure you want to exit?");
        alert.showAndWait().filter(e -> e == ButtonType.NO).ifPresent(e -> windowEvent.consume());
    }

    private BorderPane getRootNode() throws Exception {
        BorderPane borderPane = new BorderPane();
        BorderPane.setMargin(sudoku, new Insets(15));

        borderPane.setCenter(sudoku);
        borderPane.setRight(getControlPane());
        borderPane.setTop(getMenu());

        return borderPane;
    }

    private Node getMenu() {
        Menu fileMenu = new Menu("File");
        Menu settingsMenu = new Menu("Settings");

        Label aboutLabel = new Label("About");
        Menu aboutMenu = new Menu("", aboutLabel);

        MenuItem newSudokuItem = new MenuItem("New");
        newSudokuItem.setOnAction(e -> dataModel.newSudoku());

        MenuItem openItem = new MenuItem("Open");
        openItem.setOnAction(e -> {
            FileChooser fileChooser = new FileChooser();
            fileChooser.setInitialDirectory(new File("./"));
            File file = fileChooser.showOpenDialog(window);

            if (file != null) {
                try {
                    dataModel.loadFile(file);
                } catch (Exception ex) {
                    Alert alert = new Alert(Alert.AlertType.ERROR);
                    alert.setTitle("Sudoku load error");
                    alert.setContentText(ex.getMessage());
                    alert.show();
                }
            }
        });

        CheckMenuItem timerVisible = new CheckMenuItem("Enable timer");
        timerVisible.selectedProperty().bindBidirectional(dataModel.timerEnabledProperty());

        MenuItem recordsItem = new MenuItem("Records");
        recordsItem.setOnAction(e -> {
            try {
                showRecordTable();
            } catch (Exception ex) {
                Alert alert = new Alert(Alert.AlertType.ERROR);
                alert.setTitle("Record menu error");
                alert.setContentText("Failed to open record menu");
                alert.show();
            }
        });

        MenuItem exitItem = new MenuItem("Exit");
        exitItem.setOnAction(e -> window.fireEvent(new WindowEvent(window, WindowEvent.WINDOW_CLOSE_REQUEST)));

        settingsMenu.getItems().addAll(timerVisible);
        fileMenu.getItems().addAll(newSudokuItem, openItem, recordsItem, exitItem);

        aboutLabel.addEventHandler(MouseEvent.MOUSE_CLICKED, this::openAboutWindow);

        return new MenuBar(fileMenu, settingsMenu, aboutMenu);
    }

    private void openAboutWindow(MouseEvent e) {
        VBox root = new VBox(5);
        root.setPadding(new Insets(10));
        root.setAlignment(Pos.CENTER);

        Font headingFont = Font.font("Calibri", 20);
        Font normalFont = Font.font("Calibri", 12);

        int width = 400;
        int height = 250;

        Stage stage = new Stage();
        Scene scene = new Scene(root, width, height);
        stage.initOwner(window);
        stage.initModality(Modality.APPLICATION_MODAL);

        stage.setMinHeight(width);
        stage.setMinWidth(height);

        Text authorText = new Text("Author: Jiri Velek");
        Text howToPlayText = new Text("How to play?");

        authorText.setFont(headingFont);
        howToPlayText.setFont(headingFont);

        Text mainText = new Text("Only use the numbers 1 to 9,\n" +
                "Avoid trying to guess the solution to the puzzle,\n" +
                "Only use each number once in each row, column, & grid.");

        mainText.setFont(normalFont);

        Text controlsText = new Text("Keyboard controls");
        controlsText.setFont(headingFont);

        Text mainControlsText = new Text("Arrow keys => move up, down, right or left\n" +
                "Numbers 1-9 => puts a number into selected squares\n" +
                "Ctrl + Arrow keys => selects multiple squares\n" +
                "Ctrl + Numbers 1-9 => adds a number in flagging mode\n" +
                "Backspace or Delete => removes a number from selected squares\n" +
                "c => checks if sudoku is valid");

        mainControlsText.setFont(normalFont);

        root.getChildren().addAll(authorText, howToPlayText, mainText, controlsText, mainControlsText);

        stage.setScene(scene);
        stage.setTitle("About - Jiri Velek, A20B0269P");
        stage.show();
    }

    private void showRecordTable() throws Exception {
        URL url = getClass().getResource("recordTableView.fxml");
        Stage stage = FXMLLoader.load(url);
        stage.setTitle("Table of records - Jiri Velek, A20B0269P");
        stage.initOwner(window);
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.show();
    }

    private Node getControlPane() throws Exception {
        VBox node = FXMLLoader.load(getClass().getResource("controlPane.fxml"));
        node.setPadding(new Insets(15));
        return node;
    }
}
