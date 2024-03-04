import { Constants } from "../../Constants";

/**
 * Source of duplicate
 */
export class DuplicateTrace {
    /**
     * Absolute string file path in current workspace
     */
    public file: string;
    /**
     * Class name with packages: myPackage.myOtherPackage.myClass
     */
    public class: string;
    /**
     * Name of method without parameters: myMethod
     */
    public method: string;
    /**
     * Line number indexed from 1
     */
    public line: number;
    /**
     * How many duplicates have been created at this line
     */
    public count: number;

    /**
     * Assign all provided parameters to object values
     * @param file Absolute string file path in current workspace
     * @param clazz Class name with packages: myPackage.myOtherPackage.myClass
     * @param method Name of method without parameters: myMethod
     * @param line Line number indexed from 1
     * @param count How many duplicates have been created at this line
     */
    constructor(file: string, clazz: string, method: string, line: number, count: number) {
        this.file = file;
        this.class = clazz;
        this.method = method;
        this.line = line;
        this.count = count;
    }

    /**
     * Return data in string separated with "deli" specified in Constants
     * @param exp format as following: \<package with class\>"deli"\<method\>"deli"\<line\> 
     */
    public getJavaSource(): string {
        return this.class + Constants.DUPLICATE_DETAIL_DELI + this.method + Constants.DUPLICATE_DETAIL_DELI + this.line;
    }
}