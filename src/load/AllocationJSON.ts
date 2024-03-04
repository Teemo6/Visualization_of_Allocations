export class AllocationJSON {
    public LINE: LineJSON[];
    public DUPLICATE: DuplicateJSON[];

    constructor(LINE: LineJSON[], DUPLICATE: DuplicateJSON[]) {
        this.LINE = LINE;
        this.DUPLICATE = DUPLICATE;
    }
}

export interface LineJSON {
    class: string;
    method: string;
    line: number;
    size: number;
    count: number;
    name: string;
}

export interface DuplicateJSON {
    name: string;
    size: number;
    duplicates: number;
    traces: DuplicateTraceJSON[];
}

export interface DuplicateTraceJSON {
    class: string;
    method: string;
    line: number;
    count: number;
}

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

export function isSomeObject(obj: unknown): boolean {
    if (obj === null) {
        return false;
    }

    if (typeof obj !== "object") {
        return false;
    }
    return true;
}