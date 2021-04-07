export interface stripeKey {
  cityName: string;
  regionNumber: string;
  stripePublicKey: string;
}

export const getStripePrivateKey = (city: string): string => {
  // Figure out the key
  switch (city) {
    /* istanbul ignore next */
    case "tampa":
      return process.env.STRIPE_TAMPA_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "orlando":
      return process.env.STRIPE_ORLANDO_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "birmingham":
      return process.env.STRIPE_BIRMINGHAM_PRIVATE_KEY as string;
    /* istanbul ignore next */
    case "baltimore":
      return process.env.STRIPE_BALTIMORE_PRIVATE_KEY as string;
    default:
      return "";
  }
};

export const getStripePublicKey = (city: string): stripeKey => {
  switch (city) {
    case "baltimore":
      return {
        cityName: "Jani-King of Baltimore",
        regionNumber: "4",
        stripePublicKey: process.env.STRIPE_BALTIMORE_PUBLIC_KEY as string,
      };
    case "birmingham":
      return {
        cityName: "Jani-King of Birmingham",
        regionNumber: "3",
        stripePublicKey: process.env.STRIPE_BIRMINGHAM_PUBLIC_KEY as string,
      };
    case "orlando":
      return {
        cityName: "Jani-King of Orlando",
        regionNumber: "2",
        stripePublicKey: process.env.STRIPE_ORLANDO_PUBLIC_KEY as string,
      };
    case "tampa":
      return {
        cityName: "Jani-King of Tampa Bay",
        regionNumber: "1",
        stripePublicKey: process.env.STRIPE_TAMPA_PUBLIC_KEY as string,
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
      return process.env.STRIPE_TAMPA_WEBHOOK_KEY as string;
    /* istanbul ignore next */
    case "orlando":
      return process.env.STRIPE_ORLANDO_WEBHOOK_KEY as string;
    /* istanbul ignore next */
    case "birmingham":
      return process.env.STRIPE_BIRMINGHAM_WEBHOOK_KEY as string;
    /* istanbul ignore next */
    case "baltimore":
      return process.env.STRIPE_BALTIMORE_WEBHOOK_KEY as string;
    default:
      return "";
  }
};
