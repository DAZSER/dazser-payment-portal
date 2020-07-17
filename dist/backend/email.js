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
exports.default = async (content) => {
    const email = {
        body: content,
        from: {
            address: process.env.FROM_EMAIL,
            name: "Stripe Notification",
        },
        regionnum: "1",
        subject: "Payment Portal Notification",
        template: MergeType.NOTIFY,
        to: process.env.TO_EMAIL,
    };
    const sqs = new sqs_1.default({ apiVersion: "2012-11-05" });
    const sqsPost = {
        MessageBody: JSON.stringify(email),
        QueueUrl: process.env.SQS_EMAIL_QUEUE,
    };
    try {
        await sqs.sendMessage(sqsPost).promise();
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
