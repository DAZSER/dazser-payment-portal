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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlc2NyaXB0L2VtYWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsOERBQTREO0FBRTdDLEtBQUssb0JBQVUsT0FBZTtJQUUzQyxNQUFNLE1BQU0sR0FBcUI7UUFDL0IsV0FBVyxFQUFFO1lBQ1gsV0FBVyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBa0I7YUFDL0I7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRTtnQkFDSixJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLE9BQU87b0JBQ2hCLElBQUksRUFBRSxPQUFPO2lCQUNkO2FBQ0Y7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLElBQUksRUFBRSw2QkFBNkI7YUFDcEM7U0FDRjtRQUNELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQW9CO0tBQ3pDLENBQUM7SUFFRixNQUFNLEdBQUcsR0FBRyxJQUFJLGFBQUcsQ0FBQyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUMsQ0FBQyxDQUFDO0lBRWhELE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUV0RCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDM0IsQ0FBQztBQTVCRCw0QkE0QkMifQ==