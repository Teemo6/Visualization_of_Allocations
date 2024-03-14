package data;

import javafx.collections.ObservableList;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

public class SudokuFile {
	public static class Exception extends RuntimeException {
		public Exception(String msg) {
			super(msg);
		}
	}

	public static void save(File file, ObservableList<CellDataBinding> tiles) throws Exception {

    	StringBuilder sb = new StringBuilder();

		for(CellDataBinding tile : tiles) {
			sb.append(tile.getNumber());
		}

		if(!file.exists()) {
		    try {
				file.createNewFile();
			} catch(IOException ex) {
		    	throw new Exception("Can't create file " + file.getName());
			}
		}

		try(FileWriter fw = new FileWriter(file)) {
			fw.write(sb.toString());
		} catch(IOException ex) {
			throw new Exception("Can't write to file " + file.getName());
		}
    }


	private static CellDataBinding parseDigit(int codePoint) throws Exception {
		int digit = Character.getNumericValue(codePoint);
		if (digit > 9 || digit < 0) {
		    throw new IllegalArgumentException();
		}

		CellDataBinding data = new CellDataBinding(digit == 0);
		data.numberProperty().set(digit);

		return data;
	}

	public static List<CellDataBinding> load(File file) throws Exception {
	    try {
			List<CellDataBinding> list = Files.readString(Path.of(file.getPath())).codePoints().mapToObj(SudokuFile::parseDigit)
					.collect(Collectors.toList());
			if(list.size() != 81) {
				throw new Exception("File is corrupted");
			}

			return list;
		} catch(IllegalArgumentException ex) {
			throw new Exception("File " + file.getPath() + " is corrupted");
		}
	    catch(IOException ex) {
	    	throw new Exception("Can't read file " + file.getPath());
		}
	}
}
