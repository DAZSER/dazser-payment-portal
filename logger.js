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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHlwZXNjcmlwdC9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxrREFBMEI7QUFFMUIsSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ25CLDhCQUFpQixDQUFBO0lBQ2pCLDhCQUFpQixDQUFBO0FBQ25CLENBQUMsRUFIVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQUdwQjtBQUdjLEtBQUssb0JBQVUsSUFBZSxFQUFFLElBQVM7SUFDdEQsTUFBTSxVQUFVLEdBQXFCLGVBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUMxRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO1FBQ2hDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7UUFDNUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVTtRQUNoQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO0tBQzdCLENBQUMsQ0FBQztJQUVILFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUVyQixJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQzdCLFVBQVUsQ0FBQyxLQUFLLENBQ2Q7NEdBQ3NHLEVBQ3RHO1lBQ0UsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHO1lBQ2pGLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSztZQUMxRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPO1NBQ2xGLEVBQ0QsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDakIsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixPQUFPLEtBQUssQ0FBQzthQUNkO2lCQUFNO2dCQUNMLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxPQUFPLENBQUM7YUFDaEI7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLE1BQU0sRUFBRTtRQUVwQyxVQUFVLENBQUMsS0FBSyxDQUNkLG1HQUFtRyxFQUNuRztZQUNFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU87U0FDdEIsRUFDRCxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNqQixJQUFJLEtBQUssRUFBRTtnQkFDVCxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7aUJBQU07Z0JBQ0wsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNqQixPQUFPLE9BQU8sQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0tBQ0o7QUFDSCxDQUFDO0FBN0NELDRCQTZDQyJ9