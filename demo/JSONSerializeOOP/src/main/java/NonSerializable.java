/**
 * Object that cannot be serialized
 */
class NonSerializable {
    protected String strVal;
    protected int intVal;

    public void setStrVal(String val){
        strVal = val;
    }

    public void setIntVal(int val){
        intVal = val;
    }
}