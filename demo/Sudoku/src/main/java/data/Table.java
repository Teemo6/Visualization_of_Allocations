package data;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;

import java.io.*;
import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class Table {
    public final static DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());
    public static final String TABLEDATA_FILE = "records.txt";

    private final ObservableList<TableRow> rows = FXCollections.observableArrayList();

    public Table() throws IOException {
        File f = new File(TABLEDATA_FILE);
        if (!f.exists()) {
            if (!f.createNewFile()) {
                return;
            }
        }

        BufferedReader br = new BufferedReader(new FileReader(f));

        String line;

        while ((line = br.readLine()) != null) {
            String[] fields = line.split("\\|");

            if (fields.length < 3) {
                continue;
            }

            String name = fields[0];
            String level = fields[1];
            Duration time = Duration.ofSeconds(Long.parseLong(fields[2]));

            rows.add(new TableRow(name, level, time));
        }

        rows.sort((a, b) -> a.timeProperty().getValue().compareTo(b.timeProperty().get()));
    }

    public static void writeTableData(String name, String level, long seconds) throws IOException {
        File f = new File(TABLEDATA_FILE);

        if (!f.exists()) {
            f.createNewFile();
        }

        PrintWriter pw = new PrintWriter(new FileWriter(f, true));

        pw.format("%s|%s|%d%n", name, level, seconds);
        pw.close();
    }

    public ObservableList<TableRow> getItems() {
        return rows;
    }

    public void remove(int index) throws IOException {
        TableRow rowToDelete = rows.get(index);

        PrintWriter pw = new PrintWriter(new FileWriter(TABLEDATA_FILE));

        for (TableRow row : rows) {
            if(row == rowToDelete) continue;
            pw.format("%s|%s|%d%n", row.nameProperty().get(), row.levelProperty().get(), row.timeProperty().get().getSeconds());
        }

        pw.close();

        rows.remove(index);
    }
}
