// Backend, lol (it serves the frontend)
// This is the server side renderer
import Big from "big.js";
import { urlencoded, json } from "body-parser";
import compression from "compression";
import crypto from "crypto";
import Express from "express";
import hbs from "express-handlebars";
import helmet from "helmet";
// eslint-disable-next-line unicorn/import-style
import { join } from "path";
import favicon from "serve-favicon";
import serverless from "serverless-http";
import Stripe from "stripe";
import SQS from "aws-sdk/clients/sqs";
import calculateFee from "../fee";
import { getStripePublicKey, getStripePrivateKey } from "./get-stripe-keys";

interface InvoicePayload {
  amount: string;
  email: string;
  invoice: string;
}

interface FrontEndForm {
  amount: string;
  email: string;
  invoice: string;
  totalAmount: string;
}

interface ChargeSucceeded {
  amount: number;
  // eslint-disable-next-line camelcase
  client_reference_id: string;
  created: number;
  id: string;
  // eslint-disable-next-line camelcase
  payment_method_details: {
    card: {
      brand: string;
      // eslint-disable-next-line camelcase
      exp_month: number;
      // eslint-disable-next-line camelcase
      exp_year: number;
      last4: string;
    };
  };
  // eslint-disable-next-line camelcase
  receipt_email: string;
  status: string;
}

interface EmailPayload {
  attachments?: string; // This is a path to S3 for the attachment
  bcc?: string | string[];
  body: string; // This is the inner body of the message
  calendar?: string; // This is an iCal string
  cc?: string | string[];
  dsn?: boolean;
  from: {
    address: string;
    name?: string;
  };
  invoice?: {
    file: {
      // This is the S3 Invoice PDF
      content: Buffer;
      filename: string;
    };
    info: string;
    invoice: string;
  };
  performance?: {
    // This is only included in the Performance Payload
    custName: string;
    header: string;
    serviceAddress: string;
    unique: string;
  };
  preview?: string;
  regionnum: string; // This gives me the regionnum so I can get regionInfo
  subject: string;
  template: "notify.html"; // This is the template to merge with
  to: string;
}

const parseInfo = (info: string): InvoicePayload => {
  // Now, setup any passed variables
  try {
    return JSON.parse(
      decodeURIComponent(Buffer.from(info, "base64").toString())
    ) as InvoicePayload;
  } catch (error) {
    // Something is wrong with the info's encoding
    // eslint-disable-next-line no-console
    console.error("Bad Params", {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      error,
      info,
    });
    return {
      amount: "",
      email: "",
      invoice: "",
    };
  }
};

const notify = async (payload: EmailPayload): Promise<boolean> => {
  const sqs = new SQS({
    region: "us-east-1",
  });
  try {
    await sqs
      .sendMessage({
        MessageBody: JSON.stringify(payload),
        QueueUrl: process.env.SQS_QUEUE as string,
      })
      .promise();
    return true;
  } catch (error) {
    throw new Error(error);
  }
};

// This defines the nonce used in the Script nonce tag for CSP purposes.
const nonce = crypto.randomBytes(16).toString("hex");

const app = Express();
// Set up Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "connect-src": [
          "'self'",
          "https://google.com",
          "https://www.google-analytics.com",
          "https://stats.g.doubleclick.net",
        ],
        "frame-src": ["https://js.stripe.com"],
        "report-uri": ["https://dazser.report-uri.com/r/d/csp/enforce"],
        "script-src-elem": [
          "'self'",
          "https://js.stripe.com",
          "https://polyfill.io",
          "https://www.google-analytics.com",
          `'nonce-${nonce}'`,
        ],
        "style-src": ["'self'"],
        "style-src-elem": ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  })
);
app.use(compression());
app.use(favicon(join(__dirname, "..", "..", "public", "favicon.ico")));
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(Express.static(join(__dirname, "..", "..", "public")));
app.use(urlencoded({ extended: false }));
app.use(json());

app.engine(
  "hbs",
  hbs({
    defaultLayout: "main",
    extname: ".hbs",
    layoutsDir: join(__dirname, "..", "..", "views", "layouts"),
    partialsDir: join(__dirname, "..", "..", "views"),
  })
);
app.set("view engine", "hbs");
app.set("views", join(__dirname, "..", "..", "views"));

app.get("/old", (_request: Express.Request, response: Express.Response) => {
  // This path is for outdated browsers
  response.status(200).render("old", { nonce });
});

app.get("/success", (_request: Express.Request, response: Express.Response) => {
  // This path is for outdated browsers
  response.status(200).render("success", { nonce });
});

