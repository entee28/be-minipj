"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const digitGenerator = require("crypto-secure-random-digit");
const orderSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Types.ObjectId,
        required: true,
    },
    code: {
        type: String,
        unique: true,
        default: () => {
            const digits = digitGenerator.randomDigits(5);
            return digits.join("");
        },
    },
    amount: {
        type: Number,
        required: true,
    },
    interest_rate: {
        type: Number,
        required: true,
    },
});
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
//# sourceMappingURL=Order.js.map