// Backend
// This actually posts a payload to SQS
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

// This is the payload from Alpha (or other things that dumps a payload to sqs)
export interface EmailPayload {
  attachments?: string; // This is a path to S3 for the attachment
  bcc?: string | string[];
  body: string; // This is the inner body of the message
  calendar?: string; // This is an iCal string
  cc?: string | string[];
  dsn?: boolean;
  from: {
    address: string;
    name?: string;
  };
  invoice?: {
    file: {
      // This is the S3 Invoice PDF
      content: Buffer;
      filename: string;
    };
    info: string;
    invoice: string;
  };
  performance?: {
    // This is only included in the Performance Payload
    custName: string;
    header: string;
    serviceAddress: string;
    unique: string;
  };
  preview?: string;
  regionnum: string; // This gives me the regionnum so I can get regionInfo
  subject: string;
  template: MergeType; // This is the template to merge with
  to: string;
}

export default async (content: string): Promise<boolean> => {
  // Create the email parameters
  const email: EmailPayload = {
    body: content,
    from: {
      address: process.env.FROM_EMAIL as string,
      name: "Stripe Notification",
    },
    subject: "Payment Portal Notification",
    template: MergeType.NOTIFY,
    to: process.env.TO_EMAIL as string,
  };

  const sqs = new SQS({ apiVersion: "2012-11-05" });
  const sqsPost: SQS.SendMessageRequest = {
    MessageBody: JSON.stringify(email),
    QueueUrl: process.env.SQS_EMAIL_QUEUE as string,
  };

  try {
    await sqs.sendMessage(sqsPost).promise();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
