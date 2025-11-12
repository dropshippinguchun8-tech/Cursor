import Decimal from "decimal.js";

export type CurrencyCode = "USD" | "UZS" | "RUB" | (string & {});

export function formatMoney(amount: Decimal.Value, currency: CurrencyCode = "USD", locale = "uz-UZ") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currencyDisplay: "symbol",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(new Decimal(amount).toNumber());
}

export function toDecimal(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

export function sum(values: Decimal.Value[]): Decimal {
  return values.reduce((acc, value) => acc.plus(value), new Decimal(0));
}

export function average(values: Decimal.Value[]): Decimal {
  if (!values.length) {
    return new Decimal(0);
  }

  return sum(values).dividedBy(values.length);
}
