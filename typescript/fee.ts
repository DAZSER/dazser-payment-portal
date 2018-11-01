"use strict";

const calculateFee = (initAmount: number) => {
  // This calculates the fee and total amount
  let amount = new Big(initAmount);

  // Edge Case: initAmount is 0
  if ( amount.eq(0) ) {
    return {
      amount: "0",
      fee: "0",
      total: "0",
    };
  }

  // Get the Amount in Cents
  amount = amount.times(100);
  // Add 30 cents for fee
  const numerator = amount.plus(30);

  const one = new Big(1);
  const denominator = one.minus(0.029);

  const totalCharge = numerator.div(denominator).round(0);
  const fee = totalCharge.minus(amount);

  return {
    amount: amount.toString(),
    fee: fee.toString(),
    total: totalCharge.toString(),
  };
};
