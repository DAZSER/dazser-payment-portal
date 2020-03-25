// Backend
//This actually posts a payload to SQS
import SQS from "aws-sdk/clients/sqs";

declare interface Address {
  address: string;
  name: string;
}

enum MergeType {
  MARKET = "market.html",
  NOTIFY = "notify.html",
  TEXT = "text.hbs",
}

declare interface EmailPayload {
  to: string | string[] | Address | Address[];
  cc?: string | string[] | Address | Address[];
  bcc?: string | string[] | Address | Address[];
  subject: string;
  from: Address;
  body: string;
  // This is an iCal string
  calendar?: string;
  // This is a path to S3 for the attachment
  // This is any because it's Mail.Attachments AND string | string []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments?: any[];
  return_receipt?: boolean;
  preview?: string;
  phone: string;
  company: string;
  address_street: string;
  address_csz: string;
  template: MergeType;
}

export default async function (content: string): Promise<boolean> {
  // Create the email parameters
  const email: EmailPayload = {
    to: process.env.TO_EMAIL as string,
    subject: "Payment Portal Notification",
    from: {
      address: process.env.FROM_EMAIL as string,
      name: "Stripe Notification",
    },
    body: content,
    phone: "",
    company: "",
    // eslint-disable-next-line @typescript-eslint/camelcase
    address_csz: "",
    // eslint-disable-next-line @typescript-eslint/camelcase
    address_street: "",
    template: MergeType.NOTIFY,
  };

  const sqs = new SQS({ apiVersion: "2012-11-05" });
  const sqsPost: SQS.SendMessageRequest = {
    QueueUrl: process.env.SQS_EMAIL_QUEUE as string,
    MessageBody: JSON.stringify(email),
  };

  try {
    await sqs.sendMessage(sqsPost).promise();
    return true;
  } catch {
    return false;
  }
}
