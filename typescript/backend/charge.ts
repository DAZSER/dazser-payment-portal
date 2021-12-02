// Backend, lol (it serves the frontend)
// This is the server side renderer
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
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
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

interface CheckoutSessionSucceededObject {
  // eslint-disable-next-line camelcase
  amount_total: number;
  // eslint-disable-next-line camelcase
  client_reference_id: string;
  // eslint-disable-next-line camelcase
  customer_email: string;
  metadata: {
    jkAmount: string;
    jkInvoice: string;
  };
  // eslint-disable-next-line camelcase
  payment_intent: string;
  // eslint-disable-next-line camelcase
  payment_status: string;
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
  const sqs = new SQSClient({
    region: "us-east-1",
  });
  try {
    const command = new SendMessageCommand({
      MessageBody: JSON.stringify(payload),
      QueueUrl: process.env.SQS_QUEUE as string,
    });
    await sqs.send(command);
    return true;
  } catch (error) {
    console.error(error);
    return false;
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
          // eslint-disable-next-line sonarjs/no-duplicate-string
          "https://www.google-analytics.com",
          "https://stats.g.doubleclick.net",
        ],
        // eslint-disable-next-line sonarjs/no-duplicate-string
        "frame-src": ["https://js.stripe.com"],
        "img-src": ["'self'", "'unsafe-inline'", `'nonce-${nonce}'`],
        "report-uri": ["https://dazser.report-uri.com/r/d/csp/enforce"],
        "script-src": [
          "https://js.stripe.com",
          "https://polyfill.io",
          "https://www.google-analytics.com",
          `'nonce-${nonce}'`,
        ],
        "script-src-elem": [
          "https://js.stripe.com",
          "https://polyfill.io",
          "https://www.google-analytics.com",
          `'nonce-${nonce}'`,
        ],
        "style-src": ["'self'", "https://cdn.jsdelivr.net"],
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
  return response.status(200).render("old", { nonce });
});

app.get("/success", (_request: Express.Request, response: Express.Response) => {
  // This path is for outdated browsers
  return response.status(200).render("success", { nonce });
});

app.post(
  "/webhook/:city",
  (request: Express.Request, response: Express.Response) => {
    // This deals with the web hook from Stripe
    const payload = request.body as Stripe.Event;
    // const signature = request.headers["Stripe-Signature"];

    // console.log("Request", JSON.stringify(request));
    // console.log("Stripe Signature", request.headers["stripe-signature"]);

    // get region num
    // const key = getStripePrivateKey(request.params.city);

    // const endpointSecret = getStripeWebhookSigningKey(request.params.city);

    /* if (!endpointSecret && !signature) {
      console.error(
        "Missing Endpoint Secret or Stripe Signature",
        endpointSecret,
        signature
      );
      response.sendStatus(500);
    }

    const stripe = new Stripe(key.stripePrivateKey, {
      apiVersion: "2020-08-27",
      typescript: true,
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        // @ts-expect-error I already checked if signature exists
        signature,
        endpointSecret
      );
    } catch (error) {
      console.error("Webhook Error", error);
      response.sendStatus(500);
    }

    // Create a notify payload for sqs
    // @ts-expect-error Event exists
    const charge = event.data.object as CheckoutSessionSucceededObject;

    // @ts-expect-error Event exists
    const created = new Date(event.created * 1000);
    */

    const charge = payload.data.object as CheckoutSessionSucceededObject;

    const created = new Date(payload.created * 1000);

    const key = getStripePublicKey(request.params.city);

    const body = `<table style="width:100%;" border="1">
      <tr><td colspan="2">A Payment has succeeded.</td></tr>
      <tr><td>Email</td><td>${charge.customer_email}</td></tr>
      <tr><td>JK Invoice</td><td>${charge.metadata.jkInvoice}</td></tr>
      <tr><td>JK Amount</td><td>${charge.metadata.jkAmount}</td></tr>
      <tr><td>Payment on</td><td>${created.toLocaleDateString(
        "en-US"
      )}</td></tr>
      <tr><td>Payment ID</td><td><a href='https://dashboard.stripe.com/payments/${
        charge.payment_intent
      }'>${charge.payment_intent}</a></td></tr>
      <tr><td>Payment Status</td><td>${charge.payment_status}</td></tr>
      </table>`;

    notify({
      body,
      from: { address: "network.admin@dazser.com", name: "Payment Portal" },
      regionnum: key.regionNumber,
      subject: "Payment Notification",
      template: "notify.html",
      to:
        process.env.NODE_ENV === "production"
          ? "sanderson@dazser.com, chiki.bodley@dazser.com, jade.dato@dazser.com, collections.assistant@dazser.com"
          : "kyle@dazser.com",
    })
      .then((success) => {
        // eslint-disable-next-line promise/always-return
        if (success) {
          return response.sendStatus(200);
        }
        return response.sendStatus(500);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Stripe Webhook Error", error);
        return response.sendStatus(500);
      });
  }
);

app.post(
  "/createCheckoutSession/:city",
  (request: Express.Request, response: Express.Response) => {
    // This api endpoint will create the checkout session id
    const { city } = request.params;
    const parsed = request.body as FrontEndForm;
    const key = getStripePrivateKey(city);
    if (key.stripePrivateKey === "") {
      // The city is incorrect, idk what is wrong...
      // eslint-disable-next-line no-console
      console.error("Invalid City");
    }

    // Calculate the fee again based on the amount requested.
    const fee = calculateFee(
      Number.parseFloat(parsed.amount.replace(/[^\d.-]+/g, ""))
    );

    // Check to see if the fee we told them would be the fee calculated
    if (fee.display.total !== parsed.totalAmount) {
      // Something is wrong
      // eslint-disable-next-line no-console
      console.error("THE PARSED AND CALCULATED FEE ARE DIFFERENT", parsed, fee);
    }

    const stripe = new Stripe(key.stripePrivateKey, {
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
        metadata: {
          // eslint-disable-next-line prettier/prettier
          "jkAmount": parsed.amount.replace(/[^\d.-]+/g, ""),
          // eslint-disable-next-line prettier/prettier
          "jkInvoice": parsed.invoice,
        },
        mode: "payment",
        payment_method_types: ["card"],
        success_url: "https://pay.dazser.com/success",
      })
      // eslint-disable-next-line promise/always-return
      .then((session) => {
        return response.json({ id: session.id });
      });
  }
);

app.get(
  "/:city/:info?",
  (request: Express.Request, response: Express.Response) => {
    // This api endpoint will return the server side rendered checkout page
    // Verify the city
    const { city, info } = request.params;
    const { cityName, regionNumber, stripePublicKey } =
      getStripePublicKey(city);

    // If the city doesn't work, render the map
    if (cityName === "") {
      return response.status(400).render("map", { nonce });
    }

    let parsed;
    let fee;
    if (info) {
      parsed = parseInfo(info);
      try {
        fee = calculateFee(Number.parseFloat(parsed.amount));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error, `Info: ${info}`);
        return response.status(400).render("map", { nonce });
      }
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
    return response.status(200).render("portal", context);
  }
);

app.get("/", (_request: Express.Request, response: Express.Response) => {
  return response.status(200).render("map", { nonce });
});

app.get("*", (_request: Express.Request, response: Express.Response) => {
  return response.sendStatus(404);
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
