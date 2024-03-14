/**
 * Object that cannot be serialized
 */
class NonSerializable {
    private String strVal;
    private int intVal;

    public void setStrVal(String val){
        strVal = val;
    }

    public void setIntVal(int val){
        intVal = val;
    }
}