/**
 * Object that has another nested object inside (which can contain more nested objects)
 */
class SerializableNested extends Serializable{
    protected SerializableNested nested;

    public void setNested(SerializableNested ns){
        nested = ns;
    }

    public SerializableNested getNested(){
        return nested;
    }
}