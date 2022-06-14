"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    full_name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required!"],
        unique: [true, "Phone number has already been used!"],
        match: [/0[35789]\d{8}/, "Invalid phone number!"],
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map