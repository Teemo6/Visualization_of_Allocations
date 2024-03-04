import { DuplicateTrace } from "./DuplicateTrace";
import { AllocationKind } from "./AllocationKind";

export class AllocationRecord {
    public name: string;
    public line: number;
    public size: number = 0;
    public count: number = 1;
    public dupeCount: number = 0;
    public kind: AllocationKind;
    public duplicates: DuplicateTrace[] = [];

    constructor(name: string, line: number, kind: AllocationKind) {
        this.name = name;
        this.line = line;
        this.kind = kind;
    }
}