// Backend
import mysql from "mysql";

export enum EventType {
  INSERT = "Insert",
  UPDATE = "Update",
}

// This function will log the mysql record
export default async function (
  type: EventType,
  form: any
): Promise<boolean | void> {
  const connection: mysql.Connection = mysql.createConnection({
    database: process.env.MYSQL_DBAS,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASS,
    user: process.env.MYSQL_USER,
  });

  connection.connect();

  if (type === EventType.INSERT) {
    connection.query(
      "INSERT INTO `stripe_charges` (`email`,`invoice`, `invoice_amount`, `charged_amount`, \
        `payment-brand`, `last4`,`client_ip`, `created`) VALUES (?,?,?,?,?,?,INET_ATON(?),FROM_UNIXTIME(?))",
      [
        form.email,
        form.invoice,
        parseFloat(form.amount.replace(/[^0-9.-]+/g, "")) * 100,
        parseFloat(form.total_amount.replace(/[^0-9.-]+/g, "")) * 100,
        form.stripeToken.card.brand,
        form.stripeToken.card.last4,
        form.stripeToken.client_ip,
        form.stripeToken.created,
      ],
      (error, _results) => {
        if (error) {
          connection.end();
          return false;
        } else {
          connection.end();
          return true;
        }
      }
    );
  } else if (type === EventType.UPDATE) {
    // console.log(form);
    connection.query(
      "UPDATE `stripe_charges` SET `transaction_id`=?, `charged`=FROM_UNIXTIME(?) WHERE `id` = MAX(`id`)",
      [form.id, form.created],
      (error, _results) => {
        if (error) {
          connection.end();
          return false;
        } else {
          connection.end();
          return true;
        }
      }
    );
  }
}
