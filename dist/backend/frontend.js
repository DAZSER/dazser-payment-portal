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
const fee_1 = __importDefault(require("../fee"));
const app = express_1.default();
app.use(serve_favicon_1.default(path_1.join(__dirname, "..", "..", "public", "favicon.ico")));
app.use(express_1.default.static(path_1.join(__dirname, "..", "..", "public")));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.engine("hbs", express_handlebars_1.default({
    defaultLayout: "main",
    extname: ".hbs",
    layoutsDir: path_1.join(__dirname, "..", "..", "views", "layouts"),
    partialsDir: path_1.join(__dirname, "..", "..", "views"),
}));
app.set("view engine", "hbs");
app.set("views", path_1.join(__dirname, "..", "..", "views"));
app.get("/old", (_request, response) => {
    response.status(200).render("old");
});
app.get("/:city/:info?", (request, response) => {
    const { city } = request.params;
    let stripePublicKey;
    let cityName;
    let regionNumber;
    switch (city) {
        case "baltimore":
            stripePublicKey = process.env.STRIPE_BALTIMORE_PUBLIC_KEY;
            cityName = "Jani-King of Baltimore";
            regionNumber = "4";
            break;
        case "birmingham":
            stripePublicKey = process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY;
            cityName = "Jani-King of Birmingham";
            regionNumber = "3";
            break;
        case "orlando":
            stripePublicKey = process.env.STRIPE_ORLANDO_PUBLIC_KEY;
            cityName = "Jani-King of Orlando";
            regionNumber = "2";
            break;
        case "tampa":
            stripePublicKey = process.env.STRIPE_TAMPA_PUBLIC_KEY;
            cityName = "Jani-King of Tampa Bay";
            regionNumber = "1";
            break;
        default:
            response.status(400).render("map");
            return;
    }
    let email;
    let invoice;
    let amount;
    let fee;
    let total;
    if (request.params.info) {
        try {
            const json = JSON.parse(decodeURIComponent(Buffer.from(request.params.info, "base64").toString()));
            email = json.email;
            invoice = json.invoice;
            amount = json.amount;
            const totals = fee_1.default(Number.parseFloat(amount));
            fee = totals.display.fee;
            total = totals.display.total;
        }
        catch (error) {
            console.error("Bad Params", {
                error,
                info: request.params.info,
            });
        }
    }
    const context = {
        analytics: {
            key: process.env.ANALYTICS_KEY,
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
            key: process.env.ROLLBAR_KEY,
        },
        stripe: {
            publicKey: stripePublicKey,
        },
        ux: {
            company: cityName,
        },
    };
    response.status(200).render("portal", context);
});
app.get("/", (_request, response) => {
    response.status(200).render("map");
});
app.get("*", (_request, response) => {
    response.status(404).send();
});
const sApp = serverless_http_1.default(app);
exports.default = async (event, context) => {
    return sApp(event, context);
};
