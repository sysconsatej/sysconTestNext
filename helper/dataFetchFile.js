"use client";
/* eslint-disable */
// @ endResult: {isCheck: true} for validation types, {isCheck: false} for  types

const copyTableFunction = (obj) => {
    // console.log("copyTableFunction");
    const { args, values, fieldName, newState } = obj;
    // console.log("values", values, "args", typeof args)
    let argNames;

    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
    }

    // function logic
    const plrId = (values[argNames[0]] ? values[argNames[0]] : "");
    const polId = (values[argNames[1]] ? values[argNames[1]] : "");
    // console.log("plrId", plrId, "polId", polId);

    values[argNames[1]] = plrId;
    // console.log("values", values);

    let endResult = {
        isCheck: true,
        type: "success",
        message: "copyTableFunction function triggered",
        values: values,
        alertShow: false,
        fieldName: fieldName,
        newState: newState,
    }
    return endResult
}

const onLoadFunction = (obj) => {
    let { args, newState, formControlData, setFormControlData } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    // Function logic...
    const checkTableName = (arg, formControl) => {

        // Helper function to recursively check children
        const checkChildren = (children) => {
            for (const child of children) {
                if (child.tableName === arg[0]) {
                    for (const iterator of child.fields) {
                        if (iterator.fieldname === arg[1]) {
                            iterator.controlDefaultValue = "5100";
                            return formControl;
                        }
                    }
                }
                // Check subChild if it exists
                if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
                    for (const iterator of child.subChild.fields) {
                        if (iterator.fieldname === arg[1]) {
                            iterator.controlDefaultValue = "8500";
                            return formControl;
                        }
                    }
                }
            }
            return formControl;
        };

        // Check top-level tableName
        if (formControl.tableName === arg[0]) {
            for (const iterator of formControl.fields) {
                if (iterator.fieldname === arg[1]) {
                    iterator.controlDefaultValue = "58654";
                    return formControl;
                }
            }
        }

        // Check child array
        if (formControl.child && checkChildren(formControl.child)) {
            return formControl;
        }
    };

    splitArgs.forEach((arg) => {
        formControlData = checkTableName(arg, formControlData);
    });

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult
};

const setSameDDValues = (obj) => {
    let { args, newState, formControlData, setFormControlData } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    console.log("splitArgs", splitArgs);

    // // Function logic...
    // const checkTableName = (arg, formControl) => {

    //     // Helper function to recursively check children
    //     const checkChildren = (children) => {
    //         for (const child of children) {
    //             if (child.tableName === arg[0]) {
    //                 for (const iterator of child.fields) {
    //                     if (iterator.fieldname === arg[1]) {
    //                         iterator.controlDefaultValue = "5100";
    //                         return formControl;
    //                     }
    //                 }
    //             }
    //             // Check subChild if it exists
    //             if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
    //                 for (const iterator of child.subChild.fields) {
    //                     if (iterator.fieldname === arg[1]) {
    //                         iterator.controlDefaultValue = "8500";
    //                         return formControl;
    //                     }
    //                 }
    //             }
    //         }
    //         return formControl;
    //     };

    //     // Check top-level tableName
    //     if (formControl.tableName === arg[0]) {
    //         for (const iterator of formControl.fields) {
    //             if (iterator.fieldname === arg[1]) {
    //                 iterator.controlDefaultValue = "98000";
    //                 return formControl;
    //             }
    //         }
    //     }

    //     // Check child array
    //     if (formControl.child && checkChildren(formControl.child)) {
    //         return formControl;
    //     }
    // };

    // splitArgs.forEach((arg) => {
    //     formControlData = checkTableName(arg, formControlData);
    // });

    // Step 1: Create a regular expression based on args
    // const fileNameRegex = new RegExp(args.replace(/\./g, "\\."), "i");
    // console.log("fileNameRegex", fileNameRegex);

    // Step 2: Find all matching keys in newState
    // const matchingKeys = Object.keys(newState).filter(key => key.match(fileNameRegex));
    // console.log("matchingKeys", matchingKeys);

    // Step 3: Collect the key-value pairs into a single object
    // const valuesToPush = matchingKeys.reduce((acc, key) => {
    //     const fieldValue = newState[key];
    //     if (Array.isArray(fieldValue)) {
    //         // If the field value is an array, include it directly in the object
    //         acc[key] = fieldValue;
    //     } else {
    //         // If the field value is a single value, include it directly in the object
    //         acc[key] = fieldValue;
    //     }
    //     return acc;
    // }, { isChecked: true }); // Initialize with isChecked: true

    // console.log("valuesToPush", valuesToPush);

    // Step 4: Ensure the target array exists in newState
    // if (!Array.isArray(newState[splitArgs[0]])) {
    //     newState[splitArgs[0]] = [];
    // }

    // Step 5: Push the key-value pairs to newState[splitArgs[0]]
    // newState[splitArgs[0]].push(valuesToPush);
    // console.log("newState", newState);

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult

}

