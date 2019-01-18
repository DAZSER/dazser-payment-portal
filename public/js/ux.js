"use strict";
var calculateFee = function (initAmount) {
    var amount = new Big(initAmount);
    if (amount.eq(0)) {
        return {
            amount: "0",
            fee: "0",
            total: "0"
        };
    }
    amount = amount.times(100);
    var numerator = amount.plus(30);
    var one = new Big(1);
    var denominator = one.minus(0.029);
    var totalCharge = numerator.div(denominator).round(0);
    var fee = totalCharge.minus(amount);
    return {
        amount: amount.toString(),
        fee: fee.toString(),
        total: totalCharge.toString()
    };
};
var amountInput = document.querySelector("#amount");
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
amountInput.addEventListener("keyup", function () {
    if (amountInput.value != "") {
        var spanAmount = document.querySelector("#span-amount");
        var feeAmount = document.querySelector("#convenience-fee");
        var totalAmount = document.querySelector("#total-amount");
        var amounts = calculateFee(parseFloat(amountInput.value.replace(/[^0-9.-]+/g, "")));
        var total = new Big(amounts.total);
        total = total.div(100);
        var intAmount = parseFloat(total.toString());
        var fee = new Big(amounts.fee);
        fee = fee.div(100);
        var feeIntAmount = parseFloat(fee.toString());
        var options = {
            style: "currency",
            currency: "USD"
        };
        spanAmount.textContent = intAmount.toLocaleString("en-US", options);
        totalAmount.value = intAmount.toLocaleString("en-US", options);
        feeAmount.value = parseFloat(feeIntAmount.toString()).toLocaleString("en-US", options);
    }
});
