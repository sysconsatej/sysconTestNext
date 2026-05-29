export const PIE_DATA = {
    name: 'Logistics Overview',
    value: 100,
    color: '#378ADD',
    children: [
        {
            name: 'Inbound', value: 420, color: '#1D9E75', children: [
                {
                    name: 'Air Freight', value: 180, color: '#5DCAA5', children: [
                        { name: 'Express', value: 90, color: '#9FE1CB' },
                        { name: 'Standard', value: 60, color: '#5DCAA5' },
                        { name: 'Charter', value: 30, color: '#1D9E75' },
                    ]
                },
                {
                    name: 'Sea Freight', value: 150, color: '#0F6E56', children: [
                        { name: 'FCL', value: 85, color: '#5DCAA5' },
                        { name: 'LCL', value: 45, color: '#1D9E75' },
                        { name: 'Bulk', value: 20, color: '#085041' },
                    ]
                },
                {
                    name: 'Road', value: 90, color: '#04342C', children: [
                        { name: 'FTL', value: 55, color: '#5DCAA5' },
                        { name: 'LTL', value: 35, color: '#1D9E75' },
                    ]
                },
            ],
        },
        {
            name: 'Warehousing', value: 310, color: '#7F77DD', children: [
                {
                    name: 'Storage', value: 130, color: '#AFA9EC', children: [
                        { name: 'Cold Chain', value: 55, color: '#CECBF6' },
                        { name: 'Dry', value: 45, color: '#AFA9EC' },
                        { name: 'Hazmat', value: 30, color: '#7F77DD' },
                    ]
                },
                {
                    name: 'Fulfillment', value: 110, color: '#534AB7', children: [
                        { name: 'Pick & Pack', value: 60, color: '#AFA9EC' },
                        { name: 'Kitting', value: 30, color: '#7F77DD' },
                        { name: 'Returns', value: 20, color: '#534AB7' },
                    ]
                },
                {
                    name: 'Cross-dock', value: 70, color: '#3C3489', children: [
                        { name: 'B2B', value: 40, color: '#7F77DD' },
                        { name: 'B2C', value: 30, color: '#534AB7' },
                    ]
                },
            ],
        },
        {
            name: 'Outbound', value: 380, color: '#D85A30', children: [
                {
                    name: 'Last Mile', value: 160, color: '#F0997B', children: [
                        { name: 'Same Day', value: 70, color: '#F5C4B3' },
                        { name: 'Next Day', value: 55, color: '#F0997B' },
                        { name: 'Standard', value: 35, color: '#D85A30' },
                    ]
                },
                {
                    name: 'B2B Delivery', value: 140, color: '#993C1D', children: [
                        { name: 'Retail', value: 75, color: '#F0997B' },
                        { name: 'Industrial', value: 40, color: '#D85A30' },
                        { name: 'Gov', value: 25, color: '#993C1D' },
                    ]
                },
                {
                    name: 'Returns', value: 80, color: '#712B13', children: [
                        { name: 'Consumer', value: 50, color: '#D85A30' },
                        { name: 'B2B', value: 30, color: '#993C1D' },
                    ]
                },
            ],
        },
        {
            name: 'Customs', value: 190, color: '#BA7517', children: [
                {
                    name: 'Import', value: 85, color: '#EF9F27', children: [
                        { name: 'Docs', value: 40, color: '#FAC775' },
                        { name: 'Duties', value: 30, color: '#EF9F27' },
                        { name: 'Inspection', value: 15, color: '#BA7517' },
                    ]
                },
                {
                    name: 'Export', value: 65, color: '#854F0B', children: [
                        { name: 'Docs', value: 35, color: '#EF9F27' },
                        { name: 'Licensing', value: 30, color: '#BA7517' },
                    ]
                },
                {
                    name: 'Compliance', value: 40, color: '#633806', children: [
                        { name: 'AEO', value: 22, color: '#EF9F27' },
                        { name: 'CTPAT', value: 18, color: '#BA7517' },
                    ]
                },
            ],
        },
        {
            name: 'Fleet', value: 260, color: '#E24B4A', children: [
                {
                    name: 'Own Fleet', value: 110, color: '#F09595', children: [
                        { name: 'Heavy Trucks', value: 50, color: '#F7C1C1' },
                        { name: 'Vans', value: 35, color: '#F09595' },
                        { name: 'Bikes', value: 25, color: '#E24B4A' },
                    ]
                },
                {
                    name: '3PL Partners', value: 100, color: '#A32D2D', children: [
                        { name: 'Partner A', value: 45, color: '#F09595' },
                        { name: 'Partner B', value: 35, color: '#E24B4A' },
                        { name: 'Partner C', value: 20, color: '#A32D2D' },
                    ]
                },
                {
                    name: 'Intermodal', value: 50, color: '#791F1F', children: [
                        { name: 'Rail+Road', value: 30, color: '#E24B4A' },
                        { name: 'Sea+Road', value: 20, color: '#A32D2D' },
                    ]
                },
            ],
        },
    ],
};


