import { useEffect, useState } from "react";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";

export const useChargesData = (scopeOfWork) => {
  const [chargedData, setChargedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChargesData = async () => {
      setLoading(true);
      setError(null);
      const idsOfChargeGroups = scopeOfWork?.split(",") || [];
      const finalData = [];
      const storedUserData = localStorage.getItem("userData");
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0].clientId;
      try {
        // Fetch main data for each ID
        for (const id of idsOfChargeGroups) {
          const mainQuery = {
            columns: "name",
            tableName: "tblMasterData",
            whereCondition: `id = ${id}`,
            clientIdCondition: `status = 1 and clientId = ${clientId} FOR JSON PATH`,
          };
          const mainResponse = await fetchReportData(mainQuery);
          if (mainResponse.success && mainResponse.data.length > 0) {
            const mainItem = mainResponse.data[0];
            console.log("mainItem", mainItem);
            const chargesQuery = {
              columns:
                "c.id,c.name,c.sellMargin,c.buyMargin,c.rateBasisId,c.currencyId",
              tableName:
                "tblCharge c Left Join tblChargeGroups cg on cg.chargeId = c.id",
              whereCondition: `cg.chargeGroupId = ${id}`,
              clientIdCondition: `c.status = 1 and cg.status = 1 and c.clientId in (${clientId},(Select id from tblClient where clientCode = 'SYSCON')) and cg.clientId in (${clientId},(Select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
            };

            const chargesResponse = await fetchReportData(chargesQuery);
            console.log("chargesResponse", chargesResponse);
            mainItem.charges = chargesResponse.success
              ? chargesResponse.data
              : [];
            finalData.push({ ...mainItem, id: id });
            console.log("finalData", finalData);
          }
        }

        setChargedData(finalData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (scopeOfWork) {
      fetchChargesData();
    }
  }, [scopeOfWork]);

  return { chargedData, loading, error };
};
