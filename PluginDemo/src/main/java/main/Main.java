package main;

import java.util.Random;
import other.OtherPackageClass;

// Sum of all method allocations
public class Main {
    // No allocation, analyzer does not provide data
    public static Random random = new Random();

    // No allocation, analyzer does not provide data
    public static TestingObject to1 = new TestingObject(99);
    public static TestingObject to2 = new TestingObject(99);
    public static TestingObject to3 = new TestingObject(98);

    // Sum of all line allocations
    public static void basicAllocationTest(){
        // 1 allocation, 0 duplicates
        new TestingObject(1);
        new BiggerTestingObject(1, "Hello, World!");

        // 2 allocations, 0 duplicates
        new TestingObject(2); new BiggerTestingObject(2, "Hello, World!");

        // 1 allocation, 2 duplicates
        new TestingObject(3);
        new TestingObject(3);

        // 2 allocations, 2 duplicates
        new TestingObject(4); new TestingObject(4);

        // 2 allocations, 4 duplicates
        new TestingObject(5); new TestingObject(5);
        new TestingObject(5); new TestingObject(5);

        // 2 allocations, 4 duplicates
        new TestingObject(6); new TestingObject(7);
        new TestingObject(6); new TestingObject(7);

        // 2 allocations, 4 duplicates
        new TestingObject(8); new BiggerTestingObject(8, "Hello, World!");
        new TestingObject(8); new BiggerTestingObject(8, "Hello, World!");
    }

    // Sum of all line allocations
    public static void main(String[] args) {
        // 1 allocation, 0 duplicates
        new TestingObject(0);
        
        // Go to implementation
        basicAllocationTest();

        // 10 allocations, 0 duplicates (most certainly)
        for (int i = 0; i < 10; i++){
            new TestingObject(random.nextInt());
        }

        // 10 allocations, 10 duplicates
        for (int i = 0; i < 10; i++){
            new TestingObject(9);
        }

        // 10 allocations, 20 duplicates
        for (int i = 0; i < 10; i++){
            new TestingObject(10);
        }
        for (int i = 0; i < 10; i++){
            new TestingObject(10);
        }

        // Go to implementation
        OtherClass.samePackageTest(11, 10);

        // Go to implementation
        // 10 allocations, 30 duplicates
        OtherClass.samePackageDuplicateTest(12, 10);
        for (int i = 0; i < 10; i++){
            new TestingObject(12);
        }

        // Go to implementation
        OtherPackageClass.outsidePackageAloneTest(13, 100);

        // Go to implementation
        // 200 allocations, 300 duplicates
        OtherPackageClass.outsidePackageTest(4, 100);
        for (int i = 0; i < 200; i++){
            new TestingObject(4);
        }
    }
}
