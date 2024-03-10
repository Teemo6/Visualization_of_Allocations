package main;

// No allocations
public class BiggerTestingObject {
    public int value;
    public String str;

    // No allocations
    public BiggerTestingObject(int val, String str){
        this.value = val;
        this.str = str;
    }
}