import java.util.Random;

class C {
    int a;

    C(int a) {
        this.a = a;
    }

    public int getA() {
        return a;
    }
}


public class Main {

    static Random rnd = new Random();

    public static void simpleObjectTest(int count, int objectCount) {
        for(int i = 0; i < count; ++i) {
            for(int j = 0; j < objectCount; ++j) {
                new C(j);
            }
        }

        for(int i = 0; i < count; ++i) {
            for(int j = 0; j < objectCount; ++j) {
                new C(rnd.nextInt());
            }
        }
    }

    public static void main(String... args) {
        simpleObjectTest(20, 20);
    }
}