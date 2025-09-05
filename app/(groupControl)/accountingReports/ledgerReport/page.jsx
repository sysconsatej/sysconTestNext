"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState } from 'react';
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import {
    Box, FormControl, InputLabel, OutlinedInput, Radio, RadioGroup, FormControlLabel, FormLabel, MenuItem, Select, TextField, Button, Checkbox,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import styles from "@/app/app.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { useSearchParams } from 'next/navigation';


const LedgerReport = () => {
    const searchParams = useSearchParams();
    const encodedGlId = searchParams.get('gl_id');
    const [toggle, setToggle] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [receivedGlId, setReceivedGlId] = useState(null);
    const [selectedForeignCurrency, setSelectedForeignCurrency] = useState('n');
    const [selectedVoucherGrouping, setSelectedVoucherGrouping] = useState('n');
    const [isChecked, setIsChecked] = useState(false);
    const [ledgerType, setLedgerType] = useState('');
    const [ledgerName, setLedgerName] = useState('');
    const [ledgerCode, setLedgerCode] = useState('');
    const [bank, setBank] = useState('');
    const [party, setParty] = useState('');

    const decodeGlId = (encodedId) => {
        try {
            return atob(encodedId);
        } catch (error) {
            console.error('Invalid encoded ID');
            return null;
        }
    };

    useEffect(() => {
        const decodedGlId = decodeGlId(encodedGlId);
        setReceivedGlId(decodedGlId);
    }, [searchParams]);

    console.log("Received Gl Id:", receivedGlId);
    return (
        <>
            <Accordion
                expanded={toggle}
                sx={{ ...parentAccordionSection }}
                key={1}
            >
                <AccordionSummary
                    className="relative left-[11px]"
                    expandIcon={
                        <LightTooltip title={toggle ? "Collapse" : "Expand"}>
                            <ExpandMoreIcon sx={{ color: "black" }} />
                        </LightTooltip>
                    }
                    aria-controls={`panel${1 + 1}-content`}
                    id={`panel${1 + 1}-header`}
                    onClick={() => setToggle((prev) => !prev)}
                >
                    <Typography className="relative right-[11px]">
                        Ledger Report
                    </Typography>
                </AccordionSummary>
                <AccordionDetails
                    className={`!pb-0 overflow-hidden ${styles.thinScrollBar} mb-2`}
                    sx={{ ...accordianDetailsStyle }}
                >
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" className="text-xs">

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Ledger Type </InputLabel>
                            <Select onChange={(e) => setLedgerType(e.target.value)} label="Ledger  Type" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Ledger Type</em>}>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Ledger Code </InputLabel>
                            <Select onChange={(e) => setLedgerCode(e.target.value)} label="Ledger  Code" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Ledger Code</em>}>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Ledger Name </InputLabel>
                            <Select onChange={(e) => setLedgerName(e.target.value)} label="Ledger  Name" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Ledger Name</em>}>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" }, }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>From Date</InputLabel>
                            <TextField type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" }, }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>To Date</InputLabel>
                            <TextField type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Party </InputLabel>
                            <Select onChange={(e) => setParty(e.target.value)} label="Party" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Party</em>}>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Bank </InputLabel>
                            <Select onChange={(e) => setBank(e.target.value)} label="Bank" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Bank</em>}>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl component="fieldset" variant="outlined" size="small" className="ms-2" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiFormControlLabel-root": { fontSize: "0.7rem" }, }}>
                            <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">Foreign Currency</FormLabel>
                            <RadioGroup row value={selectedForeignCurrency} onChange={(e) => setSelectedForeignCurrency(e.target.value)} sx={{ gap: 2 }}>
                                <FormControlLabel value="y" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="Yes" />
                                <FormControlLabel value="n" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="No" />
                            </RadioGroup>
                        </FormControl>
                        <FormControl component="fieldset" variant="outlined" size="small" className="ms-2" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiFormControlLabel-root": { fontSize: "0.7rem" }, }}>
                            <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">Voucher Grouping</FormLabel>
                            <RadioGroup row value={selectedVoucherGrouping} onChange={(e) => setSelectedVoucherGrouping(e.target.value)} sx={{ gap: 2 }}>
                                <FormControlLabel value="y" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="Yes" />
                                <FormControlLabel value="n" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="No" />
                            </RadioGroup>
                        </FormControl>
                        <FormControl component="fieldset" variant="outlined" size="small" className="ms-2" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiFormControlLabel-root": { fontSize: "0.7rem" }, }}>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ fontSize: '0.6rem' }} checked={isChecked} onChange={(e) => setIsChecked(e.target.value)} />}
                                label="Summary"
                            />
                        </FormControl>

                    </Box>

                    <div className='flex mt-2'>
                        <button onClick={async () => { await fetchBalanceSheetData(); }} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs">Go</button>
                    </div>
                </AccordionDetails>
            </Accordion>

        </>
    );
}

export default LedgerReport