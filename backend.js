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
