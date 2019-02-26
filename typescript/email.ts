// Backend
import SES, { SendEmailRequest } from "aws-sdk/clients/ses";

export default async function(content: string) {
  // Create the email parameters
  const params: SendEmailRequest = {
    Destination: {
      ToAddresses: [
        process.env.TO_EMAIL as string,
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
    Source: process.env.FROM_EMAIL as string,
  };

  const ses = new SES({apiVersion: "2010-12-01"});

  const results = await ses.sendEmail(params).promise();

  return results.MessageId;
}
