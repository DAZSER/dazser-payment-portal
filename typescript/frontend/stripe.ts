// Frontend
import type {
  RedirectToCheckoutOptions,
  Stripe as StripeJS,
  // eslint-disable-next-line node/no-unpublished-import
} from "@stripe/stripe-js";
import type { Stripe } from "stripe";

enum PayButtonState {
  SUBMITTABLE = "submittable",
  SUBMITTING = "submitting",
}

interface FrontEndForm {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  amount?: string;
  // eslint-disable-next-line camelcase
  convenience_fee?: string;
  email?: string;
  invoice?: string;
  regionName?: string;
  // eslint-disable-next-line camelcase
  region_num?: string;
  // eslint-disable-next-line camelcase
  total_amount?: string;
}

// This function will switch the submit button between submittable and submitting
const payButtonStateChanger = (state: PayButtonState): void => {
  const payButton = document.querySelector("#pay-button") as HTMLButtonElement;

  if (state === PayButtonState.SUBMITTABLE) {
    // reset paybutton to defaults
    payButton.removeAttribute("disabled");

    const spinner = document.querySelector("#spinner") as HTMLSpanElement;
    spinner.remove();

    const amountSpan = document.createElement("span");
    amountSpan.setAttribute("id", "span-amount");

    payButton.textContent = "Continue to Pay ";
    payButton.append(amountSpan);
  } else if (state === PayButtonState.SUBMITTING) {
    // change to disabled and spinner
    payButton.setAttribute("disabled", "disabled");

    const spinner = document.createElement("span");
    spinner.setAttribute("class", "spinner-border spinner-border-sm");
    spinner.setAttribute("role", "status");
    spinner.setAttribute("id", "spinner");

    payButton.textContent = "";
    payButton.append(spinner);
  }
};

// @ts-expect-error Stripe is ALREADY imported, just in Javascript on /html/layouts/main.html
const stripe = Stripe("{{stripe.publicKey}}") as StripeJS;

// Attach the Stripe Checkout to my Submit event,
// this function will send the info to /createCheckoutSession
// and it will return with a session id, and forward to Stripe Checkout
// so they can enter payment information
const form = document.querySelector("#payment-form") as HTMLFormElement;
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fd = new FormData(form);

  const data: FrontEndForm = {};

  // eslint-disable-next-line unicorn/no-array-for-each
  fd.forEach((value, key) => {
    // eslint-disable-next-line security/detect-object-injection
    data[key] = value;
  });

  const info = {
    amount: data.amount,
    email: data.email,
    invoice: data.invoice,
    totalAmount: data.total_amount,
  };

  const city = data.regionName;

  fetch(`/createCheckoutSession/${city as string}`, {
    body: JSON.stringify(info),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((response) => {
      return response.json();
    })
    .then((session: Stripe.Checkout.Session) => {
      // This is the response from the createCheckoutSession
      return stripe.redirectToCheckout({
        sessionId: session.id,
      } as RedirectToCheckoutOptions);
    })
    .then((result) => {
      // If redirectToCheckout fails due to a browser or network
      // error, you should display the localized error message to your
      // customer using error.message.
      // eslint-disable-next-line promise/always-return
      if (result.error) {
        // eslint-disable-next-line no-alert
        alert(result.error.message);
        payButtonStateChanger(PayButtonState.SUBMITTABLE);
      }
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Error:", error);
      payButtonStateChanger(PayButtonState.SUBMITTABLE);
    });

  // Change the state of the pay button
  payButtonStateChanger(PayButtonState.SUBMITTING);
});
