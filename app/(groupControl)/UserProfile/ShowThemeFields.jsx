'use client';

import React, { useState } from 'react';
import { TextField, MenuItem, FormControl, Drawer, Button, Box } from '@mui/material'
import { commonTextFieldProps } from './commonTextFieldStyles';
import { bool } from 'prop-types';
import styles from "@/app/app.module.css";
import { fontFamilyStyles } from "@/app/globalCss";



export const ShowThemeFields = ({ defaultThemeId }) => {

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');

    const data = [10, 20, 30];

    const handleChange = (e) => {
        setValue(e)
    }

    const handleDrawer = () => {
        setOpen(prev => !prev)
    }

    const buttonProps = {
        className: `${styles.commonBtn} font-[${fontFamilyStyles}]`,
        variant: 'contained',
        type: 'button',
        onClick: () => handleDrawer(),
    }

    return (
        <>
            {defaultThemeId ?
                <Box
                    sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-40px', width: '95%' }}
                >
                    <Button {...buttonProps}> Style Theme Fields </Button>
                </Box>
                : <></>}

            <Drawer open={open} onClose={() => setOpen(prev => !prev)} anchor='right'>
                <Box sx={{ padding: '10px' , display: 'flex' , justifyContent: 'flex-end' }}  >
                    <Button {...buttonProps}> Close </Button>
                </Box>


                <FormControl sx={{ width: `400px`, padding: '10px' }}>
                    {Array.from(({ length: 20 })).map((info, _idx) => (
                        <TextField
                            select
                            label="Data"
                            value={value}
                            onChange={(e) => handleChange(e.target.value)}
                            {...commonTextFieldProps}
                            key={_idx}
                        >
                            {data.map((info, _idx) => (
                                <MenuItem key={_idx} value={info}>{info}</MenuItem>
                            ))}
                        </TextField>
                    ))}
                </FormControl>
            </Drawer>
        </>
    )
}

ShowThemeFields.propTypes = {
    defaultThemeId: bool,
}