export const LINE_DATA = {
    name: "Logistics Overview",
    color: "#378ADD",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
        {
            name: "Inbound", color: "#1D9E75",
            values: [320, 345, 380, 360, 420, 410, 390, 430, 445, 460, 420, 480],
            children: {
                name: "Inbound Breakdown",
                color: "#1D9E75",
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                series: [
                    {
                        name: "Air Freight", color: "#5DCAA5", values: [120, 130, 145, 135, 160, 155, 148, 165, 170, 178, 160, 185],
                        children: {
                            name: "Air Freight Detail", color: "#5DCAA5",
                            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            series: [
                                { name: "Express", color: "#9FE1CB", values: [55, 60, 68, 62, 75, 72, 68, 78, 80, 84, 75, 88] },
                                { name: "Standard", color: "#5DCAA5", values: [45, 48, 52, 48, 55, 53, 52, 57, 58, 60, 55, 62] },
                                { name: "Charter", color: "#1D9E75", values: [20, 22, 25, 25, 30, 30, 28, 30, 32, 34, 30, 35] }
                            ]
                        }
                    },
                    {
                        name: "Sea Freight", color: "#0F6E56", values: [110, 118, 125, 118, 150, 142, 132, 152, 158, 162, 148, 172],
                        children: {
                            name: "Sea Freight Detail", color: "#0F6E56",
                            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            series: [
                                { name: "FCL", color: "#5DCAA5", values: [62, 66, 70, 66, 85, 80, 74, 85, 88, 90, 82, 95] },
                                { name: "LCL", color: "#1D9E75", values: [32, 34, 36, 34, 42, 40, 38, 42, 44, 45, 40, 47] },
                                { name: "Bulk", color: "#085041", values: [16, 18, 19, 18, 23, 22, 20, 25, 26, 27, 26, 30] }
                            ]
                        }
                    },
                    { name: "Road", color: "#04342C", values: [90, 97, 110, 107, 110, 113, 110, 113, 117, 120, 112, 123] }
                ]
            }
        },
        {
            name: "Warehousing", color: "#7F77DD",
            values: [210, 225, 240, 235, 260, 255, 248, 265, 272, 280, 260, 290],
            children: {
                name: "Warehousing Breakdown", color: "#7F77DD",
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                series: [
                    {
                        name: "Storage", color: "#AFA9EC", values: [90, 96, 102, 100, 110, 108, 105, 112, 115, 118, 110, 122],
                        children: {
                            name: "Storage Detail", color: "#AFA9EC",
                            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            series: [
                                { name: "Cold Chain", color: "#CECBF6", values: [38, 41, 44, 43, 48, 46, 44, 48, 50, 51, 48, 53] },
                                { name: "Dry", color: "#AFA9EC", values: [32, 34, 36, 35, 38, 38, 37, 39, 40, 41, 37, 43] },
                                { name: "Hazmat", color: "#7F77DD", values: [20, 21, 22, 22, 24, 24, 24, 25, 25, 26, 25, 26] }
                            ]
                        }
                    },
                    { name: "Fulfillment", color: "#534AB7", values: [80, 86, 92, 90, 100, 97, 94, 102, 106, 110, 100, 115] },
                    { name: "Cross-dock", color: "#3C3489", values: [40, 43, 46, 45, 50, 50, 49, 51, 51, 52, 50, 53] }
                ]
            }
        },
        {
            name: "Outbound", color: "#D85A30",
            values: [280, 298, 320, 310, 355, 345, 330, 358, 370, 382, 355, 395],
            children: {
                name: "Outbound Breakdown", color: "#D85A30",
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                series: [
                    {
                        name: "Last Mile", color: "#F0997B", values: [120, 128, 138, 132, 152, 148, 140, 152, 158, 164, 152, 168],
                        children: {
                            name: "Last Mile Detail", color: "#F0997B",
                            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            series: [
                                { name: "Same Day", color: "#F5C4B3", values: [52, 56, 62, 58, 68, 66, 62, 68, 72, 75, 68, 76] },
                                { name: "Next Day", color: "#F0997B", values: [42, 44, 48, 46, 52, 50, 48, 52, 54, 56, 52, 58] },
                                { name: "Standard", color: "#D85A30", values: [26, 28, 28, 28, 32, 32, 30, 32, 32, 33, 32, 34] }
                            ]
                        }
                    },
                    { name: "B2B Delivery", color: "#993C1D", values: [105, 112, 122, 118, 135, 128, 122, 136, 142, 148, 135, 152] },
                    { name: "Returns", color: "#712B13", values: [55, 58, 60, 60, 68, 69, 68, 70, 70, 70, 68, 75] }
                ]
            }
        },
        {
            name: "Fleet", color: "#E24B4A",
            values: [180, 192, 208, 200, 230, 222, 212, 235, 244, 252, 232, 260],
            children: {
                name: "Fleet Breakdown", color: "#E24B4A",
                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                series: [
                    {
                        name: "Own Fleet", color: "#F09595", values: [78, 82, 90, 86, 100, 96, 92, 102, 106, 110, 100, 114],
                        children: {
                            name: "Own Fleet Detail", color: "#F09595",
                            months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                            series: [
                                { name: "Heavy Trucks", color: "#F7C1C1", values: [35, 37, 41, 39, 46, 44, 42, 47, 49, 51, 46, 53] },
                                { name: "Vans", color: "#F09595", values: [26, 27, 30, 29, 33, 32, 31, 34, 35, 36, 33, 38] },
                                { name: "Bikes", color: "#E24B4A", values: [17, 18, 19, 18, 21, 20, 19, 21, 22, 23, 21, 23] }
                            ]
                        }
                    },
                    { name: "3PL Partners", color: "#A32D2D", values: [68, 74, 80, 76, 88, 84, 80, 88, 92, 96, 88, 98] },
                    { name: "Intermodal", color: "#791F1F", values: [34, 36, 38, 38, 42, 42, 40, 45, 46, 46, 44, 48] }
                ]
            }
        }
    ]
};


