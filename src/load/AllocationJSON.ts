export interface AllocationJSON {
    LINE: LineJSON[];
    DUPLICATE: DuplicateJSON[];
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
    class: string;
    method: string;
    line: number;
    size: number;
    duplicates: number;
    // value: string;
}

export function isAllocationJSON(obj: any): obj is AllocationJSON {
    if (!(Array.isArray(obj.LINE) && Array.isArray(obj.DUPLICATE))) {
        return false;
    }
    for (var line of obj.LINE) {
        if (!isLineJSON(line)) {
            return false;
        }
    }
    for (var duplicate of obj.DUPLICATE) {
        if (!isDuplicateJSON(duplicate)) {
            return false;
        }
    }
    return true;
}

export function isLineJSON(obj: any): obj is LineJSON {
    if (!(
        typeof obj.class === "string" &&
        typeof obj.method === "string" &&
        typeof obj.line === "number" &&
        typeof obj.size === "number" &&
        typeof obj.count === "number" &&
        typeof obj.name === "string"
    )) {
        return false;
    }

    if (!(obj.line > 0 && obj.size > 0 && obj.count > 0)) {
        return false;
    }
    return true;
}

export function isDuplicateJSON(obj: any): obj is DuplicateJSON {
    if (!(
        typeof obj.name === "string" &&
        typeof obj.class === "string" &&
        typeof obj.method === "string" &&
        typeof obj.line === "number" &&
        typeof obj.size === "number" &&
        typeof obj.duplicates === "number"
        // typeof obj.value === "string"
    )) {
        return false;
    }

    if (!(obj.line > 0 && obj.size > 0 && obj.duplicates > 0)) {
        return false;
    }
    return true;
}
