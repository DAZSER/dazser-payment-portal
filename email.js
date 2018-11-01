"use strict";
const AWS = require("aws-sdk/global");
const SES = require("aws-sdk/clients/ses");
AWS.config.update({ region: process.env.AWS_REGION_NAME });
let sendEmail = async (content) => {
    return new Promise((resolve, reject) => {
        let params = {
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
        let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
        sendPromise.then((data) => {
            resolve(data.MessageId);
        }).catch((err) => {
            console.error(err, err.stack);
            reject(err);
        });
    });
};
module.exports.sendEmail = sendEmail;
