"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const path_1 = require("path");
const serve_favicon_1 = __importDefault(require("serve-favicon"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const fee_1 = __importDefault(require("./fee"));
const app = express_1.default();
app.use(serve_favicon_1.default(path_1.join(__dirname, "public", "favicon.ico")));
app.use(express_1.default.static(path_1.join(__dirname, "public")));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.engine("hbs", express_handlebars_1.default());
app.set("view engine", "hbs");
app.get("/old", (_req, res) => {
    console.log("oldies");
    res.status(200).render("old");
});
app.get("/:city/:info?", (req, res) => {
    const city = req.params.city;
    let stripePublicKey;
    let cityName;
    let regionNum;
    switch (city) {
        case "atlanta":
            stripePublicKey = process.env.STRIPE_ATLANTA_PUBLIC_KEY;
            cityName = "Jani-King of Atlanta";
            regionNum = "6";
            break;
        case "baltimore":
            stripePublicKey = process.env.STRIPE_BALTIMORE_PUBLIC_KEY;
            cityName = "Jani-King of Baltimore";
            regionNum = "4";
            break;
        case "birmingham":
            stripePublicKey = process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY;
            cityName = "Jani-King of Birmingham";
            regionNum = "3";
            break;
        case "orlando":
            stripePublicKey = process.env.STRIPE_ORLANDO_PUBLIC_KEY;
            cityName = "Jani-King of Orlando";
            regionNum = "2";
            break;
        case "tampa":
            stripePublicKey = process.env.STRIPE_TAMPA_PUBLIC_KEY;
            cityName = "Jani-King of Tampa Bay";
            regionNum = "1";
            break;
        default:
            res.status(400).render("map");
            return;
    }
    let email;
    let invoice;
    let amount;
    let fee;
    let total;
    if (req.params.info) {
        try {
            const json = JSON.parse(decodeURIComponent(Buffer.from(req.params.info, "base64").toString()));
            email = json.email;
            invoice = json.invoice;
            amount = json.amount;
            const totals = fee_1.default(parseFloat(amount));
            fee = totals.display.fee;
            total = totals.display.total;
        }
        catch (_a) {
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
app.get("/", (_req, res) => {
    res.status(200).render("map");
});
app.get("*", (_req, res) => {
    res.status(404).send();
});
const SApp = serverless_http_1.default(app);
exports.handler = async (event, context) => {
    return await SApp(event, context);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlc2NyaXB0L2Zyb250ZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsOERBQXFDO0FBQ3JDLHNEQUE4QjtBQUM5Qiw0RUFBcUM7QUFDckMsK0JBQTRCO0FBQzVCLGtFQUFvQztBQUNwQyxzRUFBeUM7QUFDekMsZ0RBQWlDO0FBRWpDLE1BQU0sR0FBRyxHQUFHLGlCQUFPLEVBQUUsQ0FBQztBQUN0QixHQUFHLENBQUMsR0FBRyxDQUFDLHVCQUFPLENBQUMsV0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFFM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsNEJBQUcsRUFBRSxDQUFDLENBQUM7QUFDekIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFOUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFxQixFQUFFLEdBQXFCLEVBQUUsRUFBRTtJQUMvRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBRUgsR0FBRyxDQUFDLEdBQUcsQ0FBQyxl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