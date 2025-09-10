export function hasBlackValues(obj) {
    const subChildWithoutNullValues = Object.fromEntries(
        Object.entries(obj).filter(
            // eslint-disable-next-line no-unused-vars
            ([_, value]) =>
                value != null && (!Array.isArray(value) || value.length !== 0)
        )
    );
    if (Object.keys(subChildWithoutNullValues).length === 0) {
        return true;
    } else {
        return false;
    }
}

export function areObjectsEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (
        typeof obj1 !== "object" || obj1 === null ||
        typeof obj2 !== "object" || obj2 === null
    ) {
        return obj1 === obj2;
    }

    // Handle arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            if (!areObjectsEqual(obj1[i], obj2[i])) return false;
        }
        return true;
    }

    // If one is array and the other is not
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
        if (!areObjectsEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}