export const BAR_DATA = {
    name: "Logistics Overview", value: 100, color: "#378ADD",
    children: [
        {
            name: "Inbound", value: 420, color: "#1D9E75", children: [
                {
                    name: "Air Freight", value: 180, color: "#5DCAA5", children: [
                        { name: "Express", value: 90, color: "#9FE1CB" },
                        { name: "Standard", value: 60, color: "#5DCAA5" },
                        { name: "Charter", value: 30, color: "#1D9E75" }
                    ]
                },
                {
                    name: "Sea Freight", value: 150, color: "#0F6E56", children: [
                        { name: "FCL", value: 85, color: "#5DCAA5" },
                        { name: "LCL", value: 45, color: "#1D9E75" },
                        { name: "Bulk", value: 20, color: "#085041" }
                    ]
                },
                {
                    name: "Road", value: 90, color: "#04342C", children: [
                        { name: "FTL", value: 55, color: "#5DCAA5" },
                        { name: "LTL", value: 35, color: "#1D9E75" }
                    ]
                }
            ]
        },
        {
            name: "Warehousing", value: 310, color: "#7F77DD", children: [
                {
                    name: "Storage", value: 130, color: "#AFA9EC", children: [
                        { name: "Cold Chain", value: 55, color: "#CECBF6" },
                        { name: "Dry", value: 45, color: "#AFA9EC" },
                        { name: "Hazmat", value: 30, color: "#7F77DD" }
                    ]
                },
                {
                    name: "Fulfillment", value: 110, color: "#534AB7", children: [
                        { name: "Pick & Pack", value: 60, color: "#AFA9EC" },
                        { name: "Kitting", value: 30, color: "#7F77DD" },
                        { name: "Returns", value: 20, color: "#534AB7" }
                    ]
                },
                {
                    name: "Cross-dock", value: 70, color: "#3C3489", children: [
                        { name: "B2B", value: 40, color: "#7F77DD" },
                        { name: "B2C", value: 30, color: "#534AB7" }
                    ]
                }
            ]
        },
        {
            name: "Outbound", value: 380, color: "#D85A30", children: [
                {
                    name: "Last Mile", value: 160, color: "#F0997B", children: [
                        { name: "Same Day", value: 70, color: "#F5C4B3" },
                        { name: "Next Day", value: 55, color: "#F0997B" },
                        { name: "Standard", value: 35, color: "#D85A30" }
                    ]
                },
                {
                    name: "B2B Delivery", value: 140, color: "#993C1D", children: [
                        { name: "Retail", value: 75, color: "#F0997B" },
                        { name: "Industrial", value: 40, color: "#D85A30" },
                        { name: "Gov", value: 25, color: "#993C1D" }
                    ]
                },
                {
                    name: "Returns", value: 80, color: "#712B13", children: [
                        { name: "Consumer", value: 50, color: "#D85A30" },
                        { name: "B2B", value: 30, color: "#993C1D" }
                    ]
                }
            ]
        },
        {
            name: "Customs", value: 190, color: "#BA7517", children: [
                {
                    name: "Import", value: 85, color: "#EF9F27", children: [
                        { name: "Docs", value: 40, color: "#FAC775" },
                        { name: "Duties", value: 30, color: "#EF9F27" },
                        { name: "Inspection", value: 15, color: "#BA7517" }
                    ]
                },
                {
                    name: "Export", value: 65, color: "#854F0B", children: [
                        { name: "Docs", value: 35, color: "#EF9F27" },
                        { name: "Licensing", value: 30, color: "#BA7517" }
                    ]
                },
                {
                    name: "Compliance", value: 40, color: "#633806", children: [
                        { name: "AEO", value: 22, color: "#EF9F27" },
                        { name: "CTPAT", value: 18, color: "#BA7517" }
                    ]
                }
            ]
        },
        {
            name: "Fleet", value: 260, color: "#E24B4A", children: [
                {
                    name: "Own Fleet", value: 110, color: "#F09595", children: [
                        { name: "Heavy Trucks", value: 50, color: "#F7C1C1" },
                        { name: "Vans", value: 35, color: "#F09595" },
                        { name: "Bikes", value: 25, color: "#E24B4A" }
                    ]
                },
                {
                    name: "3PL Partners", value: 100, color: "#A32D2D", children: [
                        { name: "Partner A", value: 45, color: "#F09595" },
                        { name: "Partner B", value: 35, color: "#E24B4A" },
                        { name: "Partner C", value: 20, color: "#A32D2D" }
                    ]
                },
                {
                    name: "Intermodal", value: 50, color: "#791F1F", children: [
                        { name: "Rail+Road", value: 30, color: "#E24B4A" },
                        { name: "Sea+Road", value: 20, color: "#A32D2D" }
                    ]
                }
            ]
        }
    ]
};



