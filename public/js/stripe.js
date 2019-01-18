"use strict";
;
var stripe = Stripe("***REMOVED***");
var elements = stripe.elements({
    fonts: [{
            family: "-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Helvetica Neue', Arial, sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol' !default;'"
        }]
});
var card = elements.create("card");
card.mount("#card-element");
var displayError = document.querySelector("#card-errors");
card.addEventListener("change", function (_a) {
    var error = _a.error;
    if (error) {
        displayError.textContent = error.message;
        displayError.classList.remove("d-none");
    }
    else {
        displayError.textContent = "";
        displayError.classList.add("d-none");
    }
});
var form = document.querySelector("#payment-form");
var stripeTokenHandler = function (token) {
    var hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "stripeToken");
    hiddenInput.setAttribute("value", JSON.stringify(token));
    form.appendChild(hiddenInput);
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function (value, key) {
        data[key] = value;
    });
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("error", function (event) { });
    xhr.open(form.method, form.action);
    xhr.send(JSON.stringify(data));
    xhr.addEventListener("loadend", function (response) {
        var res = JSON.parse(response.target.response);
        var message = res.data.message;
        var result = document.createElement("p");
        result.classList.add("lead");
        result.innerText = message;
        var lead = document.querySelector(".lead");
        try {
            try {
                lead.remove();
            }
            catch (err) {
                try {
                    lead.parentNode.removeChild(lead);
                }
                finally {
                }
            }
            finally {
            }
        }
        finally {
        }
        while (form.firstChild) {
            form.removeChild(form.firstChild);
        }
        form.appendChild(result);
    });
};
var payButtonStateChanger = function (state) {
    var payButton = document.querySelector("#pay-button");
    if (state === "submittable") {
        payButton.removeAttribute("disabled");
        var spinner = document.querySelector("#spinner");
        spinner.remove();
        var amountSpan = document.createElement("span");
        amountSpan.setAttribute("id", "span-amount");
        payButton.textContent = "Pay ";
        payButton.appendChild(amountSpan);
    }
    else if (state === "submitting") {
        payButton.setAttribute("disabled", "disabled");
        var spinner = document.createElement("i");
        spinner.setAttribute("class", "fa fa-spinner fa-spin fa-lg");
        spinner.setAttribute("id", "spinner");
        payButton.textContent = "";
        payButton.appendChild(spinner);
    }
};
form.addEventListener("submit", function (event) {
    event.preventDefault();
    payButtonStateChanger("submitting");
    stripe.createToken(card).then(function (result) {
        var errorElement = document.querySelector("#form-errors");
        if (result.error) {
            payButtonStateChanger("submittable");
        }
        else {
            errorElement.classList.add("d-none");
            stripeTokenHandler(result.token);
        }
    });
});
