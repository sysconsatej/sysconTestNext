export async function fetchTenantData(subdomain) {

  const tenants = {
    nclp: { name: "N Cube Logistics Limited" },
    amc: { name: "AMC Global Pvt Ltd" },
    pe: { name: "Pace Express Pvt.Ltd." },
    sls: { name: "SeaLead Shipping Agencies India Pvt. Ltd." },
    cml: { name: "Cargo Movers Limited" },
    kgs: { name: "K . J. SHIPPING & LOGISTICS PVT LTD" },
    ccs: { name: "C.C.Shah and Sons." },
    sar:  {name : "SAR Logisolutions Pvt. Ltd."},
    dts:  { name  :  "DOOR TO SHORE"},
    srl  :  {name  :  "SILCK ROUTE LOGISTIKS"}
  };

  return tenants[subdomain] || { name: "Syscon" };
}
