/* eslint-disable no-unused-vars */
"use client";
export const setRateToParent = (obj) => {
    const { args, newState, formControlData, values, setStateVariable, childName, childIndex, valuesIndex } = obj;
    const argNames = args?.split(",").map((arg) => arg.trim());

    console.log("setRateToParent", obj);
    console.log("argNames", newState[childName][childIndex][argNames[0]]);

    // if (typeof valuesIndex === "number") {
    //     newState[childName][childIndex][argNames[0]][valuesIndex] = values;
    // } else {
    //     newState[childName][childIndex][argNames[0]].push(values);
    // }

    // ✅ Ensure numeric sum
    const items = newState[childName][childIndex][argNames[0]];
    newState[childName][childIndex][argNames[2]] = items
        .filter((_, idx) => idx !== valuesIndex)
        .reduce((sum, item) => sum + (+item[argNames[1]] || 0), 0);


    console.log("finalData", newState);

    // if (typeof valuesIndex !== "number") {
    //     newState[childName][childIndex][argNames[0]].pop(); // ✅ call pop()
    // }

    return {
        type: "success",
        result: true,
        newState: newState,
        values: {},
        submitNewState: newState,
        message: "Password updated successfully!",
    };
};

export const setRateToParentPurchase = (obj) => {
    const { args, newState, formControlData, values, setStateVariable, childName, childIndex, valuesIndex } = obj;
    const argNames = args?.split(",").map((arg) => arg.trim());
    console.log("setRateToParent", obj);
    console.log("argNames", newState[childName][childIndex][argNames[0]]);

    //   if (typeof valuesIndex === "number") {
    //     newState[childName][childIndex][argNames[0]][valuesIndex] = values;
    //   } else {
    //     newState[childName][childIndex][argNames[0]].push(values);
    //   }

    // ✅ Ensure numeric sum
    const items = newState[childName][childIndex][argNames[0]].filter((_, idx) => idx !== valuesIndex);
    newState[childName][childIndex][argNames[2]] =
        items.reduce(
            (acc, item) => acc + (Number(item[argNames[1]]) || 0) /
                (items.length || 1),
            0
        ).toFixed(2);
    newState[childName][childIndex][argNames[4]] =
        (
            items.reduce(
                (acc, item) => acc + (Number(item[argNames[3]]) || 0),
                0
            )
        ).toFixed(2);

    console.log("finalData", newState);

    //   if (typeof valuesIndex !== "number") {
    //     newState[childName][childIndex][argNames[0]].pop(); // ✅ call pop()
    //   }

    return {
        type: "success",
        result: true,
        newState: newState,
        values: {},
        submitNewState: newState,
        message: "Password updated successfully!",
    };
};