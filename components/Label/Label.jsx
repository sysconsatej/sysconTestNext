import React from 'react'
import { bool, string } from 'prop-types'
import styles from "@/components/common.module.css";


export const CustomLabel = ({ inputLabel, field }) => {
    return (
        <>
            <span className={`${styles.inputTextColor}`}>
                {inputLabel}
                {field && <span style={{ color: "red" }}> *</span>}
            </span>

        </>
    )
}


// propTypes definiton 
CustomLabel.propTypes = {
    inputLabel: string,
    field: bool,
}