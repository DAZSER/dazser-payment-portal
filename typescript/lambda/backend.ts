'use strict';

import { Context } from "aws-lambda";
import _Big from "big.js";
import * as _Validator from "validator";
import * as _Stripe from 'stripe';

const stripe: _Stripe = require("stripe")(process.env.STRIPE_KEY);
const validator: typeof _Validator = require("validator");
const Big: typeof _Big = require("big.js");

const email = require("./email.js");
const logger = require("./logger.js");

interface ReturnData {
  message: string;
}

module.exports.handler = async (event: any, context: Context) => {

  // This is the return variable
  let data: ReturnData = {
    message: ""
  };

  // Get the form variables
  const form = JSON.parse(event.body);
  // Also parse the token
  form.stripeToken = JSON.parse(form.stripeToken);

  // Send off an insert into the log event
  logger.log("Insert",form);

  // Validate Email
  if ( !validator.isEmail(form.email) ) {
    data.message = "Invalid email address, please double check your email address and try again."
    return {
      statusCode: 200,
      body: JSON.stringify({data})
    };
  }

  // console.log(form);

  // Validate Amount (without the fee)
  const amount = Big(parseFloat(form.amount.replace(/[^0-9.-]+/g,"")));
  if ( amount.lt(0) || amount.gt(970999.69) ) {
    data.message = "Amount is invalid, please enter an amount greater than zero."
    return {
      statusCode: 200,
      body: JSON.stringify({data})
    };
  }

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

  const amounts = calculateFee(parseFloat(form.amount.replace(/[^0-9.-]+/g,"")));
  const chargedAmountInCents = new Big(amounts.total);

  // Check to make sure the charged amount is what we told the user it would be
  const totalAmount = new Big(parseFloat(form.total_amount.replace(/[^0-9.-]+/g,"")));
  const whatWeToldThemItWouldBe = totalAmount.times(100);

  if ( !chargedAmountInCents.eq(whatWeToldThemItWouldBe) ) {
    // ERROR, The amount I calculated is not what I told them it would be!
    const messageId = await email.sendEmail(JSON.stringify({
      error: "The frontend calculation and backend calculation did not agree.",
      frontEnd: whatWeToldThemItWouldBe.toString(),
      backEnd: chargedAmountInCents.toString(),
      form
    }))
    data.message = "An unexpected error occured. You're card has not been charged. \
    The error has been logged.\n Message ID: " + messageId;
    return {
      statusCode: 200,
      body: JSON.stringify({data})
    };
  }

  // GO AHEAD WITH THE CHARGE!!
  stripe.setTimeout(10000);
  /*
  stripe.on("request", (e) => {console.log(e);});
  stripe.on("response", (e) => {console.log(e);});
  */

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
  }).then( (charge) => {
    // The card has been charged successfully!
    // console.log(charge);
    // Now log the charge into our database (api call?)
    logger.log("Update",charge);
    data.message = "Your account has been charged and a receipt has been emailed to you. \
    You may now close this window. \
    \n\n Thank you for your business! \
    \n\n Transaction ID: " + charge.id
    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      }),
    };
  }).catch( (error) => {
    // THERE IS AN ERROR, the card was not charged!
    console.log(error);
    email.sendEmail(JSON.stringify({error,form}));
    data.message = "An unexpected error has occured.\n" + error.message + "\nCode: " + error.code;
    return {
      statusCode: 200,
      body: JSON.stringify({
        data
      }),
    };
  });
};
