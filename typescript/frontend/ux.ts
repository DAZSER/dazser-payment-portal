"use strict";

import {Big} from "big.js";

const calculateFee = (initAmount: number) => {
  // This calculates the fee and total amount
  let amount = new Big(initAmount);

  // Edge Case: initAmount is 0
  if( amount.eq(0) ) {
    return {
      amount: "0",
      fee: "0",
      total: "0"
    }
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
    total: totalCharge.toString()
  }
};

const amountInput = document.querySelector("#amount") as HTMLInputElement;
// Bind the Input Mask
// @ts-ignore I am getting this via vendor.js
Inputmask({
  prefix: "$",
  groupSeparator: ",",
  alias: "numeric",
  placeholder: "0",
  autoGroup: true,
  digits: 2,
  digitsOptional: false,
  clearMaskOnLostFocus: false
}).mask(amountInput);

/*
"currency": {
  prefix: "$ ",
  groupSeparator: ",",
  alias: "numeric",
  placeholder: "0",
  autoGroup: true,
  digits: 2,
  digitsOptional: false,
  clearMaskOnLostFocus: false
}
*/

// Bind onchange for amount to updatePaymentAmount

amountInput.addEventListener("keyup", () => {

  if ( amountInput.value != "") {
    const spanAmount = document.querySelector("#span-amount") as HTMLSpanElement;
    const feeAmount = document.querySelector("#convenience-fee") as HTMLInputElement;
    const totalAmount = document.querySelector("#total-amount") as HTMLInputElement;

    const amounts = calculateFee(parseFloat(amountInput.value.replace(/[^0-9.-]+/g,"")));

    // I have to convert to javascript float so I can use toLocaleString to format as currency
    let total = new Big(amounts.total);
    total = total.div(100);
    const intAmount = parseFloat(total.toString());

    let fee = new Big(amounts.fee);
    fee = fee.div(100);
    const feeIntAmount = parseFloat(fee.toString());
    const options = {
      style: "currency",
      currency: "USD"
    };
    spanAmount.textContent = intAmount.toLocaleString("en-US", options);
    totalAmount.value = intAmount.toLocaleString("en-US", options);
    feeAmount.value = parseFloat(feeIntAmount.toString()).toLocaleString("en-US", options);
  }

});
