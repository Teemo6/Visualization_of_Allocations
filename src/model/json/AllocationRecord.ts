import * as vscode from 'vscode';

import { DuplicateTrace } from "./DuplicateTrace";
import { AllocationKind } from "./AllocationKind";
import { Constants } from '../../Constants';

/**
 * Record of data model
 */
export class AllocationRecord {
    /**
     * Instance name for object,
     * Method() name for method,
     * Package.class name for class
     */
    public name: string;
    /**
     * Package.class of parent of this element
     */
    public parentClass: string;
    /**
     * Allocated line, indexed from 0
     */
    public line: number;
    /**
     * Size of single record, default is 0
     */
    public size: number = 0;
    /**
     * Count of allocated instances, default is 1
     */
    public count: number = 1;
    /**
     * Count of all found duplicates, default is 0
     */
    public dupeCount: number = 0;
    /**
     * Allocation kind
     */
    public kind: AllocationKind;
    /**
     * Span of lines, used for methods and classes
     */
    public range: vscode.Range | undefined;
    /**
     * Trace to every duplicate
     */
    public duplicates: DuplicateTrace[] = [];

    /**
     * Assign provided parameters to object values
     * @param name Instance name
     * @param parentClass string of parent class with package.class
     * @param line Allocation line
     * @param kind Allocation kind
     */
    constructor(name: string, parentClass: string, line: number, kind: AllocationKind) {
        this.name = name;
        this.parentClass = parentClass;
        this.line = line;
        this.kind = kind;
    }

    /**
     * Return data in string separated with "deli" specified in Constants
     * @param exp format as following: \<package with class\>"deli"\<method\>"deli"\<line\> 
     */
    public getJavaSource(): string {
        return this.parentClass + Constants.DUPLICATE_DETAIL_DELI + (this.line + 1);
    }
}