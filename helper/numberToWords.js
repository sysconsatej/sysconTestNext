const numberToWords = (num, currencyCode = "INR") => {
  if (num === null || num === undefined || num === "") return "";
  const n = Number(num);
  if (!Number.isFinite(n)) return "";

  const currencyData = {
    USD: { currency: "dollars", cents: "cents" },
    EUR: { currency: "euros", cents: "cents" },
    GBP: { currency: "pounds", cents: "pence" },
    INR: { currency: "rupees", cents: "paise" },
  };

  const belowTwenty = [
    "zero","one","two","three","four","five","six","seven","eight","nine",
    "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen",
  ];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

  const twoDigits = (x) => {
    if (x < 20) return belowTwenty[x];
    const t = Math.floor(x / 10);
    const u = x % 10;
    return u ? `${tens[t]}-${belowTwenty[u]}` : tens[t];
  };

  const threeDigits = (x) => {
    let out = "";
    if (x >= 100) {
      out += `${belowTwenty[Math.floor(x / 100)]} hundred`;
      x %= 100;
      if (x) out += " ";
    }
    if (x) out += twoDigits(x);
    return out.trim();
  };

  const indian = (intNum) => {
    if (intNum === 0) return "zero";
    const units = ["", "thousand", "lakh", "crore", "arab", "kharab"];
    const chunks = [];

    const last3 = intNum % 1000;
    intNum = Math.floor(intNum / 1000);
    if (last3) chunks.push({ val: last3, unit: "" });

    let i = 1;
    while (intNum > 0 && i < units.length) {
      const grp = intNum % 100;
      if (grp) chunks.push({ val: grp, unit: units[i] });
      intNum = Math.floor(intNum / 100);
      i++;
    }

    return chunks
      .reverse()
      .map((c) => {
        const w = c.val < 100 ? twoDigits(c.val) : threeDigits(c.val);
        return `${w}${c.unit ? " " + c.unit : ""}`.trim();
      })
      .join(" ")
      .trim();
  };

  const isNeg = n < 0;
  const abs = Math.abs(n);

  const fixed = abs.toFixed(2);
  const [intStr, decStr] = fixed.split(".");
  const intNum = parseInt(intStr, 10);
  const decNum = parseInt(decStr, 10);

  const cur = currencyData[currencyCode] || { currency: "currency", cents: "cents" };

  let result = `${isNeg ? "minus " : ""}${currencyCode === "INR" ? indian(intNum) : ""} ${cur.currency}`.trim();

  if (currencyCode !== "INR") {
    // fallback for non-INR (optional)
    result = `${isNeg ? "minus " : ""}${intNum} ${cur.currency}`.trim();
  }

  if (decNum > 0) result += ` and ${twoDigits(decNum)} ${cur.cents}`;

  // ✅ Remove trailing "Only" no matter who added it earlier
  result = result.replace(/\s*only\s*$/i, "").trim();

  return result;
};

export default numberToWords;
