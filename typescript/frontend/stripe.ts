"use strict";

interface _data {
  [key: string]: any;
};

/// <reference types="stripe-v3" />

// Create the Strip Card Element
// https://stripe.com/docs/elements
const stripe = Stripe("***REMOVED***");
//const stripe = Stripe("***REMOVED***");
const elements = stripe.elements({
  fonts: [{
    // Mimic Bootstrap default fonts
    family: "-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Helvetica Neue', Arial, sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol' !default;'"
  }]
});
const card = elements.create("card");
card.mount("#card-element");

const displayError = document.querySelector("#card-errors") as HTMLDivElement;
// @ts-ignore card does have addEventListener
card.addEventListener("change", ({error}: any) => {
  if (error) {
    displayError.textContent = error.message;
    displayError.classList.remove("d-none");
  } else {
    displayError.textContent = "";
    displayError.classList.add("d-none");
  }
});

// This function is the Credit card response handler
// createToken sends the CC info and returns a promise, this function is
// called when the promise is fulfilled
const form = document.querySelector("#payment-form") as HTMLFormElement;
const stripeTokenHandler = ( token: any ) => {
  // Add the token, then submit to my server
  // I will process the token with Stripe in order to charge the customer
  // Create the element
  const hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.setAttribute("name", "stripeToken");
  hiddenInput.setAttribute("value", JSON.stringify(token));
  // And append it to the form!
  form.appendChild(hiddenInput);

  const fd = new FormData( form );

  let data: _data = {};

  fd.forEach( (value, key) => {
    data[key] = value;
  });

  const xhr = new XMLHttpRequest();
  xhr.addEventListener("error", (event) => {});

  xhr.open(form.method, form.action);

  xhr.send(JSON.stringify(data));

  xhr.addEventListener("loadend", (response) => {
    // @ts-ignore There should be a response from the server by loadend
    const res = JSON.parse(response.target.response);
    const message = res.data.message;

    // Create the result P element
    const result = document.createElement("p");
    result.classList.add("lead");
    result.innerText = message;

    // Remove the form and the lead
    const lead = document.querySelector(".lead") as HTMLParagraphElement;
    try{
      try {
        lead.remove();
      } catch(err) {
        try {
          // @ts-ignore null error
          lead.parentNode.removeChild(lead);
        } finally {
        }
      } finally {
      }
    } finally {
    }

    // Remove all children in the form
    while (form.firstChild) {
      form.removeChild(form.firstChild);
    }

    // Append the result child
    form.appendChild(result);
  });

  // Finally, submit the form!
  // We are submitting via XHR, so I don't need to submit() the form
  //form.submit();
};

// This function will switch the submit button between submittable and submitting
const payButtonStateChanger = ( state: string ) => {
  const payButton = document.querySelector("#pay-button") as HTMLButtonElement;

  if ( state === "submittable" ) {
    // reset paybutton to defaults
    payButton.removeAttribute("disabled");

    const spinner = document.querySelector("#spinner") as HTMLElement;
    spinner.remove();

    const amountSpan = document.createElement("span");
    amountSpan.setAttribute("id", "span-amount");

    payButton.textContent = "Pay ";
    payButton.appendChild(amountSpan);

  } else if ( state === "submitting" ) {
    // change to disabled and spinner
    payButton.setAttribute("disabled", "disabled");

    const spinner = document.createElement("i");
    spinner.setAttribute("class", "fa fa-spinner fa-spin fa-lg");
    spinner.setAttribute("id", "spinner");

    payButton.textContent = "";
    payButton.appendChild(spinner);
  }
};

// Create the single use token by sending the CC information to Stripe
// This will return a token that I can store on my DB server.
// I can then use that token to charge the customer
form.addEventListener("submit", ( event ) => {
  event.preventDefault();

  // Change the state of the pay button
  payButtonStateChanger("submitting");

  stripe.createToken(card).then( (result) => {
    const errorElement = document.querySelector("#form-errors") as HTMLDivElement;
    if (result.error) {
      payButtonStateChanger("submittable");
    } else {
      // Attach the token to the form and send it to my server
      errorElement.classList.add("d-none");
      stripeTokenHandler(result.token);
    }
  });
});
