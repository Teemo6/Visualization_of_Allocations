/**
 * Object that is serialized by getters
 */
class Serializable extends NonSerializable{
    public String getStrVal(){
        return strVal;
    }

    public int getIntVal(){
        return intVal;
    }
}