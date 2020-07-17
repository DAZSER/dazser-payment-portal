"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_js_1 = __importDefault(require("big.js"));
const stripe_1 = __importDefault(require("stripe"));
const validator_1 = __importDefault(require("validator"));
const email_1 = __importDefault(require("./email"));
const fee_1 = __importDefault(require("../fee"));
const logger_1 = __importStar(require("./logger"));
exports.default = async (event) => {
    const data = {
        message: "",
    };
    const form = JSON.parse(event.body);
    form.stripeToken = JSON.parse(form.stripeToken);
    logger_1.default(logger_1.EventType.INSERT, form);
    if (!validator_1.default.isEmail(form.email)) {
        data.message =
            "Invalid email address, please double check your email address and try again.";
        return {
            body: JSON.stringify({ data }),
            statusCode: 422,
        };
    }
    const amount = big_js_1.default(Number.parseFloat(form.amount.replace(/[^\d.-]+/g, "")));
    if (amount.lt(0) || amount.gt(970999.69)) {
        data.message =
            "Amount is invalid, please enter an amount greater than zero.";
        return {
            body: JSON.stringify({ data }),
            statusCode: 422,
        };
    }
    const amounts = fee_1.default(Number.parseFloat(form.amount.replace(/[^\d.-]+/g, "")));
    const chargedAmountInCents = new big_js_1.default(amounts.total);
    const totalAmount = new big_js_1.default(Number.parseFloat(form.total_amount.replace(/[^\d.-]+/g, "")));
    const whatWeToldThemItWouldBe = totalAmount.times(100);
    if (!chargedAmountInCents.eq(whatWeToldThemItWouldBe)) {
        await email_1.default(JSON.stringify({
            backEnd: chargedAmountInCents.toString(),
            error: "The frontend calculation and backend calculation did not agree.",
            form,
            frontEnd: whatWeToldThemItWouldBe.toString(),
        }));
        data.message = `An unexpected error occured. You're card has not been charged. The error has been logged.`;
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
    const stripe = new stripe_1.default(privateKey, {
        apiVersion: "2020-03-02",
    });
    try {
        const charge = await stripe.charges.create({
            amount: Number.parseInt(chargedAmountInCents.toString(), 10),
            currency: "usd",
            description: `Jani-King Cleaning Services - ${form.invoice} - includes convenience fee`,
            metadata: {
                email: form.email,
                invoice: form.invoice,
            },
            receipt_email: form.email,
            source: form.stripeToken.id,
        });
        try {
            await logger_1.default(logger_1.EventType.UPDATE, charge);
        }
        catch (error) {
            console.error(error);
        }
        data.message = `Your account has been charged and a receipt has been emailed to you. You may now close this window. \n\n Thank you for your business! \n\n Transaction ID: ${charge.id}`;
        return {
            body: JSON.stringify({
                data,
            }),
            statusCode: 200,
        };
    }
    catch (error) {
        await email_1.default(JSON.stringify({ error, form }));
        data.message = `An unexpected error has occured.\n${error.message}\nCode: ${error.code}`;
        return {
            body: JSON.stringify({
                data,
            }),
            statusCode: 200,
        };
    }
};