export const PIE_DATA_TWO = {
    name: 'Logistics Overview',
    value: 100,
    color: '#378ADD',
    children: [
        {
            name: 'Inbound', value: 420, color: '#1D9E75', children: [
                {
                    name: 'Air Freight', value: 180, color: '#5DCAA5', children: [
                        {
                            name: 'Express', value: 90, color: '#9FE1CB', children: [
                                { name: 'International', value: 60, color: '#9FE1CB' },
                                { name: 'Domestic', value: 30, color: '#5DCAA5' }
                            ]
                        },
                        {
                            name: 'Standard', value: 60, color: '#5DCAA5', children: [
                                { name: 'International', value: 35, color: '#5DCAA5' },
                                { name: 'Domestic', value: 25, color: '#9FE1CB' }
                            ]
                        },
                        { name: 'Charter', value: 30, color: '#1D9E75' },
                    ]
                },
                {
                    name: 'Sea Freight', value: 150, color: '#0F6E56', children: [
                        {
                            name: 'FCL', value: 85, color: '#5DCAA5', children: [
                                { name: 'Asia', value: 45, color: '#5DCAA5' },
                                { name: 'Europe', value: 40, color: '#1D9E75' }
                            ]
                        },
                        { name: 'LCL', value: 45, color: '#1D9E75' },
                        { name: 'Bulk', value: 20, color: '#085041' },
                    ]
                },
                {
                    name: 'Road', value: 90, color: '#04342C', children: [
                        { name: 'FTL', value: 55, color: '#5DCAA5' },
                        {
                            name: 'LTL', value: 35, color: '#1D9E75', children: [
                                { name: 'Local', value: 25, color: '#5DCAA5' },
                                { name: 'Interstate', value: 10, color: '#1D9E75' }
                            ]
                        },
                    ]
                },
            ],
        },
        {
            name: 'Warehousing', value: 310, color: '#7F77DD', children: [
                {
                    name: 'Storage', value: 130, color: '#AFA9EC', children: [
                        {
                            name: 'Cold Chain', value: 55, color: '#CECBF6', children: [
                                { name: 'Perishable', value: 40, color: '#CECBF6' },
                                { name: 'Frozen', value: 15, color: '#7F77DD' }
                            ]
                        },
                        { name: 'Dry', value: 45, color: '#AFA9EC' },
                        { name: 'Hazmat', value: 30, color: '#7F77DD' },
                    ]
                },
                {
                    name: 'Fulfillment', value: 110, color: '#534AB7', children: [
                        { name: 'Pick & Pack', value: 60, color: '#AFA9EC' },
                        {
                            name: 'Kitting', value: 30, color: '#7F77DD', children: [
                                { name: 'Retail Kitting', value: 15, color: '#AFA9EC' },
                                { name: 'Industrial Kitting', value: 15, color: '#7F77DD' }
                            ]
                        },
                        { name: 'Returns', value: 20, color: '#534AB7' },
                    ]
                },
                {
                    name: 'Cross-dock', value: 70, color: '#3C3489', children: [
                        { name: 'B2B', value: 40, color: '#7F77DD' },
                        {
                            name: 'B2C', value: 30, color: '#534AB7', children: [
                                { name: 'Retail', value: 20, color: '#7F77DD' },
                                { name: 'E-Commerce', value: 10, color: '#534AB7' }
                            ]
                        },
                    ]
                },
            ],
        },
        {
            name: 'Outbound', value: 380, color: '#D85A30', children: [
                {
                    name: 'Last Mile', value: 160, color: '#F0997B', children: [
                        { name: 'Same Day', value: 70, color: '#F5C4B3' },
                        { name: 'Next Day', value: 55, color: '#F0997B' },
                        {
                            name: 'Standard', value: 35, color: '#D85A30', children: [
                                { name: 'B2B', value: 15, color: '#F0997B' },
                                { name: 'B2C', value: 20, color: '#D85A30' }
                            ]
                        },
                    ]
                },
                {
                    name: 'B2B Delivery', value: 140, color: '#993C1D', children: [
                        { name: 'Retail', value: 75, color: '#F0997B' },
                        { name: 'Industrial', value: 40, color: '#D85A30' },
                        { name: 'Gov', value: 25, color: '#993C1D' },
                    ]
                },
                {
                    name: 'Returns', value: 80, color: '#712B13', children: [
                        { name: 'Consumer', value: 50, color: '#D85A30' },
                        { name: 'B2B', value: 30, color: '#993C1D' },
                    ]
                },
            ],
        },
        {
            name: 'Customs', value: 190, color: '#BA7517', children: [
                {
                    name: 'Import', value: 85, color: '#EF9F27', children: [
                        { name: 'Docs', value: 40, color: '#FAC775' },
                        { name: 'Duties', value: 30, color: '#EF9F27' },
                        { name: 'Inspection', value: 15, color: '#BA7517' },
                        { name: 'Customs Bond', value: 10, color: '#FAC775' }
                    ]
                },
                {
                    name: 'Export', value: 65, color: '#854F0B', children: [
                        { name: 'Docs', value: 35, color: '#EF9F27' },
                        { name: 'Licensing', value: 30, color: '#BA7517' },
                    ]
                },
                {
                    name: 'Compliance', value: 40, color: '#633806', children: [
                        { name: 'AEO', value: 22, color: '#EF9F27' },
                        { name: 'CTPAT', value: 18, color: '#BA7517' },
                        { name: 'Other', value: 10, color: '#633806' }
                    ]
                },
            ],
        },
        {
            name: 'Fleet', value: 260, color: '#E24B4A', children: [
                {
                    name: 'Own Fleet', value: 110, color: '#F09595', children: [
                        { name: 'Heavy Trucks', value: 50, color: '#F7C1C1' },
                        { name: 'Vans', value: 35, color: '#F09595' },
                        { name: 'Bikes', value: 25, color: '#E24B4A' },
                        { name: 'Light Trucks', value: 20, color: '#F7C1C1' }
                    ]
                },
                {
                    name: '3PL Partners', value: 100, color: '#A32D2D', children: [
                        { name: 'Partner A', value: 45, color: '#F09595' },
                        { name: 'Partner B', value: 35, color: '#E24B4A' },
                        { name: 'Partner C', value: 20, color: '#A32D2D' },
                    ]
                },
                {
                    name: 'Intermodal', value: 50, color: '#791F1F', children: [
                        { name: 'Rail+Road', value: 30, color: '#E24B4A' },
                        { name: 'Sea+Road', value: 20, color: '#A32D2D' },
                    ]
                },
            ],
        },
    ],
};