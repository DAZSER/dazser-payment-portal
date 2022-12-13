export interface stripePublicKey {
  cityName: string;
  regionNumber: string;
  stripePublicKey: string;
}

export interface stripePrivateKey {
  regionNumber: string;
  stripePrivateKey: string;
}

export const getStripePrivateKey = (city: string): stripePrivateKey => {
  // Figure out the key
  switch (city) {
    /* istanbul ignore next */
    case "tampa":
      return {
        regionNumber: "1",
        stripePrivateKey: process.env["STRIPE_TAMPA_PRIVATE_KEY"] as string,
      };
    /* istanbul ignore next */
    case "orlando":
      return {
        regionNumber: "2",
        stripePrivateKey: process.env["STRIPE_ORLANDO_PRIVATE_KEY"] as string,
      };
    /* istanbul ignore next */
    case "birmingham":
      return {
        regionNumber: "3",
        stripePrivateKey: process.env["STRIPE_BIRMINGHAM_PRIVATE_KEY"] as string,
      };
    /* istanbul ignore next */
    case "baltimore":
      return {
        regionNumber: "4",
        stripePrivateKey: process.env["STRIPE_BALTIMORE_PRIVATE_KEY"] as string,
      };
    default:
      return {
        regionNumber: "",
        stripePrivateKey: "",
      };
  }
};

export const getStripePublicKey = (city: string): stripePublicKey => {
  switch (city) {
    case "baltimore":
      return {
        cityName: "Jani-King of Baltimore",
        regionNumber: "4",
        stripePublicKey: process.env["STRIPE_BALTIMORE_PUBLIC_KEY"] as string,
      };
    case "birmingham":
      return {
        cityName: "Jani-King of Birmingham",
        regionNumber: "3",
        stripePublicKey: process.env["STRIPE_BIRMINGHAM_PUBLIC_KEY"] as string,
      };
    case "orlando":
      return {
        cityName: "Jani-King of Orlando",
        regionNumber: "2",
        stripePublicKey: process.env["STRIPE_ORLANDO_PUBLIC_KEY"] as string,
      };
    case "tampa":
      return {
        cityName: "Jani-King of Tampa Bay",
        regionNumber: "1",
        stripePublicKey: process.env["STRIPE_TAMPA_PUBLIC_KEY"] as string,
      };
    default:
      return {
        cityName: "",
        regionNumber: "",
        stripePublicKey: "",
      };
  }
};

export const getStripeWebhookSigningKey = (city: string): string => {
  // Figure out the key
  switch (city) {
    /* istanbul ignore next */
    case "tampa":
      return process.env["STRIPE_TAMPA_WEBHOOK_KEY"] as string;
    /* istanbul ignore next */
    case "orlando":
      return process.env["STRIPE_ORLANDO_WEBHOOK_KEY"] as string;
    /* istanbul ignore next */
    case "birmingham":
      return process.env["STRIPE_BIRMINGHAM_WEBHOOK_KEY"] as string;
    /* istanbul ignore next */
    case "baltimore":
      return process.env["STRIPE_BALTIMORE_WEBHOOK_KEY"] as string;
    default:
      return "";
  }
};
