public class Main {
    /**
     * Creates 3 NonSerializable objects and allocates duplicate values
     * Allocator should NOT have access to the values
     */
    public static void testNonSerializable(){
        NonSerializable o11 = new NonSerializable();
        NonSerializable o12 = new NonSerializable();
        NonSerializable o13 = new NonSerializable();

        NonSerializable o21 = new NonSerializable();
        NonSerializable o22 = new NonSerializable();
        NonSerializable o23 = new NonSerializable();

        o11.setStrVal("valid");
        o11.setIntVal(1);
        o12.setStrVal("\\[]{},:\"\n");
        o12.setIntVal(-50);

        o21.setStrVal("valid");
        o21.setIntVal(1);
        o22.setStrVal("\\[]{},:\"\n");
        o22.setIntVal(-50);
        // o3 value is null
    }

    /**
     * Creates 3 Serializable objects and allocates duplicate values
     * Allocator should have access to the values and output them properly
     */
    public static void testSerializableGetter(){
        Serializable o11 = new Serializable();
        Serializable o12 = new Serializable();
        Serializable o13 = new Serializable();

        Serializable o21 = new Serializable();
        Serializable o22 = new Serializable();
        Serializable o23 = new Serializable();

        o11.setStrVal("valid");
        o11.setIntVal(1);
        o12.setStrVal("\\[]{},:\"\n");
        o12.setIntVal(-50);

        o21.setStrVal("valid");
        o21.setIntVal(1);
        o22.setStrVal("\\[]{},:\"\n");
        o22.setIntVal(-50);
        // o3 value is null
    }

    /**
     * Creates 3 SerializableNested objects and allocates duplicate values
     * Allocator should have access to the values and output them properly
     * Nested objects should also be read properly
     */
    public static void testSerializableNested(){
        SerializableNested n11 = new SerializableNested();
        SerializableNested n12 = new SerializableNested();
        SerializableNested n13 = new SerializableNested();
        n11.setStrVal("valid");
        n11.setIntVal(1);
        n12.setStrVal("\\[]{},:\"\n");
        n12.setIntVal(-50);
        // n3 value is null

        SerializableNested o11 = new SerializableNested();
        SerializableNested o12 = new SerializableNested();
        SerializableNested o13 = new SerializableNested();
        o11.setNested(n11);
        o12.setNested(n12);
        o13.setNested(n13);

        SerializableNested o21 = new SerializableNested();
        SerializableNested o22 = new SerializableNested();
        SerializableNested o23 = new SerializableNested();
        o21.setNested(n11);
        o22.setNested(n12);
        o23.setNested(n13);
    }

    public static void main(String... args) {
        testSerializableGetter();
        testNonSerializable();
        testSerializableNested();
    }
}