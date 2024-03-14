import java.util.Random;

class Link {
    Link next;
    int a;

    Link(int i, Link n) {
        a = i;
        next = n;
    }

    public int getA() {
        return a;
    }
}

public class Main {

    static Random rnd = new Random();

    public static void deepObjectTest(int count, int depth) {
        for(int i = 0; i < count; ++i) {
            Link last = null;
            for(int j = 0; j < depth; ++j) {
                last = new Link(j, last);
            }
        }

        for(int i = 0; i < count; ++i) {
            Link last = null;
            for(int j = 0; j < depth; ++j) {
                last = new Link(rnd.nextInt(), last);
            }
        }
    }

    public static void main(String... args) {
        deepObjectTest(20, 10);
    }
}