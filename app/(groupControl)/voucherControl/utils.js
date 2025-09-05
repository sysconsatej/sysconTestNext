export default function filterTblWithIsCheckedTrue(obj) {
    const result = {};

    // Return immediately if the input is not an object or is null
    if (obj === null || typeof obj !== 'object') {
        return result;
    }

    // Iterate through all keys in the object
    for (const key in obj) {
        const value = obj[key];

        if (Array.isArray(value) && key.startsWith("tbl")) {
            // If the key starts with "tbl" and the value is an array, filter the array
            const filteredArray = value.filter(item => item && item.isChecked === true);

            // Recurse into nested arrays or objects if necessary
            const filteredNestedArray = filteredArray.map(item => filterTblWithIsCheckedTrue(item));

            // Only add the filtered array to the result if it's not empty
            if (filteredNestedArray.length > 0) {
                result[key] = filteredNestedArray;
            }
        } else if (typeof value === "object") {
            // Recurse for objects that are not arrays, to handle nested objects
            const nestedResult = filterTblWithIsCheckedTrue(value);
            if (Object.keys(nestedResult).length > 0) {
                result[key] = nestedResult;
            }
        } else {
            // If the value isn't an array or object, just add it to the result
            result[key] = value;
        }
    }

    return result;
}
