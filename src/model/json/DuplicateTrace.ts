import { Constants } from "../../Constants";

export class DuplicateTrace {
    public file: string;
    public class: string;
    public method: string;
    public line: number;
    public count: number;

    constructor(file: string, clazz: string, method: string, line: number, count: number) {
        this.file = file;
        this.class = clazz;
        this.method = method;
        this.line = line;
        this.count = count;
    }

    public getJavaSource(): string {
        return this.class + Constants.DUPLICATE_DETAIL_DELI + this.method + Constants.DUPLICATE_DETAIL_DELI + this.line;
    }
}