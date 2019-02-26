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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHlwZXNjcmlwdC9mZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxvREFBeUI7QUFhekIsbUJBQXdCLFVBQWtCO0lBRXhDLElBQUksTUFBTSxHQUFHLElBQUksZ0JBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUdqQyxJQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUc7UUFDbEIsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHO1lBQ1gsT0FBTyxFQUFFO2dCQUNQLE1BQU0sRUFBRSxHQUFHO2dCQUNYLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRSxHQUFHO2FBQ1g7WUFDRCxHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxHQUFHO1NBQ1gsQ0FBQztLQUNIO0lBR0QsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFM0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUdsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLGdCQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4RCxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBSXRDLE1BQU0sT0FBTyxHQUFHO1FBQ2QsUUFBUSxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsVUFBVTtLQUNsQixDQUFDO0lBQ0YsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xHLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFOUYsT0FBTztRQUNMLE1BQU0sRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFO1FBQ3pCLE9BQU8sRUFBRTtZQUNQLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLEdBQUcsRUFBRSxVQUFVO1lBQ2YsS0FBSyxFQUFFLFlBQVk7U0FDcEI7UUFDRCxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRTtRQUNuQixLQUFLLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRTtLQUM5QixDQUFDO0FBQ0osQ0FBQztBQWpERCw0QkFpREMifQ==