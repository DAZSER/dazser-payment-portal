"use strict";

const mysql = require("mysql");

import * as _MySQL from 'mysql';

enum EventType {
  Insert = "Insert",
  Update = "Update",
}

// This function will log the mysql record
const logger = async (type: EventType, form: any) => {
  return new Promise((resolve, reject) => {
    const connection: _MySQL.Connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DBAS,
    });

    connection.connect();

    if( EventType[type] === EventType.Insert ) {
      connection.query(
        "INSERT INTO `stripe_charges` (`email`,`invoice`, `invoice_amount`, `charged_amount`, \
         `payment-brand`, `last4`,`client_ip`, `created`) VALUES (?,?,?,?,?,?,INET_ATON(?),FROM_UNIXTIME(?))",
        [
          form.email,form.invoice,parseFloat(form.amount.replace(/[^0-9.-]+/g,""))*100,parseFloat(form.total_amount.replace(/[^0-9.-]+/g,""))*100,
          form.stripeToken.card.brand,form.stripeToken.card.last4,form.stripeToken.client_ip,form.stripeToken.created
        ],
        (error, results, fields) => {
          if (error) {
            connection.end();
            reject(error);
          } else {
            connection.end();
            resolve(results);
          }
      });
    } else if ( EventType[type] === EventType.Update ) {
      console.log(form);
      connection.query(
        "UPDATE `stripe_charges` SET `transaction_id`=?, `charged`=FROM_UNIXTIME(?) WHERE `id` = MAX(`id`)",
        [
          form.id,form.created
        ],
        (error, results, fields) => {
          if (error) {
            connection.end();
            reject(error);
          } else {
            connection.end();
            resolve(results);
          }
      });
    }
  });
};

module.exports.log = logger;
