"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const path_1 = require("path");
const serverless_http_1 = __importDefault(require("serverless-http"));
const fee_1 = __importDefault(require("./fee"));
const app = express_1.default();
app.use(express_1.default.static(path_1.join(__dirname, "public")));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.engine("hbs", express_handlebars_1.default());
app.set("view engine", "hbs");
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
            const json = JSON.parse(Buffer.from(req.params.info, "base64").toString());
            email = json.email;
            invoice = json.invoice;
            amount = json.amount;
            const totals = fee_1.default(parseFloat(amount));
            fee = totals.display.fee;
            total = totals.display.total;
        }
        catch (_a) {
            console.error("bad params", req.params.info);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlc2NyaXB0L2Zyb250ZW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsOERBQXFDO0FBQ3JDLHNEQUE4QjtBQUM5Qiw0RUFBcUM7QUFDckMsK0JBQTRCO0FBQzVCLHNFQUF5QztBQUN6QyxnREFBaUM7QUFFakMsTUFBTSxHQUFHLEdBQUcsaUJBQU8sRUFBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsaUJBQU8sQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFFM0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsNEJBQUcsRUFBRSxDQUFDLENBQUM7QUFDekIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFOUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEdBQXFCLEVBQUUsRUFBRTtJQUV2RSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUM3QixJQUFJLGVBQXVCLENBQUM7SUFDNUIsSUFBSSxRQUFnQixDQUFDO0lBQ3JCLElBQUksU0FBaUIsQ0FBQztJQUN0QixRQUFRLElBQUksRUFBRTtRQUNaLEtBQUssU0FBUztZQUNaLGVBQWUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUFtQyxDQUFDO1lBQ2xFLFFBQVEsR0FBRyxzQkFBc0IsQ0FBQztZQUNsQyxTQUFTLEdBQUcsR0FBRyxDQUFDO1lBQ2hC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