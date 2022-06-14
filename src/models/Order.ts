import mongoose from "mongoose";
const digitGenerator = require("crypto-secure-random-digit");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
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

const Order = mongoose.model("Order", orderSchema);
export default Order;
