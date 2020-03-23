"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_js_1 = __importDefault(require("big.js"));
function default_1(initAmount) {
    let amount = new big_js_1.default(initAmount);
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
    amount = amount.times(100);
    const numerator = amount.plus(30);
    const one = new big_js_1.default(1);
    const denominator = one.minus(0.029);
    const totalCharge = numerator.div(denominator).round(0);
    const fee = totalCharge.minus(amount);
    const options = {
        currency: "USD",
        style: "currency",
    };
    const displayTotal = parseFloat(totalCharge.div(100).toString()).toLocaleString("en-US", options);
    const displayFee = parseFloat(fee.div(100).toString()).toLocaleString("en-US", options);
    const displayAmount = parseFloat(amount.div(100).toString()).toLocaleString("en-US", options);
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
exports.default = default_1;
