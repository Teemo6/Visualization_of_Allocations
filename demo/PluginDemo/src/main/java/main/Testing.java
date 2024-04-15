package main;

public class Testing {
    public static void usedMethod(){
        new TestingObject(100);
        new BiggerTestingObject(100, "Hello, World!");

        new TestingObject(200);
        new TestingObject(200);
        
        for(int i = 0; i < 10; i++){
            new TestingObject(300);
        }
    }

    public static void emptyMethod() {
        // Empty method
    }
}