const emptyTargetField = (obj) => {
    let { args, newState, formControlData, setFormControlData, values, fieldName } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    // Function logic...
    const targetFieldData = (arg, formControl, values, fieldName) => {

        // Helper function to recursively check children
        const checkChildren = (children) => {
            for (const child of children) {
                if (child.tableName === arg[0][0]) {
                    for (const iterator of child.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
                // Check subChild if it exists
                if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
                    for (const iterator of child.subChild.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
            }
            return formControl;
        };

        // Check top-level tableName
        if (formControl.tableName === arg[0][0]) {
            for (const iterator of formControl.fields) {
                if (iterator.fieldname === arg[1][1]) {
                    console.log("iterator", iterator, arg[1][1]);
                    iterator.controlDefaultValue = values[fieldName];
                    return formControl;
                }
            }
        }

        // Check child array
        if (formControl.child && checkChildren(formControl.child)) {
            return formControl;
        }
    };

    // splitArgs.forEach((arg) => {
    formControlData = targetFieldData(splitArgs, formControlData, values, fieldName);
    // });

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult
};


const setTaxDetails = (obj) => {
    let { args, newState, formControlData, setFormControlData, values, fieldName } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    // Function logic...
    const targetFieldData = (arg, formControl, values, fieldName) => {

        // Helper function to recursively check children
        const checkChildren = (children) => {
            for (const child of children) {
                if (child.tableName === arg[0][0]) {
                    for (const iterator of child.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
                // Check subChild if it exists
                if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
                    for (const iterator of child.subChild.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
            }
            return formControl;
        };

        // Check top-level tableName
        if (formControl.tableName === arg[0][0]) {
            for (const iterator of formControl.fields) {
                if (iterator.fieldname === arg[1][1]) {
                    console.log("iterator", iterator, arg[1][1]);
                    iterator.controlDefaultValue = values[fieldName];
                    return formControl;
                }
            }
        }

        // Check child array
        if (formControl.child && checkChildren(formControl.child)) {
            return formControl;
        }
    };

    // splitArgs.forEach((arg) => {
    formControlData = targetFieldData(splitArgs, formControlData, values, fieldName);
    // });

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult
};


const setTDSDetails = (obj) => {
    let { args, newState, formControlData, setFormControlData, values, fieldName } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    // Function logic...
    const targetFieldData = (arg, formControl, values, fieldName) => {

        // Helper function to recursively check children
        const checkChildren = (children) => {
            for (const child of children) {
                if (child.tableName === arg[0][0]) {
                    for (const iterator of child.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
                // Check subChild if it exists
                if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
                    for (const iterator of child.subChild.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
            }
            return formControl;
        };

        // Check top-level tableName
        if (formControl.tableName === arg[0][0]) {
            for (const iterator of formControl.fields) {
                if (iterator.fieldname === arg[1][1]) {
                    console.log("iterator", iterator, arg[1][1]);
                    iterator.controlDefaultValue = values[fieldName];
                    return formControl;
                }
            }
        }

        // Check child array
        if (formControl.child && checkChildren(formControl.child)) {
            return formControl;
        }
    };

    // splitArgs.forEach((arg) => {
    formControlData = targetFieldData(splitArgs, formControlData, values, fieldName);
    // });

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult
};

const getJobCharges = (obj) => {
    let { args, newState, formControlData, setFormControlData, values, fieldName } = obj;

    let argNames;
    let splitArgs = [];
    if (args === undefined || args === null || args === "" || typeof args === "object" && Object.keys(args).length === 0) {
        argNames = args
    } else {
        argNames = args.split(",").map(arg => arg.trim());
        for (const iterator of argNames) {
            splitArgs.push(iterator.split("."));
        }
    }

    // Function logic...
    const targetFieldData = (arg, formControl, values, fieldName) => {

        // Helper function to recursively check children
        const checkChildren = (children) => {
            for (const child of children) {
                if (child.tableName === arg[0][0]) {
                    for (const iterator of child.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
                // Check subChild if it exists
                if (child.subChild && child.subChild.length && checkChildren(child.subChild)) {
                    for (const iterator of child.subChild.fields) {
                        if (iterator.fieldname === arg[1][1]) {
                            iterator.controlDefaultValue = values[fieldName];
                            return formControl;
                        }
                    }
                }
            }
            return formControl;
        };

        // Check top-level tableName
        if (formControl.tableName === arg[0][0]) {
            for (const iterator of formControl.fields) {
                if (iterator.fieldname === arg[1][1]) {
                    console.log("iterator", iterator, arg[1][1]);
                    iterator.controlDefaultValue = values[fieldName];
                    return formControl;
                }
            }
        }

        // Check child array
        if (formControl.child && checkChildren(formControl.child)) {
            return formControl;
        }
    };

    // splitArgs.forEach((arg) => {
    formControlData = targetFieldData(splitArgs, formControlData, values, fieldName);
    // });

    let endResult = {
        type: "success",
        result: true,
        newState: newState,
        formControlData: formControlData,
        message: "OnLoad function triggered",
    }
    return endResult
};



export {
    copyTableFunction,
    onLoadFunction,
    setSameDDValues,
    emptyTargetField,
    setTaxDetails,
    setTDSDetails,
    getJobCharges
}