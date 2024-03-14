import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

class OptionalTest {
    Optional<Integer> test;
    OptionalTest() {
        test = Optional.empty();
    }

    OptionalTest(Integer a) {
        test = Optional.of(a);
    }
}

public class Main {
    static Random rnd = new Random();

    public static void optionalTest() {
        OptionalTest owf1 = new OptionalTest(12);
        OptionalTest owf1_dup = new OptionalTest(12);
        OptionalTest owf2 = new OptionalTest(13);
        OptionalTest owf3 = new OptionalTest(14);
        OptionalTest owfEmpty = new OptionalTest();
        OptionalTest owfEmpty_2 = new OptionalTest();
    }
    
    public static void arrayListTest(int count, int elementCount) {
        for(int i = 0; i < count; ++i) {
            List<Integer> list = new ArrayList<>();
            for(int j = 0; j < elementCount; ++j) {
                list.add(j);
            }
        }

        for(int i = 0; i < count; ++i) {
            List<Integer> list = new ArrayList<>();
            for(int j = 0; j < elementCount; ++j) {
                list.add(rnd.nextInt());
            }
        }
    }

    public static void main(String... args) {
        optionalTest();
        arrayListTest(50, 100);
    }
}