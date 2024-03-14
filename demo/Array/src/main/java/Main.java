import java.util.Random;

class TestingObject {
    int value;

    TestingObject(int val) {
        value = val;
    }

    @Override
    public String toString() {
        return "TestingObject{" +
                "value=" + value +
                '}';
    }
}

public class Main {
    static Random rnd = new Random();

    /**
     * creates multiple integer arrays of "count" elements with equal elements
     * then creates multiple integer arrays of "count" elements with random elements
     * @param arrayCount number of arrays
     * @param count number of elements of each array
     */
    public static void primitiveArrayTest(int arrayCount, int count) {

        for(int i = 0; i < arrayCount; ++i) {

            int[] array = new int[count];

            for(int j = 0; j < count; ++j) {
                array[j] = j;
            }
        }


        for(int i = 0; i < arrayCount; ++i) {
            int[] array = new int[count];

            for(int j = 0; j < count; ++j) {
                array[j] = rnd.nextInt();
            }
        }
    }

    /**
     * creates multiple TestingObject arrays of "count" elements with equal elements
     * then creates multiple TestingObject arrays of "count" elements with random elements
     * @param arrayCount number of arrays
     * @param count number of elements of each array
     */
    public static void objectArrayTest(int arrayCount, int count) {
        for(int i = 0; i < arrayCount; ++i) {

            TestingObject[] array = new TestingObject[count];

            for(int j = 0; j < count; ++j) {
                array[j] = new TestingObject(j);
            }
        }

        for(int i = 0; i < arrayCount; ++i) {

            TestingObject[] array = new TestingObject[count];

            for(int j = 0; j < count; ++j) {
                array[j] = new TestingObject(rnd.nextInt());
            }
        }
    }


    /**
     * creates an N by N arrays of equal TestingObject elements
     * then creates an N by N arrays of random TestingObject elements
     * @param n dimension
     * @param count array count
     */
    public static void multiDimensionalArrayTest(int n, int count) {
        for(int i = 0; i < count; ++i) {

            TestingObject array[][] = new TestingObject[n][n];

            for(int j = 0; j < n; ++j) {
                for(int k = 0; k < n; ++k) {
                    array[j][k] = new TestingObject(j * n + k);
                }
            }
        }

        for(int i = 0; i < count; ++i) {

            TestingObject array[][] = new TestingObject[n][n];

            for(int j = 0; j < n; ++j) {
                for(int k = 0; k < n; ++k) {
                    array[j][k] = new TestingObject(rnd.nextInt());
                }
            }
        }
    }


    public static void main(String... args) {
        primitiveArrayTest(10, 10);
        objectArrayTest(10, 10);
        multiDimensionalArrayTest(10, 10);
    }
}
