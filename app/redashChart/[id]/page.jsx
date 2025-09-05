'use client';
import React, { Fragment, useEffect, useState } from "react";
import { SunBurst } from "../SunBurst";
import Skeleton from '@mui/material/Skeleton';
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb";
// import { usePathname } from "next/navigation";
import { Iccle } from "../Iccle";
import { Radio } from "@mui/material";

const Page = () => {
    // const ref = useRef(null);
    const [chartType, setChartType] = useState('SunBurst');
    const [chartName, setChartName] = useState('');
    const [loading, setLoading] = useState(true); // start as loading
    const [chartData, setChartData] = useState(null); // store chart data
    // const path = usePathname();
    // const sp_name = path.split('/')[2];
    const sp_name = 'customerjobcount';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Set loading state to true
                const response = await fetch(`http://94.136.187.170:8080/api/v1/jobAnalysis/${sp_name}`);
                const dataSamp = await response.json();

                if (dataSamp) {
                    setChartName(dataSamp?.data[0]?.name);
                    setChartData(dataSamp?.data[0]); // store chart data
                } else {
                    setChartName('No data available');
                    setChartData(null); // handle no data
                }
            } catch (error) {
                setChartName('Error loading data');
                setChartData(null); // in case of an error, no chart
            } finally {
                setLoading(false); // set loading to false after the request is done
            }
        };

        fetchData();
    }, [sp_name]); // Re-fetch if sp_name changes

    const getChartTye = (type) => {
        setChartType(type);
    }


    return (
        <>
            <CustomeBreadCrumb />
            <div className="p-4 flex flex-col gap-2 items-center">
                <h4 className="text-2xl font-bold text-black text-center">{chartName}</h4>
                <div className="flex flex-row-reverse gap-4" >
                    {['Iccle' ,'SunBurst'].map((type) => (
                        <Fragment key={type}>
                            <label className="text-black">{type}</label>
                            <Radio checked={type === chartType}  label={type} onChange={(e) => getChartTye(e.target.value)} value={type} />
                        </Fragment>
                    ))}
                </div>

                {loading ? (
                    <Skeleton variant="circular" width="500px" height="500px" sx={{ background: 'rgb(33 150 243 / 0.5)' }} />
                ) : (
                    <div className={'chart h-[80vh]'}>
                        {chartData ? (
                            <>
                                {chartType === 'SunBurst' ? <SunBurst data={chartData} /> : <></>}
                                {chartType === 'Iccle' ? <Iccle data={chartData} /> : <></>}
                            </>
                        ) : (
                            <p>No chart data available</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Page;
