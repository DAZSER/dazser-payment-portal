'use strict';
const stripe = require("stripe")(process.env.STRIPE_KEY);
const validator = require("validator");
const Big = require("big.js");
const email = require("./email.js");
const logger = require("./logger.js");
module.exports.handler = async (event, context) => {
    let data = {
        message: ""
    };
    const form = JSON.parse(event.body);
    form.stripeToken = JSON.parse(form.stripeToken);
    logger.log("Insert", form);
    if (!validator.isEmail(form.email)) {
        data.message = "Invalid email address, please double check your email address and try again.";
        return {
            statusCode: 200,
            body: JSON.stringify({ data })
        };
    }
    const amount = Big(parseFloat(form.amount.replace(/[^0-9.-]+/g, "")));
    if (amount.lt(0) || amount.gt(970999.69)) {
        data.message = "Amount is invalid, please enter an amount greater than zero.";
        return {
            statusCode: 200,
            body: JSON.stringify({ data })
        };
    }
    const calculateFee = (initAmount) => {
        let amount = new Big(initAmount);
        if (amount.eq(0)) {
            return {
                amount: "0",
                fee: "0",
                total: "0"
            };
        }
        amount = amount.times(100);
        const numerator = amount.plus(30);
        const one = new Big(1);
        const denominator = one.minus(0.029);
        const totalCharge = numerator.div(denominator).round(0);
        const fee = totalCharge.minus(amount);
        return {
            amount: amount.toString(),
            fee: fee.toString(),
            total: totalCharge.toString()
        };
    };
    const amounts = calculateFee(parseFloat(form.amount.replace(/[^0-9.-]+/g, "")));
    const chargedAmountInCents = new Big(amounts.total);
    const totalAmount = new Big(parseFloat(form.total_amount.replace(/[^0-9.-]+/g, "")));
    const whatWeToldThemItWouldBe = totalAmount.times(100);
    if (!chargedAmountInCents.eq(whatWeToldThemItWouldBe)) {
        const messageId = await email.sendEmail(JSON.stringify({
            error: "The frontend calculation and backend calculation did not agree.",
            frontEnd: whatWeToldThemItWouldBe.toString(),
            backEnd: chargedAmountInCents.toString(),
            form
        }));
        data.message = "An unexpected error occured. You're card has not been charged. \
    The error has been logged.\n Message ID: " + messageId;
        return {
            statusCode: 200,
            body: JSON.stringify({ data })
        };
    }
    stripe.setTimeout(10000);
    return stripe.charges.create({
        amount: parseInt(chargedAmountInCents.toString()),
        currency: "usd",
        description: "Jani-King Cleaning Services - " + form.invoice + " - includes convenience fee",
        source: form.stripeToken.id,
        receipt_email: form.email,
        metadata: {
            email: form.email,
            invoice: form.invoice
        }
    }).then((charge) => {
        logger.log("Update", charge);
        data.message = "Your account has been charged and a receipt has been emailed to you. \
    You may now close this window. \
    \n\n Thank you for your business! \
    \n\n Transaction ID: " + charge.id;
        return {
            statusCode: 200,
            body: JSON.stringify({
                data
            }),
        };
    }).catch((error) => {
        console.log(error);
        email.sendEmail(JSON.stringify({ error, form }));
        data.message = "An unexpected error has occured.\n" + error.message + "\nCode: " + error.code;
        return {
            statusCode: 200,
            body: JSON.stringify({
                data
            }),
        };
    });
};
