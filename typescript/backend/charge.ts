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
import calculateFee from "../fee";

interface InvoicePayload {
  amount: string;
  email: string;
  invoice: string;
}

interface stripeKey {
  cityName: string;
  regionNumber: string;
  stripePublicKey: string;
}

interface FrontEndForm {
  amount: string;
  email: string;
  invoice: string;
  totalAmount: string;
}

const getStripePrivateKey = (city: string): string => {
  // Figure out the key
  switch (city) {
    /* istanbul ignore next */
    case "tampa":
      return process.env.STRIPE_TAMPA_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "orlando":
      return process.env.STRIPE_ORLANDO_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "birmingham":
      return process.env.STRIPE_BIRMINGHAM_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "baltimore":
      return process.env.STRIPE_BALTIMORE_PRIVATE_KEY as string;
    default:
      return "";
  }
};

const getStripePublicKey = (city: string): stripeKey => {
  switch (city) {
    case "baltimore":
      return {
        cityName: "Jani-King of Baltimore",
        regionNumber: "4",
        stripePublicKey: process.env.STRIPE_BALTIMORE_PUBLIC_KEY as string,
      };
    case "birmingham":
      return {
        cityName: "Jani-King of Birmingham",
        regionNumber: "3",
        stripePublicKey: process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY as string,
      };
    case "orlando":
      return {
        cityName: "Jani-King of Orlando",
        regionNumber: "2",
        stripePublicKey: process.env.STRIPE_ORLANDO_PUBLIC_KEY as string,
      };
    case "tampa":
      return {
        cityName: "Jani-King of Tampa Bay",
        regionNumber: "1",
        stripePublicKey: process.env.STRIPE_TAMPA_PUBLIC_KEY as string,
      };
    default:
      return {
        cityName: "",
        regionNumber: "",
        stripePublicKey: "",
      };
  }
};

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
      console.error(parsed, fee);
    }

    const stripe = new Stripe(privateKey, {
      apiVersion: "2020-08-27",
      typescript: true,
    });

    // eslint-disable-next-line promise/catch-or-return, @typescript-eslint/no-floating-promises
    stripe.checkout.sessions
      .create({
        cancel_url: "https://pay.dazser.com/",
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
          invoice: parsed.invoice,
        },
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
