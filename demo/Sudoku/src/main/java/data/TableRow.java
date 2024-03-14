package data;

import javafx.beans.property.*;
import java.time.Duration;
import java.time.Instant;

public class TableRow {
    private final StringProperty name = new SimpleStringProperty();
    private final StringProperty level = new SimpleStringProperty();
    private final ObjectProperty<Duration> time = new SimpleObjectProperty<>();

    public TableRow(String name, String level, Duration time) {
        this.name.set(name);
        this.level.set(level);
        this.time.set(time);
    }

    public StringProperty nameProperty() {
        return name;
    }

    public StringProperty levelProperty() {
        return level;
    }

    public ObjectProperty<Duration> timeProperty() {
        return time;
    }
}
