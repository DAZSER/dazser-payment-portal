// Frontend
import Inputmask from "inputmask";
import calculateFee, { IFeeStructure } from "./fee";

const amountInput = document.querySelector("#amount") as HTMLInputElement;
// Bind the Input Mask
Inputmask({
  alias: "numeric",
  autoGroup: true,
  clearMaskOnLostFocus: false,
  digits: "2",
  digitsOptional: false,
  groupSeparator: ",",
  placeholder: "0",
  prefix: "$",
}).mask(amountInput);

// Bind onchange for amount to updatePaymentAmount
amountInput.addEventListener("keyup", () => {
  if ( amountInput.value !== "") {
    const feeAmount = document.querySelector("#convenience-fee") as HTMLInputElement;
    const totalAmount = document.querySelector("#total-amount") as HTMLInputElement;

    const amounts: IFeeStructure = calculateFee(parseFloat(amountInput.value.replace(/[^0-9.-]+/g, "")));

    totalAmount.value = amounts.display.total;
    feeAmount.value = amounts.display.fee;
  }
});
