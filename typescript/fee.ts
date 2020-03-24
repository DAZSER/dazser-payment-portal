// Frontend AND Backend
import Big from "big.js";

export interface FeeStructure {
  amount: string;
  display: {
    amount: string;
    fee: string;
    total: string;
  };
  fee: string;
  total: string;
}

export default function (initAmount: number): FeeStructure {
  // This calculates the fee and total amount
  let amount = new Big(initAmount);

  // Edge Case: initAmount is 0
  if (amount.eq(0)) {
    return {
      amount: "0",
      display: {
        amount: "0",
        fee: "0",
        total: "0",
      },
      fee: "0",
      total: "0",
    };
  }

  // Get the Amount in Cents
  amount = amount.times(100);
  // Add 30 cents for fee
  const numerator = amount.plus(30);

  // Add in 2.9%
  const one = new Big(1);
  const denominator = one.minus(0.029);
  const totalCharge = numerator.div(denominator).round(0);
  const fee = totalCharge.minus(amount);

  // Also, return the display amounts
  // I have to convert to javascript float so I can use toLocaleString to format as currency
  const options = {
    currency: "USD",
    style: "currency",
  };
  const displayTotal = parseFloat(
    totalCharge.div(100).toString()
  ).toLocaleString("en-US", options);
  const displayFee = parseFloat(fee.div(100).toString()).toLocaleString(
    "en-US",
    options
  );
  const displayAmount = parseFloat(amount.div(100).toString()).toLocaleString(
    "en-US",
    options
  );

  return {
    amount: amount.toString(),
    display: {
      amount: displayAmount,
      fee: displayFee,
      total: displayTotal,
    },
    fee: fee.toString(),
    total: totalCharge.toString(),
  };
}
