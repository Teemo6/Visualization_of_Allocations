import { DuplicateTrace } from "./DuplicateTrace";
import { AllocationKind } from "./AllocationKind";

/**
 * Record of data model
 */
export class AllocationRecord {
    /**
     * Instance name
     */
    public name: string;
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
     * Trace to every duplicate
     */
    public duplicates: DuplicateTrace[] = [];

    /**
     * Assign provided parameters to object values
     * @param name Instance name
     * @param line Allocation line
     * @param kind Allocation kind
     */
    constructor(name: string, line: number, kind: AllocationKind) {
        this.name = name;
        this.line = line;
        this.kind = kind;
    }
}