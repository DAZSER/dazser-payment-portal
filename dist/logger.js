"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
var EventType;
(function (EventType) {
    EventType["INSERT"] = "Insert";
    EventType["UPDATE"] = "Update";
})(EventType = exports.EventType || (exports.EventType = {}));
async function default_1(type, form) {
    const connection = mysql_1.default.createConnection({
        database: process.env.MYSQL_DBAS,
        host: process.env.MYSQL_HOST,
        password: process.env.MYSQL_PASS,
        user: process.env.MYSQL_USER,
    });
    connection.connect();
    if (type === EventType.INSERT) {
        connection.query("INSERT INTO `stripe_charges` (`email`,`invoice`, `invoice_amount`, `charged_amount`, \
        `payment-brand`, `last4`,`client_ip`, `created`) VALUES (?,?,?,?,?,?,INET_ATON(?),FROM_UNIXTIME(?))", [
            form.email, form.invoice, parseFloat(form.amount.replace(/[^0-9.-]+/g, "")) * 100,
            parseFloat(form.total_amount.replace(/[^0-9.-]+/g, "")) * 100, form.stripeToken.card.brand,
            form.stripeToken.card.last4, form.stripeToken.client_ip, form.stripeToken.created,
        ], (error, results) => {
            if (error) {
                connection.end();
                return error;
            }
            else {
                connection.end();
                return results;
            }
        });
    }
    else if (type === EventType.UPDATE) {
        connection.query("UPDATE `stripe_charges` SET `transaction_id`=?, `charged`=FROM_UNIXTIME(?) WHERE `id` = MAX(`id`)", [
            form.id, form.created,
        ], (error, results) => {
            if (error) {
                connection.end();
                return error;
            }
            else {
                connection.end();
                return results;
            }
        });
    }
}
exports.default = default_1;
