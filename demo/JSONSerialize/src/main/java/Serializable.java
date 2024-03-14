/**
 * Object that is serialized by getters
 */
class Serializable {
    private String strVal;
    private int intVal;

    public void setStrVal(String val){
        strVal = val;
    }

    public void setIntVal(int val){
        intVal = val;
    }

    public String getStrVal(){
        return strVal;
    }

    public int getIntVal(){
        return intVal;
    }
}