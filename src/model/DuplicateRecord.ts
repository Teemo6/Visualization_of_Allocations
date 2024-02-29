export class DuplicateRecord {
    public size: number = 0;
    public duplicates: number = 1;

    constructor(size: number, duplicates: number) {
        this.size = size;
        this.duplicates = duplicates;
    }
}