/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Backend, lol (it serves the frontend)
import bodyParser from "body-parser";
import Express from "express";
import hbs from "express-handlebars";
import { join } from "path";
import favicon from "serve-favicon";
import serverless from "serverless-http";
import calculateFee from "../fee";

const app = Express();
app.use(favicon(join(__dirname, "..", "..", "public", "favicon.ico")));
app.use(Express.static(join(__dirname, "..", "..", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  response.status(200).render("old");
});

app.get(
  "/:city/:info?",
  (request: Express.Request, response: Express.Response) => {
    // Verify the city
    const { city } = request.params;
    let stripePublicKey: string;
    let cityName: string;
    let regionNumber: string;
    switch (city) {
      case "baltimore":
        stripePublicKey = process.env.STRIPE_BALTIMORE_PUBLIC_KEY as string;
        cityName = "Jani-King of Baltimore";
        regionNumber = "4";
        break;
      case "birmingham":
        stripePublicKey = process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY as string;
        cityName = "Jani-King of Birmingham";
        regionNumber = "3";
        break;
      case "orlando":
        stripePublicKey = process.env.STRIPE_ORLANDO_PUBLIC_KEY as string;
        cityName = "Jani-King of Orlando";
        regionNumber = "2";
        break;
      case "tampa":
        stripePublicKey = process.env.STRIPE_TAMPA_PUBLIC_KEY as string;
        cityName = "Jani-King of Tampa Bay";
        regionNumber = "1";
        break;
      default:
        // This case will 404 anything other than the above cases
        response.status(400).render("map");
        return;
    }

    // Now, setup any passed variables
    let email;
    let invoice;
    let amount;
    let fee;
    let total;
    if (request.params.info) {
      // We do have info, go ahead and set them up
      try {
        const json = JSON.parse(
          decodeURIComponent(
            Buffer.from(request.params.info, "base64").toString()
          )
        );
        email = json.email;
        invoice = json.invoice;
        amount = json.amount;
        const totals = calculateFee(Number.parseFloat(amount));
        fee = totals.display.fee;
        total = totals.display.total;
      } catch (error) {
        // Something is wrong with the info's encoding
        console.error("Bad Params", {
          error,
          info: request.params.info,
        });
      }
    }

    const context = {
      analytics: {
        key: process.env.ANALYTICS_KEY as string,
      },
      form: {
        amount,
        email,
        fee,
        invoice,
        regionNum: regionNumber,
        total,
      },
      rollbar: {
        key: process.env.ROLLBAR_KEY as string,
      },
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
  response.status(200).render("map");
});

app.get("*", (_request: Express.Request, response: Express.Response) => {
  response.status(404).send();
});

const sApp = serverless(app);

export default async (
  event: AWSLambda.APIGatewayEvent,
  context: AWSLambda.Context
): Promise<AWSLambda.APIGatewayProxyResult> => {
  return sApp(event, context);
};
