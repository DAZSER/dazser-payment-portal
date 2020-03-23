"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ses_1 = __importDefault(require("aws-sdk/clients/ses"));
async function default_1(content) {
    const params = {
        Destination: {
            ToAddresses: [
                process.env.TO_EMAIL,
            ],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: content,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Payment Portal Notification",
            },
        },
        Source: process.env.FROM_EMAIL,
    };
    const ses = new ses_1.default({ apiVersion: "2010-12-01" });
    const results = await ses.sendEmail(params).promise();
    return results.MessageId;
}
exports.default = default_1;
