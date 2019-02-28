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
const stripe_1 = require("stripe");
const validator_1 = __importDefault(require("validator"));
const email_1 = __importDefault(require("./email"));
const fee_1 = __importDefault(require("./fee"));
const logger_1 = __importStar(require("./logger"));
exports.handler = async (event) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHQvYmFja2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxvREFBeUI7QUFFekIsbUNBQWdDO0FBQ2hDLDBEQUFrQztBQUNsQyxvREFBNEI7QUFDNUIsZ0RBQWlDO0FBQ2pDLG1EQUE2QztBQU1oQyxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBZ0MsRUFBRSxFQUFFO0lBR2hFLE1BQU0sSUFBSSxHQUFnQjtRQUN4QixPQUFPLEVBQUUsRUFBRTtLQUNaLENBQUM7SUFHRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFjLENBQUMsQ0FBQztJQUU5QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBR2hELGdCQUFNLENBQUMsa0JBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFHL0IsSUFBSyxDQUFDLG1CQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLDhFQUE4RSxDQUFDO1FBQzlGLE9BQU87WUFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBQyxDQUFDO1lBQzVCLFVBQVUsRUFBRSxHQUFHO1NBQ2hCLENBQUM7S0FDSDtJQUdELE1BQU0sTUFBTSxHQUFHLGdCQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsSUFBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUc7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FB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