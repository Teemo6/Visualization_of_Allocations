/**
 * Object for extenison containing loaded JSON data
 */
export class AllocationJSON {
    /**
     * JSON line allocation records
     */
    public LINE: LineJSON[];
    /**
     * JSON duplicate records
     */
    public DUPLICATE: DuplicateJSON[];

    /**
     * Assign all provided parameters to object values
     * @param LINE array with line allocation records
     * @param DUPLICATE array with duplicate allocation records
     */
    constructor(LINE: LineJSON[], DUPLICATE: DuplicateJSON[]) {
        this.LINE = LINE;
        this.DUPLICATE = DUPLICATE;
    }
}

/**
 * Specified LineJSON interface
 */
export interface LineJSON {
    /**
     * Class name with packages: myPackage.myOtherPackage.myClass
     */
    class: string;
    /**
     * Name of method without parameters: myMethod
     */
    method: string;
    /**
     * Line number indexed from 1
     */
    line: number;
    /**
     * Allocated size of signle instance
     */
    size: number;
    /**
     * How many instances have been allocated at this line
     */
    count: number;
    /**
     * Instance name
     */
    name: string;
}

/**
 * Specified DuplicateJSON interface
 */
export interface DuplicateJSON {
    /**
     * Instance name
     */
    name: string;
    /**
     * Size of single duplicate
     */
    size: number;
    /**
     * How many duplcates have been created at this line
     */
    duplicates: number;
    /**
     * Array containing traces where other duplicates are located accross the project
     */
    traces: DuplicateTraceJSON[];
}

/**
 * Specified DuplicateTraceJSON interface
 */
export interface DuplicateTraceJSON {
    /**
     * Class name with packages: myPackage.myOtherPackage.myClass
     */
    class: string;
    /**
     * Name of method without parameters: myMethod
     */
    method: string;
    /**
     * Line number indexed from 1
     */
    line: number;
    /**
     * How many duplicates have been created at this line
     */
    count: number;
}

/**
 * Check if loaded data have expected format and return AllocationJSON containing parsed data
 * @param input object to compaer
 * @returns new object with parsed data from input, undefined if invalid format
 */
export function createAllocationJSON(input: unknown): AllocationJSON | undefined {
    if (!isSomeObject(input)) {
        return undefined;
    }

    const obj = input as object;
    if (!Array.isArray(obj)) {
        return undefined;
    }

    if (!(obj.length === 2)) {
        return undefined;
    }

    if (!("LINE" in obj[0] && "DUPLICATE" in obj[1])) {
        return undefined;
    }

    if (!(Array.isArray(obj[0].LINE) && Array.isArray(obj[1].DUPLICATE))) {
        return undefined;
    }

    if (obj[0].LINE.length === 0 && obj[1].DUPLICATE.length !== 0) {
        return undefined;
    }

    for (const line of obj[0].LINE) {
        if (!isLineJSON(line)) {
            return undefined;
        }
    }

    for (const duplicate of obj[1].DUPLICATE) {
        if (!isDuplicateJSON(duplicate)) {
            return undefined;
        }
    }

    return new AllocationJSON(obj[0].LINE, obj[1].DUPLICATE);
}

/**
 * Check if object has expected LineJSON format
 * @param input object to compare
 * @returns object can/cannot be converted to LineJSON
 */
export function isLineJSON(input: unknown): input is LineJSON {
    if (!isSomeObject(input)) {
        return false;
    }

    const obj = input as LineJSON;
    if (!(
        typeof obj?.class === "string" &&
        typeof obj?.method === "string" &&
        typeof obj?.line === "number" &&
        typeof obj?.size === "number" &&
        typeof obj?.count === "number" &&
        typeof obj?.name === "string"
    )) {
        return false;
    }

    if (!(obj.line > 0 && obj.size > 0 && obj.count > 0)) {
        return false;
    }
    return true;
}

/**
 * Check if object has expected DuplicateJSON format
 * @param input object to compare
 * @returns object can/cannot be converted to DuplicateJSON
 */
export function isDuplicateJSON(input: unknown): input is DuplicateJSON {
    if (!isSomeObject(input)) {
        return false;
    }

    const obj = input as DuplicateJSON;
    if (!(
        typeof obj?.name === "string" &&
        typeof obj?.size === "number" &&
        typeof obj?.duplicates === "number"
    )) {
        return false;
    }

    if (!(obj.size > 0 && obj.duplicates > 0)) {
        return false;
    }

    if (!Array.isArray(obj.traces)) {
        return false;
    }

    for (const trace of obj.traces) {
        if (!isDuplicateTraceJSON(trace)) {
            return false;
        }
    }
    return true;
}

/**
 * Check if object has expected DuplicateTraceJSON format
 * @param input object to compare
 * @returns object can/cannot be converted to DuplicateTraceJSON
 */
export function isDuplicateTraceJSON(input: unknown): input is DuplicateTraceJSON {
    if (!isSomeObject(input)) {
        return false;
    }

    const obj = input as DuplicateTraceJSON;
    if (!(
        typeof obj?.class === "string" &&
        typeof obj?.method === "string" &&
        typeof obj?.line === "number" &&
        typeof obj?.count === "number"
    )) {
        return false;
    }

    if (!(obj.line > 0 && obj.count > 0)) {
        return false;
    }
    return true;
}

/**
 * Check if provided input can be converted to object (is not null)
 * @param input object to compare
 * @returns input can/cannot be converted to object
 */
export function isSomeObject(obj: unknown): boolean {
    if (obj === null) {
        return false;
    }

    if (typeof obj !== "object") {
        return false;
    }
    return true;
}