app.post(
  "/webhook/:city",
  (request: Express.Request, response: Express.Response) => {
    // This deals with the web hook from Stripe
    const payload = request.body as Stripe.Event;

    // get region num
    const stripeKey = getStripePublicKey(request.params.city);

    let body = "";
    if (payload.type === "charge.succeeded") {
      // Create a notify payload for sqs
      const charge = payload.data.object as ChargeSucceeded;
      const amount = new Big(charge.amount)
        .times(new Big(0.971))
      const created = new Date(charge.created);
        .div(new Big(100))
        .minus(new Big(0.3));
      body = `<table style="width:100%;" border="1">
        <tr><td colspan="2">A charge has succeeded.</td></tr>
        <tr><td>Email</td><td>${charge.receipt_email}</td></tr>
        <tr><td>Invoice</td><td>${charge.client_reference_id ?? ""}</td></tr>
        <tr><td>Amount</td><td>${amount.round(2).toString()}</td></tr>
        <tr><td>Charged on</td><td>${created.toLocaleDateString(
          "en-US"
        )}</td></tr>
        <tr><td>Card Brand</td><td>${
          charge.payment_method_details.card.brand
        }</td></tr>
        <tr><td>Card Expiration</td><td>${`${charge.payment_method_details.card.exp_month}/${charge.payment_method_details.card.exp_year}`}</td></tr>
        <tr><td>Card Last Four</td><td>${
          charge.payment_method_details.card.last4
        }</td></tr>
        <tr><td>Charge ID</td><td>${charge.id}</td></tr>
        <tr><td>Charge Status</td><td>${charge.status}</td></tr>
        </table>`;
    }

    notify({
      body,
      from: { address: "network.admin@dazser.com", name: "Payment Portal" },
      regionnum: stripeKey.regionNumber,
      subject: "Payment Notification",
      template: "notify.html",
      to:
        "sanderson@dazser.com, chiki.bodley@dazser.com, jade.dato@dazser.com, collections.assistant@dazser.com",
    })
      .then((success) => {
        // eslint-disable-next-line promise/always-return
        if (success) {
          response.send(200);
        }
      })
      .catch((error) => {
        console.error("Stripe Webhook Error", error);
        response.send(500);
      });
  }
);

app.post(
  "/createCheckoutSession/:city",
  (request: Express.Request, response: Express.Response) => {
    // This api endpoint will create the checkout session id
    const { city } = request.params;
    const parsed = request.body as FrontEndForm;
    const privateKey = getStripePrivateKey(city);
    if (privateKey === "") {
      // The city is incorrect, idk what is wrong...
      console.error("Invalid City");
    }

    // Calculate the fee again based on the amount requested.
    const fee = calculateFee(
      Number.parseFloat(parsed.amount.replace(/[^\d.-]+/g, ""))
    );

    // Check to see if the fee we told them would be the fee calculated
    if (fee.total !== parsed.totalAmount) {
      // Something is wrong
      console.error("THE PARSED AND CALCULATED FEE ARE DIFFERENT", parsed, fee);
    }

    const stripe = new Stripe(privateKey, {
      apiVersion: "2020-08-27",
      typescript: true,
    });

    // eslint-disable-next-line promise/catch-or-return, @typescript-eslint/no-floating-promises
    stripe.checkout.sessions
      .create({
        cancel_url: "https://pay.dazser.com/",
        client_reference_id: parsed.invoice,
        customer_email: parsed.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                images: [
                  "https://d3bog92s18hu5m.cloudfront.net/cleaned-badge.jpg",
                ],
                name: "Jani-King Janitorial Services",
              },
              unit_amount: Number.parseFloat(fee.total),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        payment_method_types: ["card"],
        success_url: "https://pay.dazser.com/success",
      })
      // eslint-disable-next-line promise/always-return
      .then((session) => {
        response.json({ id: session.id });
      });
  }
);

app.get(
  "/:city/:info?",
  (request: Express.Request, response: Express.Response) => {
    // This api endpoint will return the server side rendered checkout page
    // Verify the city
    const { city, info } = request.params;
    const { cityName, regionNumber, stripePublicKey } = getStripePublicKey(
      city
    );

    // If the city doesn't work, render the map
    if (cityName === "") {
      response.status(400).render("map", { nonce });
    }

    let parsed;
    let fee;
    if (info) {
      parsed = parseInfo(info);
      fee = calculateFee(Number.parseFloat(parsed.amount));
    }

    const context = {
      analytics: {
        key: process.env.ANALYTICS_KEY as string,
      },
      form: {
        amount: parsed?.amount ?? "",
        email: parsed?.email ?? "",
        fee: fee?.display.fee ?? "",
        invoice: parsed?.invoice ?? "",
        regionName: city,
        regionNum: regionNumber,
        total: fee?.display.total ?? "",
      },
      nonce,
      stripe: {
        publicKey: stripePublicKey,
      },
      ux: {
        company: cityName,
      },
    };
    response.status(200).render("portal", context);
  }
);

app.get("/", (_request: Express.Request, response: Express.Response) => {
  response.status(200).render("map", { nonce });
});

app.get("*", (_request: Express.Request, response: Express.Response) => {
  response.status(404).send();
});

const sApp = serverless(app);

export default async (
  event: AWSLambda.APIGatewayEvent,
  context: AWSLambda.Context
): Promise<AWSLambda.APIGatewayProxyResult> => {
  return (await (sApp(
    event,
    context
  ) as unknown)) as AWSLambda.APIGatewayProxyResult;
};
