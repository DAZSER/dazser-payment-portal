"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqs_1 = __importDefault(require("aws-sdk/clients/sqs"));
var MergeType;
(function (MergeType) {
    MergeType["MARKET"] = "market.html";
    MergeType["NOTIFY"] = "notify.html";
    MergeType["TEXT"] = "text.hbs";
})(MergeType || (MergeType = {}));
async function default_1(content) {
    const email = {
        to: process.env.TO_EMAIL,
        subject: "Payment Portal Notification",
        from: {
            address: process.env.FROM_EMAIL,
            name: "Stripe Notification",
        },
        body: content,
        phone: "",
        company: "",
        address_csz: "",
        address_street: "",
        template: MergeType.NOTIFY,
    };
    const sqs = new sqs_1.default({ apiVersion: "2012-11-05" });
    const sqsPost = {
        QueueUrl: process.env.SQS_EMAIL_QUEUE,
        MessageBody: JSON.stringify(email),
    };
    try {
        await sqs.sendMessage(sqsPost).promise();
        return true;
    }
    catch {
        return false;
    }
}
exports.default = default_1;
