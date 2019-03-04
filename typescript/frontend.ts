// Backend, lol (it serves the frontend)
import bodyParser from "body-parser";
import Express from "express";
import hbs from "express-handlebars";
import { join } from "path";
import favicon from "serve-favicon";
import serverless from "serverless-http";
import calculateFee from "./fee";

const app = Express();
app.use(favicon(join(__dirname, "public", "favicon.ico")));
app.use(Express.static(join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine("hbs", hbs());
app.set("view engine", "hbs");

app.get("/old", (_req: Express.Request, res: Express.Response) => {
  console.log("oldies");
  res.status(200).render("old");
});

app.get("/:city/:info?", (req: Express.Request, res: Express.Response) => {
  // Verify the city
  const city = req.params.city;
  let stripePublicKey: string;
  let cityName: string;
  let regionNum: string;
  switch (city) {
    case "atlanta":
      stripePublicKey = process.env.STRIPE_ATLANTA_PUBLIC_KEY as string;
      cityName = "Jani-King of Atlanta";
      regionNum = "6";
      break;
    case "baltimore":
      stripePublicKey = process.env.STRIPE_BALTIMORE_PUBLIC_KEY as string;
      cityName = "Jani-King of Baltimore";
      regionNum = "4";
      break;
    case "birmingham":
      stripePublicKey = process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY as string;
      cityName = "Jani-King of Birmingham";
      regionNum = "3";
      break;
    case "orlando":
      stripePublicKey = process.env.STRIPE_ORLANDO_PUBLIC_KEY as string;
      cityName = "Jani-King of Orlando";
      regionNum = "2";
      break;
    case "tampa":
      stripePublicKey = process.env.STRIPE_TAMPA_PUBLIC_KEY as string;
      cityName = "Jani-King of Tampa Bay";
      regionNum = "1";
      break;
    default:
      // This case will 404 anything other than the above cases
      res.status(400).render("map");
      return;
  }

  // Now, setup any passed variables
  let email;
  let invoice;
  let amount;
  let fee;
  let total;
  if (req.params.info) {
    // We do have info, go ahead and set them up
    try {
      const json = JSON.parse(decodeURIComponent(Buffer.from(req.params.info, "base64").toString()));
      email = json.email;
      invoice = json.invoice;
      amount = json.amount;
      const totals = calculateFee(parseFloat(amount));
      fee = totals.display.fee;
      total = totals.display.total;
    } catch {
      // Something is wrong with the info's encoding
      console.error("Bad Params", req.params.info);
    }
  }

  const context = {
    form: {
      amount,
      email,
      fee,
      invoice,
      regionNum,
      total,
    },
    stripe: {
      publicKey: stripePublicKey,
    },
    ux: {
      company: cityName,
    },
  };
  res.status(200).render("index", context);
});

app.get("/", (_req: Express.Request, res: Express.Response) => {
  res.status(200).render("map");
});

app.get("*", (_req: Express.Request, res: Express.Response) => {
  res.status(404).send();
});

const SApp = serverless(app);

export const handler = async (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context): Promise<any> => {
  return await SApp(event, context);
};
