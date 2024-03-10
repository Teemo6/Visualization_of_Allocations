package main;

public class OtherClass {
    public static void samePackageTest(int val, int count){
        // 10 allocations, 20 duplicates
        for (int i = 0; i < count; i++){
            new TestingObject(val);
        }
    }

    public static void samePackageDuplicateTest(int val, int count){
        // 10 allocations, 30 duplicates
        for (int i = 0; i < count; i++){
            new TestingObject(val);
        }
        for (int i = 0; i < count; i++){
            new TestingObject(val);
        }
    }
}
