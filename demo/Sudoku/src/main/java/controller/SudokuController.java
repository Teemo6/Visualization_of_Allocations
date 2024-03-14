package controller;

import data.DataModel;
import data.SudokuMode;
import javafx.scene.Node;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;

public class SudokuController {

    private static final DataModel dataModel = DataModel.getInstance();
    private static int cursorX = 0;
    private static int cursorY = 0;

    public static void keyPressAction(KeyEvent event) {

        if (event.getCode().isArrowKey()) {
            switch (event.getCode()) {
                case LEFT:
                case KP_LEFT:

                    if (--cursorX < 0) {
                        cursorX = 8;
                    }

                    break;
                case RIGHT:
                case KP_RIGHT:

                    if (++cursorX > 8) {
                        cursorX = 0;
                    }

                    break;
                case UP:
                case KP_UP:

                    if (--cursorY < 0) {
                        cursorY = 8;
                    }

                    break;

                case DOWN:
                case KP_DOWN:

                    if (++cursorY > 8) {
                        cursorY = 0;
                    }

                    break;

                default:
                    break;
            }

            int index = cursorY * 9 + cursorX;

            if (!event.isControlDown()) {
                dataModel.deselectAll();
            }

            if (!dataModel.selectedTiles.contains(index)) {
                dataModel.selectTile(index);
            }
        } else if (event.getCode() == KeyCode.DELETE || event.getCode() == KeyCode.BACK_SPACE) {
            dataModel.delete();
        } else if (event.getCode().isDigitKey()) {
            int number = Integer.parseInt(event.getCode().isKeypadKey() ? event.getText() : event.getCode().getChar());

            if (number != 0) {
                dataModel.toggleNumber(number, null);
            }
        } else if (event.getCode() == KeyCode.ESCAPE) {
            dataModel.deselectAll();
        } else if (event.getCode() == KeyCode.C) {
            dataModel.check();
        } else if (event.getCode() == KeyCode.CONTROL) {
            dataModel.setCurrentMode(SudokuMode.PLAY_CORNER);
        }


        event.consume();
    }

    public static void keyReleaseAction(KeyEvent event) {
        if (event.getCode() == KeyCode.CONTROL) {
            dataModel.setCurrentMode(SudokuMode.PLAY);
        }

        event.consume();
    }

    public static void onMouseClickAction(MouseEvent event) {
        if (event.getButton() == MouseButton.PRIMARY) {
            Node tile = (Node) event.getSource();
            int index = Integer.parseInt(tile.getId());

            cursorX = index % 9;
            cursorY = index / 9;

            if (!event.isControlDown()) {
                dataModel.deselectAll();
            }

            if (!dataModel.selectedTiles.contains(index)) {
                dataModel.selectTile(index);
            }
        }
    }
}
