package other;

import main.TestingObject;
public class OtherPackageClass {
    public static void outsidePackageTest(int val, int count){
        // 100 allocations, 300 duplicates
        for (int i = 0; i < count; i++){
            new TestingObject(val);
        }
    }

    public static void outsidePackageAloneTest(int val, int count){
        // 100 allocations, 100 duplicates
        for (int i = 0; i < count; i++){
            new OtherTestingObject(val);
        }
    }
}