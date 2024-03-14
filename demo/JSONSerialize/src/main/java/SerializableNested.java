/**
 * Object that has another nested object inside (which can contain more nested objects)
 */
class SerializableNested extends Serializable{
    private SerializableNested nested;
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

    public void setNested(SerializableNested ns){
        nested = ns;
    }

    public SerializableNested getNested(){
        return nested;
    }
}