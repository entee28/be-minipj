import mongoose from "mongoose";
/** a package that generate an array with randomized digits */
const digitGenerator = require("crypto-secure-random-digit");

/** Order TS interface represent Order document */
interface IOrder {
  user: string;
  code: string;
  amount: number;
  interest_rate: number;
}

/** Define Order schema */
const orderSchema = new mongoose.Schema<IOrder>({
  /** @ts-ignore */
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    default: () => {
      /** create an array with 5 randomized digits */
      const digits = digitGenerator.randomDigits(5);
      /** return a 5-digit-string */
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
