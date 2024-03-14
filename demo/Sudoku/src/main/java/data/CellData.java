package data;

import java.util.List;

public class CellData {
	private final TileType tileType;
	private final List<Integer> numberList;
	private final Integer number;
	private final boolean selected;
	private final boolean editable;
	private final boolean correct;
	
	public CellData(TileType tileType, List<Integer> numberList, Integer number, boolean selected, boolean editable, boolean correct) {
		this.tileType = tileType;
		this.numberList = numberList;
		this.number = number;
		this.selected = selected;
		this.editable = editable;
		this.correct = correct;
	}
	
	public TileType getTileType() {
		return tileType;
	}
	
	public Integer getNumber() {
		return number;
	}
	
	public List<Integer> getNumberList() {
		return numberList;
	}
	
	public boolean isSelected() {
		return selected;
	}
	
	public boolean isEditable() {
		return editable;
	}
	
	public boolean isCorrect() {
		return correct;
	}
}
