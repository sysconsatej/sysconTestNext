const numberToWords = (num, currencyCode) => {
  if (num === 0) return "zero";

  const currencyData = {
    USD: { currency: "dollars", cents: "cents" },
    EUR: { currency: "euros", cents: "cents" },
    GBP: { currency: "pounds", cents: "pence" },
    INR: { currency: " ", cents: "paise" },
    CNY: { currency: "yuan", cents: "fen" },
    JPY: { currency: "yen", cents: "sen" },
    RUB: { currency: "rubles", cents: "kopeks" },
    AED: { currency: "dirhams", cents: "fils" },
    AUD: { currency: "dollars", cents: "cents" },
    CAD: { currency: "dollars", cents: "cents" },
    SGD: { currency: "dollars", cents: "cents" },
    MXN: { currency: "pesos", cents: "centavos" },
    BRL: { currency: "reais", cents: "centavos" },
    ZAR: { currency: "rand", cents: "cents" },
    SEK: { currency: "kronor", cents: "ore" },
    NOK: { currency: "kroner", cents: "ore" },
    DKK: { currency: "kroner", cents: "ore" },
    PLN: { currency: "zloty", cents: "groszy" },
    CHF: { currency: "francs", cents: "rappen" },
    THB: { currency: "baht", cents: "satang" },
    MYR: { currency: "ringgit", cents: "sen" },
    IDR: { currency: "rupiah", cents: "sen" },
    PKR: { currency: "rupees", cents: "paisa" },
  };

  const belowTwenty = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion", "trillion"];

  const convertHundreds = (num) => {
    let result = "";
    if (num >= 100) {
      result += belowTwenty[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }
    if (num > 0) {
      if (num < 20) {
        result += belowTwenty[num];
      } else {
        result += tens[Math.floor(num / 10)];
        if (num % 10 > 0) {
          result += "-" + belowTwenty[num % 10];
        }
      }
    }
    return result.trim();
  };

  const [integerPart, decimalPart] = num.toString().split(".");
  let word = "";
  let thousandCounter = 0;
  let intNum = parseInt(integerPart, 10);

  while (intNum > 0) {
    if (intNum % 1000 !== 0) {
      word =
        convertHundreds(intNum % 1000) +
        (thousands[thousandCounter] ? " " + thousands[thousandCounter] : "") +
        " " +
        word;
    }
    intNum = Math.floor(intNum / 1000);
    thousandCounter++;
  }

  let result =
    word.trim() +
    " " +
    (currencyData[currencyCode]
      ? currencyData[currencyCode].currency
      : "currency");
  if (decimalPart) {
    result +=
      " and " +
      convertHundreds(parseInt(decimalPart, 10)) +
      " " +
      (currencyData[currencyCode] ? currencyData[currencyCode].cents : "cents");
  }
  return result.trim();
};

export default numberToWords;
