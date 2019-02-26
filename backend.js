"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_js_1 = __importDefault(require("big.js"));
const validator_1 = __importDefault(require("validator"));
const email_1 = __importDefault(require("./email"));
const fee_1 = __importDefault(require("./fee"));
const logger_1 = __importStar(require("./logger"));
const stripe_1 = require("stripe");
exports.handler = async (event, context) => {
    console.log(context);
    const data = {
        message: "",
    };
    const form = JSON.parse(event.body);
    form.stripeToken = JSON.parse(form.stripeToken);
    logger_1.default(logger_1.EventType.INSERT, form);
    if (!validator_1.default.isEmail(form.email)) {
        data.message = "Invalid email address, please double check your email address and try again.";
        return {
            body: JSON.stringify({ data }),
            statusCode: 422,
        };
    }
    const amount = big_js_1.default(parseFloat(form.amount.replace(/[^0-9.-]+/g, "")));
    if (amount.lt(0) || amount.gt(970999.69)) {
        data.message = "Amount is invalid, please enter an amount greater than zero.";
        return {
            body: JSON.stringify({ data }),
            statusCode: 422,
        };
    }
    const amounts = fee_1.default(parseFloat(form.amount.replace(/[^0-9.-]+/g, "")));
    const chargedAmountInCents = new big_js_1.default(amounts.total);
    const totalAmount = new big_js_1.default(parseFloat(form.total_amount.replace(/[^0-9.-]+/g, "")));
    const whatWeToldThemItWouldBe = totalAmount.times(100);
    if (!chargedAmountInCents.eq(whatWeToldThemItWouldBe)) {
        const messageId = await email_1.default(JSON.stringify({
            backEnd: chargedAmountInCents.toString(),
            error: "The frontend calculation and backend calculation did not agree.",
            form,
            frontEnd: whatWeToldThemItWouldBe.toString(),
        }));
        data.message = "An unexpected error occured. You're card has not been charged. \
    The error has been logged.\n Message ID: " + messageId;
        return {
            body: JSON.stringify({ data }),
            statusCode: 500,
        };
    }
    let privateKey;
    switch (form.region_num) {
        case "1":
            privateKey = process.env.STRIPE_TAMPA_PRIVATE_KEY;
            break;
        case "2":
            privateKey = process.env.STRIPE_ORLANDO_PRIVATE_KEY;
            break;
        case "3":
            privateKey = process.env.STRIPE_BIRMINGHAM_PRIVATE_KEY;
            break;
        case "4":
            privateKey = process.env.STRIPE_BALTIMORE_PRIVATE_KEY;
            break;
        case "6":
            privateKey = process.env.STRIPE_ATLANTA_PRIVATE_KEY;
            break;
        default:
            console.error("Bad Region", form);
            data.message = "Bad Region Number";
            return {
                body: JSON.stringify({
                    data,
                }),
                statusCode: 500,
            };
    }
    const stripe = new stripe_1.Stripe(privateKey);
    stripe.setTimeout(10000);
    try {
        const charge = await stripe.charges.create({
            amount: parseInt(chargedAmountInCents.toString(), 10),
            currency: "usd",
            description: "Jani-King Cleaning Services - " + form.invoice + " - includes convenience fee",
            metadata: {
                email: form.email,
                invoice: form.invoice,
            },
            receipt_email: form.email,
            source: form.stripeToken.id,
        });
        await logger_1.default(logger_1.EventType.UPDATE, charge);
        data.message = "Your account has been charged and a receipt has been emailed to you. \
    You may now close this window. \
    \n\n Thank you for your business! \
    \n\n Transaction ID: " + charge.id;
        return {
            body: JSON.stringify({
                data,
            }),
            statusCode: 200,
        };
    }
    catch (error) {
        await email_1.default(JSON.stringify({ error, form }));
        data.message = "An unexpected error has occured.\n" + error.message + "\nCode: " + error.code;
        return {
            body: JSON.stringify({
                data,
            }),
            statusCode: 200,
        };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHQvYmFja2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxvREFBeUI7QUFDekIsMERBQWtDO0FBQ2xDLG9EQUE0QjtBQUM1QixnREFBaUM7QUFDakMsbURBQTZDO0FBRTdDLG1DQUE4QjtBQU1qQixRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBZ0MsRUFBRSxPQUEwQixFQUFFLEVBQUU7SUFFNUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUdyQixNQUFNLElBQUksR0FBZ0I7UUFDeEIsT0FBTyxFQUFFLEVBQUU7S0FDWixDQUFDO0lBR0YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBYyxDQUFDLENBQUM7SUFFOUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUdoRCxnQkFBTSxDQUFDLGtCQUFTLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRy9CLElBQUssQ0FBQyxtQkFBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUc7UUFDcEMsSUFBSSxDQUFDLE9BQU8sR0FBRyw4RUFBOEUsQ0FBQztRQUM5RixPQUFPO1lBQ0wsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQztZQUM1QixVQUFVLEVBQUUsR0FBRztTQUNoQixDQUFDO0tBQ0g7SUFHRCxNQUFNLE1BQU0sR0FBRyxnQkFBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLElBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENB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