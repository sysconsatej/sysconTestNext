'use client';


import React from 'react'
import LightTooltip from '../Tooltip/customToolTip';
import Image from 'next/image';
import { Box, IconButton } from '@mui/material';
import { bool, func, string } from 'prop-types';

export const ActionButton = ({
    onCopy,
    onDelete,
    deleteImagePath,
    copyImagepath,
    showDelete = true,
    showCopy = true,
}) => {
    return (
        <>
            <Box className="flex pl-1 w-12" >
                {showDelete && (
                    <LightTooltip title="Delete Record">
                        <IconButton
                            aria-label="Delete"
                            onClick={onDelete}
                        >
                            <Image
                                src={deleteImagePath}
                                alt="Delete Icon"
                                priority={false}
                                className="gridIcons2"
                            />
                        </IconButton>
                    </LightTooltip>
                )}
                {showCopy && (
                    <LightTooltip title="Copy Document">
                        <IconButton
                            aria-label="Document"
                            onClick={onCopy}
                        >
                            <Image
                                src={copyImagepath}
                                alt="Document Icon"
                                priority={false}
                                className="gridIcons2"
                            />
                        </IconButton>
                    </LightTooltip>
                )}
            </Box>

        </>

    )
}

ActionButton.propTypes = {
    onDelete: func.isRequired,
    onCopy: func.isRequired,
    deleteImagePath: string,
    copyImagepath: string,
    showDelete: bool,
    showCopy: bool,
}


